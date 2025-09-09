// src/components/admin/Course/CourseList.tsx

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ArrowUpCircle } from 'lucide-react';
import type { ICourse } from '../../../types/database';

// --- COMPONENT IMPORTS ---
import Button from '../../common/Button';
import Input from '../../common/Form/Input';
import Select from '../../common/Form/Select'; // NEW: Import the Select component for filters.

// --- UTILITY IMPORTS ---
import { exportCourseToJson } from '../../../utils/courseUtils';

interface CourseListProps {
    courses: ICourse[];
    onEditCourse: (courseId: number) => void;
    onDeleteCourse: (courseId: number) => void;
}

/**
 * Renders an interactive list of courses with searching, filtering, and sorting capabilities.
 * It allows administrators to view, manage, and export courses.
 */
const CourseList: React.FC<CourseListProps> = ({ courses, onEditCourse, onDeleteCourse }) => {
    const { t } = useTranslation();
    const listRef = useRef<HTMLDivElement>(null);

    // --- STATE MANAGEMENT ---
    // State for the text-based search input.
    const [searchTerm, setSearchTerm] = useState('');
    // NEW: State for the subject filter dropdown. 'all' means no filter.
    const [subjectFilter, setSubjectFilter] = useState('all');
    // NEW: State for the sorting criteria. Default is alphabetical ascending.
    const [sortOrder, setSortOrder] = useState('title-asc');
    // State to control the visibility of the "scroll to top" button.
    const [showScrollTop, setShowScrollTop] = useState(false);

    // --- DERIVED DATA & MEMOIZATION ---

    // NEW: Memoized calculation to get a unique list of subjects for the filter dropdown.
    const subjects = useMemo(
        () => ['all', ...Array.from(new Set(courses.map((c) => c.subject)))],
        [courses],
    );

    // REFACTORED: This memoized value now handles filtering (by search and subject) and sorting.
    const processedCourses = useMemo(() => {
        // 1. Filter by search term (title or translated subject name).
        let filtered = courses.filter(
            (course) =>
                course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t(`subjects.${course.subject}`).toLowerCase().includes(searchTerm.toLowerCase()),
        );

        // 2. Further filter by the selected subject, if not 'all'.
        if (subjectFilter !== 'all') {
            filtered = filtered.filter((course) => course.subject === subjectFilter);
        }

        // 3. Sort the filtered list based on the current sort order.
        // A new array is created with spread '[...filtered]' to avoid mutating the original.
        const sorted = [...filtered].sort((a, b) => {
            switch (sortOrder) {
                case 'title-asc':
                    return a.title.localeCompare(b.title);
                case 'title-desc':
                    return b.title.localeCompare(a.title);
                // ASSUMPTION: 'targetAudience' is an array like [minAge, maxAge] in the ICourse type.
                // Optional chaining and fallback to 0 prevent errors if the property is missing.
                case 'age-asc':
                    return (a.targetAudience?.[0] || 0) - (b.targetAudience?.[0] || 0);
                case 'age-desc':
                    return (b.targetAudience?.[0] || 0) - (a.targetAudience?.[0] || 0);
                default:
                    return 0; // No sorting applied if the sortOrder is unrecognized.
            }
        });

        return sorted;
    }, [courses, searchTerm, subjectFilter, sortOrder, t]);

    // --- EFFECTS ---

    // Effect to show/hide the "scroll to top" button based on scroll position.
    useEffect(() => {
        const listElement = listRef.current;
        if (!listElement) return;

        const handleScroll = () => {
            setShowScrollTop(listElement.scrollTop > 200);
        };

        listElement.addEventListener('scroll', handleScroll);
        // Cleanup: remove the event listener when the component unmounts.
        return () => listElement.removeEventListener('scroll', handleScroll);
    }, []);

    // --- EVENT HANDLERS ---

    const handleScrollToTop = () => {
        listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- RENDER ---
    return (
        <div className="course-list-container">
            {/* The toolbar now contains search, filter, and sort controls. */}
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
                {/* NEW: Container for the new filter and sort dropdowns. */}
                <div className="course-list__filters">
                    <Select
                        value={subjectFilter}
                        onChange={(e) => setSubjectFilter(e.target.value)}
                        aria-label={t('labels.filterBySubject')}
                    >
                        {subjects.map((subject) => (
                            <option key={subject} value={subject}>
                                {subject === 'all'
                                    ? t('labels.allSubjects')
                                    : t(`subjects.${subject}`)}
                            </option>
                        ))}
                    </Select>
                    <Select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        aria-label={t('labels.sortBy')}
                    >
                        <option value="title-asc">{t('labels.sort.alphaAsc')}</option>
                        <option value="title-desc">{t('labels.sort.alphaDesc')}</option>
                        <option value="age-asc">{t('labels.sort.ageAsc')}</option>
                        <option value="age-desc">{t('labels.sort.ageDesc')}</option>
                    </Select>
                </div>
            </div>

            <div className="course-list" ref={listRef}>
                {/* The list now renders the 'processedCourses' which are filtered and sorted. */}
                {processedCourses.length > 0 ? (
                    <>
                        <div className="course-list__header">
                            <div className="course-list__cell">{t('labels.title')}</div>
                            <div className="course-list__cell">{t('labels.subject')}</div>
                            <div className="course-list__cell">{t('labels.ageRange')}</div>
                            <div className="course-list__cell"></div>
                        </div>
                        {processedCourses.map((course) => (
                            <div key={course.id} className="course-list__row">
                                <div className="course-list__cell">{course.title}</div>
                                <div className="course-list__cell course-list__cell--subject">
                                    {t(`subjects.${course.subject}`)}
                                </div>
                                <div className="course-list__cell">
                                    {/* Display the age range, with a fallback. */}
                                    {course.targetAudience
                                        ? `${course.targetAudience[0]}-${course.targetAudience[1]}`
                                        : 'N/A'}
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
                    <div className="course-list__empty">{t('labels.noCoursesAdmin')}</div>
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
