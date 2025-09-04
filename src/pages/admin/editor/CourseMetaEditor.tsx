// src/pages/admin/editor/CourseMetaEditor.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ICourse } from '../../../types/database';
import Input from '../../../components/common/Form/Input.tsx';
import Label from '../../../components/common/Form/Label.tsx';
import Select from '../../../components/common/Form/Select.tsx';

// MODIFICATION: Added gradeRange and setGradeRange to the props interface to accept them from the parent.
interface CourseMetaEditorProps {
    title: string;
    setTitle: (title: string) => void;
    subject: ICourse['subject'];
    setSubject: (subject: ICourse['subject']) => void;
    gradeRange: string;
    setGradeRange: (gradeRange: string) => void;
}

const CourseMetaEditor: React.FC<CourseMetaEditorProps> = ({
    title,
    setTitle,
    subject,
    setSubject,
    // MODIFICATION: Destructured the new props.
    gradeRange,
    setGradeRange,
}) => {
    const { t } = useTranslation();
    return (
        <div className="course-editor-page__meta">
            <div className="form-group">
                <Label htmlFor="course-title">{t('labels.courseTitle')}</Label>
                <Input id="course-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="form-group">
                <Label htmlFor="course-subject">{t('labels.subject')}</Label>
                <Select
                    id="course-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as typeof subject)}
                >
                    <option value="Math">{t('subjects.math')}</option>
                    <option value="Reading">{t('subjects.reading')}</option>
                    <option value="Writing">{t('subjects.writing')}</option>
                    <option value="English">{t('subjects.english')}</option>
                </Select>
            </div>
            {/* FIX & UPGRADE: Replaced the restrictive dropdown with a flexible text input. 
                This now correctly uses the setGradeRange function passed from the parent, fixing the crash.
            */}
            <div className="form-group">
                <Label htmlFor="course-grade-range">{t('labels.gradeRange')}</Label>
                <Input
                    id="course-grade-range"
                    value={gradeRange}
                    onChange={(e) => setGradeRange(e.target.value)}
                    placeholder="e.g., 2-4, 9, Advanced"
                />
            </div>
        </div>
    );
};

export default CourseMetaEditor;
