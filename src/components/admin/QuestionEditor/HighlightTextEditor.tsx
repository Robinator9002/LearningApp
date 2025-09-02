// src/components/learner/qa/HighlightTextPlayer.tsx

import React from 'react';
// --- NEW: Import the reusable, universal passage component ---
import InteractivePassage from '../../shared/InteractivePassage';

interface HighlightTextPlayerProps {
    passage: string;
    selectedSentences: string[];
    // FIX: The handler prop name was updated to match the InteractivePassage component's API
    onSelectionChange: (sentences: string[]) => void;
    isAnswered: boolean;
}

/**
 * A player for "Highlight Text" questions, now refactored to use the
 * universal InteractivePassage component. This ensures a consistent
 * and reliable experience for the learner that mirrors the admin editor.
 */
const HighlightTextPlayer: React.FC<HighlightTextPlayerProps> = ({
    passage,
    selectedSentences = [],
    onSelectionChange,
    isAnswered,
}) => {
    return (
        <div className="highlight-text-player">
            <p className="highlight-text-player__instructions">
                Select the sentence or sentences that correctly answer the question.
            </p>
            {/* --- REWORKED: The old sentence-splitting logic is gone. --- */}
            {/* It is replaced with our new, intelligent component. */}
            <InteractivePassage
                passageText={passage}
                selectedSentences={selectedSentences}
                onSelectionChange={onSelectionChange}
                disabled={isAnswered}
            />
        </div>
    );
};

export default HighlightTextPlayer;
