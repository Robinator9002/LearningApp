// src/components/learner/progress/HistoryTable.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { format, isValid } from 'date-fns';
import type { ITrackedCourse } from '../../../types/database';

interface HistoryTableProps {
    courses: ITrackedCourse[];
}

const HistoryTable: React.FC<HistoryTableProps> = ({ courses }) => {
    const { t } = useTranslation();

    // FIX: Sort courses using the correct 'completedAt' property.
    const sortedCourses = [...courses].sort((a, b) => b.completedAt - a.completedAt);

    return (
        <div className="history-table-container">
            <h3>{t('progress.completedCoursesTitle')}</h3>
            <table className="history-table">
                <thead>
                    <tr>
                        <th>{t('labels.courseTitle')}</th>
                        <th>{t('labels.dateCompleted')}</th>
                        <th>{t('labels.timeSpent')}</th>
                        <th>{t('labels.score')}</th>
                        <th>{t('labels.grade')}</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedCourses.map((course) => {
                        // FIX: Validate the date before attempting to format it.
                        const completionDate = new Date(course.completedAt);
                        const displayDate = isValid(completionDate)
                            ? format(completionDate, 'PP')
                            : t('labels.invalidDate'); // Provide a fallback for invalid dates.

                        return (
                            <tr key={course.courseId + course.completedAt}>
                                <td>{course.title}</td>
                                <td>{displayDate}</td>
                                <td>{Math.round(course.timeSpent / 60)} min</td>
                                <td>{`${course.score} / ${course.totalQuestions}`}</td>
                                <td className="history-table__grade">{course.grade}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default HistoryTable;
