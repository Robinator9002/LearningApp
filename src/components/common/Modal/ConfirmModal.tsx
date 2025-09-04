// src/components/common/Modal/ConfirmModal.tsx

import React from 'react';
import { useTranslation } from 'react-i18next'; // NEW: Import useTranslation
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
    const { t } = useTranslation(); // NEW: Initialize useTranslation

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <>
                <p>{message}</p>
                <div className="modal-footer">
                    {/* FIX: Replaced hardcoded "Cancel" */}
                    <Button onClick={onClose} variant="secondary">
                        {t('buttons.cancel')}
                    </Button>
                    {/* FIX: Replaced hardcoded "Confirm" */}
                    <Button variant="primary" onClick={onConfirm}>
                        {t('buttons.confirm')}
                    </Button>
                </div>
            </>
        </Modal>
    );
};

export default ConfirmModal;
