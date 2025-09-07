// src/pages/learner/LearnerDashboardPage.tsx

import React, { useMemo, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';

// --- CONTEXTS & DB ---
import { db } from '../../lib/db.ts';
import { AuthContext } from '../../contexts/AuthContext.tsx';

// --- UTILS ---
import { groupCourses } from '../../lib/courseUtils.ts';

// --- COMPONENT IMPORTS ---
import ProgressSummary from '../../components/learner/dashboard/ProgressSummary.tsx';
import CourseCard from '../../components/learner/course/CourseCard.tsx';
import CourseFilters, {
    type FilterValues,
} from '../../components/learner/dashboard/CourseFilters.tsx';

// --- STYLES ---
import '../../styles/components/learner/course-filters.css';

const LearnerDashboardPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const allCourses = useLiveQuery(() => db.courses.toArray(), []);
    const currentUser = auth?.currentUser;

    const [filters, setFilters] = useState<FilterValues>({
        subject: '',
        gradeRange: '',
    });

    const { availableSubjects, availableGradeRanges } = useMemo(() => {
        if (!allCourses) return { availableSubjects: [], availableGradeRanges: [] };
        const subjects = new Set(allCourses.map((c) => c.subject));
        const gradeRanges = new Set(allCourses.map((c) => c.gradeRange));
        return {
            availableSubjects: Array.from(subjects),
            availableGradeRanges: Array.from(gradeRanges),
        };
    }, [allCourses]);

    const filteredCourses = useMemo(() => {
        if (!allCourses) return [];
        return allCourses.filter((course) => {
            const subjectMatch =
                !filters.subject || course.subject.toLowerCase() === filters.subject.toLowerCase();
            const gradeMatch =
                !filters.gradeRange ||
                course.gradeRange.toLowerCase().includes(filters.gradeRange.toLowerCase());
            return subjectMatch && gradeMatch;
        });
    }, [allCourses, filters]);

    const groupedAndFilteredCourses = useMemo(
        () => (filteredCourses ? groupCourses(filteredCourses) : {}),
        [filteredCourses],
    );

    // --- EVENT HANDLERS ---
    const handleSelectCourse = (courseId: number) => {
        navigate(`/course/${courseId}`);
    };

    if (!allCourses || !currentUser) {
        return <div>{t('labels.loading')}</div>;
    }

    return (
        <div className="learner-dashboard">
            <h2 className="learner-dashboard__title">{t('dashboard.learnerTitle')}</h2>
            <ProgressSummary currentUserId={currentUser.id!} />

            {allCourses.length > 0 && (
                <CourseFilters
                    filters={filters}
                    onFilterChange={setFilters}
                    availableSubjects={availableSubjects}
                    availableGradeRanges={availableGradeRanges}
                />
            )}

            {Object.keys(groupedAndFilteredCourses).length > 0 ? (
                Object.entries(groupedAndFilteredCourses).map(([subject, grades]) => (
                    <div key={subject} className="course-group">
                        <h3 className="course-group__title">{t(`subjects.${subject}`)}</h3>
                        {Object.entries(grades).map(([gradeRange, courses]) => (
                            <div key={gradeRange} className="course-subgroup">
                                <h4 className="course-subgroup__title">
                                    {t('labels.gradeRangeLabel', { range: gradeRange })}
                                </h4>
                                <div className="course-grid">
                                    {courses.map((course) => (
                                        <CourseCard
                                            key={course.id}
                                            course={course}
                                            onSelect={() => handleSelectCourse(course.id!)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ))
            ) : (
                <div className="dashboard-welcome">
                    <h3 className="dashboard-welcome__title">{t('dashboard.welcomeTitle')}</h3>
                    <p>{t('dashboard.noCoursesLearner')}</p>
                </div>
            )}
        </div>
    );
};

export default LearnerDashboardPage;
