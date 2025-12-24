import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, FileCode, Timer, CheckCircle, Download, Copy } from 'lucide-react';
import QuizModal from './QuizModal';
import TutorialModal from './TutorialModal';
import { GameState } from '@/hooks/useGameProgress';

interface MetaGeneratorProps {
    onComplete?: (score: number, data: unknown) => void;
    gameState?: GameState;
    addScore?: (points: number, reason?: string) => void;
    playSuccess?: () => void;
    playFail?: () => void;
    playLevelComplete?: () => void;
    startLevelTimer?: () => void;
}

export default function MetaGenerator({ onComplete, addScore, playSuccess, playLevelComplete, startLevelTimer }: MetaGeneratorProps) {
    const [metadata, setMetadata] = useState({
        title: '',
        description: '',
        creator: '',
        license: 'CC-BY 4.0'
    });
    const [metaXml, setMetaXml] = useState('');
    const [datapackage, setDatapackage] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [showTutorial, setShowTutorial] = useState(true);
    const [levelScore, setLevelScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(300);
    const [isTimerRunning, setIsTimerRunning] = useState(true);

    useEffect(() => {
        startLevelTimer?.();
    }, [startLevelTimer]);

    // Timer countdown
    useEffect(() => {
        if (!isTimerRunning || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setIsTimerRunning(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isTimerRunning, timeLeft]);

    const generateMetaXml = () => {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<archive xmlns="http://rs.tdwg.org/dwc/text/">
  <core encoding="UTF-8" fieldsTerminatedBy="," linesTerminatedBy="\\n" ignoreHeaderLines="1" rowType="http://rs.tdwg.org/dwc/terms/Event">
    <files>
      <location>event.txt</location>
    </files>
    <id index="0"/>
    <field index="1" term="http://rs.tdwg.org/dwc/terms/eventDate"/>
    <field index="2" term="http://rs.tdwg.org/dwc/terms/verbatimLocality"/>
    <field index="3" term="http://rs.tdwg.org/dwc/terms/decimalLatitude"/>
    <field index="4" term="http://rs.tdwg.org/dwc/terms/decimalLongitude"/>
  </core>
  <extension encoding="UTF-8" fieldsTerminatedBy="," linesTerminatedBy="\\n" ignoreHeaderLines="1" rowType="http://rs.tdwg.org/dwc/terms/Occurrence">
    <files>
      <location>occurrence.txt</location>
    </files>
    <coreid index="0"/>
    <field index="1" term="http://rs.tdwg.org/dwc/terms/scientificName"/>
    <field index="2" term="http://rs.tdwg.org/dwc/terms/recordedBy"/>
  </extension>
</archive>`;
        setMetaXml(xml);
        playSuccess?.();
        setLevelScore(prev => prev + 150);
    };

    const generateDatapackage = () => {
        const pkg = JSON.stringify({
            "name": metadata.title.toLowerCase().replace(/\s+/g, '-') || "dwc-dataset",
            "title": metadata.title || "Darwin Core Dataset",
            "description": metadata.description,
            "licenses": [{ "name": metadata.license }],
            "contributors": [{ "title": metadata.creator, "role": "creator" }],
            "resources": [
                {
                    "name": "event",
                    "path": "event.txt",
                    "schema": { "fields": [{ "name": "eventID", "type": "string" }] }
                },
                {
                    "name": "occurrence", 
                    "path": "occurrence.txt",
                    "schema": { "fields": [{ "name": "occurrenceID", "type": "string" }] }
                }
            ]
        }, null, 2);
        setDatapackage(pkg);
        playSuccess?.();
        setLevelScore(prev => prev + 150);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const downloadFile = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const progress = ((metaXml ? 50 : 0) + (datapackage ? 50 : 0));
    const canComplete = metaXml && datapackage;

    const handleComplete = () => {
        if (!canComplete) return;
        setShowQuiz(true);
    };

    const handleQuizComplete = (quizScore: number) => {
        const finalScore = levelScore + (quizScore * 2);
        addScore?.(finalScore, 'Package Seal Complete');
        playLevelComplete?.();
        onComplete?.(finalScore, { metaXml, datapackage, metadata });
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-slate-900 dark:via-teal-950 dark:to-slate-900 p-4 md:p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <Package className="w-8 h-8 text-teal-500 dark:text-teal-400" />
                                Mission 3: Package Seal
                            </h1>
                            <p className="text-gray-600 dark:text-slate-400 mt-1">
                                Generate meta.xml and datapackage.json
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                                timeLeft < 60 ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                                <Timer className={`w-5 h-5 ${timeLeft < 60 ? 'animate-pulse' : ''}`} />
                                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
                            </div>
                            <Badge variant="outline" className="text-lg px-4 py-2 border-teal-400 text-teal-600 dark:border-teal-500 dark:text-teal-400">
                                {levelScore} pts
                            </Badge>
                        </div>
                    </div>
                    <Progress value={progress} className="h-3 bg-gray-200 dark:bg-slate-700" />
                </motion.div>

                {/* Metadata Form */}
                <Card className="mb-6 bg-white/80 border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Dataset Metadata</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Title</label>
                                <Input
                                    value={metadata.title}
                                    onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Dataset title"
                                    className="bg-white dark:bg-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Creator</label>
                                <Input
                                    value={metadata.creator}
                                    onChange={(e) => setMetadata(prev => ({ ...prev, creator: e.target.value }))}
                                    placeholder="Your name"
                                    className="bg-white dark:bg-slate-700"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description</label>
                            <Textarea
                                value={metadata.description}
                                onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Dataset description"
                                className="bg-white dark:bg-slate-700"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Generate Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Button onClick={generateMetaXml} className="w-full bg-teal-600 hover:bg-teal-700 text-white h-16" size="lg">
                        <FileCode className="w-5 h-5 mr-2" />
                        Generate meta.xml
                        {metaXml && <CheckCircle className="w-5 h-5 ml-2" />}
                    </Button>
                    <Button onClick={generateDatapackage} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-16" size="lg">
                        <Package className="w-5 h-5 mr-2" />
                        Generate datapackage.json
                        {datapackage && <CheckCircle className="w-5 h-5 ml-2" />}
                    </Button>
                </div>

                {/* Generated Files Preview */}
                {(metaXml || datapackage) && (
                    <Card className="mb-6 bg-white/80 border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 backdrop-blur">
                        <CardHeader>
                            <CardTitle className="text-gray-900 dark:text-white">Generated Files</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="meta" className="w-full">
                                <TabsList className="w-full bg-gray-100 dark:bg-slate-700/50">
                                    <TabsTrigger value="meta" className="flex-1" disabled={!metaXml}>meta.xml</TabsTrigger>
                                    <TabsTrigger value="datapackage" className="flex-1" disabled={!datapackage}>datapackage.json</TabsTrigger>
                                </TabsList>
                                <TabsContent value="meta" className="mt-4">
                                    {metaXml && (
                                        <div className="relative">
                                            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm max-h-64">{metaXml}</pre>
                                            <div className="absolute top-2 right-2 flex gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(metaXml)}>
                                                    <Copy className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => downloadFile(metaXml, 'meta.xml')}>
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>
                                <TabsContent value="datapackage" className="mt-4">
                                    {datapackage && (
                                        <div className="relative">
                                            <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg overflow-x-auto text-sm max-h-64">{datapackage}</pre>
                                            <div className="absolute top-2 right-2 flex gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(datapackage)}>
                                                    <Copy className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => downloadFile(datapackage, 'datapackage.json')}>
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={handleComplete}
                                disabled={!canComplete}
                                className={`w-full ${canComplete ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 dark:bg-slate-600'}`}
                                size="lg"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {canComplete ? 'Complete Level' : 'Generate Both Files'}
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                {/* Modals */}
                {showQuiz && (
                    <QuizModal
                        onComplete={handleQuizComplete}
                        onClose={() => setShowQuiz(false)}
                    />
                )}

                {showTutorial && (
                    <TutorialModal
                        levelNumber={3}
                        isOpen={showTutorial}
                        onClose={() => setShowTutorial(false)}
                    />
                )}
            </div>
        </div>
    );
}
