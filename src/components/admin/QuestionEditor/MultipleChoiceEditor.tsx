// src/components/admin/QuestionEditor/MultipleChoiceEditor.tsx

import React from 'react';
import type { IQuestion } from '../../../types/database';
import Button from '../../common/Button/Button';
import Input from '../../common/Form/Input';
import Label from '../../common/Form/Label';

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
    // If the question is not a multiple-choice question, this component
    // will not render, preventing type errors and ensuring component integrity.
    if (question.type !== 'mcq') {
        return null;
    }

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onQuestionChange(index, { ...question, questionText: e.target.value });
    };

    /**
     * Updates the text for a specific answer option.
     */
    const handleOptionTextChange = (optIndex: number, text: string) => {
        // Create a new array with the updated option to maintain immutability.
        const newOptions = question.options.map((opt, idx) =>
            idx === optIndex ? { ...opt, text } : opt,
        );
        onQuestionChange(index, { ...question, options: newOptions });
    };

    /**
     * Sets the selected option as the correct one and ensures all others are not.
     */
    const handleCorrectOptionChange = (optIndex: number) => {
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
                    {question.options.map((option, optIndex) => (
                        <div key={option.id} className="question-editor__option">
                            <Input
                                value={option.text}
                                onChange={(e) => handleOptionTextChange(optIndex, e.target.value)}
                                placeholder={`Option ${optIndex + 1}`}
                            />
                            <input
                                type="radio"
                                id={`correct-option-${question.id}-${option.id}`}
                                name={`correct-option-${question.id}`}
                                checked={option.isCorrect}
                                onChange={() => handleCorrectOptionChange(optIndex)}
                                className="question-editor__option-radio"
                            />
                            {/* IMPROVEMENT: A conditional class is added to the Label.
                              This allows us to visually style the label for the correct answer,
                              making it much easier for admins to identify.
                            */}
                            <Label
                                htmlFor={`correct-option-${question.id}-${option.id}`}
                                className={
                                    option.isCorrect
                                        ? 'question-editor__option-label--correct'
                                        : 'question-editor__option-label'
                                }
                            >
                                Correct
                            </Label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuestionEditor;
