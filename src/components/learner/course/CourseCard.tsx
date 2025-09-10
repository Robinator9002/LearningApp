// src/components/learner/course/CourseCard.tsx

import React from 'react';
import { Book, Calculator, Pencil, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ICourse } from '../../../types/database';
import Button from '../../common/Button';

interface CourseCardProps {
    course: ICourse;
    onSelect: (courseId: number) => void;
}

// REFACTOR: This record now only defines icons for specific, known subjects.
const subjectIcons: Record<string, React.ReactNode> = {
    Math: <Calculator size={48} />,
    Reading: <Book size={48} />,
    Writing: <Pencil size={48} />,
    English: <Book size={48} />,
};

// A default icon to use when the subject name doesn't match a known key.
const defaultIcon = <HelpCircle size={48} />;

const CourseCard: React.FC<CourseCardProps> = ({ course, onSelect }) => {
    const { t } = useTranslation();

    const handleCardClick = () => {
        if (course.id) {
            onSelect(course.id);
        }
    };

    // REFACTOR: Safely get the icon for the subject, falling back to the default.
    const icon = subjectIcons[course.subject] || defaultIcon;

    return (
        <div className="course-card" onClick={handleCardClick}>
            <div className="course-card__icon-wrapper">{icon}</div>
            <div className="course-card__content">
                <h3 className="course-card__title">{course.title}</h3>
                <p className="course-card__subject">{course.subject}</p>
                <div className="course-card__actions">
                    <Button variant="primary" onClick={handleCardClick}>
                        {t('buttons.startCourse')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
