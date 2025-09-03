// src/components/admin/CourseList/CourseList.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ICourse } from '../../../types/database';
import Button from '../../common/Button/Button';
// NEW: Import our export utility.
import { exportCourseToJson } from '../../../lib/courseUtils.ts';

interface CourseListProps {
    courses: ICourse[];
    onEditCourse: (courseId: number) => void;
    onDeleteCourse: (courseId: number) => void;
}

const CourseList: React.FC<CourseListProps> = ({ courses, onEditCourse, onDeleteCourse }) => {
    const { t } = useTranslation();

    if (courses.length === 0) {
        return <div className="course-list__empty">{t('labels.noCoursesFound')}</div>;
    }

    return (
        <div className="course-list">
            <div className="course-list__header">
                <div className="course-list__cell">{t('labels.title')}</div>
                <div className="course-list__cell">{t('labels.subject')}</div>
                <div className="course-list__cell"></div>
            </div>
            {courses.map((course) => (
                <div key={course.id} className="course-list__row">
                    <div className="course-list__cell">{course.title}</div>
                    <div className="course-list__cell course-list__cell--subject">
                        {course.subject}
                    </div>
                    <div className="course-list__cell course-list__cell--actions">
                        {/* NEW: The export button, calling our utility directly. */}
                        <Button variant="secondary" onClick={() => exportCourseToJson(course)}>
                            {t('buttons.export')}
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => course.id && onEditCourse(course.id)}
                        >
                            {t('buttons.edit')}
                        </Button>
                        {/* IMPROVEMENT: Changed variant to 'danger' for better UX. */}
                        <Button
                            variant="danger"
                            onClick={() => course.id && onDeleteCourse(course.id)}
                        >
                            {t('buttons.delete')}
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CourseList;
