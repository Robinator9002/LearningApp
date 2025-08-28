// src/components/learner/AnswerOption/AnswerOption.tsx
import React from 'react';

export type AnswerStatus = 'default' | 'selected' | 'correct' | 'incorrect';

interface AnswerOptionProps {
    text: string;
    status: AnswerStatus;
    onClick: () => void;
    disabled: boolean;
}

const AnswerOption: React.FC<AnswerOptionProps> = ({ text, status, onClick, disabled }) => {
    const statusClass = status !== 'default' ? `answer-option--${status}` : '';
    const className = `answer-option ${statusClass}`.trim();

    return (
        <button className={className} onClick={onClick} disabled={disabled}>
            {text}
        </button>
    );
};

export default AnswerOption;
