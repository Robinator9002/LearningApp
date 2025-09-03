// src/pages/learner/LearnerDashboardPage.tsx

import React, { useContext, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// FIX: Added explicit file extensions to resolve potential import path errors.
import { db } from '../../lib/db.ts';
import { AuthContext } from '../../contexts/AuthContext.tsx';
import { groupCourses } from '../../lib/courseUtils.ts';
import ProgressSummary from '../../components/learner/dashboard/ProgressSummary.tsx';
import CourseCard from '../../components/learner/course/CourseCard.tsx';
import type { ICourse } from '../../types/database.ts';

const LearnerDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const auth = useContext(AuthContext);
    const courses = useLiveQuery(() => db.courses.toArray(), []);

    // MODIFICATION: Use the `groupCourses` utility, memoizing the result for performance.
    const groupedCourses = useMemo(() => {
        if (!courses) return {};
        return groupCourses(courses);
    }, [courses]);

    if (!auth || !auth.currentUser) {
        return <div>{t('labels.loading')}</div>;
    }

    const { currentUser } = auth;

    const handleSelectCourse = (courseId: number) => {
        navigate(`/player/${courseId}`);
    };

    return (
        <div className="learner-dashboard">
            <ProgressSummary currentUserId={currentUser.id!} />

            {courses && courses.length > 0 ? (
                <div className="learner-dashboard__content">
                    {/* MODIFICATION: Render courses in nested loops by category. */}
                    {Object.keys(groupedCourses).map((subject) => (
                        <div key={subject} className="course-group">
                            <h3 className="course-group__subject-title">{subject}</h3>
                            {Object.keys(groupedCourses[subject]).map((gradeRange) => (
                                <div key={gradeRange} className="course-group__grade-section">
                                    <h4 className="course-group__grade-title">
                                        {t('labels.gradeRangeLabel', { range: gradeRange })}
                                    </h4>
                                    <div className="learner-dashboard__grid">
                                        {groupedCourses[subject][gradeRange].map(
                                            (course: ICourse) => (
                                                <CourseCard
                                                    key={course.id}
                                                    course={course}
                                                    onSelect={handleSelectCourse}
                                                />
                                            ),
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="learner-dashboard__empty">
                    <p>{courses ? t('dashboard.noCoursesLearner') : t('labels.loading')}</p>
                </div>
            )}
        </div>
    );
};

export default LearnerDashboardPage;
