// src/pages/admin/editor/CourseEditorHeader.tsx

import React from 'react';
import type { IQuestion } from '../../../types/database';
import Button from '../../../components/common/Button/Button';

interface CourseEditorHeaderProps {
    isEditMode: boolean;
    onAddQuestion: (type: IQuestion['type']) => void;
}

const CourseEditorHeader: React.FC<CourseEditorHeaderProps> = ({ isEditMode, onAddQuestion }) => {
    return (
        <header className="course-editor-page__header">
            <h2 className="course-editor-page__title">
                {isEditMode ? 'Edit Course' : 'Create New Course'}
            </h2>
            <div className="course-editor-page__questions-header">
                <h3 className="course-editor-page__questions-title">Questions</h3>
                <div className="add-question-buttons">
                    <Button onClick={() => onAddQuestion('mcq')}>+ Multiple Choice</Button>
                    <Button onClick={() => onAddQuestion('sti')}>+ Smart Text</Button>
                    <Button onClick={() => onAddQuestion('alg-equation')}>
                        + Algebra Equation
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default CourseEditorHeader;
