// src/components/admin/QuestionEditor/SentenceCorrectionEditor.tsx

import React from 'react';
import { useTranslation } from 'react-i18next'; // MODIFICATION: Imported useTranslation
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
 */
const SentenceCorrectionEditor: React.FC<SentenceCorrectionEditorProps> = ({
    question,
    index,
    onQuestionChange,
    onRemoveQuestion,
}) => {
    const { t } = useTranslation(); // MODIFICATION: Initialized useTranslation

    // --- TYPE GUARD ---
    if (question.type !== 'sentence-correction') {
        return null;
    }

    const handleMistakeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onQuestionChange(index, { ...question, sentenceWithMistake: e.target.value });
    };

    const handleCorrectionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onQuestionChange(index, { ...question, correctedSentence: e.target.value });
    };

    return (
        <div className="question-editor">
            <div className="question-editor__header">
                {/* MODIFICATION: Title is now dynamically translated. */}
                <h3 className="question-editor__title">
                    {t('editor.questionTitle', {
                        index: index + 1,
                        type: t('questionTypes.sentenceCorrection'),
                    })}
                </h3>
                {/* MODIFICATION: Replaced hardcoded button text. */}
                <Button onClick={() => onRemoveQuestion(index)}>{t('buttons.remove')}</Button>
            </div>

            <div className="form-group">
                {/* MODIFICATION: Replaced hardcoded label. */}
                <Label htmlFor={`mistake-sentence-${question.id}`}>
                    {t('labels.incorrectSentence')}
                </Label>
                <Textarea
                    id={`mistake-sentence-${question.id}`}
                    value={question.sentenceWithMistake}
                    onChange={handleMistakeChange}
                    // MODIFICATION: Replaced hardcoded placeholder.
                    placeholder={t('placeholders.sentenceCorrection.incorrect')}
                    rows={3}
                />
            </div>

            <div className="form-group">
                {/* MODIFICATION: Replaced hardcoded label. */}
                <Label htmlFor={`correct-sentence-${question.id}`}>
                    {t('labels.correctedSentence')}
                </Label>
                <Textarea
                    id={`correct-sentence-${question.id}`}
                    value={question.correctedSentence}
                    onChange={handleCorrectionChange}
                    // MODIFICATION: Replaced hardcoded placeholder.
                    placeholder={t('placeholders.sentenceCorrection.correct')}
                    rows={3}
                />
            </div>
        </div>
    );
};

export default SentenceCorrectionEditor;
