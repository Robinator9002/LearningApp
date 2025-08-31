// src/components/admin/QuestionEditor/AlgebraEquationEditor.tsx

import React from 'react';
import type { IQuestion } from '../../../types/database';
import Button from '../../common/Button/Button';
import Input from '../../common/Form/Input/Input';
import Label from '../../common/Form/Label/Label';

interface AlgebraEquationEditorProps {
    question: IQuestion;
    index: number;
    onQuestionChange: (index: number, question: IQuestion) => void;
    onRemoveQuestion: (index: number) => void;
}

/**
 * A dedicated editor component for the 'alg-equation' question type.
 * It provides fields for the question text, the equation itself,
 * and a list of variables to be solved.
 */
const AlgebraEquationEditor: React.FC<AlgebraEquationEditorProps> = ({
    question,
    index,
    onQuestionChange,
    onRemoveQuestion,
}) => {
    // This is a type guard. It ensures that this component only ever tries to render
    // if the question is of the correct 'alg-equation' type.
    if (question.type !== 'alg-equation') {
        return null;
    }

    /**
     * Handles changes to the main question text.
     */
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onQuestionChange(index, { ...question, questionText: e.target.value });
    };

    /**
     * Handles changes to the equation string.
     */
    const handleEquationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onQuestionChange(index, { ...question, equation: e.target.value });
    };

    /**
     * Handles changes to the variables input. It converts the comma-separated
     * string from the input field into an array of strings for the data model.
     */
    const handleVariablesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const variables = e.target.value.split(',').map((v) => v.trim());
        onQuestionChange(index, { ...question, variables });
    };

    return (
        <div className="question-editor">
            <div className="question-editor__header">
                <h3 className="question-editor__title">
                    Question {index + 1} (Algebraic Equation)
                </h3>
                <Button onClick={() => onRemoveQuestion(index)}>Remove</Button>
            </div>
            <div className="form-group">
                <Label htmlFor={`question-text-${question.id}`}>Question Text</Label>
                <Input
                    id={`question-text-${question.id}`}
                    value={question.questionText}
                    onChange={handleTextChange}
                    placeholder="e.g., Solve for the variables in the equation below."
                />
            </div>
            <div className="form-group">
                <Label htmlFor={`equation-${question.id}`}>Equation</Label>
                <Input
                    id={`equation-${question.id}`}
                    value={question.equation}
                    onChange={handleEquationChange}
                    placeholder="e.g., 2*x + 5 = 15"
                />
            </div>
            <div className="form-group">
                <Label htmlFor={`variables-${question.id}`}>Variables (comma-separated)</Label>
                <Input
                    id={`variables-${question.id}`}
                    value={question.variables.join(', ')}
                    onChange={handleVariablesChange}
                    placeholder="e.g., x, y"
                />
            </div>
        </div>
    );
};

export default AlgebraEquationEditor;
