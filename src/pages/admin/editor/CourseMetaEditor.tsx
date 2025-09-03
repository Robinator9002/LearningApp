// src/pages/admin/editor/CourseMetaEditor.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
// FIX: Corrected import paths based on recent build errors.
import Input from '../../../components/common/Form/Input.tsx';
import Label from '../../../components/common/Form/Label.tsx';
import Select from '../../../components/common/Form/Select.tsx';
import type { ICourse } from '../../../types/database';

interface CourseMetaEditorProps {
    title: string;
    setTitle: (title: string) => void;
    subject: ICourse['subject'];
    setSubject: (subject: ICourse['subject']) => void;
    // MODIFICATION: Added gradeRange and its setter to the component's props.
    gradeRange: ICourse['gradeRange'];
    setGradeRange: (gradeRange: ICourse['gradeRange']) => void;
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
            {/* MODIFICATION: Added the new form group for the Grade Range dropdown. */}
            <div className="form-group">
                <Label htmlFor="course-grade-range">{t('labels.gradeRange')}</Label>
                <Select
                    id="course-grade-range"
                    value={gradeRange}
                    onChange={(e) => setGradeRange(e.target.value as typeof gradeRange)}
                >
                    <option value="2-4">{t('gradeRanges.2-4')}</option>
                    <option value="6-8">{t('gradeRanges.6-8')}</option>
                </Select>
            </div>
        </div>
    );
};

export default CourseMetaEditor;
