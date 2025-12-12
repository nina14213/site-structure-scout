import { useCallback } from 'react';
import { dwcTerms, isoCodes } from '@/components/game/DwCTerms';

interface ValidationResult {
    valid: boolean;
    message?: string;
}

export function useValidator() {
    const validateField = useCallback((termName: string, value: string, allValues?: string[]): ValidationResult => {
        const term = dwcTerms[termName];
        if (!term) return { valid: true };

        // Check if required
        if (term.required && (!value || value.trim() === '')) {
            return { valid: false, message: `${termName} is required` };
        }

        if (!value || value.trim() === '') {
            return { valid: true };
        }

        // Validate by type
        switch (term.type) {
            case 'coordinate': {
                const num = parseFloat(value);
                if (isNaN(num)) {
                    return { valid: false, message: 'Must be a valid number' };
                }
                if (term.range) {
                    if (num < term.range[0] || num > term.range[1]) {
                        return { valid: false, message: `Must be between ${term.range[0]} and ${term.range[1]}` };
                    }
                }
                break;
            }

            case 'controlled': {
                if (term.allowedValues && !term.allowedValues.includes(value)) {
                    return { valid: false, message: `Must be one of: ${term.allowedValues.join(', ')}` };
                }
                if (term.format === 'iso2-country' && !isoCodes.includes(value)) {
                    return { valid: false, message: 'Must be a valid ISO 3166-1 alpha-2 country code' };
                }
                break;
            }

            case 'date': {
                // Check for ISO date format
                const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
                const altDateRegex = /^\d{2}-\d{2}-\d{4}$/;
                if (!isoDateRegex.test(value) && !altDateRegex.test(value)) {
                    return { valid: false, message: 'Must be a valid date (YYYY-MM-DD or DD-MM-YYYY)' };
                }
                break;
            }

            case 'integer': {
                const num = parseInt(value, 10);
                if (isNaN(num)) {
                    return { valid: false, message: 'Must be a valid integer' };
                }
                if (term.range) {
                    if (num < term.range[0] || num > term.range[1]) {
                        return { valid: false, message: `Must be between ${term.range[0]} and ${term.range[1]}` };
                    }
                }
                break;
            }

            case 'decimal': {
                const num = parseFloat(value);
                if (isNaN(num)) {
                    return { valid: false, message: 'Must be a valid number' };
                }
                if (term.range) {
                    if (num < term.range[0] || num > term.range[1]) {
                        return { valid: false, message: `Must be between ${term.range[0]} and ${term.range[1]}` };
                    }
                }
                break;
            }

            case 'coreID': {
                if (term.unique && allValues) {
                    const count = allValues.filter(v => v === value).length;
                    if (count > 1) {
                        return { valid: false, message: 'Must be unique' };
                    }
                }
                break;
            }

            case 'uri': {
                try {
                    new URL(value);
                } catch {
                    return { valid: false, message: 'Must be a valid URL' };
                }
                break;
            }
        }

        return { valid: true };
    }, []);

    return { validateField };
}

export default useValidator;
