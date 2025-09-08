// src/components/learner/course/CourseSummary.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../common/Button';

interface CourseSummaryProps {
    score: number;
    totalQuestions: number;
    onComplete: () => void; // MODIFICATION: Changed from navigate to a callback
}

const CourseSummary: React.FC<CourseSummaryProps> = ({ score, totalQuestions, onComplete }) => {
    const { t } = useTranslation();

    return (
        <div className="course-summary">
            <h2 className="course-summary__title">{t('summary.title')}</h2>
            <p className="course-summary__message">{t('summary.message')}</p>
            <p className="course-summary__score">
                {t('summary.score', { score, total: totalQuestions })}
            </p>
            <div className="course-summary__actions">
                {/* MODIFICATION: Button now calls the onComplete prop */}
                <Button variant="primary" onClick={onComplete}>
                    {t('buttons.backToDashboard')}
                </Button>
            </div>
        </div>
    );
};

export default CourseSummary;
