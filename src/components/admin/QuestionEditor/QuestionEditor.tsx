// src/components/admin/QuestionEditor/QuestionEditor.tsx

import React from 'react';
import type { IQuestion, IMCQOption } from '../../../types/database';
import Button from '../../common/Button/Button';
import Input from '../../common/Form/Input/Input';
import Label from '../../common/Form/Label/Label';

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
    // --- Generic Handlers ---
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onQuestionChange(index, { ...question, questionText: e.target.value });
    };

    // --- MCQ-Specific Handlers ---
    const handleOptionTextChange = (optIndex: number, text: string) => {
        if (!question.options) return;
        const newOptions = [...question.options];
        newOptions[optIndex].text = text;
        onQuestionChange(index, { ...question, options: newOptions });
    };

    const handleCorrectOptionChange = (optIndex: number) => {
        if (!question.options) return;
        const newOptions = question.options.map((opt: IMCQOption, idx: number) => ({
            ...opt,
            isCorrect: idx === optIndex,
        }));
        onQuestionChange(index, { ...question, options: newOptions });
    };

    // --- FITB-Specific Handlers ---
    const handleCorrectAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onQuestionChange(index, { ...question, correctAnswer: e.target.value });
    };

    return (
        <div className="question-editor">
            <div className="question-editor__header">
                <h3 className="question-editor__title">
                    Question {index + 1} ({question.type.toUpperCase()})
                </h3>
                <Button variant="danger" onClick={() => onRemoveQuestion(index)}>
                    Remove
                </Button>
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

            {/* CONDITIONAL RENDERING BASED ON QUESTION TYPE */}

            {question.type === 'mcq' && question.options && (
                <div className="form-group">
                    <Label>Answer Options (Select the correct one)</Label>
                    <div className="question-editor__option-list">
                        {question.options.map((option, optIndex) => (
                            <div key={option.id} className="question-editor__option">
                                <input
                                    type="radio"
                                    name={`correct-option-${question.id}`}
                                    checked={option.isCorrect}
                                    onChange={() => handleCorrectOptionChange(optIndex)}
                                    className="question-editor__option-radio"
                                />
                                <Input
                                    value={option.text}
                                    onChange={(e: any) =>
                                        handleOptionTextChange(optIndex, e.target.value)
                                    }
                                    placeholder={`Option ${optIndex + 1}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {question.type === 'fitb' && (
                <div className="form-group">
                    <Label htmlFor={`correct-answer-${question.id}`}>Correct Answer</Label>
                    <Input
                        id={`correct-answer-${question.id}`}
                        value={question.correctAnswer || ''}
                        onChange={handleCorrectAnswerChange}
                        placeholder="Enter the exact correct answer"
                    />
                </div>
            )}
        </div>
    );
};

export default QuestionEditor;
