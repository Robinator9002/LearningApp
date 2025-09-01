// src/components/admin/AddQuestionModal/AddQuestionModal.tsx

import React from 'react';
import type { IQuestion } from '../../../types/database';
import Modal from '../../common/Modal/Modal';

/**
 * Defines the properties for the AddQuestionModal component.
 * @param isOpen - A boolean that controls whether the modal is visible.
 * @param onClose - A callback function to be invoked when the modal should be closed.
 * @param onAddQuestion - A callback function that passes the selected question type
 * back to the parent component to be created.
 */
interface AddQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddQuestion: (type: IQuestion['type']) => void;
}

/**
 * A modal dialog for adding new questions to a course. It will organize
 * question types into categories for a better user experience, replacing the
 * long, disorganized row of buttons in the header.
 */
const AddQuestionModal: React.FC<AddQuestionModalProps> = ({ isOpen, onClose }) => {
    // This component renders nothing if it's not open.
    // The actual modal logic (like the overlay) is handled by the generic Modal component.
    if (!isOpen) {
        return null;
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add a New Question">
            <div className="add-question-modal">
                <div className="add-question-modal__header">
                    {/* The title is now passed to the generic Modal, so this h2 is redundant */}
                    <p>Select a question type from the categories below.</p>
                </div>
                <div className="add-question-modal__content">
                    {/* The content for categories and buttons will be added in the next step. */}
                    <p>Categories will go here...</p>
                </div>
            </div>
        </Modal>
    );
};

export default AddQuestionModal;
