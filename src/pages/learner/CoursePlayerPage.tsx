// src/pages/learner/CoursePlayerPage.tsx

import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import Confetti from 'react-confetti';

import { db } from '../../lib/db';
import { AuthContext } from '../../contexts/AuthContext';
import type { IMCQOption, IProgressLog } from '../../types/database';

import Button from '../../components/common/Button/Button';
import CourseSummary from '../../components/learner/Course/CourseSummary';
import AnswerOption, { type AnswerStatus } from '../../components/learner/QA/AnswerOption';
import Input from '../../components/common/Form/Input/Input';

// A simple hook to manage window dimensions for the confetti effect.
const useWindowSize = () => {
    const [size, setSize] = useState([window.innerWidth, window.innerHeight]);
    useEffect(() => {
        const handleResize = () => setSize([window.innerWidth, window.innerHeight]);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return size;
};

const CoursePlayerPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    // Correctly destructure the array returned by the hook
    const [width, height] = useWindowSize();

    // --- State Management ---
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [fitbAnswer, setFitbAnswer] = useState('');
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // --- Data Fetching ---
    const course = useLiveQuery(
        () => (courseId ? db.courses.get(parseInt(courseId, 10)) : undefined),
        [courseId],
    );

    const currentQuestion = course?.questions[currentQuestionIndex];
    const totalQuestions = course?.questions.length ?? 0;
    const progressPercentage =
        totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

    // --- Event Handlers ---
    const handleCheckAnswer = () => {
        if (!currentQuestion) return;

        let correct = false;
        if (currentQuestion.type === 'mcq') {
            // Add explicit type to 'opt' parameter
            const selectedOption = currentQuestion.options?.find(
                (opt: IMCQOption) => opt.id === selectedOptionId,
            );
            correct = selectedOption?.isCorrect ?? false;
        } else if (currentQuestion.type === 'fitb') {
            correct =
                fitbAnswer.trim().toLowerCase() ===
                currentQuestion.correctAnswer?.trim().toLowerCase();
        }

        setIsCorrect(correct);
        if (correct) {
            setScore((prev) => prev + 1);
            setShowConfetti(true);
        }
        setIsAnswered(true);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            // Reset state for the new question
            setIsAnswered(false);
            setSelectedOptionId(null);
            setFitbAnswer('');
            setIsCorrect(false);
        } else {
            handleCourseFinish();
        }
    };

    // Timer to turn off confetti so it can re-trigger on subsequent correct answers
    useEffect(() => {
        if (showConfetti) {
            const timer = setTimeout(() => setShowConfetti(false), 5000); // Confetti lasts 5 seconds
            return () => clearTimeout(timer);
        }
    }, [showConfetti]);

    const handleCourseFinish = async () => {
        if (auth?.currentUser && course?.id) {
            const logEntry: Omit<IProgressLog, 'id'> = {
                userId: auth.currentUser.id!,
                courseId: course.id,
                score: score,
                totalQuestions,
                // Convert Date object to ISO string to match the type definition
                timestamp: new Date().toISOString(),
            };
            await db.progressLogs.add(logEntry as IProgressLog);
        }
        setIsFinished(true);
    };

    // Helper for MCQ answer status
    const getMCQStatus = (option: IMCQOption): AnswerStatus => {
        if (!isAnswered) {
            return selectedOptionId === option.id ? 'selected' : 'default';
        }
        if (option.isCorrect) return 'correct';
        if (selectedOptionId === option.id) return 'incorrect';
        return 'default';
    };

    // --- Render Logic ---
    if (!course || !currentQuestion) {
        return <div>Loading course...</div>;
    }

    if (isFinished) {
        return <CourseSummary score={score} totalQuestions={totalQuestions} />;
    }

    return (
        <div className="course-player-v2">
            {showConfetti && (
                <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />
            )}

            <header className="course-player-v2__header">
                <Button
                    variant="secondary"
                    onClick={() => navigate('/dashboard')}
                    title="Exit Course"
                >
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
                </div>

                <div className="qa-card qa-card--answer">
                    {/* RENDER LOGIC: Switch between question types */}
                    {currentQuestion.type === 'mcq' && (
                        <div className="answer-options-grid">
                            {currentQuestion.options?.map((option: IMCQOption) => (
                                <AnswerOption
                                    key={option.id}
                                    text={option.text}
                                    status={getMCQStatus(option)}
                                    onClick={() => !isAnswered && setSelectedOptionId(option.id)}
                                    disabled={isAnswered}
                                />
                            ))}
                        </div>
                    )}

                    {currentQuestion.type === 'fitb' && (
                        <div className="fitb-answer-area">
                            <Input
                                type="text"
                                placeholder="Type your answer here..."
                                value={fitbAnswer}
                                onChange={(e) => setFitbAnswer(e.target.value)}
                                disabled={isAnswered}
                                className="fitb-input"
                                autoFocus
                            />
                            {isAnswered && !isCorrect && (
                                <p className="fitb-correct-answer">
                                    The correct answer was:{' '}
                                    <strong>{currentQuestion.correctAnswer}</strong>
                                </p>
                            )}
                        </div>
                    )}
                </div>
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
                        <Button variant="primary" onClick={handleNextQuestion}>
                            {currentQuestionIndex < totalQuestions - 1
                                ? 'Next Question'
                                : 'Finish Course'}
                        </Button>
                    </div>
                ) : (
                    <Button
                        variant="primary"
                        onClick={handleCheckAnswer}
                        disabled={
                            (currentQuestion.type === 'mcq' && !selectedOptionId) ||
                            (currentQuestion.type === 'fitb' && fitbAnswer.trim() === '')
                        }
                    >
                        Check Answer
                    </Button>
                )}
            </footer>
        </div>
    );
};

export default CoursePlayerPage;
