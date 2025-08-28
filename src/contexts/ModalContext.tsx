// src/contexts/ModalContext.tsx
import React, { createContext, useState, type ReactNode } from 'react';
import ConfirmModal from '../components/common/Modal/ConfirmModal';

interface ModalOptions {
    title: string;
    message: string;
}

interface ConfirmOptions extends ModalOptions {
    onConfirm: () => void;
    onCancel?: () => void;
}

interface ModalContextType {
    showConfirm: (options: ConfirmOptions) => void;
    // We can add showAlert, showCustom, etc. here later
}

export const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
    children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
    const [confirmState, setConfirmState] = useState<ConfirmOptions | null>(null);

    const showConfirm = (options: ConfirmOptions) => {
        setConfirmState(options);
    };

    const handleClose = () => {
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

    return (
        <ModalContext.Provider value={{ showConfirm }}>
            {children}
            {confirmState && (
                <ConfirmModal
                    isOpen={!!confirmState}
                    title={confirmState.title}
                    message={confirmState.message}
                    onConfirm={handleConfirm}
                    onClose={handleClose}
                />
            )}
        </ModalContext.Provider>
    );
};
