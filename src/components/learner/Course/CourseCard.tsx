// src/components/learner/CourseCard/CourseCard.tsx
import React from 'react';
import { Book, Calculator, Pencil } from 'lucide-react';
import type { ICourse } from '../../../types/database';
import Button from '../../common/Button/Button';

interface CourseCardProps {
    course: ICourse;
    onSelect: (courseId: number) => void;
}

const subjectIcons: Record<ICourse['subject'], React.ReactNode> = {
    Math: <Calculator size={48} />,
    Reading: <Book size={48} />,
    Writing: <Pencil size={48} />,
};

const CourseCard: React.FC<CourseCardProps> = ({ course, onSelect }) => {
    const handleCardClick = () => {
        if (course.id) {
            onSelect(course.id);
        }
    };

    return (
        <div className="course-card" onClick={handleCardClick}>
            <div className="course-card__icon-wrapper">{subjectIcons[course.subject]}</div>
            <div className="course-card__content">
                <h3 className="course-card__title">{course.title}</h3>
                <p className="course-card__subject">{course.subject}</p>
                <div className="course-card__actions">
                    <Button variant="primary" onClick={handleCardClick}>
                        Start Course
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
