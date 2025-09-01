// src/components/learner/qa/SentenceCorrectionPlayer.tsx

import React from 'react';
import Textarea from '../../common/Form/Textarea';

interface SentenceCorrectionPlayerProps {
    sentenceWithMistake: string;
    answer: string;
    onAnswerChange: (value: string) => void;
    isAnswered: boolean; // Add the missing prop
}

const SentenceCorrectionPlayer: React.FC<SentenceCorrectionPlayerProps> = ({
    sentenceWithMistake,
    answer,
    onAnswerChange,
    isAnswered, // Use the prop
}) => {
    return (
        <div className="sentence-correction-player">
            <div className="sentence-correction-player__prompt">
                <p className="sentence-correction-player__prompt-label">Original Sentence:</p>
                <p className="sentence-correction-player__prompt-text">"{sentenceWithMistake}"</p>
            </div>
            <Textarea
                value={answer}
                onChange={(e) => onAnswerChange(e.target.value)}
                placeholder="Type the corrected sentence here..."
                rows={5}
                disabled={isAnswered} // Disable the textarea when the question is answered
            />
        </div>
    );
};

export default SentenceCorrectionPlayer;
