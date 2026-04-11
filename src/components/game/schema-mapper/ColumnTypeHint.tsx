/**
 * @file ColumnTypeHint.tsx
 * @description Wykrywa typ danych w kolumnie i wyświetla przyjazną podpowiedź.
 */

import React from "react";

/** Zgaduje typ danych na podstawie przykładowych wartości */
export function guessColumnType(sampleValues: string): string | null {
  if (!sampleValues || sampleValues === "—") return null;

  const vals = sampleValues.split(", ").map(v => v.trim()).filter(Boolean);
  if (vals.length === 0) return null;

  // Współrzędne
  const coordPattern = /^-?\d{1,3}\.\d{2,}$/;
  if (vals.every(v => coordPattern.test(v))) {
    const num = parseFloat(vals[0]);
    if (num >= -90 && num <= 90) return "📍 Wygląda jak: szerokość geograficzna";
    if (num >= -180 && num <= 180) return "📍 Wygląda jak: długość geograficzna";
    return "📍 Wygląda jak: współrzędna";
  }

  // Data
  const datePattern = /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$|^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}$/;
  if (vals.every(v => datePattern.test(v))) return "📅 Wygląda jak: data";

  // Liczba całkowita
  if (vals.every(v => /^\d+$/.test(v))) return "🔢 Wygląda jak: liczba";

  // UUID
  if (vals.every(v => /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(v))) return "🔑 Wygląda jak: identyfikator UUID";

  // URL
  if (vals.every(v => /^https?:\/\//i.test(v))) return "🔗 Wygląda jak: link URL";

  // Email
  if (vals.every(v => /@/.test(v) && /\./.test(v))) return "📧 Wygląda jak: email";

  return null;
}

interface ColumnTypeHintProps {
  sampleValues: string;
}

export default function ColumnTypeHint({ sampleValues }: ColumnTypeHintProps) {
  const hint = guessColumnType(sampleValues);
  if (!hint) return null;

  return (
    <p className="text-[10px] text-primary/70 mt-0.5 italic">
      {hint}
    </p>
  );
}
