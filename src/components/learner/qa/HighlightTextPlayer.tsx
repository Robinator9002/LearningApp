// src/components/learner/qa/HighlightTextPlayer.tsx

import React from 'react';

interface HighlightTextPlayerProps {
    passage: string;
    selectedWords: string[];
    onToggleWord: (word: string) => void;
    disabled: boolean;
}

/**
 * A component for learners to answer 'highlight-text' questions.
 * It tokenizes a passage of text into clickable words/spans.
 */
const HighlightTextPlayer: React.FC<HighlightTextPlayerProps> = ({
    passage,
    selectedWords,
    onToggleWord,
    disabled,
}) => {
    // A simple tokenizer that splits the passage by spaces and punctuation,
    // but keeps the punctuation as separate tokens to be rendered.
    const tokens = passage.split(/(\s+|[.,!?;"'])/).filter(Boolean);

    return (
        <div className="highlight-text-player">
            <p className="highlight-text-player__passage">
                {tokens.map((token, index) => {
                    // We only want actual words to be selectable, not whitespace or punctuation.
                    const isWord = /[a-zA-Z0-9]/.test(token);
                    const isSelected = isWord && selectedWords.includes(token);

                    const className = `
                        highlight-text-player__token
                        ${isWord ? 'highlight-text-player__token--word' : ''}
                        ${isSelected ? 'highlight-text-player__token--selected' : ''}
                        ${disabled ? 'highlight-text-player__token--disabled' : ''}
                    `;

                    return (
                        <span
                            key={index}
                            className={className.trim()}
                            onClick={() => !disabled && isWord && onToggleWord(token)}
                        >
                            {token}
                        </span>
                    );
                })}
            </p>
        </div>
    );
};

export default HighlightTextPlayer;
