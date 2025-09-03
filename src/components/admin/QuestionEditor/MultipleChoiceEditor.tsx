// src/components/admin/QuestionEditor/MultipleChoiceEditor.tsx

import React from 'react';
import { useTranslation } from 'react-i18next'; // MODIFICATION: Imported useTranslation
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
 */
const MultipleChoiceEditor: React.FC<QuestionEditorProps> = ({
    question,
    index,
    onQuestionChange,
    onRemoveQuestion,
}) => {
    const { t } = useTranslation(); // MODIFICATION: Initialized useTranslation

    // --- TYPE GUARD ---
    if (question.type !== 'mcq') {
        return null;
    }

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onQuestionChange(index, { ...question, questionText: e.target.value });
    };

    const handleOptionTextChange = (optIndex: number, text: string) => {
        const newOptions = question.options.map((opt, idx) =>
            idx === optIndex ? { ...opt, text } : opt,
        );
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
                {/* MODIFICATION: Title is now dynamically translated. */}
                <h3 className="question-editor__title">
                    {t('editor.questionTitle', {
                        index: index + 1,
                        type: t('questionTypes.mcq'),
                    })}
                </h3>
                {/* MODIFICATION: Replaced hardcoded button text. */}
                <Button onClick={() => onRemoveQuestion(index)}>{t('buttons.remove')}</Button>
            </div>

            <div className="form-group">
                {/* MODIFICATION: Replaced hardcoded label. */}
                <Label htmlFor={`question-text-${question.id}`}>{t('labels.questionText')}</Label>
                <Input
                    id={`question-text-${question.id}`}
                    value={question.questionText}
                    onChange={handleTextChange}
                    // MODIFICATION: Replaced hardcoded placeholder.
                    placeholder={t('placeholders.mcq.questionText')}
                />
            </div>

            <div className="form-group">
                {/* MODIFICATION: Replaced hardcoded label. */}
                <Label>{t('labels.answerOptions')}</Label>
                <div className="question-editor__option-list">
                    {question.options.map((option, optIndex) => (
                        <div key={option.id} className="question-editor__option">
                            <Input
                                value={option.text}
                                onChange={(e) => handleOptionTextChange(optIndex, e.target.value)}
                                // MODIFICATION: Replaced hardcoded placeholder.
                                placeholder={t('placeholders.mcq.option', {
                                    index: optIndex + 1,
                                })}
                            />
                            <input
                                type="radio"
                                id={`correct-option-${question.id}-${option.id}`}
                                name={`correct-option-${question.id}`}
                                checked={option.isCorrect}
                                onChange={() => handleCorrectOptionChange(optIndex)}
                                className="question-editor__option-radio"
                            />
                            <Label
                                htmlFor={`correct-option-${question.id}-${option.id}`}
                                className={
                                    option.isCorrect
                                        ? 'question-editor__option-label--correct'
                                        : 'question-editor__option-label'
                                }
                            >
                                {/* MODIFICATION: Replaced hardcoded label. */}
                                {t('labels.correct')}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// MODIFICATION: Changed the component's export name for clarity.
export default MultipleChoiceEditor;
