// src/components/learner/CourseSummary/CourseSummary.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../common/Button/Button';

interface CourseSummaryProps {
    score: number;
    totalQuestions: number;
}

const CourseSummary: React.FC<CourseSummaryProps> = ({ score, totalQuestions }) => {
    const navigate = useNavigate();

    return (
        <div className="course-summary">
            <h2 className="course-summary__title">Course Complete!</h2>
            <p className="course-summary__message">Great job making it to the end.</p>
            <p className="course-summary__score">
                Your Score: {score} / {totalQuestions}
            </p>
            <div className="course-summary__actions">
                <Button variant="primary" onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
                </Button>
            </div>
        </div>
    );
};

export default CourseSummary;
