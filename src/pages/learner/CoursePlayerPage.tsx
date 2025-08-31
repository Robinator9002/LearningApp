// src/pages/learner/CoursePlayerPage.tsx

import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import Confetti from 'react-confetti';

import { db } from '../../lib/db';
import { AuthContext } from '../../contexts/AuthContext';
import type { IProgressLog, IMCQOption } from '../../types/database';
import type { AnswerStatus } from '../../components/learner/qa/AnswerOption';

import CourseSummary from '../../components/learner/course/CourseSummary';
import CoursePlayerUI from '../../components/learner/course/CoursePlayerUI';
import { useWindowSize, evaluateEquation } from './CoursePlayerUtils';

/**
 * CoursePlayerPage serves as a "container" component.
 * # Its primary role is to manage state, data fetching, and business logic for the course player.
 * # It passes all necessary data and handlers down to the CoursePlayerUI component for rendering.
 */
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

    // --- Core Logic and Event Handlers ---

    const handleNextQuestion = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            // Reset state for the next question
            setIsAnswered(false);
            setSelectedOptionId(null);
            setStiAnswer('');
            setAlgAnswers({});
            setIsCorrect(false);
        } else {
            handleCourseFinish();
        }
    };

    const handleCheckAnswer = () => {
        if (!currentQuestion) return;

        let correct = false;
        // Determine correctness based on question type
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
        }
        setIsAnswered(true);

        // Automatically move to the next question after a delay
        setTimeout(() => {
            handleNextQuestion();
        }, 2000);
    };

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
        setShowConfetti(true); // Trigger confetti on course finish
    };

    // Effect to hide confetti after a few seconds
    useEffect(() => {
        if (showConfetti) {
            const timer = setTimeout(() => setShowConfetti(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [showConfetti]);

    // --- Prop Calculation for UI Component ---

    const getMCQStatus = (option: IMCQOption): AnswerStatus => {
        if (!isAnswered) {
            return selectedOptionId === option.id ? 'selected' : 'default';
        }
        if (option.isCorrect) return 'correct';
        if (selectedOptionId === option.id) return 'incorrect';
        return 'default';
    };

    const isCheckButtonDisabled = () => {
        if (!currentQuestion) return true;
        if (currentQuestion.type === 'mcq') return !selectedOptionId;
        if (currentQuestion.type === 'sti') return stiAnswer.trim() === '';
        if (currentQuestion.type === 'alg-equation' && currentQuestion.variables) {
            return currentQuestion.variables.some(
                (v: any) => !algAnswers[v] || algAnswers[v].trim() === '',
            );
        }
        return true;
    };

    // --- Render Logic ---

    if (!course || !currentQuestion) {
        return <div>Loading course...</div>;
    }

    if (isFinished) {
        return (
            <>
                {showConfetti && (
                    <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />
                )}
                <CourseSummary score={score} totalQuestions={totalQuestions} />
            </>
        );
    }

    return (
        <CoursePlayerUI
            course={course}
            currentQuestionIndex={currentQuestionIndex}
            progressPercentage={progressPercentage}
                isAnswered={isAnswered}
                isCorrect={isCorrect}
                selectedOptionId={selectedOptionId}
                stiAnswer={stiAnswer}
                algAnswers={algAnswers}
                onExitCourse={() => navigate('/dashboard')}
                onCheckAnswer={handleCheckAnswer}
                onSelectOption={setSelectedOptionId}
                onStiAnswerChange={setStiAnswer}
                onAlgAnswerChange={(variable, value) =>
                    setAlgAnswers((prev) => ({ ...prev, [variable]: value }))
                }
                getMCQStatus={getMCQStatus}
                isCheckButtonDisabled={isCheckButtonDisabled}
            />
    );
};

export default CoursePlayerPage;

