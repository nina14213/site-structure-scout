/**
 * @file SaveProgressButton.tsx
 * @description Przycisk "Zapisz postęp" — generuje link z zakodowanym stanem mapowania.
 */

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Check, Copy } from "lucide-react";
import { toast } from "sonner";

interface SaveProgressButtonProps {
  mappings: Record<string, string>;
  fileName: string;
  selectedSchema: string;
}

export default function SaveProgressButton({ mappings, fileName, selectedSchema }: SaveProgressButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleSave = useCallback(() => {
    try {
      const state = { m: mappings, f: fileName, s: selectedSchema };
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(state))));
      const url = `${window.location.origin}${window.location.pathname}#mappings=${encoded}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        toast.success("📋 Link skopiowany! Możesz go zapisać i wrócić później.");
        setTimeout(() => setCopied(false), 3000);
      }).catch(() => {
        // Fallback: show URL in prompt
        window.prompt("Skopiuj ten link aby wrócić później:", url);
      });
    } catch {
      toast.error("Nie udało się wygenerować linku.");
    }
  }, [mappings, fileName, selectedSchema]);

  const mappingCount = Object.keys(mappings).length;
  if (mappingCount === 0) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSave}
      className="text-[10px] md:text-xs border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 gap-1.5"
      title="Zapisz postęp — wygeneruj link do późniejszego powrotu"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Link2 className="w-3.5 h-3.5" />}
      <span className="hidden sm:inline">{copied ? "Skopiowano!" : "Zapisz postęp"}</span>
      <span className="sm:hidden">{copied ? "✓" : "💾"}</span>
    </Button>
  );
}
