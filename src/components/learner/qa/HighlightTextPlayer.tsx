// src/components/learner/qa/HighlightTextPlayer.tsx

import React, { useMemo } from 'react';

interface HighlightTextPlayerProps {
    passage: string;
    // The state now tracks full sentences, not individual words.
    selectedSentences: string[];
    // The handler now toggles sentences in the parent state.
    onToggleHighlightSentence: (sentence: string) => void;
    isAnswered: boolean;
}

/**
 * A player component for "Highlight Text" questions.
 * It tokenizes a passage into sentences and allows the learner to select them.
 */
const HighlightTextPlayer: React.FC<HighlightTextPlayerProps> = ({
    passage,
    selectedSentences = [], // Default to an empty array to prevent crashes
    onToggleHighlightSentence,
    isAnswered,
}) => {
    // useMemo ensures we only split the passage into sentences when the text actually changes.
    // This is a performance optimization for a potentially expensive operation.
    // The regex splits the string by looking for a period, question mark, or
    // exclamation point, followed by a space, but it keeps the delimiter.
    const sentences = useMemo(() => {
        if (!passage) return [];
        // This regex splits the passage into sentences, preserving punctuation.
        // It looks for a punctuation mark followed by a space or the end of the string.
        return passage.match(/[^.!?]+[.!?]*/g) || [];
    }, [passage]);

    return (
        <div className="highlight-text-player">
            <p className="highlight-text-player__instructions">
                Select the sentence or sentences that correctly answer the question.
            </p>
            <div className="highlight-text-player__passage">
                {sentences.map((sentence, index) => {
                    const trimmedSentence = sentence.trim();
                    const isSelected = selectedSentences.includes(trimmedSentence);

                    return (
                        <span // Using <span> allows sentences to flow naturally in the paragraph.
                            key={index}
                            className={`sentence ${isSelected ? 'sentence--selected' : ''}`}
                            onClick={() =>
                                !isAnswered && onToggleHighlightSentence(trimmedSentence)
                            }
                        >
                            {sentence}
                        </span>
                    );
                })}
            </div>
        </div>
    );
};

export default HighlightTextPlayer;
