// src/pages/admin/editor/Course/CourseSettingsPanel.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import type { ICourse } from '../../../../types/database';
import Button from '../../../../components/common/Button';
import Input from '../../../../components/common/Form/Input';
import Label from '../../../../components/common/Form/Label';
import Select from '../../../../components/common/Form/Select';
import GradeAssignmentEditor from '../GradeAssignmentEditor';

interface CourseSettingsPanelProps {
    title: string;
    setTitle: (value: string) => void;
    subject: ICourse['subject'];
    setSubject: (value: ICourse['subject']) => void;
    gradeRange: string;
    setGradeRange: (value: string) => void;
    onSave: () => void;
}

const CourseSettingsPanel: React.FC<CourseSettingsPanelProps> = ({
    title,
    setTitle,
    subject,
    setSubject,
    gradeRange,
    setGradeRange,
    onSave,
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <aside className="course-settings-panel">
            <div className="course-settings-panel__header">
                <h3>{t('editor.settingsTitle', 'Course Settings')}</h3>
            </div>
            <div className="course-settings-panel__content">
                <div className="form-group">
                    <Label htmlFor="course-title">{t('labels.courseTitle')}</Label>
                    <Input
                        id="course-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <Label htmlFor="course-subject">{t('labels.subject')}</Label>
                    <Select
                        id="course-subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value as ICourse['subject'])}
                    >
                        <option value="Math">{t('subjects.Math')}</option>
                        <option value="Reading">{t('subjects.Reading')}</option>
                        <option value="Writing">{t('subjects.Writing')}</option>
                        <option value="English">{t('subjects.English')}</option>
                    </Select>
                </div>
                <div className="form-group">
                    <Label>{t('labels.gradeRange')}</Label>
                    <GradeAssignmentEditor gradeRange={gradeRange} setGradeRange={setGradeRange} />
                </div>
            </div>
            <div className="course-settings-panel__footer">
                <Button variant="secondary" onClick={() => navigate('/admin')}>
                    {t('buttons.backToDashboard')}
                </Button>
                <Button variant="primary" onClick={onSave}>
                    {t('buttons.saveCourse')}
                </Button>
            </div>
        </aside>
    );
};

export default CourseSettingsPanel;
