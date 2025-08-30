// src/components/common/Form/Label/Label.tsx

import React from 'react';

// Define the props for the Label component
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    children: React.ReactNode;
    /**
     * Allows rendering the label as a different HTML element, e.g., 'h3'.
     * Defaults to 'label'.
     */
    as?: React.ElementType;
}

/**
 * A reusable, polymorphic label component.
 */
const Label: React.FC<LabelProps> = ({
    children,
    className = '',
    as: Component = 'label',
    ...props
}) => {
    const labelClassName = `form-label ${className}`.trim();

    // Render the component with the specified tag, passing along all props.
    return (
        <Component className={labelClassName} {...props}>
            {children}
        </Component>
    );
};

export default Label;
