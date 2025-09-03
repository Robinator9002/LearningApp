// src/pages/admin/editor/CourseMetaEditor.tsx

import React from 'react';
import { useTranslation } from 'react-i18next'; // MODIFICATION: Imported useTranslation
import Input from '../../../components/common/Form/Input';
import Label from '../../../components/common/Form/Label';
import Select from '../../../components/common/Form/Select';

interface CourseMetaEditorProps {
    title: string;
    setTitle: (title: string) => void;
    subject: 'Math' | 'Reading' | 'Writing' | 'English';
    setSubject: (subject: 'Math' | 'Reading' | 'Writing' | 'English') => void;
}

const CourseMetaEditor: React.FC<CourseMetaEditorProps> = ({
    title,
    setTitle,
    subject,
    setSubject,
}) => {
    const { t } = useTranslation(); // MODIFICATION: Initialized useTranslation

    return (
        <div className="course-editor-page__meta">
            <div className="form-group">
                {/* MODIFICATION: Replaced hardcoded label. */}
                <Label htmlFor="course-title">{t('labels.courseTitle')}</Label>
                <Input id="course-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="form-group">
                {/* MODIFICATION: Replaced hardcoded label. */}
                <Label htmlFor="course-subject">{t('labels.subject')}</Label>
                <Select
                    id="course-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as typeof subject)}
                >
                    <option value="Math">Math</option>
                    <option value="Reading">Reading</option>
                    <option value="Writing">Writing</option>
                    <option value="English">English</option>
                </Select>
            </div>
        </div>
    );
};

export default CourseMetaEditor;
