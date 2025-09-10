// src/components/admin/AddQuestionModal.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { IQuestion } from '../../types/database';
import Modal from '../common/Modal/Modal';

interface AddQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddQuestion: (type: IQuestion['type']) => void;
}

type QuestionOption = {
    type: IQuestion['type'];
    label: string;
    description: string;
};

type QuestionCategory = {
    category: string;
    questions: QuestionOption[];
};

const AddQuestionModal: React.FC<AddQuestionModalProps> = ({ isOpen, onClose, onAddQuestion }) => {
    const { t } = useTranslation();

    const questionCategories: QuestionCategory[] = [
        {
            category: t('addQuestionModal.categories.general'),
            questions: [
                {
                    type: 'mcq',
                    label: t('addQuestionModal.mcq.label'),
                    description: t('addQuestionModal.mcq.description'),
                },
                {
                    type: 'sti',
                    label: t('addQuestionModal.sti.label'),
                    description: t('addQuestionModal.sti.description'),
                },
            ],
        },
        {
            category: t('addQuestionModal.categories.readingWriting'),
            questions: [
                {
                    type: 'sentence-correction',
                    label: t('addQuestionModal.sentenceCorrection.label'),
                    description: t('addQuestionModal.sentenceCorrection.description'),
                },
                {
                    type: 'highlight-error',
                    label: t('addQuestionModal.highlightError.label'),
                    description: t('addQuestionModal.highlightError.description'),
                },
                {
                    type: 'sentence-order',
                    label: t('addQuestionModal.sentenceOrder.label'),
                    description: t('addQuestionModal.sentenceOrder.description'),
                },
            ],
        },
        {
            category: t('addQuestionModal.categories.math'),
            questions: [
                {
                    type: 'alg-equation',
                    label: t('addQuestionModal.algEquation.label'),
                    description: t('addQuestionModal.algEquation.description'),
                },
            ],
        },
    ];

    if (!isOpen) {
        return null;
    }

    const handleSelectQuestion = (type: IQuestion['type']) => {
        onAddQuestion(type);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('addQuestionModal.title')}>
            <div className="add-question-modal">
                <div className="add-question-modal__header">
                    <p>{t('addQuestionModal.description')}</p>
                </div>
                <div className="add-question-modal__content">
                    {questionCategories.map((cat) => (
                        <div key={cat.category} className="question-category">
                            <h3 className="question-category__title">{cat.category}</h3>
                            <div className="question-category__options">
                                {cat.questions.map((q) => (
                                    <button
                                        key={q.type}
                                        className="question-option-button"
                                        onClick={() => handleSelectQuestion(q.type)}
                                    >
                                        <span className="question-option-button__label">
                                            {q.label}
                                        </span>
                                        <span className="question-option-button__description">
                                            {q.description}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
    );
};

export default AddQuestionModal;
