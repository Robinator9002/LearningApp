import React from 'react';
import Input from '../../../components/common/Form/Input/Input';
import Label from '../../../components/common/Form/Label/Label';
import Select from '../../../components/common/Form/Select/Select';

interface CourseMetaEditorProps {
    title: string;
    setTitle: (title: string) => void;
    subject: 'Math' | 'Reading' | 'Writing';
    setSubject: (subject: 'Math' | 'Reading' | 'Writing') => void;
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
                </Select>
            </div>
        </div>
    );
};

export default CourseMetaEditor;
