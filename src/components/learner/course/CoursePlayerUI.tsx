import React from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';

import type { ICourse } from '../../../types/database';
import type { AnswerStatus } from '../qa/AnswerOption';
import Button from '../../common/Button/Button';
import AnswerOption from '../qa/AnswerOption';
import Input from '../../common/Form/Input';
import AlgebraEquationSolver from '../qa/AlgebraEquationSolver';
import EquationDisplay from '../qa/EquationDisplay';
import SentenceCorrectionPlayer from '../qa/SentenceCorrectionPlayer';

interface CoursePlayerUIProps {
    course: ICourse;
    currentQuestionIndex: number;
    progressPercentage: number;
    isAnswered: boolean;
    isCorrect: boolean;
    stiAnswer: string;
    algAnswers: Record<string, string>;
    sentenceCorrectionAnswer: string;
    onExitCourse: () => void;
    onCheckAnswer: () => void;
    onSelectOption: (id: string) => void;
    onStiAnswerChange: (value: string) => void;
    onAlgAnswerChange: (variable: string, value: string) => void;
    onSentenceCorrectionChange: (value: string) => void;
    getMCQStatus: (optionId: string) => AnswerStatus;
    isCheckButtonDisabled: () => boolean;
}

const CoursePlayerUI: React.FC<CoursePlayerUIProps> = ({
    course,
    currentQuestionIndex,
    progressPercentage,
    isAnswered,
    isCorrect,
    stiAnswer,
    algAnswers,
    sentenceCorrectionAnswer,
    onExitCourse,
    onCheckAnswer,
    onSelectOption,
    onStiAnswerChange,
    onAlgAnswerChange,
    onSentenceCorrectionChange,
    getMCQStatus,
    isCheckButtonDisabled,
}) => {
    const currentQuestion = course.questions[currentQuestionIndex];
    const totalQuestions = course.questions.length;

    const renderQuestionContent = () => {
        switch (currentQuestion.type) {
            case 'mcq':
                return (
                    <div className="answer-options-grid">
                        {currentQuestion.options.map((option) => (
                            <AnswerOption
                                key={option.id}
                                text={option.text}
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
            case 'sentence-correction':
                return (
                    <SentenceCorrectionPlayer
                        sentenceWithMistake={currentQuestion.sentenceWithMistake}
                        answer={sentenceCorrectionAnswer}
                        onAnswerChange={onSentenceCorrectionChange}
                        isAnswered={isAnswered}
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
