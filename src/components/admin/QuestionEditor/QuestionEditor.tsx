// src/components/admin/QuestionEditor/QuestionEditor.tsx
import React from 'react';
import type { IQuestion } from '../../../types/database';
import Button from '../../common/Button/Button';
import Input from '../../common/forms/Input/Input';
import Label from '../../common/forms/Label/Label';

interface QuestionEditorProps {
    question: IQuestion;
    index: number;
    onQuestionChange: (index: number, question: IQuestion) => void;
    onRemoveQuestion: (index: number) => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
    question,
    index,
    onQuestionChange,
    onRemoveQuestion,
}) => {
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onQuestionChange(index, { ...question, questionText: e.target.value });
    };

    const handleOptionTextChange = (optIndex: number, text: string) => {
        const newOptions = [...question.options];
        newOptions[optIndex].text = text;
        onQuestionChange(index, { ...question, options: newOptions });
    };

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
                <h3 className="question-editor__title">Question {index + 1}</h3>
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
                                onChange={(e: any) => handleOptionTextChange(optIndex, e.target.value)}
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
