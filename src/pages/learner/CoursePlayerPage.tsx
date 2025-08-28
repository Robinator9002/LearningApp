// src/pages/learner/CoursePlayerPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';

import { db } from '../../lib/db';
import type { ICourse } from '../../types/database';
import Button from '../../components/common/Button/Button';

const CoursePlayerPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();

    // --- State Management ---
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);

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

    return (
        <div className="course-player">
            <header className="course-player__header">
                <div>
                    <h2 className="course-player__title">{course.title}</h2>
                    <p className="course-player__subject">{course.subject}</p>
                </div>
                <div className="course-player__progress">
                    Question {currentQuestionIndex + 1} / {totalQuestions}
                </div>
            </header>

            <div className="course-player__content">
                {/* We will render QuestionDisplay and AnswerOption components here */}
                <h3>{currentQuestion?.questionText || 'Loading question...'}</h3>
            </div>

            <footer className="course-player__footer">
                <Button onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={16} style={{ marginRight: '8px' }} />
                    Back to Dashboard
                </Button>
                {/* "Next" and "Finish" buttons will be rendered here */}
            </footer>
        </div>
    );
};

export default CoursePlayerPage;
