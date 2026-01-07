import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { 
    Upload, 
    FileSpreadsheet, 
    ArrowLeft, 
    Check,
    AlertCircle,
    Table,
    FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface DataImportProps {
    onBack: () => void;
    onImportComplete?: (data: any[], columns: string[], fileName: string) => void;
}

export default function DataImport({ onBack, onImportComplete }: DataImportProps) {
    const [file, setFile] = useState<File | null>(null);
    const [fileType, setFileType] = useState<'csv' | 'txt' | 'xlsx' | null>(null);
    const [delimiter, setDelimiter] = useState(',');
    const [decimalSign, setDecimalSign] = useState('.');
    const [preview, setPreview] = useState<{ columns: string[]; rows: any[] } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const parseTextFile = useCallback((text: string, delim: string): { columns: string[]; rows: any[] } => {
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        if (lines.length === 0) throw new Error('Plik jest pusty');
        
        const columns = lines[0].split(delim).map(col => col.trim().replace(/^"|"$/g, ''));
        const rows = lines.slice(1, 6).map(line => {
            const values = line.split(delim).map(val => val.trim().replace(/^"|"$/g, ''));
            const row: Record<string, string> = {};
            columns.forEach((col, idx) => {
                row[col] = values[idx] || '';
            });
            return row;
        });
        
        return { columns, rows };
    }, []);

    const parseXLSX = useCallback(async (file: File): Promise<{ columns: string[]; rows: any[] }> => {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { header: 1 });
        
        if (jsonData.length === 0) throw new Error('Arkusz jest pusty');
        
        const columns = (jsonData[0] as any[]).map(col => String(col || '').trim());
        const rows = jsonData.slice(1, 6).map(rowData => {
            const row: Record<string, string> = {};
            columns.forEach((col, idx) => {
                row[col] = String((rowData as any[])[idx] ?? '');
            });
            return row;
        });
        
        return { columns, rows };
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setError(null);
        setIsLoading(true);

        try {
            const fileName = selectedFile.name.toLowerCase();
            const isCSV = fileName.endsWith('.csv');
            const isTXT = fileName.endsWith('.txt');
            const isXLSX = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

            if (!isCSV && !isTXT && !isXLSX) {
                throw new Error('Obsługiwane formaty: CSV, TXT, XLSX, XLS');
            }

            if (isCSV) {
                setFileType('csv');
                const text = await selectedFile.text();
                const parsed = parseTextFile(text, delimiter);
                setPreview(parsed);
            } else if (isTXT) {
                setFileType('txt');
                const text = await selectedFile.text();
                const parsed = parseTextFile(text, delimiter);
                setPreview(parsed);
            } else if (isXLSX) {
                setFileType('xlsx');
                const parsed = await parseXLSX(selectedFile);
                setPreview(parsed);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Błąd podczas wczytywania pliku');
            setPreview(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelimiterChange = async (newDelimiter: string) => {
        setDelimiter(newDelimiter);
        if (file && (fileType === 'csv' || fileType === 'txt')) {
            setIsLoading(true);
            try {
                const text = await file.text();
                const parsed = parseTextFile(text, newDelimiter);
                setPreview(parsed);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Błąd parsowania');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleImport = async () => {
        if (!file || !preview) return;
        
        setIsLoading(true);
        try {
            if (fileType === 'xlsx') {
                const buffer = await file.arrayBuffer();
                const workbook = XLSX.read(buffer, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { header: 1 });
                
                const columns = (jsonData[0] as any[]).map(col => String(col || '').trim());
                const allRows = jsonData.slice(1).map(rowData => {
                    const row: Record<string, string> = {};
                    columns.forEach((col, idx) => {
                        let v = String((rowData as any[])[idx] ?? '');
                        if (decimalSign === ',' && /^\d+,\d+$/.test(v)) {
                            v = v.replace(',', '.');
                        }
                        row[col] = v;
                    });
                    return row;
                });

                onImportComplete?.(allRows, columns, file.name);
            } else {
                const text = await file.text();
                const lines = text.split(/\r?\n/).filter(line => line.trim());
                const columns = lines[0].split(delimiter).map(col => col.trim().replace(/^"|"$/g, ''));
                const allRows = lines.slice(1).map(line => {
                    const values = line.split(delimiter).map(val => {
                        let v = val.trim().replace(/^"|"$/g, '');
                        if (decimalSign === ',' && /^\d+,\d+$/.test(v)) {
                            v = v.replace(',', '.');
                        }
                        return v;
                    });
                    const row: Record<string, string> = {};
                    columns.forEach((col, idx) => {
                        row[col] = values[idx] || '';
                    });
                    return row;
                });

                onImportComplete?.(allRows, columns, file.name);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Błąd importu');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8"
                >
                    <Button
                        onClick={onBack}
                        variant="ghost"
                        className="text-slate-400 hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Powrót do menu
                    </Button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
                        Stwórz swoją Data Package
                    </h1>
                    <p className="text-slate-400">
                        Zaimportuj własne dane i przekształć je w Darwin Core Data Package
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Import Options */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Upload className="w-5 h-5 text-emerald-400" />
                                    Import pliku
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* File Input */}
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Wybierz plik (CSV, TXT lub XLSX)</Label>
                                    <div className="relative">
                                        <Input
                                            type="file"
                                            accept=".csv,.txt,.xlsx,.xls"
                                            onChange={handleFileChange}
                                            className="bg-slate-700/50 border-slate-600 text-white file:bg-emerald-600 file:text-white file:border-0 file:mr-4 file:px-4 file:py-2 file:rounded-lg hover:file:bg-emerald-700"
                                        />
                                    </div>
                                    {file && (
                                        <p className="text-sm text-emerald-400 flex items-center gap-1">
                                            {fileType === 'xlsx' ? <FileSpreadsheet className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                            {file.name}
                                        </p>
                                    )}
                                </div>

                                {/* CSV/TXT Options */}
                                <div className={`p-4 rounded-lg bg-slate-700/30 border border-slate-600/50 space-y-4 ${fileType === 'xlsx' ? 'opacity-50' : ''}`}>
                                    <h4 className="text-sm font-medium text-slate-300">Opcje CSV/TXT {fileType === 'xlsx' && '(niedostępne dla XLSX)'}</h4>
                                    
                                    <div className="space-y-2">
                                        <Label className="text-slate-400 text-sm">Separator kolumn</Label>
                                        <Select value={delimiter} onValueChange={handleDelimiterChange}>
                                            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-800 border-slate-700">
                                                <SelectItem value="," className="text-white hover:bg-slate-700">Przecinek (,)</SelectItem>
                                                <SelectItem value=";" className="text-white hover:bg-slate-700">Średnik (;)</SelectItem>
                                                <SelectItem value="\t" className="text-white hover:bg-slate-700">Tab</SelectItem>
                                                <SelectItem value="|" className="text-white hover:bg-slate-700">Pipe (|)</SelectItem>
                                                <SelectItem value=" " className="text-white hover:bg-slate-700">Spacja ( )</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-slate-400 text-sm">Znak dziesiętny</Label>
                                        <Select value={decimalSign} onValueChange={setDecimalSign}>
                                            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-800 border-slate-700">
                                                <SelectItem value="." className="text-white hover:bg-slate-700">Kropka (.)</SelectItem>
                                                <SelectItem value="," className="text-white hover:bg-slate-700">Przecinek (,)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center gap-2 text-red-300">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-sm">{error}</span>
                                    </div>
                                )}

                                <Button
                                    onClick={handleImport}
                                    disabled={!preview || isLoading}
                                    className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                            />
                                            Przetwarzanie...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Check className="w-4 h-4" />
                                            Importuj i kontynuuj
                                        </span>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur h-full">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Table className="w-5 h-5 text-cyan-400" />
                                    Podgląd danych
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {preview ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-600">
                                                    {preview.columns.map((col, idx) => (
                                                        <th 
                                                            key={idx} 
                                                            className="px-3 py-2 text-left text-emerald-400 font-medium whitespace-nowrap"
                                                        >
                                                            {col}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {preview.rows.map((row, rowIdx) => (
                                                    <tr key={rowIdx} className="border-b border-slate-700/50">
                                                        {preview.columns.map((col, colIdx) => (
                                                            <td 
                                                                key={colIdx} 
                                                                className="px-3 py-2 text-slate-300 whitespace-nowrap max-w-[150px] truncate"
                                                            >
                                                                {row[col] || '-'}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <p className="text-xs text-slate-500 mt-3">
                                            Pokazano pierwsze 5 wierszy · {preview.columns.length} kolumn
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                        <FileSpreadsheet className="w-12 h-12 mb-4 opacity-50" />
                                        <p>Wybierz plik, aby zobaczyć podgląd</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
