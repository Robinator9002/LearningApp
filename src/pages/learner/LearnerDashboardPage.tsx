// src/pages/learner/LearnerDashboardPage.tsx

import React, { useContext } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // MODIFICATION: Imported useTranslation
import { db } from '../../lib/db';
import { AuthContext } from '../../contexts/AuthContext';

import ProgressSummary from '../../components/learner/dashboard/ProgressSummary';
import CourseCard from '../../components/learner/course/CourseCard';

const LearnerDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation(); // MODIFICATION: Initialized useTranslation
    const auth = useContext(AuthContext);
    const courses = useLiveQuery(() => db.courses.toArray(), []);

    if (!auth || !auth.currentUser) {
        return <div>{t('labels.loadingUser')}</div>;
    }

    const { currentUser } = auth;

    const handleSelectCourse = (courseId: number) => {
        navigate(`/player/${courseId}`);
    };

    return (
        <div className="learner-dashboard">
            <ProgressSummary currentUserId={currentUser.id!} />

            {courses && courses.length > 0 ? (
                <div className="learner-dashboard__grid">
                    {courses.map((course: any) => (
                        <CourseCard key={course.id} course={course} onSelect={handleSelectCourse} />
                    ))}
                </div>
            ) : (
                <div className="learner-dashboard__empty">
                    {/* MODIFICATION: Replaced hardcoded text with i18n key */}
                    <p>{t('dashboard.noCourses')}</p>
                </div>
            )}
        </div>
    );
};

export default LearnerDashboardPage;
