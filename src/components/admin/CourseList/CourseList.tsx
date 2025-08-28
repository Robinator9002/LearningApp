// src/components/admin/CourseList/CourseList.tsx
import React from 'react';
import type { ICourse } from '../../../types/database';
import Button from '../../common/Button/Button';

interface CourseListProps {
    courses: ICourse[];
}

/**
 * A component to display a list of courses in a table-like format for admins.
 */
const CourseList: React.FC<CourseListProps> = ({ courses }) => {
    if (courses.length === 0) {
        return (
            <div className="course-list__empty">No courses found. Create one to get started!</div>
        );
    }

    return (
        <div className="course-list">
            <div className="course-list__header">
                <div className="course-list__cell">Title</div>
                <div className="course-list__cell">Subject</div>
                <div className="course-list__cell"></div> {/* Empty cell for actions */}
            </div>
            {courses.map((course) => (
                <div key={course.id} className="course-list__row">
                    <div className="course-list__cell">{course.title}</div>
                    <div className="course-list__cell course-list__cell--subject">
                        {course.subject}
                    </div>
                    <div className="course-list__cell course-list__cell--actions">
                        {/* We will add functionality to these buttons later */}
                        <Button variant="primary" onClick={() => alert(`Editing ${course.title}`)}>
                            Edit
                        </Button>
                        <Button variant="primary" onClick={() => alert(`Deleting ${course.title}`)}>
                            Delete
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CourseList;
