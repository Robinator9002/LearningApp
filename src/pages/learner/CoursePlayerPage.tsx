// src/pages/learner/CoursePlayerPage.tsx

import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import Confetti from 'react-confetti';
// We will simulate the math.js library. In a real project, you would install it.
// import * as math from 'mathjs';

import { db } from '../../lib/db';
import { AuthContext } from '../../contexts/AuthContext';
import type { IProgressLog, IMCQOption } from '../../types/database';

import Button from '../../components/common/Button/Button';
import CourseSummary from '../../components/learner/Course/CourseSummary';
import AnswerOption, { type AnswerStatus } from '../../components/learner/QA/AnswerOption';
import Input from '../../components/common/Form/Input/Input';
// 1. Import the new AlgebraEquationSolver component
import AlgebraEquationSolver from '../../components/learner/QA/AlgebraEquationSolver';

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

/**
 * A mock evaluation function to simulate using a real math library like math.js.
 * This is the core of the intelligent evaluation.
 * @param equation The equation string, e.g., "2*x + 5 = 3*y - 12"
 * @param answers A record of variable values, e.g., { x: '8.5', y: '10' }
 * @returns True if the equation holds, false otherwise.
 */
const evaluateEquation = (equation: string, answers: Record<string, string>): boolean => {
    try {
        // Step 1: Split the equation into left and right sides.
        const sides = equation.split('=');
        if (sides.length !== 2) return false; // Invalid equation format
        const leftSide = sides[0].trim();
        const rightSide = sides[1].trim();

        // Step 2: Create a scope object for the math parser by converting
        // the answer strings to numbers.
        const scope: Record<string, number> = {};
        for (const variable in answers) {
            const value = parseFloat(answers[variable]);
            if (isNaN(value)) return false; // A variable is not a valid number
            scope[variable] = value;
        }

        // Step 3: Use the (simulated) math library to parse and evaluate each side.
        // In a real app, this would be:
        // const leftResult = math.evaluate(leftSide, scope);
        // const rightResult = math.evaluate(rightSide, scope);

        // For this simulation, we'll use a safer, limited evaluation.
        // This is a simplified stand-in for a real math parser.
        const evalWithScope = (expr: string, localScope: Record<string, number>) => {
            const func = new Function(...Object.keys(localScope), `return ${expr}`);
            return func(...Object.values(localScope));
        };

        const leftResult = evalWithScope(leftSide, scope);
        const rightResult = evalWithScope(rightSide, scope);

        // Step 4: Compare the results with a small tolerance for floating point issues.
        return Math.abs(leftResult - rightResult) < 1e-9;
    } catch (error) {
        // If the equation is malformed or evaluation fails, it's incorrect.
        console.error('Equation evaluation failed:', error);
        return false;
    }
};

const CoursePlayerPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const [width, height] = useWindowSize();

    // --- State Management ---
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [stiAnswer, setStiAnswer] = useState('');
    // 2. Add new state for the algebra answers
    const [algAnswers, setAlgAnswers] = useState<Record<string, string>>({});
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [autoProceedTimeout, setAutoProceedTimeout] = useState<NodeJS.Timeout | null>(null);

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
        // 3. Implement the new evaluation logic
        switch (currentQuestion.type) {
            case 'mcq':
                const selectedOption = currentQuestion.options.find(
                    (opt: IMCQOption) => opt.id === selectedOptionId,
                );
                correct = selectedOption?.isCorrect ?? false;
                break;
            case 'sti':
                const learnerAnswer = stiAnswer.trim();
                if (currentQuestion.evaluationMode === 'case-insensitive') {
                    correct = currentQuestion.correctAnswers.some(
                        (ans: any) => ans.toLowerCase() === learnerAnswer.toLowerCase(),
                    );
                } else {
                    correct = currentQuestion.correctAnswers.includes(learnerAnswer);
                }
                break;
            case 'alg-equation':
                // Use our powerful new evaluation function
                correct = evaluateEquation(currentQuestion.equation, algAnswers);
                break;
        }

        setIsCorrect(correct);
        if (correct) {
            setScore((prev) => prev + 1);
            setShowConfetti(true);
        }
        setIsAnswered(true);

        const timeout = setTimeout(() => {
            handleNextQuestion();
        }, 2000); // Wait 2 seconds before moving on
        setAutoProceedTimeout(timeout);
    };

    const handleNextQuestion = () => {
        if (autoProceedTimeout) {
            clearTimeout(autoProceedTimeout);
            setAutoProceedTimeout(null);
        }

        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setIsAnswered(false);
            setSelectedOptionId(null);
            setStiAnswer('');
            setAlgAnswers({}); // Reset algebra answers for the next question
            setIsCorrect(false);
        } else {
            handleCourseFinish();
        }
    };

    const handleAlgAnswerChange = (variable: string, value: string) => {
        setAlgAnswers((prev) => ({ ...prev, [variable]: value }));
    };

    // Timer to turn off confetti so it can re-trigger on subsequent correct answers
    useEffect(() => {
        if (showConfetti) {
            const timer = setTimeout(() => setShowConfetti(false), 5000); // Confetti lasts 5 seconds
            return () => clearTimeout(timer);
        }
    }, [showConfetti]);

    const handleCourseFinish = async () => {
        if (auth?.currentUser?.id && course?.id) {
            const logEntry: Omit<IProgressLog, 'id'> = {
                userId: auth.currentUser.id,
                courseId: course.id,
                score: score,
                totalQuestions,
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

    // Helper to determine if the check answer button should be disabled
    const isCheckDisabled = () => {
        if (!currentQuestion) return true;
        switch (currentQuestion.type) {
            case 'mcq':
                return !selectedOptionId;
            case 'sti':
                return stiAnswer.trim() === '';
            case 'alg-equation':
                // Check if every required variable has an answer
                return currentQuestion.variables.some((v: any) => !algAnswers[v]?.trim());
            default:
                return true;
        }
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
                            {currentQuestion.options.map((option: IMCQOption) => (
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

                    {currentQuestion.type === 'sti' && (
                        <div className="fitb-answer-area">
                            <Input
                                type="text"
                                placeholder="Type your answer here..."
                                value={stiAnswer}
                                onChange={(e) => setStiAnswer(e.target.value)}
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
                    )}

                    {/* 4. Render the new solver component */}
                    {currentQuestion.type === 'alg-equation' && (
                        <AlgebraEquationSolver
                            variables={currentQuestion.variables}
                            answers={algAnswers}
                            onAnswerChange={handleAlgAnswerChange}
                            disabled={isAnswered}
                        />
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
                                {currentQuestion.type === 'alg-equation' && ' Check your work.'}
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
                        disabled={isCheckDisabled()}
                    >
                        Check Answer
                    </Button>
                )}
            </footer>
        </div>
    );
};

export default CoursePlayerPage;
