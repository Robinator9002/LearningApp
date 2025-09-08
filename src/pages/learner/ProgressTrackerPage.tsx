// src/pages/learner/ProgressTrackerPage.tsx

import React, { useContext } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { db } from '../../lib/db';
import { AuthContext } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';

import StatCard from '../../components/learner/progress/StatCard';
import ActivityChart from '../../components/learner/progress/ActivityChart';
import SubjectBreakdown from '../../components/learner/progress/SubjectBreakdown';
import HistoryTable from '../../components/learner/progress/HistoryTable';

const ProgressTrackerPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    const trackingData = useLiveQuery(
        async () => {
            if (!auth?.currentUser?.id) return undefined;
            // Explicitly return null if not found to distinguish from loading state
            const data = await db.userTracking.get(auth.currentUser.id);
            return data ?? null;
        },
        [auth?.currentUser?.id],
        undefined,
    );

    if (trackingData === undefined || !auth?.currentUser) {
        return <div>{t('labels.loadingProgress')}</div>;
    }

    // Handle the case where a user has no tracking data yet
    if (trackingData === null || trackingData.completedCourses.length === 0) {
        return (
            <div className="progress-tracker-page progress-tracker-page--empty">
                <div className="progress-tracker-page__header">
                    <h2>{t('progress.title')}</h2>
                    {/* NEW: Back button added to header for consistency */}
                    <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                        {t('buttons.backToDashboard')}
                    </Button>
                </div>
                <h3>{t('progress.title')}</h3>
                <p>{t('progress.noData')}</p>
            </div>
        );
    }

    const totalTimeMinutes = Math.round(trackingData.totalTimeSpent / 60);

    return (
        <div className="progress-tracker-page">
            <div className="progress-tracker-page__header">
                <h2>{t('progress.title')}</h2>
                {/* RELOCATED: The back button is now here */}
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
