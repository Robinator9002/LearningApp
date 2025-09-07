// src/pages/admin/editor/CourseMetaEditor.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
// --- TYPES ---
import type { ICourse } from '../../../../types/database.ts';
// --- COMPONENTS ---
import Input from '../../../../components/common/Form/Input.tsx';
import Label from '../../../../components/common/Form/Label.tsx';
import Select from '../../../../components/common/Form/Select.tsx';
// NEW: Import our new grade assignment component.
import GradeAssignmentEditor from '../GradeAssignmentEditor.tsx';

interface CourseMetaEditorProps {
    title: string;
    setTitle: (value: string) => void;
    subject: ICourse['subject'];
    setSubject: (value: ICourse['subject']) => void;
    gradeRange: string;
    setGradeRange: (value: string) => void;
}

const CourseMetaEditor: React.FC<CourseMetaEditorProps> = ({
    title,
    setTitle,
    subject,
    setSubject,
    gradeRange,
    setGradeRange,
}) => {
    const { t } = useTranslation();

    return (
        <div className="course-meta-editor">
            <div className="form-group">
                <Label htmlFor="course-title">{t('labels.courseTitle')}</Label>
                <Input id="course-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="form-group">
                <Label htmlFor="course-subject">{t('labels.subject')}</Label>
                <Select
                    id="course-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as ICourse['subject'])}
                >
                    {/* NEW: Use translation keys for subjects */}
                    <option value="math">{t('subjects.math')}</option>
                    <option value="reading">{t('subjects.reading')}</option>
                    <option value="writing">{t('subjects.writing')}</option>
                    <option value="english">{t('subjects.english')}</option>
                </Select>
            </div>
            <div className="form-group">
                <Label>{t('labels.gradeRange')}</Label>
                {/* REPLACEMENT: The old text input is replaced by our new component. */}
                <GradeAssignmentEditor gradeRange={gradeRange} setGradeRange={setGradeRange} />
            </div>
        </div>
    );
};

export default CourseMetaEditor;
