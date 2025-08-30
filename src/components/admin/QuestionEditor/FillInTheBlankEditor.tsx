// src/components/admin/FillInTheBlankEditor/FillInTheBlankEditor.tsx

import React from 'react';
import type { IQuestion } from '../../../types/database';
import Button from '../../common/Button/Button';
import Input from '../../common/Form/Input/Input';
import Label from '../../common/Form/Label/Label';

interface FillInTheBlankEditorProps {
    question: IQuestion;
    index: number;
    onQuestionChange: (index: number, question: IQuestion) => void;
    onRemoveQuestion: (index: number) => void;
}

/**
 * A component specifically for editing Fill-in-the-blank (FITB) questions.
 * It ensures that only questions of type 'fitb' are handled here.
 */
const FillInTheBlankEditor: React.FC<FillInTheBlankEditorProps> = ({
    question,
    index,
    onQuestionChange,
    onRemoveQuestion,
}) => {
    // --- TYPE GUARD ---
    // This is the proactive fix. If the question is not a fill-in-the-blank question,
    // this component will not render. This makes it robust and type-safe.
    if (question.type !== 'fitb') {
        return null;
    }

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onQuestionChange(index, { ...question, questionText: e.target.value });
    };

    const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onQuestionChange(index, { ...question, correctAnswer: e.target.value });
    };

    return (
        <div className="question-editor">
            <div className="question-editor__header">
                <h3 className="question-editor__title">Question {index + 1} (Fill-in-the-blank)</h3>
                <Button onClick={() => onRemoveQuestion(index)}>Remove</Button>
            </div>
            <div className="form-group">
                <Label htmlFor={`question-text-${question.id}`}>Question Text</Label>
                <Input
                    id={`question-text-${question.id}`}
                    value={question.questionText}
                    onChange={handleTextChange}
                    placeholder="e.g., The capital of France is ____."
                />
            </div>
            <div className="form-group">
                <Label htmlFor={`correct-answer-${question.id}`}>Correct Answer</Label>
                <Input
                    id={`correct-answer-${question.id}`}
                    value={question.correctAnswer}
                    onChange={handleAnswerChange}
                    placeholder="e.g., Paris"
                />
            </div>
        </div>
    );
};

export default FillInTheBlankEditor;
