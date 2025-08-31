// src/components/learner/QuestionDisplay/QuestionDisplay.tsx

import React from 'react';

interface QuestionDisplayProps {
    text: string;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ text }) => {
    return (
        <div className="question-display">
            <p className="question-display__text">{text}</p>
        </div>
    );
};

export default QuestionDisplay;
