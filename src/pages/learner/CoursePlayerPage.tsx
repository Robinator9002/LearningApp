// src/pages/learner/CoursePlayerPage.tsx

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';

import { db } from '../../lib/db';
import type { IMCQOption } from '../../types/database';

import Button from '../../components/common/Button/Button';
import QuestionDisplay from '../../components/learner/QA/QuestionDisplay';
import AnswerOption, { type AnswerStatus } from '../../components/learner/QA/AnswerOption';
import CourseSummary from '../../components/learner/Course/CourseSummary';

const CoursePlayerPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();

    // --- State Management ---
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    // --- Data Fetching ---
    const course = useLiveQuery(
        () => (courseId ? db.courses.get(parseInt(courseId, 10)) : undefined),
        [courseId],
    );

    if (!course) {
        return <div>Loading course...</div>;
    }

    const currentQuestion = course.questions[currentQuestionIndex];
    const totalQuestions = course.questions.length;

    // --- Event Handlers ---
    const handleAnswerSelect = (option: IMCQOption) => {
        if (isAnswered) return; // Prevent changing answer after submission

        setSelectedAnswerId(option.id);
        setIsAnswered(true);

        if (option.isCorrect) {
            setScore((prevScore) => prevScore + 1);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
            // Reset for the next question
            setIsAnswered(false);
            setSelectedAnswerId(null);
        } else {
            // Last question was answered, finish the course
            setIsFinished(true);
        }
    };

    // --- Render Logic ---
    const getAnswerStatus = (option: IMCQOption): AnswerStatus => {
        if (!isAnswered) {
            return selectedAnswerId === option.id ? 'selected' : 'default';
        }
        if (option.isCorrect) {
            return 'correct';
        }
        if (selectedAnswerId === option.id) {
            return 'incorrect';
        }
        return 'default';
    };

    // --- Final Render ---
    if (isFinished) {
        return <CourseSummary score={score} totalQuestions={totalQuestions} />;
    }

    return (
        <div className="course-player">
            <header className="course-player__header">
                <div>
                    <h2 className="course-player__title">{course.title}</h2>
                </div>
                <div className="course-player__progress">
                    Question {currentQuestionIndex + 1} / {totalQuestions}
                </div>
            </header>

            <div className="course-player__content">
                <QuestionDisplay text={currentQuestion.questionText} />
                <div className="answer-options-list">
                    {currentQuestion.options.map((option: any) => (
                        <AnswerOption
                            key={option.id}
                            text={option.text}
                            status={getAnswerStatus(option)}
                            onClick={() => handleAnswerSelect(option)}
                            disabled={isAnswered}
                        />
                    ))}
                </div>
            </div>

            <footer className="course-player__footer">
                <Button onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={16} style={{ marginRight: '8px' }} />
                    Exit Course
                </Button>
                {isAnswered && (
                    <Button variant="primary" onClick={handleNextQuestion}>
                        {currentQuestionIndex < totalQuestions - 1 ? 'Next' : 'Finish'}
                    </Button>
                )}
            </footer>
        </div>
    );
};

export default CoursePlayerPage;
