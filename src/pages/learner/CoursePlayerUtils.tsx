// src/pages/learner/player/CoursePlayerUtils.tsx
import { useState, useEffect } from 'react';

/**
 * A simple hook to manage window dimensions for effects like confetti.
 * # Returns the current window width and height.
 */
export const useWindowSize = () => {
    const [size, setSize] = useState([window.innerWidth, window.innerHeight]);
    useEffect(() => {
        const handleResize = () => setSize([window.innerWidth, window.innerHeight]);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return size;
};

/**
 * A robust evaluation function to simulate a real math library.
 * # This version handles implicit multiplication (e.g., '2x') to prevent SyntaxErrors.
 * @param expression The mathematical expression string to evaluate.
 * @param scope A record of variable values, e.g., { x: 5, y: 10 }
 * @returns The numerical result of the evaluation.
 */
const evalWithScope = (expression: string, scope: Record<string, number>): number => {
    // Sanitize and replace implicit multiplication, e.g., '2x' becomes '2*x'
    let sanitizedExpression = expression.replace(/(\d+)([a-zA-Z]+)/g, '$1*$2');

    // Create a function body that declares the variables in the scope
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
        // Return NaN (Not a Number) to indicate a failure in evaluation
        return NaN;
    }
};

/**
 * The core of the intelligent evaluation for algebraic equations.
 * # It splits the equation, evaluates both sides with the user's answers, and compares the results.
 * @param equation The equation string, e.g., "2*x + 5 = 3*y - 12"
 * @param answers A record of variable values, e.g., { x: '8.5', y: '10' }
 * @returns A boolean indicating if the solution is correct.
 */
export const evaluateEquation = (equation: string, answers: Record<string, string>): boolean => {
    const parts = equation.split('=');
    if (parts.length !== 2) return false; // Not a valid equation

    const leftSide = parts[0].trim();
    const rightSide = parts[1].trim();

    // Convert string answers to numbers for the scope
    const scope: Record<string, number> = {};
    for (const key in answers) {
        const numValue = parseFloat(answers[key]);
        if (isNaN(numValue)) return false; // Invalid number input
        scope[key] = numValue;
    }

    try {
        const leftResult = evalWithScope(leftSide, scope);
        const rightResult = evalWithScope(rightSide, scope);

        // Use a small tolerance for comparing floating-point numbers
        return Math.abs(leftResult - rightResult) < 1e-9;
    } catch (error) {
        console.error('Equation evaluation failed:', error);
        return false;
    }
};
