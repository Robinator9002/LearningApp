// src/components/admin/CourseList.tsx

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ArrowUpCircle } from 'lucide-react';
import type { ICourse } from '../../types/database.ts';
import Button from '../common/Button.tsx';
import Input from '../common/Form/Input.tsx';
import { exportCourseToJson } from '../../lib/courseUtils.ts';

interface CourseListProps {
    courses: ICourse[];
    onEditCourse: (courseId: number) => void;
    onDeleteCourse: (courseId: number) => void;
}

const CourseList: React.FC<CourseListProps> = ({ courses, onEditCourse, onDeleteCourse }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [showScrollTop, setShowScrollTop] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);

    const filteredCourses = useMemo(() => {
        return courses.filter(
            (course) =>
                course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.subject.toLowerCase().includes(searchTerm.toLowerCase()),
        );
    }, [courses, searchTerm]);

    useEffect(() => {
        const listElement = listRef.current;
        if (!listElement) return;

        const handleScroll = () => {
            if (listElement.scrollTop > 200) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        listElement.addEventListener('scroll', handleScroll);
        return () => listElement.removeEventListener('scroll', handleScroll);
    }, []);

    const handleScrollToTop = () => {
        listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="course-list-container">
            <div className="course-list__toolbar">
                <div className="search-bar">
                    <Search className="search-bar__icon" size={18} />
                    <Input
                        type="text"
                        placeholder={t('labels.searchCourses')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-bar__input"
                    />
                </div>
            </div>

            <div className="course-list" ref={listRef}>
                {filteredCourses.length > 0 ? (
                    <>
                        <div className="course-list__header">
                            <div className="course-list__cell">{t('labels.title')}</div>
                            <div className="course-list__cell">{t('labels.subject')}</div>
                            <div className="course-list__cell"></div>
                        </div>
                        {filteredCourses.map((course) => (
                            <div key={course.id} className="course-list__row">
                                <div className="course-list__cell">{course.title}</div>
                                <div className="course-list__cell course-list__cell--subject">
                                    {course.subject}
                                </div>
                                <div className="course-list__cell course-list__cell--actions">
                                    <Button
                                        variant="secondary"
                                        onClick={() => exportCourseToJson(course)}
                                    >
                                        {t('buttons.export')}
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={() => course.id && onEditCourse(course.id)}
                                    >
                                        {t('buttons.edit')}
                                    </Button>
                                    <Button
                                        variant="danger"
                                        onClick={() => course.id && onDeleteCourse(course.id)}
                                    >
                                        {t('buttons.delete')}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="course-list__empty">{t('labels.noCoursesFound')}</div>
                )}
            </div>

            {showScrollTop && (
                <button
                    className="scroll-to-top-btn"
                    onClick={handleScrollToTop}
                    aria-label={t('buttons.scrollToTop')}
                >
                    <ArrowUpCircle size={24} />
                </button>
            )}
        </div>
    );
};

export default CourseList;
