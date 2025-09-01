// src/components/learner/course/CoursePlayerUI.tsx

import React from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';

import type { IMCQOption } from '../../../types/database';
import type { AnswerStatus } from '../qa/AnswerOption';
import Button from '../../common/Button/Button';
import AnswerOption from '../qa/AnswerOption';
import Input from '../../common/Form/Input';
import AlgebraEquationSolver from '../qa/AlgebraEquationSolver';
import EquationDisplay from '../qa/EquationDisplay';

// Define the shape of the course and question objects for props
interface CoursePlayerUIProps {
    course: {
        questions: {
            questionText: string;
            type: 'mcq' | 'sti' | 'alg-equation';
            equation?: string;
            options?: IMCQOption[];
            correctAnswers?: string[];
            variables?: string[];
        }[];
    };
    currentQuestionIndex: number;
    progressPercentage: number;
    isAnswered: boolean;
    isCorrect: boolean;
    selectedOptionId: string | null;
    stiAnswer: string;
    algAnswers: Record<string, string>;
    onExitCourse: () => void;
    onCheckAnswer: () => void;
    onSelectOption: (id: string) => void;
    onStiAnswerChange: (value: string) => void;
    onAlgAnswerChange: (variable: string, value: string) => void;
    getMCQStatus: (option: IMCQOption) => AnswerStatus;
    isCheckButtonDisabled: () => boolean;
}

/**
 * CoursePlayerUI is a presentational component responsible for rendering the course player interface.
 * # It is stateless and receives all data and callbacks via props from a container component.
 */
const CoursePlayerUI: React.FC<CoursePlayerUIProps> = ({
    course,
    currentQuestionIndex,
    progressPercentage,
    isAnswered,
    isCorrect,
    stiAnswer,
    algAnswers,
    onExitCourse,
    onCheckAnswer,
    onSelectOption,
    onStiAnswerChange,
    onAlgAnswerChange,
    getMCQStatus,
    isCheckButtonDisabled,
}) => {
    const currentQuestion = course.questions[currentQuestionIndex];
    const totalQuestions = course.questions.length;

    return (
        <div className="course-player-v2">
            {/* --- HEADER: Navigation and Progress --- */}
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

            {/* --- MAIN CONTENT: Question and Answer areas --- */}
            <main className="course-player-v2__main">
                <div className="qa-card qa-card--question">
                    <p className="qa-card__question-text">{currentQuestion.questionText}</p>
                    {currentQuestion.type === 'alg-equation' && currentQuestion.equation && (
                        <EquationDisplay equation={currentQuestion.equation} />
                    )}
                </div>

                <div className="qa-card qa-card--answer">
                    {/* Multiple Choice Question */}
                    {currentQuestion.type === 'mcq' && currentQuestion.options && (
                        <div className="answer-options-grid">
                            {currentQuestion.options.map((option) => (
                                <AnswerOption
                                    key={option.id}
                                    text={option.text}
                                    status={getMCQStatus(option)}
                                    onClick={() => !isAnswered && onSelectOption(option.id)}
                                    disabled={isAnswered}
                                />
                            ))}
                        </div>
                    )}

                    {/* Short Text Input */}
                    {currentQuestion.type === 'sti' && (
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
                            {isAnswered && !isCorrect && currentQuestion.correctAnswers && (
                                <p className="fitb-correct-answer">
                                    The correct answer was:{' '}
                                    <strong>{currentQuestion.correctAnswers[0]}</strong>
                                </p>
                            )}
                        </div>
                    )}

                    {/* Algebraic Equation */}
                    {currentQuestion.type === 'alg-equation' && currentQuestion.variables && (
                        <AlgebraEquationSolver
                            variables={currentQuestion.variables}
                            answers={algAnswers}
                            onAnswerChange={onAlgAnswerChange}
                            disabled={isAnswered}
                        />
                    )}
                </div>
            </main>

            {/* --- FOOTER: Feedback and Actions --- */}
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
