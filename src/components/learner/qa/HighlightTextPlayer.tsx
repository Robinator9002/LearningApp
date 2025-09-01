// src/components/learner/qa/HighlightTextPlayer.tsx

import React from 'react';

interface HighlightTextPlayerProps {
    passage: string;
    selectedWords: string[];
    onToggleWord: (word: string) => void;
    disabled: boolean;
}

/**
 * A player for 'highlight-text' questions. It tokenizes a passage
 * and allows the learner to select individual words.
 */
const HighlightTextPlayer: React.FC<HighlightTextPlayerProps> = ({
    passage,
    selectedWords = [], // FIX: Add a default empty array to prevent crashes
    onToggleWord,
    disabled,
}) => {
    // A simple regex to split the passage into words and punctuation.
    const words = passage.split(/(\s+|[.,!?;:"])/);

    return (
        <div className="highlight-text-player">
            <p className="highlight-text-player__passage">
                {words.map((word, index) => {
                    // We only want to make actual words clickable.
                    const isWord = /[a-zA-Z0-9]/.test(word);
                    if (!isWord) {
                        return <span key={index}>{word}</span>;
                    }

                    const isSelected = selectedWords.includes(word);
                    const className = `highlight-text-player__word ${
                        isSelected ? 'highlight-text-player__word--selected' : ''
                    }`;

                    return (
                        <span
                            key={index}
                            className={className}
                            onClick={() => !disabled && onToggleWord(word)}
                        >
                            {word}
                        </span>
                    );
                })}
            </p>
        </div>
    );
};

export default HighlightTextPlayer;
