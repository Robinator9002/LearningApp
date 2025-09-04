// src/contexts/ModalContext.tsx

import React, { createContext, useState, useCallback, type ReactNode } from 'react';

// --- COMPONENT IMPORTS ---
import Modal from '../components/common/Modal/Modal.tsx';
import Button from '../components/common/Button.tsx';

// --- TYPE DEFINITIONS ---

/**
 * Defines the shape for simple alert dialogs.
 */
interface AlertOptions {
    title: string;
    message: string;
    onClose?: () => void;
}

/**
 * Defines the shape for confirmation dialogs that require user action.
 */
interface ConfirmOptions extends AlertOptions {
    onConfirm: () => void;
    onCancel?: () => void;
}

/**
 * A new type to define a custom modal.
 * It includes a title and the React component (JSX) to be rendered.
 */
interface CustomModalOptions {
    title: string;
    content: React.ReactNode;
}

/**
 * The shape of the context that will be exposed to the application.
 * It now includes functions to show/hide alerts, confirmations, and custom modals.
 */
interface ModalContextType {
    showAlert: (options: AlertOptions) => void;
    showConfirm: (options: ConfirmOptions) => void;
    showModal: (options: CustomModalOptions) => void;
    hideModal: () => void;
}

// Create the context with an initial undefined value.
export const ModalContext = createContext<ModalContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---

interface ModalProviderProps {
    children: ReactNode;
}

/**
 * The ModalProvider is the workhorse. It manages the state for all modal types
 * and renders the appropriate modal when its state is set. It should wrap the
 * entire application to make the context available everywhere.
 */
export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
    // A single state object to manage which modal is active.
    // This simplifies logic, as only one modal can be open at a time.
    const [modalState, setModalState] = useState<{
        type: 'alert' | 'confirm' | 'custom' | null;
        props: any;
    }>({ type: null, props: {} });

    // --- CONTEXT API FUNCTIONS ---

    const showAlert = useCallback((options: AlertOptions) => {
        setModalState({ type: 'alert', props: options });
    }, []);

    const showConfirm = useCallback((options: ConfirmOptions) => {
        setModalState({ type: 'confirm', props: options });
    }, []);

    const showModal = useCallback((options: CustomModalOptions) => {
        setModalState({ type: 'custom', props: options });
    }, []);

    const hideModal = useCallback(() => {
        // Before closing, check if a cancel callback exists and call it.
        if (modalState.type === 'confirm' && modalState.props.onCancel) {
            modalState.props.onCancel();
        }
        setModalState({ type: null, props: {} });
    }, [modalState]);

    // --- ACTION HANDLERS ---

    const handleConfirm = () => {
        if (modalState.type === 'confirm' && modalState.props.onConfirm) {
            modalState.props.onConfirm();
        }
        hideModal();
    };

    // --- RENDER LOGIC ---

    const renderModal = () => {
        switch (modalState.type) {
            case 'alert':
                return (
                    <Modal isOpen={true} onClose={hideModal} title={modalState.props.title}>
                        <p>{modalState.props.message}</p>
                        <div className="modal-footer">
                            <Button variant="primary" onClick={hideModal}>
                                OK
                            </Button>
                        </div>
                    </Modal>
                );
            case 'confirm':
                return (
                    <Modal isOpen={true} onClose={hideModal} title={modalState.props.title}>
                        <p>{modalState.props.message}</p>
                        <div className="modal-footer">
                            <Button variant="secondary" onClick={hideModal}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={handleConfirm}>
                                Confirm
                            </Button>
                        </div>
                    </Modal>
                );
            case 'custom':
                // For custom modals, the content is passed in directly.
                // The custom component itself is responsible for its footer/actions.
                return (
                    <Modal isOpen={true} onClose={hideModal} title={modalState.props.title}>
                        {modalState.props.content}
                    </Modal>
                );
            default:
                return null;
        }
    };

    return (
        <ModalContext.Provider value={{ showAlert, showConfirm, showModal, hideModal }}>
            {children}
            {renderModal()}
        </ModalContext.Provider>
    );
};
