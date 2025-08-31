// src/pages/learner/CoursePlayerPage.tsx

import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import Confetti from 'react-confetti';

import { db } from '../../lib/db';
import { AuthContext } from '../../contexts/AuthContext';
import type { IProgressLog, IMCQOption } from '../../types/database';

import Button from '../../components/common/Button/Button';
import CourseSummary from '../../components/learner/course/CourseSummary';
import AnswerOption, { type AnswerStatus } from '../../components/learner/qa/AnswerOption';
import Input from '../../components/common/Form/Input/Input';
import AlgebraEquationSolver from '../../components/learner/qa/AlgebraEquationSolver';
import EquationDisplay from '../../components/learner/qa/EquationDisplay';

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
 * A more robust mock evaluation function to simulate a real math library.
 * This version handles implicit multiplication (e.g., '2x') to prevent SyntaxErrors.
 * @param expression The mathematical expression string to evaluate.
 * @param scope A record of variable values, e.g., { x: 5, y: 10 }
 * @returns The numerical result of the evaluation.
 */
const evalWithScope = (expression: string, scope: Record<string, number>): number => {
    // Sanitize and replace implicit multiplication, e.g., '2x' becomes '2*x'
    let sanitizedExpression = expression.replace(/(\d+)([a-zA-Z]+)/g, '$1*$2');

    // Create a function body that declares the variables in the scope
    const functionBody = `
        "use strict";
        ${Object.keys(scope)
            .map((key) => `const ${key} = ${scope[key]};`)
            .join('\n')}
        return ${sanitizedExpression};
    `;
    try {
        const result = new Function(functionBody)();
        if (typeof result !== 'number' || !isFinite(result)) {
            throw new Error('Evaluation resulted in a non-finite number.');
        }
        return result;
    } catch (error) {
        console.error('Evaluation error:', error);
        // Return NaN (Not a Number) to indicate a failure in evaluation
        return NaN;
    }
};

/**
 * The core of the intelligent evaluation.
 * @param equation The equation string, e.g., "2*x + 5 = 3*y - 12"
 * @param answers A record of variable values, e.g., { x: '8.5', y: '10' }
 * @returns A boolean indicating if the solution is correct.
 */
const evaluateEquation = (equation: string, answers: Record<string, string>): boolean => {
    const parts = equation.split('=');
    if (parts.length !== 2) return false; // Not a valid equation

    const leftSide = parts[0].trim();
    const rightSide = parts[1].trim();

    // Convert string answers to numbers for the scope
    const scope: Record<string, number> = {};
    for (const key in answers) {
        const numValue = parseFloat(answers[key]);
        if (isNaN(numValue)) return false; // Invalid number input
        scope[key] = numValue;
    }

    try {
        const leftResult = evalWithScope(leftSide, scope);
        const rightResult = evalWithScope(rightSide, scope);

        // Use a small tolerance for comparing floating-point numbers
        return Math.abs(leftResult - rightResult) < 1e-9;
    } catch (error) {
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
    const [algAnswers, setAlgAnswers] = useState<Record<string, string>>({});
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

    /**
     * FIX: This new handler function correctly matches the signature expected
     * by the AlgebraEquationSolver component's onAnswerChange prop.
     */
    const handleAlgAnswerChange = (variable: string, value: string) => {
        setAlgAnswers((prevAnswers) => ({
            ...prevAnswers,
            [variable]: value,
        }));
    };

    const handleCheckAnswer = () => {
        if (!currentQuestion) return;

        let correct = false;
        if (currentQuestion.type === 'mcq') {
            const selectedOption = currentQuestion.options.find(
                (opt: IMCQOption) => opt.id === selectedOptionId,
            );
            correct = selectedOption?.isCorrect ?? false;
        } else if (currentQuestion.type === 'sti') {
            const userAnswer = stiAnswer.trim();
            const correctAnswers = currentQuestion.correctAnswers;
            if (currentQuestion.evaluationMode === 'case-insensitive') {
                correct = correctAnswers.some(
                    (ans: any) => ans.toLowerCase() === userAnswer.toLowerCase(),
                );
            } else {
                correct = correctAnswers.includes(userAnswer);
            }
        } else if (currentQuestion.type === 'alg-equation') {
            correct = evaluateEquation(currentQuestion.equation, algAnswers);
        }

        setIsCorrect(correct);
        if (correct) {
            setScore((prev) => prev + 1);
            setShowConfetti(true);
        }
        setIsAnswered(true);

        setTimeout(() => {
            handleNextQuestion();
        }, 2000);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setIsAnswered(false);
            setSelectedOptionId(null);
            setStiAnswer('');
            setAlgAnswers({});
            setIsCorrect(false);
        } else {
            handleCourseFinish();
        }
    };

    useEffect(() => {
        if (showConfetti) {
            const timer = setTimeout(() => setShowConfetti(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [showConfetti]);

    const handleCourseFinish = async () => {
        // FIX: Added an explicit check for currentUser.id to satisfy TypeScript
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

    const getMCQStatus = (option: IMCQOption): AnswerStatus => {
        if (!isAnswered) {
            return selectedOptionId === option.id ? 'selected' : 'default';
        }
        if (option.isCorrect) return 'correct';
        if (selectedOptionId === option.id) return 'incorrect';
        return 'default';
    };

    if (!course || !currentQuestion) {
        return <div>Loading course...</div>;
    }

    if (isFinished) {
        return <CourseSummary score={score} totalQuestions={totalQuestions} />;
    }

    const checkButtonDisabled = () => {
        if (currentQuestion.type === 'mcq') return !selectedOptionId;
        if (currentQuestion.type === 'sti') return stiAnswer.trim() === '';
        if (currentQuestion.type === 'alg-equation') {
            return currentQuestion.variables.some(
                (v: any) => !algAnswers[v] || algAnswers[v].trim() === '',
            );
        }
        return true;
    };

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
                    {currentQuestion.type === 'alg-equation' && (
                        <EquationDisplay equation={currentQuestion.equation} />
                    )}
                </div>

                <div className="qa-card qa-card--answer">
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
                            </span>
                        )}
                    </div>
                ) : (
                    <Button
                        variant="primary"
                        onClick={handleCheckAnswer}
                        disabled={checkButtonDisabled()}
                    >
                        Check Answer
                    </Button>
                )}
            </footer>
        </div>
    );
};

export default CoursePlayerPage;
