// src/components/admin/QuestionEditor/QuestionEditor.tsx

import React from 'react';
// By importing the specific question types, we can be more explicit.
import type { IQuestion } from '../../../types/database';
import Button from '../../common/Button/Button';
import Input from '../../common/Form/Input/Input';
import Label from '../../common/Form/Label/Label';

interface QuestionEditorProps {
    question: IQuestion;
    index: number;
    onQuestionChange: (index: number, question: IQuestion) => void;
    onRemoveQuestion: (index: number) => void;
}

/**
 * A component specifically for editing Multiple Choice Questions (MCQ).
 * It ensures that only questions of type 'mcq' are handled here.
 */
const QuestionEditor: React.FC<QuestionEditorProps> = ({
    question,
    index,
    onQuestionChange,
    onRemoveQuestion,
}) => {
    // --- TYPE GUARD ---
    // This is the critical fix. If the question is not a multiple-choice question,
    // this component has no business rendering it. This prevents runtime errors
    // and satisfies TypeScript's strict type checking.
    if (question.type !== 'mcq') {
        return null;
    }

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // We spread the existing question and update only the relevant property.
        onQuestionChange(index, { ...question, questionText: e.target.value });
    };

    const handleOptionTextChange = (optIndex: number, text: string) => {
        // Create a new array for immutability.
        const newOptions = [...question.options];
        // Update the text of the specific option.
        newOptions[optIndex] = { ...newOptions[optIndex], text };
        // Pass the entire updated question object back up.
        onQuestionChange(index, { ...question, options: newOptions });
    };

    const handleCorrectOptionChange = (optIndex: number) => {
        // Create a new array of options, updating the isCorrect flag for all of them.
        const newOptions = question.options.map((opt, idx) => ({
            ...opt,
            isCorrect: idx === optIndex,
        }));
        onQuestionChange(index, { ...question, options: newOptions });
    };

    return (
        <div className="question-editor">
            <div className="question-editor__header">
                <h3 className="question-editor__title">Question {index + 1} (Multiple Choice)</h3>
                <Button onClick={() => onRemoveQuestion(index)}>Remove</Button>
            </div>

            <div className="form-group">
                <Label htmlFor={`question-text-${question.id}`}>Question Text</Label>
                <Input
                    id={`question-text-${question.id}`}
                    value={question.questionText}
                    onChange={handleTextChange}
                    placeholder="e.g., What is 2 + 2?"
                />
            </div>

            <div className="form-group">
                <Label>Answer Options</Label>
                <div className="question-editor__option-list">
                    {/* Because of the type guard above, TypeScript now knows question.options exists. */}
                    {question.options.map((option, optIndex) => (
                        <div key={option.id} className="question-editor__option">
                            <Input
                                value={option.text}
                                onChange={(e) => handleOptionTextChange(optIndex, e.target.value)}
                                placeholder={`Option ${optIndex + 1}`}
                            />
                            <input
                                type="radio"
                                name={`correct-option-${question.id}`}
                                checked={option.isCorrect}
                                onChange={() => handleCorrectOptionChange(optIndex)}
                                className="question-editor__option-radio"
                            />
                            <Label>Correct</Label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuestionEditor;
