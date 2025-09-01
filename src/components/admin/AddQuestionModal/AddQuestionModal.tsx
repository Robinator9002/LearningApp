// src/components/admin/AddQuestionModal/AddQuestionModal.tsx

import React from 'react';
import type { IQuestion } from '../../../types/database';
import Modal from '../../common/Modal/Modal';

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

// A structured list of all available question types, organized by category.
// This makes the UI scalable and easy to update.
const questionCategories: QuestionCategory[] = [
    {
        category: 'General Purpose',
        questions: [
            {
                type: 'mcq',
                label: 'Multiple Choice',
                description: 'Present several options, one is correct.',
            },
            {
                type: 'sti',
                label: 'Smart Text Input',
                description: 'User types an answer (case-insensitive or exact).',
            },
            // --- REMOVED: The 'free-response' option has been purged from this list. ---
        ],
    },
    {
        category: 'Reading & Writing',
        questions: [
            {
                type: 'highlight-text',
                label: 'Highlight Text',
                description: 'User must identify and select correct phrases in a passage.',
            },
            {
                type: 'sentence-correction',
                label: 'Sentence Correction',
                description: 'User rewrites an incorrect sentence correctly.',
            },
        ],
    },
    {
        category: 'Math',
        questions: [
            {
                type: 'alg-equation',
                label: 'Algebraic Equation',
                description: 'User solves for one or more variables in an equation.',
            },
        ],
    },
];

/**
 * A modal dialog for adding new questions to a course. It organizes
 * question types into categories for a much-improved user experience.
 */
const AddQuestionModal: React.FC<AddQuestionModalProps> = ({ isOpen, onClose, onAddQuestion }) => {
    if (!isOpen) {
        return null;
    }

    /**
     * Handles the selection of a question type.
     * It calls the parent's onAddQuestion callback and then closes the modal.
     * @param type - The type of question to be added (e.g., 'mcq', 'sti').
     */
    const handleSelectQuestion = (type: IQuestion['type']) => {
        onAddQuestion(type);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add a New Question">
            <div className="add-question-modal">
                <div className="add-question-modal__header">
                    <p>Select a question type from the categories below.</p>
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
