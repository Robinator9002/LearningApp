// src/pages/admin/editor/CourseEditorHeader.tsx

import React from 'react';
import Button from '../../../components/common/Button/Button';

/**
 * Defines the properties for the CourseEditorHeader component.
 * The onAddQuestion prop has been replaced with a single function
 * to open the new, much more organized question selection modal.
 */
interface CourseEditorHeaderProps {
    isEditMode: boolean;
    onOpenAddQuestionModal: () => void;
}

const CourseEditorHeader: React.FC<CourseEditorHeaderProps> = ({
    isEditMode,
    onOpenAddQuestionModal,
}) => {
    return (
        <header className="course-editor-page__header">
            <h2 className="course-editor-page__title">
                {isEditMode ? 'Edit Course' : 'Create New Course'}
            </h2>
            <div className="course-editor-page__questions-header">
                <h3 className="course-editor-page__questions-title">Questions</h3>
                <div className="add-question-buttons">
                    {/* The chaotic mess of buttons has been vanquished, replaced by a single, elegant button. */}
                    <Button variant="primary" onClick={onOpenAddQuestionModal}>
                        + Add Question
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default CourseEditorHeader;
