// src/components/admin/QuestionEditor/FillInTheBlankEditor.tsx

import React, { useContext } from 'react'; // MODIFICATION: Imported useContext
import { X } from 'lucide-react';
import type { IQuestion } from '../../../types/database';
import { ModalContext } from '../../../contexts/ModalContext'; // MODIFICATION: Imported ModalContext

// --- Component Imports ---
import Button from '../../common/Button/Button';
import Input from '../../common/Form/Input';
import Label from '../../common/Form/Label';
import Select from '../../common/Form/Select';

interface FillInTheBlankEditorProps {
    question: IQuestion;
    index: number;
    onQuestionChange: (index: number, question: IQuestion) => void;
    onRemoveQuestion: (index: number) => void;
}

/**
 * A component for editing Smart Text Input (sti) questions.
 * It allows for multiple correct answers and different evaluation modes.
 */
const FillInTheBlankEditor: React.FC<FillInTheBlankEditorProps> = ({
    question,
    index,
    onQuestionChange,
    onRemoveQuestion,
}) => {
    // MODIFICATION: Get the modal context to show alerts.
    const modal = useContext(ModalContext);

    // --- TYPE GUARD ---
    // This component is only for 'sti' questions. If another type is passed,
    // it will render nothing, preventing errors and ensuring component integrity.
    if (question.type !== 'sti') {
        return null;
    }

    if (!modal) {
        throw new Error('This component must be used within a ModalProvider');
    }

    /**
     * Handles changes to the main question text.
     */
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onQuestionChange(index, { ...question, questionText: e.target.value });
    };

    /**
     * Handles changes to one of the correct answer inputs.
     */
    const handleAnswerChange = (ansIndex: number, value: string) => {
        const newAnswers = [...question.correctAnswers];
        newAnswers[ansIndex] = value;
        onQuestionChange(index, { ...question, correctAnswers: newAnswers });
    };

    /**
     * Adds a new, empty answer field to the list.
     */
    const handleAddAnswer = () => {
        const newAnswers = [...question.correctAnswers, ''];
        onQuestionChange(index, { ...question, correctAnswers: newAnswers });
    };

    /**
     * Removes an answer from the list, ensuring at least one remains.
     */
    const handleRemoveAnswer = (ansIndex: number) => {
        // Prevent the removal of the last answer to maintain data integrity.
        if (question.correctAnswers.length <= 1) {
            // MODIFICATION: Replaced console.warn with a user-facing alert modal.
            modal.showAlert({
                title: 'Action Prohibited',
                message: 'A Smart Text Input question must have at least one accepted answer.',
            });
            return;
        }
        const newAnswers = question.correctAnswers.filter((_, i) => i !== ansIndex);
        onQuestionChange(index, { ...question, correctAnswers: newAnswers });
    };

    /**
     * Handles changes to the evaluation mode dropdown.
     */
    const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onQuestionChange(index, {
            ...question,
            evaluationMode: e.target.value as 'case-insensitive' | 'exact-match',
        });
    };

    return (
        <div className="question-editor">
            <div className="question-editor__header">
                <h3 className="question-editor__title">Question {index + 1} (Smart Text Input)</h3>
                <Button onClick={() => onRemoveQuestion(index)}>Remove</Button>
            </div>
            <div className="form-group">
                <Label htmlFor={`question-text-${question.id}`}>Question Text</Label>
                <Input
                    id={`question-text-${question.id}`}
                    value={question.questionText}
                    onChange={handleTextChange}
                    placeholder="e.g., The capital of France is ____."
                />
            </div>
            <div className="form-group">
                <Label>Evaluation Mode</Label>
                <Select value={question.evaluationMode} onChange={handleModeChange}>
                    <option value="case-insensitive">Case-insensitive</option>
                    <option value="exact-match">Exact Match</option>
                </Select>
            </div>
            <div className="form-group">
                <Label>Accepted Answers (one or more)</Label>
                <div className="answer-list">
                    {question.correctAnswers.map((answer, ansIndex) => (
                        <div key={ansIndex} className="answer-list__item">
                            <Input
                                value={answer}
                                onChange={(e) => handleAnswerChange(ansIndex, e.target.value)}
                                placeholder={`Answer ${ansIndex + 1}`}
                            />
                            <Button
                                variant="secondary"
                                onClick={() => handleRemoveAnswer(ansIndex)}
                                disabled={question.correctAnswers.length <= 1}
                                title="Remove Answer"
                            >
                                <X size={16} />
                            </Button>
                        </div>
                    ))}
                </div>
                <Button
                    variant="secondary"
                    onClick={handleAddAnswer}
                    className="answer-list__add-btn"
                >
                    + Add another answer
                </Button>
            </div>
        </div>
    );
};

export default FillInTheBlankEditor;
