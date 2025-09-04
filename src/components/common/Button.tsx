// src/components/common/Button.tsx

import React from 'react';

// --- TYPE DEFINITIONS ---
// Defines the props for the Button component.
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    /**
     * The visual style of the button.
     * @default 'primary'
     */
    variant?: 'primary' | 'secondary' | 'danger';
    /**
     * The size of the button.
     * @default 'normal'
     */
    size?: 'normal' | 'large';
}

/**
 * A reusable, theme-aware button component.
 * It supports different visual variants and sizes through BEM-style CSS classes.
 */
const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'normal', // Default size is 'normal'
    className = '',
    ...props
}) => {
    // Construct the className string from our global CSS classes.
    // Base class: 'btn'
    // Modifiers: e.g., 'btn--primary', 'btn--large'
    const sizeClass = size !== 'normal' ? `btn--${size}` : '';
    const buttonClassName = `btn btn--${variant} ${sizeClass} ${className}`.trim();

    return (
        <button className={buttonClassName} {...props}>
            {children}
        </button>
    );
};

export default Button;
