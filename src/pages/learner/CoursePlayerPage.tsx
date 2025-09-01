// src/pages/learner/CoursePlayerPage.tsx

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

import { db } from '../../lib/db';
import { ModalContext } from '../../contexts/ModalContext';
// FIX: IQuestion is no longer needed, ICourse is sufficient.
import type { ICourse } from '../../types/database';
import type { AnswerStatus } from '../../components/learner/qa/AnswerOption';
import CoursePlayerUI from '../../components/learner/course/CoursePlayerUI';
import CourseSummary from '../../components/learner/course/CourseSummary';
import { checkAnswer, isAnswerValid } from './CoursePlayerUtils';

const CoursePlayerPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const modal = useContext(ModalContext);
    const { width, height } = useWindowSize();

    const [course, setCourse] = useState<ICourse | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // --- State for different answer types ---
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [stiAnswer, setStiAnswer] = useState('');
    const [algAnswers, setAlgAnswers] = useState<Record<string, string>>({});
    const [highlightedWords, setHighlightedWords] = useState<string[]>([]);
    const [freeResponseAnswer, setFreeResponseAnswer] = useState('');
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
        setHighlightedWords([]);
        setFreeResponseAnswer('');
        setSentenceCorrectionAnswer('');
    };

    const handleCheckAnswer = () => {
        if (!currentQuestion) return;

        const answerPayload = {
            mcq: selectedOptionId,
            sti: stiAnswer,
            'alg-equation': algAnswers,
            'highlight-text': highlightedWords,
            'free-response': freeResponseAnswer,
            'sentence-correction': sentenceCorrectionAnswer,
        };

        const result = checkAnswer(currentQuestion, answerPayload);
        setIsCorrect(result);
        setIsAnswered(true);

        if (result) {
            setScore((s) => s + 1);
            setShowConfetti(true);
        }

        setTimeout(() => {
            goToNextQuestion();
            setShowConfetti(false);
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
        // --- TYPE GUARD ---
        // We must check the question type before accessing type-specific properties.
        if (currentQuestion?.type !== 'mcq') {
            return 'default'; // Should not happen in MCQ context, but a safe fallback.
        }

        if (!isAnswered) {
            return selectedOptionId === optionId ? 'selected' : 'default';
        }
        // Inside this block, TypeScript now knows currentQuestion is an IQuestionMCQ.
        const correctOption = currentQuestion.options.find((o) => o.isCorrect);
        if (correctOption?.id === optionId) {
            return 'correct';
        }
        if (selectedOptionId === optionId) {
            return 'incorrect';
        }
        return 'default';
    };

    // --- Answer change handlers ---
    const handleToggleHighlightWord = (word: string) => {
        setHighlightedWords((prev) =>
            prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word],
        );
    };

    const isCheckButtonDisabled = () => {
        if (!currentQuestion) return true;
        const answerPayload = {
            mcq: selectedOptionId,
            sti: stiAnswer,
            'alg-equation': algAnswers,
            'highlight-text': highlightedWords,
            'free-response': freeResponseAnswer,
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
            {showConfetti && <Confetti width={width} height={height} />}
            <CoursePlayerUI
                course={course}
                currentQuestionIndex={currentQuestionIndex}
                progressPercentage={progressPercentage}
                isAnswered={isAnswered}
                isCorrect={isCorrect}
                // Pass states
                selectedOptionId={selectedOptionId}
                stiAnswer={stiAnswer}
                algAnswers={algAnswers}
                highlightedWords={highlightedWords}
                freeResponseAnswer={freeResponseAnswer}
                sentenceCorrectionAnswer={sentenceCorrectionAnswer}
                // Pass handlers
                onExitCourse={() => navigate('/dashboard')}
                onCheckAnswer={handleCheckAnswer}
                onSelectOption={setSelectedOptionId}
                onStiAnswerChange={setStiAnswer}
                onAlgAnswerChange={(variable, value) =>
                    setAlgAnswers((prev) => ({ ...prev, [variable]: value }))
                }
                onToggleHighlightWord={handleToggleHighlightWord}
                onFreeResponseChange={setFreeResponseAnswer}
                onSentenceCorrectionChange={setSentenceCorrectionAnswer}
                // Pass helpers
                getMCQStatus={getMCQStatus}
                isCheckButtonDisabled={isCheckButtonDisabled}
            />
        </>
    );
};

export default CoursePlayerPage;
