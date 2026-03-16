/**
 * @file useSchemaExport.test.ts
 * @description Testy hooka useSchemaExport — weryfikacja generowania podglądu danych.
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSchemaExport, isDateTerm } from '@/components/game/schema-mapper/useSchemaExport';

describe('isDateTerm', () => {
  it('rozpoznaje termy dat DwC', () => {
    expect(isDateTerm('eventDate')).toBe(true);
    expect(isDateTerm('dateIdentified')).toBe(true);
    expect(isDateTerm('modified')).toBe(true);
  });

  it('nie rozpoznaje nie-datowych termów', () => {
    expect(isDateTerm('scientificName')).toBe(false);
    expect(isDateTerm('occurrenceID')).toBe(false);
    expect(isDateTerm('kingdom')).toBe(false);
  });
});

describe('useSchemaExport', () => {
  const mockData = [
    { name: 'Test Species', date: '2024-01-15', id: '1' },
    { name: 'Another Species', date: '15/03/2024', id: '2' },
  ];

  it('getPreviewRows zwraca zmapowane dane', () => {
    const { result } = renderHook(() =>
      useSchemaExport({
        data: mockData,
        fileName: 'test.csv',
        convertDatesToISO: false,
        generatedIdConfigs: [],
        generatedIdValues: {},
        getMappingsBySchema: () => ({}),
        classifiedSchemas: { optimal: [], optional: [] },
        selectedForDownload: new Set(),
      })
    );

    const rows = result.current.getPreviewRows({ scientificName: 'name' });
    expect(rows).toHaveLength(2);
    expect(rows[0].scientificName).toBe('Test Species');
  });

  it('getPreviewRows zwraca max 5 wierszy', () => {
    const bigData = Array.from({ length: 20 }, (_, i) => ({ name: `Sp ${i}` }));
    const { result } = renderHook(() =>
      useSchemaExport({
        data: bigData,
        fileName: 'test.csv',
        convertDatesToISO: false,
        generatedIdConfigs: [],
        generatedIdValues: {},
        getMappingsBySchema: () => ({}),
        classifiedSchemas: { optimal: [], optional: [] },
        selectedForDownload: new Set(),
      })
    );

    const rows = result.current.getPreviewRows({ scientificName: 'name' });
    expect(rows.length).toBeLessThanOrEqual(5);
  });
});
