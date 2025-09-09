// src/pages/learner/ProgressTrackerPage.tsx

import React, { useContext } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// FIX: Add explicit file extensions to imports to ensure the bundler can resolve them.
import { db } from '../../lib/db.ts';
import { AuthContext } from '../../contexts/AuthContext.tsx';
import Button from '../../components/common/Button.tsx';

import StatCard from '../../components/learner/progress/StatCard.tsx';
import ActivityChart from '../../components/learner/progress/ActivityChart.tsx';
import SubjectBreakdown from '../../components/learner/progress/SubjectBreakdown.tsx';
import HistoryTable from '../../components/learner/progress/HistoryTable.tsx';

const ProgressTrackerPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    const trackingData = useLiveQuery(
        async () => {
            if (!auth?.currentUser?.id) return undefined;
            // DATABASE FIX: Query by the 'userId' index, not the primary key.
            // The .get() method was failing because it only works on the primary key ('++id').
            const data = await db.userTracking.where('userId').equals(auth.currentUser.id).first();
            return data ?? null; // Return null if not found to distinguish from loading state
        },
        [auth?.currentUser?.id],
        undefined,
    );

    // This state handles when the data is still being fetched.
    if (trackingData === undefined || !auth?.currentUser) {
        return <div>{t('labels.loadingProgress')}</div>;
    }

    // This state handles when a user has no tracking data created yet.
    if (trackingData === null || trackingData.completedCourses.length === 0) {
        return (
            <div className="progress-tracker-page progress-tracker-page--empty">
                <div className="progress-tracker-page__header">
                    <h2>{t('progress.title')}</h2>
                    <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                        {t('buttons.backToDashboard')}
                    </Button>
                </div>
                <p>{t('progress.noData')}</p>
            </div>
        );
    }

    const totalTimeMinutes = Math.round(trackingData.totalTimeSpent / 60);

    return (
        <div className="progress-tracker-page">
            <div className="progress-tracker-page__header">
                <h2>{t('progress.title')}</h2>
                <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                    {t('buttons.backToDashboard')}
                </Button>
            </div>

            <div className="progress-tracker-page__stats-grid">
                <StatCard title={t('progress.totalTime')} value={`${totalTimeMinutes} min`} />
                <StatCard
                    title={t('progress.coursesCompleted')}
                    value={trackingData.completedCourses.length}
                />
                <StatCard
                    title={t('progress.averageScore')}
                    value={`${trackingData.averageScore.toFixed(1)}%`}
                />
            </div>

            <ActivityChart data={trackingData.dailyActivity} />
            <SubjectBreakdown data={trackingData.statsBySubject} />
            <HistoryTable courses={trackingData.completedCourses} />
        </div>
    );
};

export default ProgressTrackerPage;
