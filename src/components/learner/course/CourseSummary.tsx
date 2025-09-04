// src/components/learner/course/CourseSummary.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // MODIFICATION: Imported useTranslation
import Button from '../../common/Button';

interface CourseSummaryProps {
    score: number;
    totalQuestions: number;
}

const CourseSummary: React.FC<CourseSummaryProps> = ({ score, totalQuestions }) => {
    const navigate = useNavigate();
    const { t } = useTranslation(); // MODIFICATION: Initialized useTranslation

    return (
        <div className="course-summary">
            {/* MODIFICATION: Replaced hardcoded text */}
            <h2 className="course-summary__title">{t('summary.title')}</h2>
            <p className="course-summary__message">{t('summary.message')}</p>
            <p className="course-summary__score">
                {/* MODIFICATION: Replaced hardcoded text and used interpolation */}
                {t('summary.score', { score, total: totalQuestions })}
            </p>
            <div className="course-summary__actions">
                {/* MODIFICATION: Replaced hardcoded text */}
                <Button variant="primary" onClick={() => navigate('/dashboard')}>
                    {t('buttons.backToDashboard')}
                </Button>
            </div>
        </div>
    );
};

export default CourseSummary;
