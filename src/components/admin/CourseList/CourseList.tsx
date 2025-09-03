// src/components/admin/CourseList/CourseList.tsx

import React from 'react';
import { useTranslation } from 'react-i18next'; // MODIFICATION: Imported useTranslation
import type { ICourse } from '../../../types/database';
import Button from '../../common/Button/Button';

interface CourseListProps {
    courses: ICourse[];
    onEditCourse: (courseId: number) => void;
    onDeleteCourse: (courseId: number) => void;
}

/**
 * A component to display a list of courses in a table-like format for admins.
 */
const CourseList: React.FC<CourseListProps> = ({ courses, onEditCourse, onDeleteCourse }) => {
    // MODIFICATION: Initialized the translation hook.
    const { t } = useTranslation();

    if (courses.length === 0) {
        return (
            // MODIFICATION: Replaced hardcoded empty state text.
            <div className="course-list__empty">{t('labels.noCoursesFound')}</div>
        );
    }

    return (
        <div className="course-list">
            <div className="course-list__header">
                {/* MODIFICATION: Replaced hardcoded header labels. */}
                <div className="course-list__cell">{t('labels.title')}</div>
                <div className="course-list__cell">{t('labels.subject')}</div>
                <div className="course-list__cell"></div> {/* Empty cell for actions */}
            </div>
            {courses.map((course) => (
                <div key={course.id} className="course-list__row">
                    <div className="course-list__cell">{course.title}</div>
                    <div className="course-list__cell course-list__cell--subject">
                        {course.subject}
                    </div>
                    <div className="course-list__cell course-list__cell--actions">
                        {/* MODIFICATION: Replaced hardcoded button text. */}
                        <Button
                            variant="primary"
                            onClick={() => course.id && onEditCourse(course.id)}
                        >
                            {t('buttons.edit')}
                        </Button>
                        <Button
                            variant="primary"
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
