// src/components/learner/progress/HistoryTable.tsx

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format, isValid } from 'date-fns';

import type { ITrackedCourse, Grade } from '../../../types/database';
import { getGradeClass } from '../../../utils/gradeUtils';

import Input from '../../common/Form/Input';
import Select from '../../common/Form/Select';

// --- TYPE DEFINITIONS ---
type SortKey = 'date' | 'title' | 'time' | 'score' | 'grade';

interface HistoryTableProps {
    courses: ITrackedCourse[];
}

// --- HELPER FUNCTIONS ---
const gradeOrder: Record<Grade, number> = {
    A: 1,
    B: 2,
    C: 3,
    D: 4,
    F: 5,
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
};

// --- MAIN COMPONENT ---
const HistoryTable: React.FC<HistoryTableProps> = ({ courses }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('date');

    const filteredAndSortedCourses = useMemo(() => {
        const filtered = courses.filter((course) =>
            course.title.toLowerCase().includes(searchTerm.toLowerCase()),
        );

        return filtered.sort((a, b) => {
            switch (sortKey) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'time':
                    return b.timeSpent - a.timeSpent;
                case 'score':
                    const scoreA = (a.score / a.totalQuestions) * 100;
                    const scoreB = (b.score / b.totalQuestions) * 100;
                    return scoreB - scoreA;
                case 'grade':
                    return gradeOrder[a.grade] - gradeOrder[b.grade];
                case 'date':
                default:
                    return b.completedAt - a.completedAt;
            }
        });
    }, [courses, searchTerm, sortKey]);

    return (
        <div className="history-table-container">
            <div className="history-table-container__header">
                <h3>{t('progress.completedCoursesTitle')}</h3>
                <div className="history-table-container__controls">
                    <Input
                        type="text"
                        placeholder={t('progress.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
                        <option value="date">{t('progress.sortBy.date')}</option>
                        <option value="title">{t('progress.sortBy.title')}</option>
                        <option value="time">{t('progress.sortBy.time')}</option>
                        <option value="score">{t('progress.sortBy.score')}</option>
                        <option value="grade">{t('progress.sortBy.grade')}</option>
                    </Select>
                </div>
            </div>
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
                    {filteredAndSortedCourses.map((course) => {
                        const completionDate = new Date(course.completedAt);
                        const displayDate = isValid(completionDate)
                            ? format(completionDate, 'PP')
                            : t('labels.invalidDate');

                        return (
                            <tr key={course.courseId + course.completedAt}>
                                <td>{course.title}</td>
                                <td>{displayDate}</td>
                                <td>{Math.round(course.timeSpent / 60)} min</td>
                                <td>{`${course.score} / ${course.totalQuestions}`}</td>
                                <td>
                                    <span
                                        className={`history-table__grade ${getGradeClass(
                                            course.grade,
                                        )}`}
                                    >
                                        {course.grade}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default HistoryTable;
