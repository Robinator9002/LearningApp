// src/components/admin/QuestionEditor/SentenceCorrectionEditor.tsx

import React from 'react';
import type { IQuestion } from '../../../types/database';
import Button from '../../common/Button/Button';
import Label from '../../common/Form/Label';
import Textarea from '../../common/Form/Textarea';

interface SentenceCorrectionEditorProps {
    question: IQuestion;
    index: number;
    onQuestionChange: (index: number, question: IQuestion) => void;
    onRemoveQuestion: (index: number) => void;
}

/**
 * An editor component for the 'sentence-correction' question type.
 * It provides two text areas: one for the incorrect sentence to be shown
 * to the student, and one for the corrected version for auto-grading.
 */
const SentenceCorrectionEditor: React.FC<SentenceCorrectionEditorProps> = ({
    question,
    index,
    onQuestionChange,
    onRemoveQuestion,
}) => {
    // --- TYPE GUARD ---
    // Ensures this component only renders for 'sentence-correction' questions.
    if (question.type !== 'sentence-correction') {
        return null;
    }

    /**
     * Updates the sentence that contains the mistake.
     */
    const handleMistakeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onQuestionChange(index, { ...question, sentenceWithMistake: e.target.value });
    };

    /**
     * Updates the corrected version of the sentence.
     */
    const handleCorrectionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onQuestionChange(index, { ...question, correctedSentence: e.target.value });
    };

    return (
        <div className="question-editor">
            <div className="question-editor__header">
                <h3 className="question-editor__title">
                    Question {index + 1} (Sentence Correction)
                </h3>
                <Button onClick={() => onRemoveQuestion(index)}>Remove</Button>
            </div>

            <div className="form-group">
                <Label htmlFor={`mistake-sentence-${question.id}`}>Incorrect Sentence</Label>
                <Textarea
                    id={`mistake-sentence-${question.id}`}
                    value={question.sentenceWithMistake}
                    onChange={handleMistakeChange}
                    placeholder="e.g., He don't like vegetables."
                    rows={3}
                />
            </div>

            <div className="form-group">
                <Label htmlFor={`correct-sentence-${question.id}`}>Corrected Sentence</Label>
                <Textarea
                    id={`correct-sentence-${question.id}`}
                    value={question.correctedSentence}
                    onChange={handleCorrectionChange}
                    placeholder="e.g., He doesn't like vegetables."
                    rows={3}
                />
            </div>
        </div>
    );
};

export default SentenceCorrectionEditor;
