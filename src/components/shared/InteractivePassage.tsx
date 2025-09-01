// src/components/shared/InteractivePassage/InteractivePassage.tsx

import React, { useMemo } from 'react';

interface InteractivePassageProps {
    passageText: string;
    selectedSentences: string[];
    onSelectionChange: (newSelection: string[]) => void;
    disabled?: boolean;
}

/**
 * A reusable component that displays a passage of text, tokenizes it into
 * selectable sentences, and manages the selection state via callbacks.
 * This is the cornerstone of the 'Highlight Text' question type.
 */
const InteractivePassage: React.FC<InteractivePassageProps> = ({
    passageText,
    selectedSentences,
    onSelectionChange,
    disabled = false,
}) => {
    // useMemo ensures we only split the passage into sentences when the text actually changes.
    // This is a performance optimization for a potentially expensive operation.
    const sentences = useMemo(() => {
        if (!passageText) return [];
        // NOTE: This regex is a significant improvement but may not be perfect. It splits
        // the passage into sentences while trying to preserve punctuation. It looks for
        // a punctuation mark followed by a space or the end of the string.
        // It does not handle all edge cases (e.g., "Mr. Smith"). A more robust
        // solution would require a dedicated NLP library.
        return passageText.match(/[^.!?]+[.!?]*/g) || [];
    }, [passageText]);

    const handleSentenceClick = (sentence: string) => {
        if (disabled) return;

        const trimmedSentence = sentence.trim();
        const isSelected = selectedSentences.includes(trimmedSentence);

        let newSelection;
        if (isSelected) {
            newSelection = selectedSentences.filter((s) => s !== trimmedSentence);
        } else {
            newSelection = [...selectedSentences, trimmedSentence];
        }
        onSelectionChange(newSelection);
    };

    return (
        <div className="interactive-passage">
            {sentences.map((sentence, index) => {
                const trimmedSentence = sentence.trim();
                const isSelected = selectedSentences.includes(trimmedSentence);
                const sentenceClasses = [
                    'interactive-passage__sentence',
                    isSelected ? 'interactive-passage__sentence--selected' : '',
                    disabled ? 'interactive-passage__sentence--disabled' : '',
                ]
                    .join(' ')
                    .trim();

                return (
                    <span
                        key={index}
                        className={sentenceClasses}
                        onClick={() => handleSentenceClick(sentence)}
                    >
                        {/* Add a space after each sentence for natural wrapping */}
                        {sentence}{' '}
                    </span>
                );
            })}
        </div>
    );
};

export default InteractivePassage;
