// src/components/learner/qa/AnswerOption.tsx

import React from 'react';

// FIX: Add 'revealed' state for post-answer feedback
export type AnswerStatus = 'default' | 'selected' | 'correct' | 'incorrect' | 'revealed';

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
