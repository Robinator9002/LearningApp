// src/pages/admin/editor/CourseEditorHeader.tsx

import React from 'react';
import { useTranslation } from 'react-i18next'; // MODIFICATION: Imported useTranslation
import Button from '../../../components/common/Button';

/**
 * Defines the properties for the CourseEditorHeader component.
 */
interface CourseEditorHeaderProps {
    isEditMode: boolean;
    onOpenAddQuestionModal: () => void;
}

const CourseEditorHeader: React.FC<CourseEditorHeaderProps> = ({
    isEditMode,
    onOpenAddQuestionModal,
}) => {
    const { t } = useTranslation(); // MODIFICATION: Initialized useTranslation

    return (
        <header className="course-editor-page__header">
            <h2 className="course-editor-page__title">
                {/* MODIFICATION: Replaced ternary with i18n keys. */}
                {isEditMode ? t('courseEditor.editTitle') : t('courseEditor.createTitle')}
            </h2>
            <div className="course-editor-page__questions-header">
                {/* MODIFICATION: Replaced hardcoded text. */}
                <h3 className="course-editor-page__questions-title">{t('labels.questions')}</h3>
                <div className="add-question-buttons">
                    {/* MODIFICATION: Replaced hardcoded button text. */}
                    <Button variant="primary" onClick={onOpenAddQuestionModal}>
                        {t('buttons.addQuestion')}
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default CourseEditorHeader;
