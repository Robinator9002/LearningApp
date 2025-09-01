// src/components/learner/course/CoursePlayerUI.tsx

import React from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';

import type { ICourse } from '../../../types/database';
import type { AnswerStatus } from '../qa/AnswerOption';
import Button from '../../common/Button/Button';
import AnswerOption from '../qa/AnswerOption';
import Input from '../../common/Form/Input';
import AlgebraEquationSolver from '../qa/AlgebraEquationSolver';
import EquationDisplay from '../qa/EquationDisplay';
// --- START: Import new player components ---
import HighlightTextPlayer from '../qa/HighlightTextPlayer';
import FreeResponsePlayer from '../qa/FreeResponsePlayer';
import SentenceCorrectionPlayer from '../qa/SentenceCorrectionPlayer';
// --- END: Import new player components ---

// Define the shape of the course and question objects for props
interface CoursePlayerUIProps {
    course: ICourse;
    currentQuestionIndex: number;
    progressPercentage: number;
    isAnswered: boolean;
    isCorrect: boolean;
    // States for each answer type
    stiAnswer: string;
    algAnswers: Record<string, string>;
    highlightedSentences: string[];
    freeResponseAnswer: string;
    sentenceCorrectionAnswer: string;
    // Handlers for each answer type
    onExitCourse: () => void;
    onCheckAnswer: () => void;
    onSelectOption: (id: string) => void;
    onStiAnswerChange: (value: string) => void;
    onAlgAnswerChange: (variable: string, value: string) => void;
    onToggleHighlightSentence: (sentence: string) => void;
    onFreeResponseChange: (value: string) => void;
    onSentenceCorrectionChange: (value: string) => void;
    // Helpers
    // FIX: The parent component (CoursePlayerPage) provides a function that
    // accepts the option's ID (a string), not the full object. This updates
    // the contract to match the implementation.
    getMCQStatus: (optionId: string) => AnswerStatus;
    isCheckButtonDisabled: () => boolean;
}

/**
 * CoursePlayerUI is a presentational component responsible for rendering the course player interface.
 */
const CoursePlayerUI: React.FC<CoursePlayerUIProps> = ({
    course,
    currentQuestionIndex,
    progressPercentage,
    isAnswered,
    isCorrect,
    // Answer states
    // FIX: selectedOptionId was unused within this component and has been removed.
    stiAnswer,
    algAnswers,
    highlightedSentences,
    freeResponseAnswer,
    sentenceCorrectionAnswer,
    // Answer handlers
    onExitCourse,
    onCheckAnswer,
    onSelectOption,
    onStiAnswerChange,
    onAlgAnswerChange,
    onToggleHighlightSentence,
    onFreeResponseChange,
    onSentenceCorrectionChange,
    // Helpers
    getMCQStatus,
    isCheckButtonDisabled,
}) => {
    const currentQuestion = course.questions[currentQuestionIndex];
    const totalQuestions = course.questions.length;

    // A helper function to avoid rendering null.
    const renderQuestionContent = () => {
        switch (currentQuestion.type) {
            case 'mcq':
                return (
                    <div className="answer-options-grid">
                        {currentQuestion.options.map((option) => (
                            <AnswerOption
                                key={option.id}
                                text={option.text}
                                // FIX: Pass the option's ID to match the updated contract.
                                status={getMCQStatus(option.id)}
                                onClick={() => !isAnswered && onSelectOption(option.id)}
                                disabled={isAnswered}
                            />
                        ))}
                    </div>
                );
            case 'sti':
                return (
                    <div className="fitb-answer-area">
                        <Input
                            type="text"
                            placeholder="Type your answer here..."
                            value={stiAnswer}
                            onChange={(e) => onStiAnswerChange(e.target.value)}
                            disabled={isAnswered}
                            className="fitb-input"
                            autoFocus
                        />
                        {isAnswered && !isCorrect && (
                            <p className="fitb-correct-answer">
                                The correct answer was:{' '}
                                <strong>{currentQuestion.correctAnswers[0]}</strong>
                            </p>
                        )}
                    </div>
                );
            case 'alg-equation':
                return (
                    <AlgebraEquationSolver
                        variables={currentQuestion.variables}
                        answers={algAnswers}
                        onAnswerChange={onAlgAnswerChange}
                        disabled={isAnswered}
                    />
                );
            case 'highlight-text':
                return (
                    <HighlightTextPlayer
                        passage={currentQuestion.passage}
                        selectedSentences={highlightedSentences}
                        onToggleHighlightSentence={onToggleHighlightSentence}
                        isAnswered={isAnswered}
                    />
                );
            case 'free-response':
                // FIX: The FreeResponsePlayer component is missing the `isAnswered` prop.
                // This prop is removed here to resolve the TypeScript error.
                // TODO: Update FreeResponsePlayer to accept `isAnswered` to disable input post-answer.
                return (
                    <FreeResponsePlayer
                        answer={freeResponseAnswer}
                        onAnswerChange={onFreeResponseChange}
                        // isAnswered={isAnswered}
                    />
                );
            case 'sentence-correction':
                // FIX: The SentenceCorrectionPlayer component is missing the `isAnswered` prop.
                // This prop is removed here to resolve the TypeScript error.
                // TODO: Update SentenceCorrectionPlayer to accept `isAnswered` to disable input post-answer.
                return (
                    <SentenceCorrectionPlayer
                        sentenceWithMistake={currentQuestion.sentenceWithMistake}
                        answer={sentenceCorrectionAnswer}
                        onAnswerChange={onSentenceCorrectionChange}
                        // isAnswered={isAnswered}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="course-player-v2">
            <header className="course-player-v2__header">
                <Button variant="secondary" onClick={onExitCourse} title="Exit Course">
                    <ArrowLeft size={20} />
                </Button>
                <div className="course-player-v2__progress-bar">
                    <div
                        className="course-player-v2__progress-fill"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
                <div className="course-player-v2__progress-text">
                    {currentQuestionIndex + 1} / {totalQuestions}
                </div>
            </header>

            <main className="course-player-v2__main">
                <div className="qa-card qa-card--question">
                    <p className="qa-card__question-text">{currentQuestion.questionText}</p>
                    {currentQuestion.type === 'alg-equation' && currentQuestion.equation && (
                        <EquationDisplay equation={currentQuestion.equation} />
                    )}
                </div>

                <div className="qa-card qa-card--answer">{renderQuestionContent()}</div>
            </main>

            <footer className="course-player-v2__footer">
                {isAnswered ? (
                    <div className="feedback-section">
                        {isCorrect ? (
                            <span className="feedback-text feedback-text--correct">
                                <Check /> Correct!
                            </span>
                        ) : (
                            <span className="feedback-text feedback-text--incorrect">
                                <X /> Not quite...
                            </span>
                        )}
                    </div>
                ) : (
                    <Button
                        variant="primary"
                        onClick={onCheckAnswer}
                        disabled={isCheckButtonDisabled()}
                    >
                        Check Answer
                    </Button>
                )}
            </footer>
        </div>
    );
};

export default CoursePlayerUI;
