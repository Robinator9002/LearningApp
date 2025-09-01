// src/components/common/Form/Select/Select.tsx

import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ children, className = '', ...props }) => {
    const selectClassName = `form-select ${className}`.trim();
    return (
        <select className={selectClassName} {...props}>
            {children}
        </select>
    );
};

export default Select;
