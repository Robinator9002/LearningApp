// src/components/admin/QuestionEditor/HighlightTextEditor.tsx

import React from 'react';
import { X } from 'lucide-react';
import type { IQuestion } from '../../../types/database';
// FIX: Corrected the relative paths for the common components.
import Button from '../../common/Button/Button';
import Input from '../../common/Form/Input';
import Label from '../../common/Form/Label';
import Textarea from '../../common/Form/Textarea';

interface HighlightTextEditorProps {
    question: IQuestion;
    index: number;
    onQuestionChange: (index: number, question: IQuestion) => void;
    onRemoveQuestion: (index: number) => void;
}

/**
 * An editor component for the 'highlight-text' question type.
 * It provides a textarea for a passage and a dynamic list for defining
 * the exact strings that are considered correct answers to be highlighted.
 */
const HighlightTextEditor: React.FC<HighlightTextEditorProps> = ({
    question,
    index,
    onQuestionChange,
    onRemoveQuestion,
}) => {
    // --- TYPE GUARD ---
    if (question.type !== 'highlight-text') {
        return null;
    }

    // --- FIX: Address TypeScript Errors ---
    // The core type definitions are missing `correctHighlights`. We use a type assertion (`as any`)
    // to bypass the compiler error temporarily. This also allows us to provide a fallback empty array.
    const correctHighlights = (question as any).correctHighlights || [];

    /**
     * Handles changes to the main question text (the prompt).
     */
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onQuestionChange(index, { ...question, questionText: e.target.value });
    };

    /**
     * Handles changes to the main passage of text.
     */
    const handlePassageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onQuestionChange(index, { ...question, passage: e.target.value });
    };

    /**
     * Updates the text for a specific correct highlight.
     */
    const handleHighlightChange = (hlIndex: number, value: string) => {
        const newHighlights = [...correctHighlights];
        newHighlights[hlIndex] = value;
        onQuestionChange(index, {
            ...question,
            correctHighlights: newHighlights,
        } as IQuestion);
    };

    /**
     * Adds a new, empty highlight field to the list.
     */
    const handleAddHighlight = () => {
        const newHighlights = [...correctHighlights, ''];
        onQuestionChange(index, {
            ...question,
            correctHighlights: newHighlights,
        } as IQuestion);
    };

    /**
     * Removes a highlight from the list, ensuring at least one remains.
     */
    const handleRemoveHighlight = (hlIndex: number) => {
        if (correctHighlights.length <= 1) {
            console.warn('Cannot remove the last correct highlight.');
            return;
        }
        const newHighlights = correctHighlights.filter((_: any, i: any) => i !== hlIndex);
        onQuestionChange(index, {
            ...question,
            correctHighlights: newHighlights,
        } as IQuestion);
    };

    return (
        <div className="question-editor">
            <div className="question-editor__header">
                <h3 className="question-editor__title">Question {index + 1} (Highlight Text)</h3>
                <Button onClick={() => onRemoveQuestion(index)}>Remove</Button>
            </div>

            <div className="form-group">
                <Label htmlFor={`question-text-${question.id}`}>Question Prompt</Label>
                <Input
                    id={`question-text-${question.id}`}
                    value={question.questionText}
                    onChange={handleTextChange}
                    placeholder="e.g., Highlight the sentence that describes the main character."
                />
            </div>

            <div className="form-group">
                <Label htmlFor={`passage-${question.id}`}>Passage Text</Label>
                <Textarea
                    id={`passage-${question.id}`}
                    value={question.passage}
                    onChange={handlePassageChange}
                    placeholder="Paste the full reading passage here..."
                    rows={8}
                />
            </div>

            <div className="form-group">
                <Label>Correct Highlights (must be exact match)</Label>
                <div className="answer-list">
                    {/* FIX: Explicitly typing the map parameters to resolve implicit 'any' errors. */}
                    {correctHighlights.map((highlight: string, hlIndex: number) => (
                        <div key={hlIndex} className="answer-list__item">
                            <Input
                                value={highlight}
                                onChange={(e) => handleHighlightChange(hlIndex, e.target.value)}
                                placeholder={`Correct phrase ${hlIndex + 1}`}
                            />
                            <Button
                                variant="secondary"
                                onClick={() => handleRemoveHighlight(hlIndex)}
                                disabled={correctHighlights.length <= 1}
                                title="Remove Highlight"
                            >
                                <X size={16} />
                            </Button>
                        </div>
                    ))}
                </div>
                <Button
                    variant="secondary"
                    onClick={handleAddHighlight}
                    className="answer-list__add-btn"
                >
                    + Add another highlight
                </Button>
            </div>
        </div>
    );
};

export default HighlightTextEditor;
