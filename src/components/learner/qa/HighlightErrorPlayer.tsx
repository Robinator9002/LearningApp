// src/components/learner/qa/HighlightErrorPlayer.tsx

import React, { useMemo } from 'react';
import type { IQuestionHighlightError } from '../../../types/database.ts';

// --- TYPE DEFINITIONS ---

// Defines the possible visual states for a single word token in the player.
export type TokenStatus = 'default' | 'selected' | 'correct' | 'incorrect';

interface HighlightErrorPlayerProps {
    question: IQuestionHighlightError;
    selectedIndices: number[];
    isAnswered: boolean;
    onTokenSelect: (tokenIndex: number) => void;
}

// Re-using the same robust tokenizer from the admin editor ensures consistency.
const TOKENIZER_REGEX = /(\w+)|([^\w\s])/g;

/**
 * A player component for the "Highlight the Error" question type. It displays
 * a sentence and allows the learner to click on words to select them as answers.
 */
const HighlightErrorPlayer: React.FC<HighlightErrorPlayerProps> = ({
    question,
    selectedIndices,
    isAnswered,
    onTokenSelect,
}) => {
    // Memoize the tokenization to prevent re-calculating on every render.
    const sentenceTokens = useMemo(() => {
        return question.sentence.match(TOKENIZER_REGEX) || [];
    }, [question.sentence]);

    /**
     * Determines the visual status of a given word token based on the game state.
     * @param tokenIndex The index of the token in the `sentenceTokens` array.
     * @returns A `TokenStatus` string used for CSS styling.
     */
    const getTokenStatus = (tokenIndex: number): TokenStatus => {
        const isSelected = selectedIndices.includes(tokenIndex);
        const isCorrect = question.correctAnswerIndices.includes(tokenIndex);

        if (isAnswered) {
            if (isCorrect) return 'correct';
            if (isSelected && !isCorrect) return 'incorrect';
        } else {
            if (isSelected) return 'selected';
        }
        return 'default';
    };

    return (
        <div className="highlight-error-player">
            {sentenceTokens.map((token, tokenIndex) => {
                const isWord = /\w/.test(token);

                if (isWord) {
                    const status = getTokenStatus(tokenIndex);
                    return (
                        <span
                            key={`${question.id}-token-${tokenIndex}`}
                            className={`player-word-token player-word-token--${status}`}
                            onClick={() => !isAnswered && onTokenSelect(tokenIndex)}
                        >
                            {token}
                        </span>
                    );
                } else {
                    // Render punctuation as a simple, non-interactive span.
                    return (
                        <span
                            key={`${question.id}-token-${tokenIndex}`}
                            className="player-punctuation-token"
                        >
                            {token}
                        </span>
                    );
                }
            })}
        </div>
    );
};

export default HighlightErrorPlayer;
