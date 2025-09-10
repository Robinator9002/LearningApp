// src/components/learner/course/CoursePlayerUI.tsx

import React from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type {
    ICourse,
    IQuestionHighlightError,
    IQuestionSentenceOrder,
} from '../../../types/database';
import type { AnswerStatus } from '../qa/AnswerOption.tsx';
import Button from '../../common/Button.tsx';
import AnswerOption from '../qa/AnswerOption.tsx';
import Input from '../../common/Form/Input.tsx';
import AlgebraEquationSolver from '../qa/AlgebraEquationSolver.tsx';
import EquationDisplay from '../qa/EquationDisplay.tsx';
import SentenceCorrectionPlayer from '../qa/SentenceCorrectionPlayer.tsx';
import HighlightErrorPlayer from '../qa/HighlightErrorPlayer.tsx';
import SentenceOrderPlayer from '../qa/SentenceOrderPlayer.tsx';

interface CoursePlayerUIProps {
    course: ICourse;
    currentQuestionIndex: number;
    progressPercentage: number;
    isAnswered: boolean;
    isCorrect: boolean;
    // --- Answer States ---
    stiAnswer: string;
    algAnswers: Record<string, string>;
    sentenceCorrectionAnswer: string;
    highlightErrorIndices: number[];
    sentenceOrderAnswer: string[];
    // --- Event Handlers ---
    onExitCourse: () => void;
    onCheckAnswer: () => void;
    onSelectOption: (id: string) => void;
    onStiAnswerChange: (value: string) => void;
    onAlgAnswerChange: (variable: string, value: string) => void;
    onSentenceCorrectionChange: (value: string) => void;
    onHighlightErrorTokenSelect: (index: number) => void;
    onSentenceOrderChange: (newOrder: string[]) => void;
    // --- Status Getters ---
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
    highlightErrorIndices,
    onExitCourse,
    onCheckAnswer,
    onSelectOption,
    onStiAnswerChange,
    onAlgAnswerChange,
    onSentenceCorrectionChange,
    onHighlightErrorTokenSelect,
    onSentenceOrderChange,
    getMCQStatus,
    isCheckButtonDisabled,
}) => {
    const { t } = useTranslation();
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
                            placeholder={t('placeholders.sti.answer')}
                            value={stiAnswer}
                            onChange={(e) => onStiAnswerChange(e.target.value)}
                            disabled={isAnswered}
                            className="fitb-input"
                            autoFocus
                        />
                        {isAnswered && !isCorrect && (
                            <p className="fitb-correct-answer">
                                {t('player.correctAnswerWas')}{' '}
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
            case 'highlight-error':
                return (
                    <HighlightErrorPlayer
                        question={currentQuestion as IQuestionHighlightError}
                        selectedIndices={highlightErrorIndices}
                        isAnswered={isAnswered}
                        onTokenSelect={onHighlightErrorTokenSelect}
                    />
                );
            case 'sentence-order':
                return (
                    <SentenceOrderPlayer
                        question={currentQuestion as IQuestionSentenceOrder}
                        isAnswered={isAnswered}
                        onAnswerChange={onSentenceOrderChange}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="course-player-v2">
            <header className="course-player-v2__header">
                <Button variant="secondary" onClick={onExitCourse} title={t('player.exitCourse')}>
                    <ArrowLeft size={20} />
                </Button>
                <div className="course-player-v2__progress-bar">
                    <div
                        className="course-player-v2__progress-fill"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
                <div className="course-player-v2__progress-text">
                    {t('player.progress', {
                        current: currentQuestionIndex + 1,
                        total: totalQuestions,
                    })}
                </div>
            </header>

            <main className="course-player-v2__main">
                <div className="qa-card qa-card--question">
                    {currentQuestion.type === 'mcq' && currentQuestion.imageUrl && (
                        <div className="question-image-container">
                            <img src={currentQuestion.imageUrl} alt={t('altText.questionImage')} />
                        </div>
                    )}

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
                                <Check /> {t('feedback.correct')}
                            </span>
                        ) : (
                            <span className="feedback-text feedback-text--incorrect">
                                <X /> {t('feedback.incorrect')}
                            </span>
                        )}
                    </div>
                ) : (
                    <Button
                        variant="primary"
                        onClick={onCheckAnswer}
                        disabled={isCheckButtonDisabled()}
                    >
                        {t('buttons.checkAnswer')}
                    </Button>
                )}
            </footer>
        </div>
    );
};

export default CoursePlayerUI;
