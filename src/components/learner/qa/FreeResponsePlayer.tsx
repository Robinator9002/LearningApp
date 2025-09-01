// src/components/learner/qa/FreeResponsePlayer.tsx

import React from 'react';
import Textarea from '../../common/Form/Textarea';

interface FreeResponsePlayerProps {
    answer: string;
    onAnswerChange: (value: string) => void;
    disabled: boolean;
}

/**
 * A component for learners to answer 'free-response' questions.
 * It provides a simple textarea for long-form answers.
 */
const FreeResponsePlayer: React.FC<FreeResponsePlayerProps> = ({
    answer,
    onAnswerChange,
    disabled,
}) => {
    return (
        <div className="free-response-player">
            <Textarea
                value={answer}
                onChange={(e) => onAnswerChange(e.target.value)}
                disabled={disabled}
                placeholder="Type your response here..."
                rows={8} // Provide a generous default size
                className="free-response-player__textarea"
            />
        </div>
    );
};

export default FreeResponsePlayer;
