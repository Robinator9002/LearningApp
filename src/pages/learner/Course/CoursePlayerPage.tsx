// src/pages/learner/Course/CoursePlayerPage.tsx

import React, { useEffect, useContext, useReducer, useState, useLayoutEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Confetti from 'react-confetti';

import { db } from '../../../lib/db';
import { ModalContext } from '../../../contexts/ModalContext';
// MODIFICATION: Import the AuthContext to get the current user
import { AuthContext } from '../../../contexts/AuthContext';
import type { ICourse } from '../../../types/database';
import type { AnswerStatus } from '../../../components/learner/qa/AnswerOption';
import CoursePlayerUI from '../../../components/learner/course/CoursePlayerUI';
import CourseSummary from '../../../components/learner/course/CourseSummary';
import { checkAnswer, isAnswerValid } from './CoursePlayerUtils';
// MODIFICATION: Import the tracking utility
import { saveTrackingData } from '../../../utils/trackingUtils';

const useWindowSize = () => {
    const [size, setSize] = useState([0, 0]);
    useLayoutEffect(() => {
        function updateSize() {
            setSize([window.innerWidth, window.innerHeight]);
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
};

interface PlayerState {
    course: ICourse | null;
    currentQuestionIndex: number;
    score: number;
    isAnswered: boolean;
    isCorrect: boolean;
    showSummary: boolean;
    showConfetti: boolean;
    startTime: number; // For tracking time spent
    selectedOptionId: string | null;
    stiAnswer: string;
    algAnswers: Record<string, string>;
    sentenceCorrectionAnswer: string;
}

const initialState: PlayerState = {
    course: null,
    currentQuestionIndex: 0,
    score: 0,
    isAnswered: false,
    isCorrect: false,
    showSummary: false,
    showConfetti: false,
    startTime: 0,
    selectedOptionId: null,
    stiAnswer: '',
    algAnswers: {},
    sentenceCorrectionAnswer: '',
};

type PlayerAction =
    | { type: 'SET_COURSE'; payload: ICourse }
    | { type: 'SELECT_OPTION'; payload: string }
    | { type: 'SET_STI_ANSWER'; payload: string }
    | { type: 'SET_ALG_ANSWER'; payload: { variable: string; value: string } }
    | { type: 'SET_SENTENCE_CORRECTION'; payload: string }
    | { type: 'CHECK_ANSWER' }
    | { type: 'NEXT_QUESTION' };

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
    switch (action.type) {
        case 'SET_COURSE':
            return { ...state, course: action.payload, startTime: Date.now() };
        case 'SELECT_OPTION':
            return { ...state, selectedOptionId: action.payload };
        case 'SET_STI_ANSWER':
            return { ...state, stiAnswer: action.payload };
        case 'SET_ALG_ANSWER':
            return {
                ...state,
                algAnswers: {
                    ...state.algAnswers,
                    [action.payload.variable]: action.payload.value,
                },
            };
        case 'SET_SENTENCE_CORRECTION':
            return { ...state, sentenceCorrectionAnswer: action.payload };
        case 'CHECK_ANSWER': {
            if (!state.course) return state;
            const currentQuestion = state.course.questions[state.currentQuestionIndex];
            const answerPayload = {
                mcq: state.selectedOptionId,
                sti: state.stiAnswer,
                'alg-equation': state.algAnswers,
                'sentence-correction': state.sentenceCorrectionAnswer,
            };
            const isCorrect = checkAnswer(currentQuestion, answerPayload);
            return {
                ...state,
                isAnswered: true,
                isCorrect,
                score: isCorrect ? state.score + 1 : state.score,
            };
        }
        case 'NEXT_QUESTION': {
            if (!state.course) return state;
            const isLastQuestion = state.currentQuestionIndex >= state.course.questions.length - 1;

            if (isLastQuestion) {
                return { ...state, showSummary: true, showConfetti: true };
            }

            return {
                ...state,
                currentQuestionIndex: state.currentQuestionIndex + 1,
                isAnswered: false,
                isCorrect: false,
                showConfetti: false,
                selectedOptionId: null,
                stiAnswer: '',
                algAnswers: {},
                sentenceCorrectionAnswer: '',
            };
        }
        default:
            return state;
    }
}

const CoursePlayerPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const modal = useContext(ModalContext);
    const auth = useContext(AuthContext); // MODIFICATION: Get the auth context
    const [width, height] = useWindowSize();
    const [state, dispatch] = useReducer(playerReducer, initialState);
    const {
        course,
        currentQuestionIndex,
        score,
        isAnswered,
        isCorrect,
        showSummary,
        showConfetti,
        startTime,
        selectedOptionId,
        stiAnswer,
        algAnswers,
        sentenceCorrectionAnswer,
    } = state;

    if (!modal || !auth) throw new Error('CoursePlayerPage must be used within required providers');

    useEffect(() => {
        const fetchCourse = async () => {
            if (!courseId) return;
            try {
                const courseData = await db.courses.get(parseInt(courseId, 10));
                if (courseData) {
                    dispatch({ type: 'SET_COURSE', payload: courseData });
                } else {
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error('Failed to fetch course:', error);
            }
        };
        fetchCourse();
    }, [courseId, navigate]);

    // MODIFICATION: This effect now handles saving the data when the summary is shown
    useEffect(() => {
        if (showSummary && course && auth.currentUser) {
            const timeSpent = (Date.now() - startTime) / 1000; // in seconds
            saveTrackingData({
                userId: auth.currentUser.id!,
                course,
                score,
                timeSpent,
                language: auth.currentUser.language || 'en',
            });
        }
    }, [showSummary, course, score, startTime, auth.currentUser]);

    const handleCheckAnswer = () => {
        dispatch({ type: 'CHECK_ANSWER' });
        setTimeout(() => {
            dispatch({ type: 'NEXT_QUESTION' });
        }, 2000);
    };

    const currentQuestion = course?.questions[currentQuestionIndex];

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
            {showConfetti && <Confetti width={width} height={height} recycle={false} />}
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
                onSelectOption={(id) => dispatch({ type: 'SELECT_OPTION', payload: id })}
                onStiAnswerChange={(value) => dispatch({ type: 'SET_STI_ANSWER', payload: value })}
                onAlgAnswerChange={(variable, value) =>
                    dispatch({ type: 'SET_ALG_ANSWER', payload: { variable, value } })
                }
                onSentenceCorrectionChange={(value) =>
                    dispatch({ type: 'SET_SENTENCE_CORRECTION', payload: value })
                }
                getMCQStatus={getMCQStatus}
                isCheckButtonDisabled={isCheckButtonDisabled}
            />
        </>
    );
};

export default CoursePlayerPage;
