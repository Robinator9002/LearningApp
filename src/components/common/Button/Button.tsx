// src/components/common/Button/Button.tsx
import React from 'react';

// Define the props for the Button component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary'; // We can add more variants like 'secondary' later
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
    // Modifier class: 'btn--primary'
    const buttonClassName = `btn btn--${variant} ${className}`.trim();

    return (
        <button className={buttonClassName} {...props}>
            {children}
        </button>
    );
};

export default Button;
