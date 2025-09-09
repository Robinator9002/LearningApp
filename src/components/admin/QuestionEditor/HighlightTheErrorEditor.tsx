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

// FIX: A more robust regex to split the sentence into words and punctuation.
// This captures either a sequence of word characters (\w+) OR a single non-word, non-space character ([^\w\s]).
const TOKENIZER_REGEX = /(\w+)|([^\w\s])/g;

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
     * This now uses the improved regex to correctly separate words and punctuation.
     */
    const sentenceTokens = useMemo(() => {
        return question.sentence.match(TOKENIZER_REGEX) || [];
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
     * NOTE: This now operates on the index within the `sentenceTokens` array.
     */
    const handleTokenClick = (tokenIndex: number) => {
        const newIndices = question.correctAnswerIndices.includes(tokenIndex)
            ? question.correctAnswerIndices.filter((i) => i !== tokenIndex)
            : [...question.correctAnswerIndices, tokenIndex];

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
                <Button variant="danger" onClick={() => onRemoveQuestion(index)}>
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
                        {sentenceTokens.length > 0 ? (
                            sentenceTokens.map((token, tokenIndex) => {
                                // FIX: Determine if the token is a word and can be clicked.
                                const isWord = /\w/.test(token);
                                const isSelected =
                                    question.correctAnswerIndices.includes(tokenIndex);

                                if (isWord) {
                                    return (
                                        <span
                                            key={`${question.id}-token-${tokenIndex}`}
                                            className={`word-token ${
                                                isSelected ? 'word-token--selected' : ''
                                            }`}
                                            onClick={() => handleTokenClick(tokenIndex)}
                                        >
                                            {token}
                                        </span>
                                    );
                                } else {
                                    // Render punctuation as a simple, non-interactive span.
                                    return (
                                        <span
                                            key={`${question.id}-token-${tokenIndex}`}
                                            className="punctuation-token"
                                        >
                                            {token}
                                        </span>
                                    );
                                }
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
