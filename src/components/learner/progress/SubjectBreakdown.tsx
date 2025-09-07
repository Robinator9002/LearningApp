// src/components/learner/progress/SubjectBreakdown.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { IStatsBySubject } from '../../../types/database';

interface SubjectBreakdownProps {
    data: IStatsBySubject;
}

const SubjectBreakdown: React.FC<SubjectBreakdownProps> = ({ data }) => {
    const { t } = useTranslation();

    return (
        <div className="subject-breakdown">
            <h3 className="subject-breakdown__title">{t('progress.subjectBreakdownTitle')}</h3>
            <div className="subject-breakdown__grid">
                {Object.entries(data).map(([subject, stats]) => (
                    <div key={subject} className="subject-card">
                        <h4 className="subject-card__title">{t(`subjects.${subject}`)}</h4>
                        <p className="subject-card__stat">
                            {Math.round(stats.totalTimeSpent / 60)} {t('progress.minutes')}
                        </p>
                        <p className="subject-card__stat">
                            {stats.coursesCompleted} {t('progress.courses')}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SubjectBreakdown;
