// src/components/common/Button/Button.tsx

import React from 'react';

// Define the props for the Button component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    /**
     * The visual style of the button.
     * Defaults to 'primary'.
     */
    variant?: 'primary' | 'secondary' | 'danger';
}

/**
 * A reusable button component that uses global BEM-style CSS classes.
 */
const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    className = '',
    ...props
}) => {
    // Construct the className string from our global CSS classes
    // Base class: 'btn'
    // Modifier class: e.g., 'btn--primary'
    const buttonClassName = `btn btn--${variant} ${className}`.trim();

    return (
        <button className={buttonClassName} {...props}>
            {children}
        </button>
    );
};

export default Button;
