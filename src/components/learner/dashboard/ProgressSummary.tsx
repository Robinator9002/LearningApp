// src/components/learner/dashboard/ProgressSummary.tsx

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next'; // MODIFICATION: Imported useTranslation
import { db } from '../../../lib/db';

interface ProgressSummaryProps {
    currentUserId: number;
}

const ProgressSummary: React.FC<ProgressSummaryProps> = ({ currentUserId }) => {
    const { t } = useTranslation(); // MODIFICATION: Initialized useTranslation

    const progressLogs = useLiveQuery(
        () => db.progressLogs.where('userId').equals(currentUserId).toArray(),
        [currentUserId],
    );

    if (!progressLogs) {
        // MODIFICATION: Replaced hardcoded text
        return <div className="progress-summary">{t('labels.loadingProgress')}</div>;
    }

    if (progressLogs.length === 0) {
        return (
            <div className="progress-summary">
                {/* MODIFICATION: Replaced hardcoded text */}
                <h3 className="progress-summary__title">{t('dashboard.welcomeTitle')}</h3>
                <p>{t('dashboard.welcomeMessage')}</p>
            </div>
        );
    }

    const totalScore = progressLogs.reduce((sum: any, log: any) => sum + log.score, 0);
    const totalQuestions = progressLogs.reduce((sum: any, log: any) => sum + log.totalQuestions, 0);
    const averageScore = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;

    return (
        <div className="progress-summary">
            {/* MODIFICATION: Replaced hardcoded text */}
            <h3 className="progress-summary__title">{t('dashboard.progressTitle')}</h3>
            <div className="progress-summary__stats">
                <div className="stat-item">
                    <span className="stat-item__value">{progressLogs.length}</span>
                    {/* MODIFICATION: Replaced hardcoded text */}
                    <span className="stat-item__label">{t('labels.coursesCompleted')}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-item__value">{averageScore.toFixed(0)}%</span>
                    {/* MODIFICATION: Replaced hardcoded text */}
                    <span className="stat-item__label">{t('labels.averageScore')}</span>
                </div>
            </div>
        </div>
    );
};

export default ProgressSummary;
