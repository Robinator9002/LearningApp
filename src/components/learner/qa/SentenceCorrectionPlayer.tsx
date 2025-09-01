// src/components/learner/qa/SentenceCorrectionPlayer.tsx

import React from 'react';
import Textarea from '../../common/Form/Textarea';

interface SentenceCorrectionPlayerProps {
    sentenceWithMistake: string;
    answer: string;
    onAnswerChange: (value: string) => void;
    disabled: boolean;
}

/**
 * A component for learners to answer 'sentence-correction' questions.
 * It displays the incorrect sentence and a textarea for the learner's correction.
 */
const SentenceCorrectionPlayer: React.FC<SentenceCorrectionPlayerProps> = ({
    sentenceWithMistake,
    answer,
    onAnswerChange,
    disabled,
}) => {
    return (
        <div className="sentence-correction-player">
            <div className="sentence-correction-player__prompt">
                <p className="sentence-correction-player__prompt-label">
                    Correct the following sentence:
                </p>
                <p className="sentence-correction-player__prompt-text">"{sentenceWithMistake}"</p>
            </div>
            <Textarea
                value={answer}
                onChange={(e) => onAnswerChange(e.target.value)}
                disabled={disabled}
                placeholder="Type the corrected sentence here..."
                rows={4}
                className="sentence-correction-player__textarea"
            />
        </div>
    );
};

export default SentenceCorrectionPlayer;
