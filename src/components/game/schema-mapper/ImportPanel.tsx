/**
 * @file ImportPanel.tsx
 * @description Reusable data import panel for embedding in the Schema Mapper wizard.
 * Extracted from DataImport.tsx to work as a wizard step.
 */

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
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
  Check,
  AlertCircle,
  Table,
  FileText,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useLanguage } from "@/i18n/LanguageContext";

interface ImportPanelProps {
  onImportComplete: (data: any[], columns: string[], fileName: string) => void;
}

export default function ImportPanel({ onImportComplete }: ImportPanelProps) {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"csv" | "txt" | "xlsx" | null>(null);
  const [delimiter, setDelimiter] = useState(",");
  const [customDelimiter, setCustomDelimiter] = useState("");
  const [decimalSign, setDecimalSign] = useState(".");
  const [preview, setPreview] = useState<{ columns: string[]; rows: any[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ rows: number; columns: number } | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [workbookCache, setWorkbookCache] = useState<any>(null);

  const getActualDelimiter = (delim: string): string => {
    if (delim === "\\t") return "\t";
    if (delim === "__custom__") return customDelimiter || ",";
    return delim;
  };

  const excelDateToISO = (serial: number): string => {
    const utcDays = serial - 25569;
    const date = new Date(utcDays * 86400 * 1000);
    return date.toISOString().split("T")[0];
  };

  const normalizeDate = (value: string): string => {
    if (!value || value.trim() === "") return value;
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    const asNum = Number(trimmed);
    if (!isNaN(asNum) && asNum > 1 && asNum < 200000 && !trimmed.includes(".") && !trimmed.includes("/") && !trimmed.includes("-")) {
      return excelDateToISO(asNum);
    }
    const dmy = trimmed.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
    if (dmy) {
      const [, d, m, y] = dmy;
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
    const ymd = trimmed.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
    if (ymd) {
      const [, y, m, d] = ymd;
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
    return trimmed;
  };

  const convertDates = useCallback(
    (rows: Record<string, string>[], columns: string[]): Record<string, string>[] => {
      const dateColumns = columns.filter((col) => {
        const lc = col.toLowerCase();
        if (/date|data|datum|day|dzień|jour/.test(lc)) return true;
        const samples = rows.slice(0, 5).map((r) => r[col]).filter(Boolean);
        return samples.some((v) => {
          const n = Number(v);
          return (!isNaN(n) && n > 30000 && n < 100000) || /^\d{1,2}[./-]\d{1,2}[./-]\d{4}$/.test(v);
        });
      });
      if (dateColumns.length === 0) return rows;
      return rows.map((row) => {
        const newRow = { ...row };
        dateColumns.forEach((col) => {
          if (newRow[col]) newRow[col] = normalizeDate(newRow[col]);
        });
        return newRow;
      });
    },
    []
  );

  const parseTextFile = useCallback(
    (text: string, delim: string): { columns: string[]; rows: any[] } => {
      const actualDelim = getActualDelimiter(delim);
      const lines = text.split(/\r?\n/).filter((line) => line.trim());
      if (lines.length === 0) throw new Error(t("import.error.empty"));
      const headers = lines[0].split(actualDelim).map((h) => h.trim().replace(/^"|"$/g, ""));
      if (headers.length < 2) throw new Error(t("import.error.fewColumns"));
      const rows = lines.slice(1).map((line) => {
        const values = line.split(actualDelim).map((v) => v.trim().replace(/^"|"$/g, ""));
        const row: Record<string, string> = {};
        headers.forEach((header, idx) => {
          let value = values[idx] || "";
          if (decimalSign === "," && !isNaN(Number(value.replace(",", ".")))) {
            value = value.replace(",", ".");
          }
          row[header] = value;
        });
        return row;
      });
      return { columns: headers, rows };
    },
    [decimalSign, customDelimiter, t]
  );

  const loadSheetPreview = useCallback(
    (workbook: any, sheetName: string) => {
      try {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        if (jsonData.length === 0) throw new Error(t("import.error.empty"));
        const headers = jsonData[0].map(String);
        const rows = jsonData.slice(1).map((row: any[]) => {
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => { obj[h] = row[i] != null ? String(row[i]) : ""; });
          return obj;
        });
        const convertedRows = convertDates(rows, headers);
        setPreview({ columns: headers, rows: convertedRows.slice(0, 5) });
        setError(null);
      } catch (err: any) {
        setError(err.message || t("import.error.parse"));
      }
    },
    [t, convertDates]
  );

  const handleSheetChange = useCallback(
    (sheetName: string) => {
      setSelectedSheet(sheetName);
      if (workbookCache) {
        loadSheetPreview(workbookCache, sheetName);
      }
    },
    [workbookCache, loadSheetPreview]
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;
      setFile(selectedFile);
      setError(null);
      const ext = selectedFile.name.split(".").pop()?.toLowerCase();
      if (ext === "xlsx" || ext === "xls") {
        setFileType("xlsx");
        try {
          const buffer = await selectedFile.arrayBuffer();
          const workbook = XLSX.read(buffer, { type: "array" });
          setWorkbookCache(workbook);
          setSheetNames(workbook.SheetNames);
          const firstSheet = workbook.SheetNames[0];
          setSelectedSheet(firstSheet);
          loadSheetPreview(workbook, firstSheet);
        } catch (err: any) {
          setError(err.message || t("import.error.parse"));
        }
      } else if (ext === "csv" || ext === "txt") {
        setFileType(ext as "csv" | "txt");
        try {
          const text = await selectedFile.text();
          const parsed = parseTextFile(text, delimiter);
          setPreview({ columns: parsed.columns, rows: parsed.rows.slice(0, 5) });
        } catch (err: any) {
          setError(err.message || t("import.error.parse"));
        }
      } else {
        setError(t("import.error.format"));
      }
    },
    [delimiter, parseTextFile, t, convertDates]
  );

  const handleDelimiterChange = useCallback(
    async (newDelimiter: string) => {
      setDelimiter(newDelimiter);
      if (file && (fileType === "csv" || fileType === "txt")) {
        try {
          const text = await file.text();
          const parsed = parseTextFile(text, newDelimiter);
          setPreview({ columns: parsed.columns, rows: parsed.rows.slice(0, 5) });
          setError(null);
        } catch (err: any) {
          setError(err.message);
        }
      }
    },
    [file, fileType, parseTextFile]
  );

  const handleImport = useCallback(async () => {
    if (!file || !preview) return;
    setIsLoading(true);
    try {
      let allData: any[];
      if (fileType === "xlsx") {
        const workbook = workbookCache || XLSX.read(await file.arrayBuffer(), { type: "array" });
        const sheetName = selectedSheet || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        const headers = jsonData[0].map(String);
        allData = jsonData.slice(1).map((row) => {
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => { obj[h] = row[i] != null ? String(row[i]) : ""; });
          return obj;
        });
        allData = convertDates(allData, headers);
      } else {
        const text = await file.text();
        const parsed = parseTextFile(text, delimiter);
        allData = convertDates(parsed.rows, parsed.columns);
      }
      setImportResult({ rows: allData.length, columns: preview.columns.length });
      onImportComplete(allData, preview.columns, file.name);
    } catch (err: any) {
      setError(err.message || t("import.error.import"));
    } finally {
      setIsLoading(false);
    }
  }, [file, fileType, preview, delimiter, parseTextFile, onImportComplete, t, convertDates, workbookCache, selectedSheet]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Import Options */}
      <Card className="bg-card/90 border-border backdrop-blur">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            {t("import.fileImport")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Input */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">{t("import.selectFile")}</Label>
            <div className="relative">
              <Input
                type="file"
                accept=".csv,.txt,.xlsx,.xls"
                onChange={handleFileChange}
                className="bg-muted/50 border-border text-foreground file:bg-emerald-600 file:text-white file:border-0 file:mr-4 file:px-4 file:py-2 file:rounded-lg hover:file:bg-emerald-700"
              />
            </div>
            {file && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                {fileType === "xlsx" ? <FileSpreadsheet className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                {file.name}
              </p>
            )}
          </div>

          {/* Sheet selector for Excel */}
          {fileType === "xlsx" && sheetNames.length > 1 && (
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">{t("import.sheetSelect")}</Label>
              <Select value={selectedSheet} onValueChange={handleSheetChange}>
                <SelectTrigger className="bg-muted/50 border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sheetNames.map((name) => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* CSV/TXT Options */}
          <div className={`p-4 rounded-lg bg-muted/50 border border-border space-y-4 ${fileType === "xlsx" ? "opacity-50" : ""}`}>
            <h4 className="text-sm font-medium text-muted-foreground">
              {t("import.csvOptions")} {fileType === "xlsx" && t("import.csvNotAvailable")}
            </h4>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">{t("import.columnSeparator")}</Label>
              <Select value={delimiter} onValueChange={handleDelimiterChange}>
                <SelectTrigger className="bg-muted/50 border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=",">{t("import.sep.comma")}</SelectItem>
                  <SelectItem value=";">{t("import.sep.semicolon")}</SelectItem>
                  <SelectItem value="\t">{t("import.sep.tab")}</SelectItem>
                  <SelectItem value="|">{t("import.sep.pipe")}</SelectItem>
                  <SelectItem value=" ">{t("import.sep.space")}</SelectItem>
                  <SelectItem value="__custom__">{t("import.sep.other")}</SelectItem>
                </SelectContent>
              </Select>
              {delimiter === "__custom__" && (
                <Input
                  value={customDelimiter}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomDelimiter(val);
                    if (val && file && (fileType === "csv" || fileType === "txt")) {
                      file.text().then((text) => {
                        try {
                          const parsed = parseTextFile(text, "__custom__");
                          setPreview({ columns: parsed.columns, rows: parsed.rows.slice(0, 5) });
                          setError(null);
                        } catch (err: any) {
                          setError(err.message);
                        }
                      });
                    }
                  }}
                  placeholder={t("import.sep.otherPlaceholder")}
                  maxLength={3}
                  className="bg-muted/50 border-border text-foreground w-24 mt-1"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">{t("import.decimalSign")}</Label>
              <Select value={decimalSign} onValueChange={setDecimalSign}>
                <SelectTrigger className="bg-muted/50 border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=".">{t("import.dec.dot")}</SelectItem>
                  <SelectItem value=",">{t("import.dec.comma")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <Button
            onClick={handleImport}
            disabled={!preview || isLoading}
            className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
                {t("import.processing")}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {t("import.importContinue")}
              </span>
            )}
          </Button>

          {importResult && (
            <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <Check className="w-4 h-4" />
              <span className="text-sm">
                {t("import.successMessage", { rows: importResult.rows, columns: importResult.columns })}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="bg-card/90 border-border backdrop-blur h-full">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Table className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            {t("import.dataPreview")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {preview ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {preview.columns.map((col, idx) => (
                      <th
                        key={idx}
                        className="px-3 py-2 text-left text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="border-b border-border/50">
                      {preview.columns.map((col, colIdx) => (
                        <td
                          key={colIdx}
                          className="px-3 py-2 text-foreground whitespace-nowrap max-w-[150px] truncate"
                        >
                          {row[col] || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-muted-foreground mt-3">
                {t("resources.previewRows", { count: preview.columns.length })}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileSpreadsheet className="w-12 h-12 mb-4 opacity-50" />
              <p>{t("resources.selectFilePreview")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
