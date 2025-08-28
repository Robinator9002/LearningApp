// src/components/common/Form/Label/Label.tsx

import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    children: React.ReactNode;
}

const Label: React.FC<LabelProps> = ({ children, className = '', ...props }) => {
    const labelClassName = `form-label ${className}`.trim();
    return (
        <label className={labelClassName} {...props}>
            {children}
        </label>
    );
};

export default Label;
