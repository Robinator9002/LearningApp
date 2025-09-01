// src/components/learner/qa/FreeResponsePlayer.tsx

import React from 'react';
import Textarea from '../../common/Form/Textarea';

interface FreeResponsePlayerProps {
    answer: string;
    onAnswerChange: (value: string) => void;
    isAnswered: boolean; // Add the missing prop
}

const FreeResponsePlayer: React.FC<FreeResponsePlayerProps> = ({
    answer,
    onAnswerChange,
    isAnswered, // Use the prop
}) => {
    return (
        <div className="free-response-player">
            <Textarea
                value={answer}
                onChange={(e) => onAnswerChange(e.target.value)}
                placeholder="Type your response here..."
                rows={8}
                disabled={isAnswered} // Disable the textarea when the question is answered
            />
        </div>
    );
};

export default FreeResponsePlayer;
