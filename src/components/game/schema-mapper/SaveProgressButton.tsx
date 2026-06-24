/**
 * @file SaveProgressButton.tsx
 * @description Save-progress button — generates a link with the encoded mapping state.
 */

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Check } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";

interface SaveProgressButtonProps {
  mappings: Record<string, string>;
  fileName: string;
  selectedSchema: string;
}

export default function SaveProgressButton({ mappings, fileName, selectedSchema }: SaveProgressButtonProps) {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  const handleSave = useCallback(() => {
    try {
      const state = { m: mappings, f: fileName, s: selectedSchema };
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(state))));
      const url = `${window.location.origin}${window.location.pathname}#mappings=${encoded}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        toast.success(t('saveProgress.toastSuccess'));
        setTimeout(() => setCopied(false), 3000);
      }).catch(() => {
        window.prompt(t('saveProgress.fallbackPrompt'), url);
      });
    } catch {
      toast.error(t('saveProgress.toastError'));
    }
  }, [mappings, fileName, selectedSchema, t]);

  const mappingCount = Object.keys(mappings).length;
  if (mappingCount === 0) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSave}
      className="text-[10px] md:text-xs border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 gap-1.5"
      title={t('saveProgress.title')}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Link2 className="w-3.5 h-3.5" />}
      <span className="hidden sm:inline">{copied ? t('saveProgress.copied') : t('saveProgress.save')}</span>
      <span className="sm:hidden">{copied ? "✓" : "💾"}</span>
    </Button>
  );
}
