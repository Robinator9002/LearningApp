// src/utils/gradeUtils.ts

import type { Grade } from '../types/database';

/**
 * Returns a CSS class name based on the grade.
 * @param grade - The grade ('A'-'F' or '1'-'6').
 * @returns A string representing the CSS class for that grade.
 */
export const getGradeClass = (grade: Grade): string => {
    return `grade--${grade}`;
};
