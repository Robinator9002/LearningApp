// src/pages/learner/CoursePlayerPage.tsx

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// --- REMOVED: Confetti and useWindowSize temporarily to resolve build issues ---

import { db } from '../../lib/db';
import { ModalContext } from '../../contexts/ModalContext';
import type { ICourse } from '../../types/database';
import type { AnswerStatus } from '../../components/learner/qa/AnswerOption';
import CoursePlayerUI from '../../components/learner/course/CoursePlayerUI';
import CourseSummary from '../../components/learner/course/CourseSummary';
import { checkAnswer, isAnswerValid } from './CoursePlayerUtils';

const CoursePlayerPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const modal = useContext(ModalContext);
    // --- REMOVED: useWindowSize hook ---

    const [course, setCourse] = useState<ICourse | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    // --- REMOVED: showConfetti state ---

    // --- State for different answer types ---
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [stiAnswer, setStiAnswer] = useState('');
    const [algAnswers, setAlgAnswers] = useState<Record<string, string>>({});
    const [sentenceCorrectionAnswer, setSentenceCorrectionAnswer] = useState('');
    // -----------------------------------------

    if (!modal) throw new Error('CoursePlayerPage must be used within a ModalProvider');

    useEffect(() => {
        const fetchCourse = async () => {
            if (!courseId) return;
            try {
                const courseData = await db.courses.get(parseInt(courseId, 10));
                if (courseData) {
                    setCourse(courseData);
                } else {
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error('Failed to fetch course:', error);
            }
        };
        fetchCourse();
    }, [courseId, navigate]);

    const currentQuestion = course?.questions[currentQuestionIndex];

    const resetAnswerStates = () => {
        setSelectedOptionId(null);
        setStiAnswer('');
        setAlgAnswers({});
        setSentenceCorrectionAnswer('');
    };

    const handleCheckAnswer = () => {
        if (!currentQuestion) return;

        const answerPayload = {
            mcq: selectedOptionId,
            sti: stiAnswer,
            'alg-equation': algAnswers,
            'sentence-correction': sentenceCorrectionAnswer,
        };

        const result = checkAnswer(currentQuestion, answerPayload);
        setIsCorrect(result);
        setIsAnswered(true);

        if (result) {
            setScore((s) => s + 1);
        }

        setTimeout(() => {
            goToNextQuestion();
        }, 2000);
    };

    const goToNextQuestion = () => {
        if (course && currentQuestionIndex < course.questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setIsAnswered(false);
            setIsCorrect(false);
            resetAnswerStates();
        } else {
            setShowSummary(true);
        }
    };

    const getMCQStatus = (optionId: string): AnswerStatus => {
        if (!isAnswered) {
            return selectedOptionId === optionId ? 'selected' : 'default';
        }

        if (currentQuestion?.type !== 'mcq') return 'default';

        const correctOption = currentQuestion.options.find((o) => o.isCorrect);
        if (correctOption?.id === optionId) {
            return 'correct';
        }
        if (selectedOptionId === optionId) {
            return 'incorrect';
        }
        return 'default';
    };

    const isCheckButtonDisabled = () => {
        if (!currentQuestion) return true;
        const answerPayload = {
            mcq: selectedOptionId,
            sti: stiAnswer,
            'alg-equation': algAnswers,
            'sentence-correction': sentenceCorrectionAnswer,
        };
        return !isAnswerValid(currentQuestion, answerPayload);
    };

    if (!course) return <div>Loading...</div>;
    if (showSummary) {
        return <CourseSummary score={score} totalQuestions={course.questions.length} />;
    }

    const progressPercentage = ((currentQuestionIndex + 1) / course.questions.length) * 100;

    return (
        <>
            {/* --- REMOVED: Confetti component --- */}
            <CoursePlayerUI
                course={course}
                currentQuestionIndex={currentQuestionIndex}
                progressPercentage={progressPercentage}
                isAnswered={isAnswered}
                isCorrect={isCorrect}
                stiAnswer={stiAnswer}
                algAnswers={algAnswers}
                sentenceCorrectionAnswer={sentenceCorrectionAnswer}
                onExitCourse={() => navigate('/dashboard')}
                onCheckAnswer={handleCheckAnswer}
                onSelectOption={setSelectedOptionId}
                onStiAnswerChange={setStiAnswer}
                onAlgAnswerChange={(variable, value) =>
                    setAlgAnswers((prev) => ({ ...prev, [variable]: value }))
                }
                onSentenceCorrectionChange={setSentenceCorrectionAnswer}
                getMCQStatus={getMCQStatus}
                isCheckButtonDisabled={isCheckButtonDisabled}
            />
        </>
    );
};

export default CoursePlayerPage;
