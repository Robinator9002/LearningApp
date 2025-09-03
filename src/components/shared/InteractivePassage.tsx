import React from 'react';
import { v4 as uuidv4 } from 'uuid';
// --- MODIFIED: Corrected the import path for the stylesheet ---
import '../../../styles/components/InteractivePassage.css';

// A utility to split text into sentences. It's not perfect but handles
// common cases like periods, question marks, and exclamation points.
const splitIntoSentences = (text: string): string[] => {
    if (!text) return [];
    // This regex splits the text by looking for sentence-ending punctuation
    // followed by a space or the end of the string. The filter removes empty strings.
    return text.match(/[^.!?]+[.!?]\s*|[^.!?]+$/g)?.filter(Boolean) || [];
};

interface InteractivePassageProps {
    passageText: string;
    selectedSentences: string[];
    onSelectionChange: (sentences: string[]) => void;
    disabled?: boolean;
}

const InteractivePassage: React.FC<InteractivePassageProps> = ({
    passageText,
    selectedSentences = [],
    onSelectionChange,
    disabled = false,
}) => {
    const sentences = splitIntoSentences(passageText);

    const handleSentenceClick = (sentence: string) => {
        if (disabled) return;

        // Check if the sentence is already selected
        const isSelected = selectedSentences.includes(sentence);

        let newSelection;
        if (isSelected) {
            // If it's already selected, remove it
            newSelection = selectedSentences.filter((s) => s !== sentence);
        } else {
            // Otherwise, add it to the selection
            newSelection = [...selectedSentences, sentence];
        }
        onSelectionChange(newSelection);
    };

    const passageClassName = `interactive-passage ${disabled ? 'disabled' : ''}`;

    return (
        <div className={passageClassName}>
            {sentences.map((sentence) => {
                const isSelected = selectedSentences.includes(sentence.trim());
                const sentenceClassName = `sentence ${isSelected ? 'selected' : ''}`;

                return (
                    <span
                        key={uuidv4()} // Using uuid for a stable key
                        className={sentenceClassName}
                        onClick={() => handleSentenceClick(sentence.trim())}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleSentenceClick(sentence.trim());
                            }
                        }}
                    >
                        {sentence}
                    </span>
                );
            })}
        </div>
    );
};

export default InteractivePassage;
