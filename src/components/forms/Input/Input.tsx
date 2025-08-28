// src/components/common/forms/Input/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
    const inputClassName = `form-input ${className}`.trim();
    return <input className={inputClassName} {...props} />;
};

export default Input;
