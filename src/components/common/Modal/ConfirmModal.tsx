// src/components/common/Modal/ConfirmModal.tsx

import React from 'react';
import Modal from './Modal';
import Button from '../Button';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

/**
 * A specific modal implementation for confirmation dialogs.
 */
const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <>
                <p>{message}</p>
                <div className="modal-footer">
                    <Button onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={onConfirm}>
                        Confirm
                    </Button>
                </div>
            </>
        </Modal>
    );
};

export default ConfirmModal;
