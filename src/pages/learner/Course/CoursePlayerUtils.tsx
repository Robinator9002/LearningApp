// src/pages/learner/Course/CoursePlayerUtils.tsx

import type { IQuestion } from '../../../types/database';

// MODIFICATION: The AnswerPayload now includes the new question type.
type AnswerPayload = {
    mcq: string | null;
    sti: string;
    'alg-equation': Record<string, string>;
    'sentence-correction': string;
    'highlight-error': number[];
};

/**
 * A robust evaluation function to simulate a real math library.
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
        case 'sentence-correction':
            return answers['sentence-correction'].trim() !== '';
        // NEW: Validation logic for the new question type.
        case 'highlight-error':
            return answers['highlight-error'].length > 0;
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
        // NEW: Grading logic for the new question type.
        case 'highlight-error': {
            const learnerAnswers = [...answers['highlight-error']].sort((a, b) => a - b);
            const correctAnswers = [...question.correctAnswerIndices].sort((a, b) => a - b);
            // The answer is correct only if the arrays are identical.
            return JSON.stringify(learnerAnswers) === JSON.stringify(correctAnswers);
        }
        default:
            return false;
    }
};
