// src/components/admin/QuestionEditor/HighlightTheErrorEditor.tsx

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

import type { IQuestionHighlightError } from '../../../types/database';
import Button from '../../common/Button';
import Label from '../../common/Form/Label';
import Textarea from '../../common/Form/Textarea';

interface HighlightTheErrorEditorProps {
    index: number;
    question: IQuestionHighlightError;
    onQuestionChange: (index: number, question: IQuestionHighlightError) => void;
    onRemoveQuestion: (index: number) => void;
}

/**
 * An editor component for the "Highlight the Error" question type.
 * It allows an admin to enter a sentence and then click on the individual
 * words to mark them as the correct answers (the errors).
 */
const HighlightTheErrorEditor: React.FC<HighlightTheErrorEditorProps> = ({
    index,
    question,
    onQuestionChange,
    onRemoveQuestion,
}) => {
    const { t } = useTranslation();

    /**
     * Memoizes the tokenization of the sentence.
     * This splits the sentence into an array of words, which is crucial for the interactive part.
     * It uses a simple regex to split by spaces, which is effective for this use case.
     */
    const wordTokens = useMemo(() => {
        return question.sentence.trim().split(/\s+/).filter(Boolean);
    }, [question.sentence]);

    /**
     * Handles changes to the main sentence textarea.
     * When the sentence is modified, it also clears the selected error indices,
     * as the word positions will have changed.
     */
    const handleSentenceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onQuestionChange(index, {
            ...question,
            sentence: e.target.value,
            correctAnswerIndices: [], // Reset answers when sentence changes
        });
    };

    /**
     * Toggles the selection of a word. If the word's index is already marked
     * as an error, it's removed; otherwise, it's added.
     */
    const handleWordClick = (wordIndex: number) => {
        const newIndices = question.correctAnswerIndices.includes(wordIndex)
            ? question.correctAnswerIndices.filter((i) => i !== wordIndex)
            : [...question.correctAnswerIndices, wordIndex];

        onQuestionChange(index, {
            ...question,
            correctAnswerIndices: newIndices,
        });
    };

    return (
        <div className="question-editor-card">
            <div className="question-editor-card__header">
                <h4 className="question-editor-card__title">
                    {t('editor.questionTitle', {
                        index: index + 1,
                        type: t('questionTypes.highlightError'),
                    })}
                </h4>
                <Button variant="danger-outline" size="sm" onClick={() => onRemoveQuestion(index)}>
                    <X size={16} /> {t('buttons.remove')}
                </Button>
            </div>
            <div className="question-editor-card__content">
                <div className="form-group">
                    <Label htmlFor={`q-text-${question.id}`}>{t('labels.questionText')}</Label>
                    <Textarea
                        id={`q-text-${question.id}`}
                        value={question.questionText}
                        onChange={(e) =>
                            onQuestionChange(index, { ...question, questionText: e.target.value })
                        }
                        placeholder={t('placeholders.highlightError.questionText')}
                        rows={2}
                    />
                </div>
                <div className="form-group">
                    <Label htmlFor={`q-sentence-${question.id}`}>
                        {t('labels.sentenceWithErrors')}
                    </Label>
                    <Textarea
                        id={`q-sentence-${question.id}`}
                        value={question.sentence}
                        onChange={handleSentenceChange}
                        placeholder={t('placeholders.highlightError.sentence')}
                        rows={3}
                    />
                </div>
                <div className="form-group">
                    <Label>{t('labels.selectErrors')}</Label>
                    <div className="highlight-editor__word-bank">
                        {wordTokens.length > 0 ? (
                            wordTokens.map((word, wordIndex) => {
                                const isSelected =
                                    question.correctAnswerIndices.includes(wordIndex);
                                return (
                                    <span
                                        key={`${question.id}-word-${wordIndex}`}
                                        className={`word-token ${
                                            isSelected ? 'word-token--selected' : ''
                                        }`}
                                        onClick={() => handleWordClick(wordIndex)}
                                    >
                                        {word}
                                    </span>
                                );
                            })
                        ) : (
                            <p className="highlight-editor__placeholder">
                                {t('placeholders.highlightError.wordBank')}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HighlightTheErrorEditor;
