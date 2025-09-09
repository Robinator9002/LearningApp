// src/components/admin/QuestionEditor/FillInTheBlankEditor.tsx

import React, { useContext } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // MODIFICATION: Imported useTranslation
import type { IQuestion } from '../../../types/database';
import { ModalContext } from '../../../contexts/ModalContext';

// --- Component Imports ---
import Button from '../../common/Button';
import Input from '../../common/Form/Input';
import Label from '../../common/Form/Label';
import Select from '../../common/Form/Select';

interface FillInTheBlankEditorProps {
    question: IQuestion;
    index: number;
    onQuestionChange: (index: number, question: IQuestion) => void;
    onRemoveQuestion: (index: number) => void;
}

/**
 * A component for editing Smart Text Input (sti) questions.
 */
const FillInTheBlankEditor: React.FC<FillInTheBlankEditorProps> = ({
    question,
    index,
    onQuestionChange,
    onRemoveQuestion,
}) => {
    const modal = useContext(ModalContext);
    const { t } = useTranslation(); // MODIFICATION: Initialized useTranslation

    // --- TYPE GUARD ---
    if (question.type !== 'sti') {
        return null;
    }

    if (!modal) {
        throw new Error('This component must be used within a ModalProvider');
    }

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onQuestionChange(index, { ...question, questionText: e.target.value });
    };

    const handleAnswerChange = (ansIndex: number, value: string) => {
        const newAnswers = [...question.correctAnswers];
        newAnswers[ansIndex] = value;
        onQuestionChange(index, { ...question, correctAnswers: newAnswers });
    };

    const handleAddAnswer = () => {
        const newAnswers = [...question.correctAnswers, ''];
        onQuestionChange(index, { ...question, correctAnswers: newAnswers });
    };

    const handleRemoveAnswer = (ansIndex: number) => {
        if (question.correctAnswers.length <= 1) {
            modal.showAlert({
                title: t('errors.actionProhibited.title'),
                message: t('errors.actionProhibited.stiMinAnswers'),
            });
            return;
        }
        const newAnswers = question.correctAnswers.filter((_, i) => i !== ansIndex);
        onQuestionChange(index, { ...question, correctAnswers: newAnswers });
    };

    const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onQuestionChange(index, {
            ...question,
            evaluationMode: e.target.value as 'case-insensitive' | 'exact-match',
        });
    };

    return (
        <div className="question-editor">
            <div className="question-editor__header">
                {/* MODIFICATION: Replaced hardcoded title */}
                <h3 className="question-editor__title">
                    {t('editor.questionTitle', {
                        index: index + 1,
                        type: t('questionTypes.sti'),
                    })}
                </h3>
                {/* MODIFICATION: Replaced hardcoded button text */}
                <Button variant="danger" onClick={() => onRemoveQuestion(index)}>
                    <X size={16} /> {t('buttons.remove')}
                </Button>
            </div>
            <div className="form-group">
                {/* MODIFICATION: Replaced hardcoded label */}
                <Label htmlFor={`question-text-${question.id}`}>{t('labels.questionText')}</Label>
                <Input
                    id={`question-text-${question.id}`}
                    value={question.questionText}
                    onChange={handleTextChange}
                    // MODIFICATION: Replaced hardcoded placeholder
                    placeholder={t('placeholders.sti.questionText')}
                />
            </div>
            <div className="form-group">
                {/* MODIFICATION: Replaced hardcoded label */}
                <Label>{t('labels.evaluationMode')}</Label>
                <Select value={question.evaluationMode} onChange={handleModeChange}>
                    {/* MODIFICATION: Replaced hardcoded options */}
                    <option value="case-insensitive">{t('options.caseInsensitive')}</option>
                    <option value="exact-match">{t('options.exactMatch')}</option>
                </Select>
            </div>
            <div className="form-group">
                {/* MODIFICATION: Replaced hardcoded label */}
                <Label>{t('labels.acceptedAnswers')}</Label>
                <div className="answer-list">
                    {question.correctAnswers.map((answer, ansIndex) => (
                        <div key={ansIndex} className="answer-list__item">
                            <Input
                                value={answer}
                                onChange={(e) => handleAnswerChange(ansIndex, e.target.value)}
                                // MODIFICATION: Replaced hardcoded placeholder
                                placeholder={t('placeholders.sti.answer', {
                                    index: ansIndex + 1,
                                })}
                            />
                            <Button
                                variant="secondary"
                                onClick={() => handleRemoveAnswer(ansIndex)}
                                disabled={question.correctAnswers.length <= 1}
                                title={t('tooltips.removeAnswer')}
                            >
                                <X size={16} />
                            </Button>
                        </div>
                    ))}
                </div>
                <Button
                    variant="secondary"
                    onClick={handleAddAnswer}
                    className="answer-list__add-btn"
                >
                    {/* MODIFICATION: Replaced hardcoded button text */}
                    {t('buttons.addAnotherAnswer')}
                </Button>
            </div>
        </div>
    );
};

export default FillInTheBlankEditor;
