// src/pages/learner/Course/CoursePlayerUtils.tsx

import type { IQuestion } from '../../../types/database';

// FINAL STEP: The AnswerPayload now includes all question types.
type AnswerPayload = {
    mcq: string | null;
    sti: string;
    'alg-equation': Record<string, string>;
    'sentence-correction': string;
    'highlight-error': number[];
    'sentence-order': string[];
};

/**
 * A robust evaluation function to simulate a real math library.
 * This version handles implicit multiplication (e.g., '2x') to prevent SyntaxErrors.
 */
const evalWithScope = (expression: string, scope: Record<string, number>): number => {
    // Sanitize to prevent implicit multiplication errors, e.g., '2x' becomes '2*x'
    let sanitizedExpression = expression.replace(/(\d+)([a-zA-Z]+)/g, '$1*$2');

    // Create a safe evaluation scope
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
        return NaN; // Return NaN to indicate failure
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
        case 'sentence-correction':
            return answers['sentence-correction'].trim() !== '';
        case 'highlight-error':
            return answers['highlight-error'].length > 0;
        // FIX: For sentence-order, any arrangement is a valid attempt.
        case 'sentence-order':
            return true;
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
        case 'sentence-correction':
            const corrected = answers['sentence-correction'].trim();
            const expected = question.correctedSentence.trim();
            return corrected === expected;
        case 'highlight-error': {
            const { correctAnswerIndices } = question;
            const selected = answers['highlight-error'];
            if (correctAnswerIndices.length !== selected.length) {
                return false;
            }
            const sortedCorrect = [...correctAnswerIndices].sort();
            const sortedSelected = [...selected].sort();
            return sortedCorrect.every((val, index) => val === sortedSelected[index]);
        }
        // NEW: Add the evaluation logic for sentence-order.
        case 'sentence-order': {
            // The simplest, most robust way to check if two arrays of strings
            // are identical is to compare their JSON string representations.
            return JSON.stringify(question.items) === JSON.stringify(answers['sentence-order']);
        }
        default:
            return false;
    }
};
