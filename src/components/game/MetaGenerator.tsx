import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    FileCode,
    CheckCircle,
    Package,
    Download,
    Eye,
    Code,
    FileArchive,
    Timer,
    FileText
} from 'lucide-react';
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
    previousLevelData?: {
        coreData?: Record<string, string>[];
        mappings?: Record<string, string>;
        links?: Record<string, string>;
    };
}

export default function MetaGenerator({
    onComplete,
    addScore,
    playSuccess,
    playFail,
    playLevelComplete,
    startLevelTimer,
    previousLevelData
}: MetaGeneratorProps) {
    const [metadata, setMetadata] = useState({
        title: '',
        description: '',
        creator: '',
        publisher: 'Adam Mickiewicz University',
        license: ''
    });
    const [metaXml, setMetaXml] = useState('');
    const [datapackageJson, setDatapackageJson] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [showTutorial, setShowTutorial] = useState(true);
    const [levelScore, setLevelScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(300);
    const [isTimerRunning, setIsTimerRunning] = useState(true);
    const [generatedFiles, setGeneratedFiles] = useState({ meta: false, datapackage: false });

    const coreData = previousLevelData?.coreData || [];

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
    }, [isTimerRunning]);

    // Generate meta.xml
    const generateMetaXml = useCallback(() => {
        const columns = Object.keys(coreData[0] || {});
        const fieldsXml = columns.map((col, idx) =>
            `      <field index="${idx}" term="http://rs.tdwg.org/dwc/terms/${col}"/>`
        ).join('\n');

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<archive xmlns="http://rs.tdwg.org/dwc/text/"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://rs.tdwg.org/dwc/text/ http://rs.tdwg.org/dwc/text/tdwg_dwc_text.xsd">
  
  <core encoding="UTF-8" linesTerminatedBy="\\n" fieldsTerminatedBy="," 
        fieldsEnclosedBy="&quot;" ignoreHeaderLines="1" rowType="http://rs.tdwg.org/dwc/terms/Event">
    <files>
      <location>event.txt</location>
    </files>
    <id index="0"/>
${fieldsXml}
  </core>

  <extension encoding="UTF-8" linesTerminatedBy="\\n" fieldsTerminatedBy=","
             fieldsEnclosedBy="&quot;" ignoreHeaderLines="1" rowType="http://rs.gbif.org/terms/1.0/Multimedia">
    <files>
      <location>multimedia.txt</location>
    </files>
    <coreid index="0"/>
    <field index="0" term="http://rs.tdwg.org/dwc/terms/eventID"/>
    <field index="1" term="http://purl.org/dc/terms/type"/>
    <field index="2" term="http://purl.org/dc/terms/format"/>
    <field index="3" term="http://purl.org/dc/terms/identifier"/>
  </extension>

</archive>`;

        setMetaXml(xml);
        setGeneratedFiles(prev => ({ ...prev, meta: true }));
        playSuccess?.();
    }, [coreData, playSuccess]);

    // Generate datapackage.json
    const generateDatapackageJson = useCallback(() => {
        const columns = Object.keys(coreData[0] || {});

        const json = {
            name: metadata.title.toLowerCase().replace(/\s+/g, '-') || 'dwc-dataset',
            title: metadata.title || 'DwC Dataset',
            description: metadata.description,
            version: "1.0.0",
            created: new Date().toISOString(),
            contributors: [{
                title: metadata.creator,
                role: "author"
            }],
            licenses: [{
                name: metadata.license,
                path: "https://creativecommons.org/licenses/by/4.0/"
            }],
            resources: [
                {
                    name: "event",
                    path: "event.txt",
                    schema: {
                        fields: columns.map(col => ({
                            name: col,
                            type: col.includes('Latitude') || col.includes('Longitude') ? 'number' : 'string',
                            constraints: {
                                required: ['eventID', 'decimalLatitude', 'decimalLongitude', 'geodeticDatum', 'countryCode'].includes(col)
                            }
                        }))
                    }
                },
                {
                    name: "multimedia",
                    path: "multimedia.txt",
                    schema: {
                        fields: [
                            { name: "eventID", type: "string" },
                            { name: "type", type: "string" },
                            { name: "format", type: "string" },
                            { name: "identifier", type: "string" }
                        ]
                    }
                }
            ]
        };

        setDatapackageJson(JSON.stringify(json, null, 2));
        setGeneratedFiles(prev => ({ ...prev, datapackage: true }));
        playSuccess?.();
    }, [coreData, metadata, playSuccess]);

    // Calculate score
    useEffect(() => {
        let score = 0;
        if (generatedFiles.meta) score += 100;
        if (generatedFiles.datapackage) score += 100;
        if (metadata.title && metadata.description && metadata.creator) score += 50;
        // Time bonus
        if (timeLeft > 240) score += 50;
        else if (timeLeft > 180) score += 30;
        else if (timeLeft > 60) score += 10;

        setLevelScore(score);
    }, [generatedFiles, metadata, timeLeft]);

    const progress = ((generatedFiles.meta ? 1 : 0) + (generatedFiles.datapackage ? 1 : 0)) / 2 * 100;
    const canComplete = generatedFiles.meta && generatedFiles.datapackage;

    const handleComplete = () => {
        if (!canComplete) {
            playFail?.();
            return;
        }
        const finalScore = levelScore;
        addScore?.(finalScore, 'Package Seal Complete');
        playLevelComplete?.();
        onComplete?.(finalScore, {
            metadata,
            metaXml,
            datapackageJson,
            coreData
        });
    };
    };

    // Download XML
    const downloadArchive = useCallback(() => {
        const blob = new Blob([metaXml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'meta.xml';
        a.click();
        URL.revokeObjectURL(url);
        playSuccess?.();
    }, [metaXml, playSuccess]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                                <Package className="w-8 h-8 text-teal-400" />
                                Mission 3: Package Seal
                            </h1>
                            <p className="text-slate-400 mt-1">
                                Generate meta.xml and datapackage.json, compress DwC Data Package
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                                timeLeft < 60 ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-300'
                            }`}>
                                <Timer className={`w-5 h-5 ${timeLeft < 60 ? 'animate-pulse' : ''}`} />
                                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
                            </div>
                            <Badge variant="outline" className="text-lg px-4 py-2 border-teal-500 text-teal-400">
                                {levelScore} pts
                            </Badge>
                        </div>
                    </div>

                    <Progress value={progress} className="h-3 bg-slate-700" />
                    <div className="flex justify-between text-sm mt-2 text-slate-400">
                        <span>{Math.round(progress)}% complete</span>
                        <span>{(generatedFiles.meta ? 1 : 0) + (generatedFiles.datapackage ? 1 : 0)}/2 files</span>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Project Note */}
                    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Project Note
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="prose prose-sm prose-invert max-w-none">
                                <h3 className="text-lg font-semibold text-white mb-2">Invasive species – Ailanthus altissima in Poznań</h3>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    This is a collection of information gathered on the invasive species <em>Ailanthus altissima</em> (tree-of-heaven) in Poznań using the mobile application AMUnatcoll.
                                </p>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    <em>Ailanthus altissima</em> is an alien invasive tree species originating from Southeast Asia, fast-growing (up to 20-30 m in height) and producing numerous root suckers as well as seeds.
                                </p>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    In Poland and the EU, it is recognized as highly invasive, banned from cultivation since 2011, with an obligation to remove it.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Metadata Form */}
                    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <FileCode className="w-5 h-5" />
                                Dataset Metadata
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-slate-300">Dataset Title</Label>
                                <Input
                                    id="title"
                                    value={metadata.title}
                                    onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                                    className="bg-slate-700/50 border-slate-600 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-slate-300">Description</Label>
                                <Textarea
                                    id="description"
                                    value={metadata.description}
                                    onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                                    className="bg-slate-700/50 border-slate-600 text-white"
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="creator" className="text-slate-300">Author</Label>
                                    <Input
                                        id="creator"
                                        value={metadata.creator}
                                        onChange={(e) => setMetadata(prev => ({ ...prev, creator: e.target.value }))}
                                        className="bg-slate-700/50 border-slate-600 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="license" className="text-slate-300">License</Label>
                                    <Select
                                        value={metadata.license}
                                        onValueChange={(value) => setMetadata(prev => ({ ...prev, license: value }))}
                                    >
                                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                            <SelectValue placeholder="Select license" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CC0 1.0">CC0 1.0 (Public Domain)</SelectItem>
                                            <SelectItem value="CC-BY 4.0">CC-BY 4.0</SelectItem>
                                            <SelectItem value="CC-BY-SA 4.0">CC-BY-SA 4.0</SelectItem>
                                            <SelectItem value="CC-BY-NC 4.0">CC-BY-NC 4.0</SelectItem>
                                            <SelectItem value="CC-BY-NC-SA 4.0">CC-BY-NC-SA 4.0</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-2 gap-6 mt-6">
                    {/* Actions */}
                    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <FileCode className="w-5 h-5" />
                                Generuj Pliki
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    onClick={generateMetaXml}
                                    disabled={generatedFiles.meta}
                                    className={generatedFiles.meta ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'}
                                    size="lg"
                                >
                                    {generatedFiles.meta ? (
                                        <>
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            meta.xml ✓
                                        </>
                                    ) : (
                                        <>
                                            <Code className="w-4 h-4 mr-2" />
                                            Generuj meta.xml
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={generateDatapackageJson}
                                    disabled={generatedFiles.datapackage}
                                    className={generatedFiles.datapackage ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-700'}
                                    size="lg"
                                >
                                    {generatedFiles.datapackage ? (
                                        <>
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            datapackage.json ✓
                                        </>
                                    ) : (
                                        <>
                                            <FileCode className="w-4 h-4 mr-2" />
                                            Generuj datapackage.json
                                        </>
                                    )}
                                </Button>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    onClick={() => setShowPreview(!showPreview)}
                                    variant="outline"
                                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                                    disabled={!generatedFiles.meta && !generatedFiles.datapackage}
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Podgląd
                                </Button>
                                <Button
                                    onClick={downloadArchive}
                                    variant="outline"
                                    className="flex-1 border-teal-500/50 text-teal-400 hover:bg-teal-500/10"
                                    disabled={!generatedFiles.meta}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Pobierz meta.xml
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* File Previews */}
                <AnimatePresence>
                    {showPreview && (generatedFiles.meta || generatedFiles.datapackage) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6"
                        >
                            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                                <CardContent className="pt-6">
                                    <Tabs defaultValue="meta" className="w-full">
                                        <TabsList className="w-full bg-slate-700/50 mb-4">
                                            <TabsTrigger value="meta" className="flex-1" disabled={!generatedFiles.meta}>
                                                meta.xml
                                            </TabsTrigger>
                                            <TabsTrigger value="datapackage" className="flex-1" disabled={!generatedFiles.datapackage}>
                                                datapackage.json
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="meta" className="mt-0">
                                            <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto text-sm text-green-400 font-mono max-h-96">
                                                {metaXml}
                                            </pre>
                                        </TabsContent>

                                        <TabsContent value="datapackage" className="mt-0">
                                            <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto text-sm text-yellow-400 font-mono max-h-96">
                                                {datapackageJson}
                                            </pre>
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Archive Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                >
                    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <FileArchive className="w-5 h-5" />
                                Archive Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50">
                                    <Package className="w-6 h-6 text-teal-400" />
                                    <div>
                                        <p className="text-sm text-slate-400">meta.xml</p>
                                        <p className="font-semibold text-white">{generatedFiles.meta ? '✓ Ready' : 'Generate'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50">
                                    <FileCode className="w-6 h-6 text-purple-400" />
                                    <div>
                                        <p className="text-sm text-slate-400">datapackage.json</p>
                                        <p className="font-semibold text-white">{generatedFiles.datapackage ? '✓ Ready' : 'Generate'}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex gap-4">
                            <Button
                                onClick={handleComplete}
                                disabled={!canComplete}
                                className={`flex-1 ${canComplete ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-600'}`}
                                size="lg"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {canComplete ? 'Complete Level' : 'Generate Files'}
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>

                {/* Modals */}

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
