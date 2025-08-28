// src/components/common/Modal/Modal.tsx
import React from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

/**
 * A generic, reusable Modal component that renders its content in a portal.
 */
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) {
        return null;
    }

    // We use a portal to render the modal at the top level of the DOM,
    // which is essential for correct stacking and accessibility.
    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        &times;
                    </button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>,
        document.getElementById('root')!, // Render inside our main app container
    );
};

export default Modal;
