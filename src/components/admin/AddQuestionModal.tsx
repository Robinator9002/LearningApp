// src/components/admin/AddQuestionModal/AddQuestionModal.tsx

import React from 'react';
import { useTranslation } from 'react-i18next'; // MODIFICATION: Imported useTranslation
import type { IQuestion } from '../../types/database';
import Modal from '../common/Modal/Modal';

/**
 * Defines the properties for the AddQuestionModal component.
 */
interface AddQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddQuestion: (type: IQuestion['type']) => void;
}

/**
 * Defines the structure for a single question type button within the modal.
 */
type QuestionOption = {
    type: IQuestion['type'];
    label: string;
    description: string;
};

/**
 * Defines the structure for a category of questions.
 */
type QuestionCategory = {
    category: string;
    questions: QuestionOption[];
};

/**
 * A modal dialog for adding new questions to a course. It organizes
 * question types into categories for a much-improved user experience.
 */
const AddQuestionModal: React.FC<AddQuestionModalProps> = ({ isOpen, onClose, onAddQuestion }) => {
    const { t } = useTranslation(); // MODIFICATION: Initialized useTranslation

    // MODIFICATION: The question categories are now dynamically generated using
    // the translation keys, making the component fully data-driven and scalable.
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

    /**
     * Handles the selection of a question type.
     */
    const handleSelectQuestion = (type: IQuestion['type']) => {
        onAddQuestion(type);
        onClose();
    };

    return (
        // MODIFICATION: Replaced hardcoded title.
        <Modal isOpen={isOpen} onClose={onClose} title={t('addQuestionModal.title')}>
            <div className="add-question-modal">
                <div className="add-question-modal__header">
                    {/* MODIFICATION: Replaced hardcoded description. */}
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
