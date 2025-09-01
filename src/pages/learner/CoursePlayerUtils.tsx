// src/pages/learner/CoursePlayerUtils.tsx

import type { IQuestion } from '../../types/database';

// A type to represent the payload of answers from the UI
type AnswerPayload = {
    mcq: string | null;
    sti: string;
    'alg-equation': Record<string, string>;
    'highlight-text': string[];
    'free-response': string;
    'sentence-correction': string;
};

// --- START: NEW FUZZY STRING MATCHING LOGIC ---

/**
 * Calculates the Levenshtein distance between two strings (the number of edits
 * required to change one string into the other). This is a classic algorithm
 * for determining string similarity.
 * @param s1 The first string.
 * @param s2 The second string.
 * @returns The edit distance between the two strings.
 */
const calculateLevenshteinDistance = (s1: string, s2: string): number => {
    const track = Array(s2.length + 1)
        .fill(null)
        .map(() => Array(s1.length + 1).fill(null));
    for (let i = 0; i <= s1.length; i += 1) {
        track[0][i] = i;
    }
    for (let j = 0; j <= s2.length; j += 1) {
        track[j][0] = j;
    }
    for (let j = 1; j <= s2.length; j += 1) {
        for (let i = 1; i <= s1.length; i += 1) {
            const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1, // deletion
                track[j - 1][i] + 1, // insertion
                track[j - 1][i - 1] + indicator, // substitution
            );
        }
    }
    return track[s2.length][s1.length];
};

/**
 * Calculates the similarity percentage between two strings.
 * A result of 100 means the strings are identical.
 * @param s1 The first string.
 * @param s2 The second string.
 * @returns The similarity percentage.
 */
const calculateSimilarity = (s1: string, s2: string): number => {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    if (longer.length === 0) {
        return 100.0;
    }
    return (longer.length - calculateLevenshteinDistance(longer, shorter)) / longer.length;
};

// --- END: NEW FUZZY STRING MATCHING LOGIC ---

/**
 * A robust evaluation function to simulate a real math library.
 * This version handles implicit multiplication (e.g., '2x') to prevent SyntaxErrors.
 */
const evalWithScope = (expression: string, scope: Record<string, number>): number => {
    let sanitizedExpression = expression.replace(/(\d+)([a-zA-Z]+)/g, '$1*$2');
    const functionBody = `
        "use strict";
        ${Object.keys(scope)
            .map((key) => `const ${key} = ${scope[key]};`)
            .join('\n')}
        return ${sanitizedExpression};
    `;
    try {
        const result = new Function(functionBody)();
        if (typeof result !== 'number' || !isFinite(result)) {
            throw new Error('Evaluation resulted in a non-finite number.');
        }
        return result;
    } catch (error) {
        console.error('Evaluation error:', error);
        return NaN;
    }
};

/**
 * The core of the intelligent evaluation for algebraic equations.
 */
export const evaluateEquation = (equation: string, answers: Record<string, string>): boolean => {
    const parts = equation.split('=');
    if (parts.length !== 2) return false;
    const [leftSide, rightSide] = parts.map((p) => p.trim());
    const scope: Record<string, number> = {};
    for (const key in answers) {
        const numValue = parseFloat(answers[key]);
        if (isNaN(numValue)) return false;
        scope[key] = numValue;
    }
    try {
        const leftResult = evalWithScope(leftSide, scope);
        const rightResult = evalWithScope(rightSide, scope);
        return Math.abs(leftResult - rightResult) < 1e-9;
    } catch (error) {
        console.error('Equation evaluation failed:', error);
        return false;
    }
};

/**
 * Checks if the user has provided a valid, non-empty answer for the current question.
 */
export const isAnswerValid = (question: IQuestion, answers: AnswerPayload): boolean => {
    switch (question.type) {
        case 'mcq':
            return answers.mcq !== null;
        case 'sti':
            return answers.sti.trim() !== '';
        case 'alg-equation':
            return (
                question.variables.length > 0 &&
                question.variables.every(
                    (v) =>
                        answers['alg-equation'][v]?.trim() &&
                        !isNaN(parseFloat(answers['alg-equation'][v])),
                )
            );
        case 'highlight-text':
            return answers['highlight-text'].length > 0;
        case 'free-response':
            return answers['free-response'].trim() !== '';
        case 'sentence-correction':
            return answers['sentence-correction'].trim() !== '';
        default:
            return false;
    }
};

/**
 * The master function to check if the user's answer is correct.
 */
export const checkAnswer = (question: IQuestion, answers: AnswerPayload): boolean => {
    switch (question.type) {
        case 'mcq':
            const correctOption = question.options.find((opt) => opt.isCorrect);
            return correctOption?.id === answers.mcq;
        case 'sti':
            const userAnswer = answers.sti.trim();
            return question.correctAnswers.some((correctAnswer) =>
                question.evaluationMode === 'case-insensitive'
                    ? userAnswer.toLowerCase() === correctAnswer.toLowerCase()
                    : userAnswer === correctAnswer,
            );
        case 'alg-equation':
            return evaluateEquation(question.equation, answers['alg-equation']);
        case 'highlight-text':
            // The user must select the exact number of correct sentences.
            if (answers['highlight-text'].length !== question.correctAnswers.length) {
                return false;
            }

            // Normalize strings by removing all whitespace for comparison.
            const normalizedSelected = answers['highlight-text'].map((s) => s.replace(/\s/g, ''));
            const normalizedCorrect = question.correctAnswers.map((s) => s.replace(/\s/g, ''));

            // Check if every correct answer has a matching selected answer with >= 90% similarity.
            return normalizedCorrect.every((correctSentence) =>
                normalizedSelected.some(
                    (selectedSentence) =>
                        calculateSimilarity(selectedSentence, correctSentence) >= 0.9,
                ),
            );
        case 'free-response':
            return true; // Manual grading
        case 'sentence-correction':
            const corrected = answers['sentence-correction'].trim();
            const expected = question.correctedSentence.trim();
            return corrected === expected;
        default:
            return false;
    }
};
