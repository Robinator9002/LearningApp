// src/components/admin/QuestionEditor/FreeResponseEditor.tsx

import React from 'react';
import type { IQuestion } from '../../../types/database';
import Button from '../../common/Button/Button';
import Label from '../../common/Form/Label';
import Textarea from '../../common/Form/Textarea';

interface FreeResponseEditorProps {
    question: IQuestion;
    index: number;
    onQuestionChange: (index: number, question: IQuestion) => void;
    onRemoveQuestion: (index: number) => void;
}

/**
 * An editor component for the 'free-response' question type.
 * This is the simplest editor, as it only requires a prompt for the student.
 * A note is included to remind the admin that this type requires manual grading.
 */
const FreeResponseEditor: React.FC<FreeResponseEditorProps> = ({
    question,
    index,
    onQuestionChange,
    onRemoveQuestion,
}) => {
    // --- TYPE GUARD ---
    // Ensures the component only renders for 'free-response' questions.
    if (question.type !== 'free-response') {
        return null;
    }

    /**
     * Handles changes to the main question prompt using a textarea for better multiline editing.
     */
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onQuestionChange(index, { ...question, questionText: e.target.value });
    };

    return (
        <div className="question-editor">
            <div className="question-editor__header">
                <h3 className="question-editor__title">Question {index + 1} (Free Response)</h3>
                <Button onClick={() => onRemoveQuestion(index)}>Remove</Button>
            </div>

            <div className="form-group">
                <Label htmlFor={`question-text-${question.id}`}>Question Prompt</Label>
                <Textarea
                    id={`question-text-${question.id}`}
                    value={question.questionText}
                    onChange={handleTextChange}
                    placeholder="e.g., Explain the main theme of the story in your own words."
                    rows={5}
                />
            </div>
            <div className="form-group-info">
                <p>
                    Note: Free response questions are not auto-graded. They require manual review.
                </p>
            </div>
        </div>
    );
};

export default FreeResponseEditor;
