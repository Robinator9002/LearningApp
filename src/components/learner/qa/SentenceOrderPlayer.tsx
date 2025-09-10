// src/components/learner/qa/SentenceOrderPlayer.tsx

import React, { useState, useEffect } from 'react';
import { GripVertical } from 'lucide-react';
import type { IQuestionSentenceOrder } from '../../../types/database';

interface SentenceOrderPlayerProps {
    question: IQuestionSentenceOrder;
    isAnswered: boolean;
    onAnswerChange: (newOrder: string[]) => void;
}

// A simple Fisher-Yates shuffle to randomize the initial order.
const shuffleArray = (array: string[]): string[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const SentenceOrderPlayer: React.FC<SentenceOrderPlayerProps> = ({
    question,
    isAnswered,
    onAnswerChange,
}) => {
    const [items, setItems] = useState<string[]>([]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    useEffect(() => {
        // Shuffle the items only once when the component mounts.
        const shuffled = shuffleArray(question.items);
        setItems(shuffled);
        onAnswerChange(shuffled);
    }, [question.id]); // Depend on question.id to re-shuffle for a new question

    const handleDragStart = (index: number) => {
        if (isAnswered) return;
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // Necessary to allow dropping
    };

    const handleDrop = (targetIndex: number) => {
        if (isAnswered || draggedIndex === null) return;

        const newItems = [...items];
        const [draggedItem] = newItems.splice(draggedIndex, 1);
        newItems.splice(targetIndex, 0, draggedItem);

        setItems(newItems);
        onAnswerChange(newItems);
        setDraggedIndex(null);
    };

    const getStatusClass = (index: number) => {
        if (!isAnswered) return '';
        return items[index] === question.items[index] ? 'correct' : 'incorrect';
    };

    return (
        <div className="sentence-order-player">
            {items.map((item, index) => (
                <div
                    key={`${question.id}-${item}-${index}`}
                    className={`sentence-order-player__item sentence-order-player__item--${getStatusClass(
                        index,
                    )} ${draggedIndex === index ? 'dragging' : ''}`}
                    draggable={!isAnswered}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                >
                    <GripVertical className="drag-handle" />
                    <p className="sentence-order-player__item-text">{item}</p>
                </div>
            ))}
        </div>
    );
};

export default SentenceOrderPlayer;
