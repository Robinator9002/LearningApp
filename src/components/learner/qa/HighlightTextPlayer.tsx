import React from 'react';
import InteractivePassage from '../../shared/InteractivePassage';
// --- NEW: Import the dedicated stylesheet for the player ---
import '../../../../styles/components/HighlightTextPlayer.css';

interface HighlightTextPlayerProps {
    passage: string;
    selectedSentences: string[];
    onSelectionChange: (sentences: string[]) => void;
    isAnswered: boolean;
}

/**
 * A player for "Highlight Text" questions, now refactored to use the
 * universal InteractivePassage component and custom styling. This ensures
 * a consistent and reliable experience for the learner.
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
