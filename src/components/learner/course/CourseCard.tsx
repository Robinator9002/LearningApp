// src/components/learner/course/CourseCard.tsx

import React from 'react';
import { Book, Calculator, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // MODIFICATION: Imported useTranslation
import type { ICourse } from '../../../types/database';
import Button from '../../common/Button/Button';

interface CourseCardProps {
    course: ICourse;
    onSelect: (courseId: number) => void;
}

// NOTE: The subject names themselves come from the database and are not translated here.
// In a production app with multi-language course content, this would be handled differently.
const subjectIcons: Record<ICourse['subject'], React.ReactNode> = {
    Math: <Calculator size={48} />,
    Reading: <Book size={48} />,
    Writing: <Pencil size={48} />,
    English: <Book size={48} />, // Using Book icon for English as well
};

const CourseCard: React.FC<CourseCardProps> = ({ course, onSelect }) => {
    const { t } = useTranslation(); // MODIFICATION: Initialized useTranslation

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
                    {/* MODIFICATION: Replaced hardcoded button text */}
                    <Button variant="primary" onClick={handleCardClick}>
                        {t('buttons.startCourse')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
