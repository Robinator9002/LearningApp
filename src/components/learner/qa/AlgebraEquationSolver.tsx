// src/components/learner/QA/AlgebraEquationSolver.tsx

import React from 'react';
import Input from '../../common/Form/Input';
import Label from '../../common/Form/Label';

interface AlgebraEquationSolverProps {
    variables: string[];
    answers: Record<string, string>;
    onAnswerChange: (variable: string, value: string) => void;
    disabled: boolean;
}

/**
 * A component that dynamically generates input fields for each variable
 * in an algebraic equation question.
 */
const AlgebraEquationSolver: React.FC<AlgebraEquationSolverProps> = ({
    variables,
    answers,
    onAnswerChange,
    disabled,
}) => {
    return (
        <div className="alg-equation-solver">
            {variables.map((variable) => (
                <div key={variable} className="alg-equation-solver__group">
                    <Label htmlFor={`alg-var-${variable}`}>{variable} =</Label>
                    <Input
                        id={`alg-var-${variable}`}
                        type="number"
                        className="alg-equation-solver__input"
                        value={answers[variable] || ''}
                        onChange={(e) => onAnswerChange(variable, e.target.value)}
                        disabled={disabled}
                        placeholder="Enter value"
                    />
                </div>
            ))}
        </div>
    );
};

export default AlgebraEquationSolver;
