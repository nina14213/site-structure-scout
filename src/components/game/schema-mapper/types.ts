export type DataRow = Record<string, string>;

export type PreviewRow = Record<string, string | true | undefined>;

export type SheetCellValue = string | number | boolean | Date | null | undefined;

export type SheetRow = SheetCellValue[];

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
