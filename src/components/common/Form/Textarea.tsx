// src/components/common/Form/Textarea/Textarea.tsx

import React from 'react';

// Inherit all standard HTML textarea attributes for maximum flexibility.
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * A reusable and consistently styled textarea component.
 * It acts as a simple wrapper around the native HTML <textarea> element,
 * applying a standard CSS class for styling.
 */
const Textarea: React.FC<TextareaProps> = ({ className, ...props }) => {
    // Combine a base class with any additional classes passed via props.
    // This allows for component-specific style modifications.
    const combinedClassName = `form-textarea ${className || ''}`.trim();

    return <textarea className={combinedClassName} {...props} />;
};

export default Textarea;
