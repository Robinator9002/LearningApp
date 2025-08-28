// src/components/common/Modal/AlertModal.tsx
import React from 'react';
import Modal from './Modal';
import Button from '../Button/Button';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
}

/**
 * A specific modal implementation for showing simple alerts and messages.
 */
const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, title, message }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <>
                <p>{message}</p>
                <div className="modal-footer">
                    <Button variant="primary" onClick={onClose}>
                        OK
                    </Button>
                </div>
            </>
        </Modal>
    );
};

export default AlertModal;
