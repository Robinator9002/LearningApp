// src/pages/learner/ProgressTrackerPage.tsx

import React, { useContext } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { Frown } from 'lucide-react';

import { db } from '../../lib/db';
import { AuthContext } from '../../contexts/AuthContext';
import type { IUserTracking } from '../../types/database';

// Import the new sub-components
import StatCard from '../../components/learner/progress/StatCard';
import ActivityChart from '../../components/learner/progress/ActivityChart';
import SubjectBreakdown from '../../components/learner/progress/SubjectBreakdown';
import HistoryTable from '../../components/learner/progress/HistoryTable';

const ProgressTrackerPage: React.FC = () => {
    const { t } = useTranslation();
    const auth = useContext(AuthContext);

    const trackingData = useLiveQuery(
        () =>
            auth?.currentUser
                ? db.userTracking.where('userId').equals(auth.currentUser.id!).first()
                : undefined,
        [auth?.currentUser],
    ) as IUserTracking | undefined;

    if (!auth?.currentUser) {
        return <div>{t('labels.loading')}</div>; // Or some other auth error state
    }

    // Loading state while dexie fetches the data
    if (trackingData === undefined) {
        return <div>{t('labels.loading')}</div>;
    }

    // Empty state if the user has no tracking data yet
    if (trackingData === null || trackingData?.completedCourses.length === 0) {
        return (
            <div className="progress-tracker-empty">
                <Frown size={64} />
                <h2>{t('progress.noDataTitle')}</h2>
                <p>{t('progress.noDataMessage')}</p>
            </div>
        );
    }

    const totalCourses = trackingData.completedCourses.length;
    const totalTimeMinutes = Math.round(trackingData.totalTimeSpent / 60);

    // Calculate average score
    const totalScoreSum = trackingData.completedCourses.reduce(
        (sum, course) => sum + course.score,
        0,
    );
    const totalQuestionsSum = trackingData.completedCourses.reduce(
        (sum, course) => sum + course.totalQuestions,
        0,
    );
    const averageScore = totalQuestionsSum > 0 ? (totalScoreSum / totalQuestionsSum) * 100 : 0;

    return (
        <div className="progress-tracker-page">
            <h1 className="progress-tracker-page__title">{t('progress.pageTitle')}</h1>

            <section className="progress-tracker-page__overview">
                <StatCard title={t('progress.totalTime')} value={`${totalTimeMinutes} min`} />
                <StatCard title={t('progress.coursesCompleted')} value={totalCourses} />
                <StatCard
                    title={t('progress.averageScore')}
                    value={`${averageScore.toFixed(1)}%`}
                />
            </section>

            <section className="progress-tracker-page__visuals">
                <ActivityChart data={trackingData.dailyActivity} />
                <SubjectBreakdown data={trackingData.statsBySubject} />
            </section>

            <section className="progress-tracker-page__history">
                <HistoryTable courses={trackingData.completedCourses} />
            </section>
        </div>
    );
};

export default ProgressTrackerPage;
