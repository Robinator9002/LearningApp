// src/lib/trackingUtils.ts

import type { Grade } from '../types/database';

/**
 * Calculates a grade based on a percentage score and the current language.
 * Follows standard US and German grading scales.
 * @param percentage - The user's score as a percentage (0-100).
 * @param language - The current language ('en' or 'de').
 * @returns The calculated grade as a Grade type.
 */
export const calculateGrade = (percentage: number, language: 'en' | 'de'): Grade => {
    if (language === 'de') {
        // German grading system (1 is best, 6 is worst)
        if (percentage >= 92) return '1';
        if (percentage >= 81) return '2';
        if (percentage >= 67) return '3';
        if (percentage >= 50) return '4';
        if (percentage >= 23) return '5';
        return '6';
    } else {
        // Default to US grading system (A is best, F is worst)
        if (percentage >= 90) return 'A';
        if (percentage >= 80) return 'B';
        if (percentage >= 70) return 'C';
        if (percentage >= 60) return 'D';
        return 'F';
    }
};
