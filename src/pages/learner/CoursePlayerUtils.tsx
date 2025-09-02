// src/pages/learner/CoursePlayerUtils.tsx

import type { IQuestion } from '../../types/database';

// A type to represent the payload of answers from the UI
type AnswerPayload = {
    mcq: string | null;
    sti: string;
    'alg-equation': Record<string, string>;
    'highlight-text': string[];
    'sentence-correction': string;
};

/**
 * A robust evaluation function to simulate a real math library.
 * This version handles implicit multiplication (e.g., '2x') to prevent SyntaxErrors.
 */
const evalWithScope = (expression: string, scope: Record<string, number>): number => {
    // Sanitize to handle implicit multiplication like '2x' or '3(x+1)'
    let sanitizedExpression = expression
        .replace(/(\d+)([a-zA-Z(])/g, '$1*$2') // 2x -> 2*x or 3( -> 3*(
        .replace(/(\))([a-zA-Z(])/g, '$1*$2'); // )( -> )*(

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
        // Use a small epsilon for floating-point comparison
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
            // Ensure all variables defined in the question have a valid numeric answer.
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
            // --- REWORKED: The old, fuzzy logic is replaced with a precise, set-based comparison. ---
            const correctAnswersSet = new Set(question.correctHighlights);
            const userAnswersSet = new Set(answers['highlight-text']);

            // The answer is correct if and only if the sets are of the same size
            // and every correct answer is present in the user's selection.
            if (correctAnswersSet.size !== userAnswersSet.size) {
                return false;
            }

            for (const answer of correctAnswersSet) {
                if (!userAnswersSet.has(answer)) {
                    return false;
                }
            }

            return true;
        case 'sentence-correction':
            const corrected = answers['sentence-correction'].trim();
            const expected = question.correctedSentence.trim();
            // Simple strict equality check
            return corrected === expected;
        default:
            return false;
    }
};
