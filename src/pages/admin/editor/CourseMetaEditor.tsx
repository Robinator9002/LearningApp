// src/pages/admin/editor/CourseMetaEditor.tsx

import React from 'react';
import Input from '../../../components/common/Form/Input';
import Label from '../../../components/common/Form/Label';
import Select from '../../../components/common/Form/Select';

// The props interface is the source of the type error.
// We must expand the 'subject' type to match the parent component's state.
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
    return (
        <div className="course-editor-page__meta">
            <div className="form-group">
                <Label htmlFor="course-title">Course Title</Label>
                <Input id="course-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="form-group">
                <Label htmlFor="course-subject">Subject</Label>
                <Select
                    id="course-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as typeof subject)}
                >
                    <option value="Math">Math</option>
                    <option value="Reading">Reading</option>
                    <option value="Writing">Writing</option>
                    {/* --- NEW: Add English to the dropdown --- */}
                    <option value="English">English</option>
                </Select>
            </div>
        </div>
    );
};

export default CourseMetaEditor;
