// src/components/learner/dashboard/CourseFilters.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Filter } from 'lucide-react';

import Select from '../../common/Form/Select';
import Input from '../../common/Form/Input';

// --- TYPE DEFINITIONS ---

// The set of values that the filter component can manage.
export interface FilterValues {
    subject: string;
    gradeRange: string;
}

// The props required by this component.
interface CourseFiltersProps {
    filters: FilterValues;
    onFilterChange: (newFilters: FilterValues) => void;
    // We need all available subjects and grade ranges to populate the dropdowns.
    availableSubjects: string[];
    availableGradeRanges: string[];
}

// --- MAIN COMPONENT ---

const CourseFilters: React.FC<CourseFiltersProps> = ({
    filters,
    onFilterChange,
    availableSubjects,
    availableGradeRanges,
}) => {
    const { t } = useTranslation();

    // A generic handler to update a specific filter value.
    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        onFilterChange({
            ...filters,
            [name]: value,
        });
    };

    return (
        <div className="course-filters">
            <h3 className="course-filters__title">
                <Filter size={20} />
                {t('dashboard.filters.title')}
            </h3>
            <div className="course-filters__controls">
                {/* Subject Filter Dropdown */}
                <div className="filter-group">
                    <label htmlFor="subject-filter" className="filter-group__label">
                        {t('labels.subject')}
                    </label>
                    <Select
                        id="subject-filter"
                        name="subject"
                        value={filters.subject}
                        onChange={handleInputChange}
                    >
                        <option value="">{t('dashboard.filters.allSubjects')}</option>
                        {availableSubjects.map((subject) => (
                            <option key={subject} value={subject}>
                                {t(`subjects.${subject}`)}
                            </option>
                        ))}
                    </Select>
                </div>

                {/* Grade Range Filter Input */}
                <div className="filter-group">
                    <label htmlFor="grade-range-filter" className="filter-group__label">
                        {t('labels.gradeRange')}
                    </label>
                    <Input
                        id="grade-range-filter"
                        name="gradeRange"
                        type="text"
                        placeholder={t('placeholders.gradeRange')}
                        value={filters.gradeRange}
                        onChange={handleInputChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default CourseFilters;
