// src/pages/learner/ProgressTrackerPage.tsx

import React, { useContext } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { AuthContext } from '../../contexts/AuthContext';
import { db } from '../../lib/db';

import StatCard from '../../components/learner/progress/StatCard';
import ActivityChart from '../../components/learner/progress/ActivityChart';
import SubjectBreakdown from '../../components/learner/progress/SubjectBreakdown';
import HistoryTable from '../../components/learner/progress/HistoryTable';
import Button from '../../components/common/Button';

const ProgressTrackerPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    const trackingData = useLiveQuery(
        async () => {
            if (!auth?.currentUser?.id) return undefined;
            const data = await db.userTracking.where({ userId: auth.currentUser.id }).first();
            return data || null;
        },
        [auth?.currentUser?.id],
        undefined,
    );

    if (trackingData === undefined) {
        return <div>{t('labels.loadingProgress')}</div>;
    }

    if (!trackingData || trackingData.completedCourses.length === 0) {
        return (
            <div className="progress-tracker-page progress-tracker-page--empty">
                <h2>{t('progress.title')}</h2>
                <p>{t('progress.noData')}</p>
                <Button variant="primary" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={16} /> {t('buttons.backToDashboard')}
                </Button>
            </div>
        );
    }

    return (
        <div className="progress-tracker-page">
            {/* NEW: Added a header with a title and a back button */}
            <div className="progress-tracker-page__header">
                <h2>{t('progress.title')}</h2>
                <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={16} /> {t('buttons.backToDashboard')}
                </Button>
            </div>

            <div className="progress-tracker-page__stats-grid">
                <StatCard
                    title={t('progress.totalTime')}
                    value={`${Math.round(trackingData.totalTimeSpent / 60)} ${t(
                        'progress.minutes',
                    )}`}
                />
                <StatCard
                    title={t('progress.coursesCompleted')}
                    value={trackingData.completedCourses.length}
                />
            </div>

            <ActivityChart data={trackingData.dailyActivity} />
            <SubjectBreakdown data={trackingData.statsBySubject} />
            <HistoryTable courses={trackingData.completedCourses} />
        </div>
    );
};

export default ProgressTrackerPage;
