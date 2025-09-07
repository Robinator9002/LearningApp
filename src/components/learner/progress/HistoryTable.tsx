// src/components/learner/progress/HistoryTable.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ITrackedCourse } from '../../../types/database';
import { format } from 'date-fns';

interface HistoryTableProps {
    courses: ITrackedCourse[];
}

const HistoryTable: React.FC<HistoryTableProps> = ({ courses }) => {
    const { t } = useTranslation();

    // Sort courses by most recent first
    const sortedCourses = [...courses].sort((a, b) => b.timestamp - a.timestamp);

    return (
        <div className="history-table-container">
            <h3 className="history-table-container__title">
                {t('progress.completedCoursesTitle')}
            </h3>
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
                    {sortedCourses.map((course) => (
                        <tr key={course.courseId + course.timestamp}>
                            <td>{course.courseTitle}</td>
                            <td>{format(new Date(course.timestamp), 'PP')}</td>
                            <td>{Math.round(course.timeSpent / 60)} min</td>
                            <td>{`${course.score} / ${course.totalQuestions}`}</td>
                            <td className="history-table__grade">{course.grade}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default HistoryTable;
