// src/contexts/ModalContext.tsx

import React, { createContext, useState, type ReactNode } from 'react';
import ConfirmModal from '../components/common/Modal/ConfirmModal';
import AlertModal from '../components/common/Modal/AlertModal'; // Import the new component

interface ModalOptions {
    title: string;
    message: string;
}

interface ConfirmOptions extends ModalOptions {
    onConfirm: () => void;
    onCancel?: () => void;
}

interface AlertOptions extends ModalOptions {
    onClose?: () => void;
}

interface ModalContextType {
    showConfirm: (options: ConfirmOptions) => void;
    showAlert: (options: AlertOptions) => void; // Add the new function type
}

export const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
    children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
    const [confirmState, setConfirmState] = useState<ConfirmOptions | null>(null);
    const [alertState, setAlertState] = useState<AlertOptions | null>(null); // Add state for alerts

    const showConfirm = (options: ConfirmOptions) => {
        setConfirmState(options);
    };

    const showAlert = (options: AlertOptions) => {
        setAlertState(options);
    };

    const handleConfirmClose = () => {
        if (confirmState?.onCancel) {
            confirmState.onCancel();
        }
        setConfirmState(null);
    };

    const handleConfirm = () => {
        if (confirmState?.onConfirm) {
            confirmState.onConfirm();
        }
        setConfirmState(null);
    };

    const handleAlertClose = () => {
        if (alertState?.onClose) {
            alertState.onClose();
        }
        setAlertState(null);
    };

    return (
        <ModalContext.Provider value={{ showConfirm, showAlert }}>
            {children}
            {confirmState && (
                <ConfirmModal
                    isOpen={!!confirmState}
                    title={confirmState.title}
                    message={confirmState.message}
                    onConfirm={handleConfirm}
                    onClose={handleConfirmClose}
                />
            )}
            {alertState && (
                <AlertModal
                    isOpen={!!alertState}
                    title={alertState.title}
                    message={alertState.message}
                    onClose={handleAlertClose}
                />
            )}
        </ModalContext.Provider>
    );
};
