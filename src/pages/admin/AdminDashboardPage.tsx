// src/pages/admin/AdminDashboardPage.tsx

import React, { useContext } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/db.ts';
import { ModalContext } from '../../contexts/ModalContext.tsx';
// NEW: Import our new utility function.
import { importCourseFromJson } from '../../lib/courseUtils.ts';

import CourseList from '../../components/admin/CourseList/CourseList.tsx';
import Button from '../../components/common/Button/Button.tsx';

const AdminDashboardPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const modal = useContext(ModalContext);
    const courses = useLiveQuery(() => db.courses.toArray(), []);

    if (!modal) {
        throw new Error('AdminDashboardPage must be used within a ModalProvider');
    }

    // NEW: Handler function for the import process.
    // It calls our utility and uses the modal context to show success or error messages.
    const handleImportCourse = async () => {
        try {
            const successMessage = await importCourseFromJson();
            modal.showAlert({
                title: t('success.title'),
                message: successMessage,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            modal.showAlert({
                title: t('errors.importCourse.title'),
                message: message,
            });
        }
    };

    const handleCreateCourse = () => {
        navigate('/admin/create-course');
    };

    const handleEditCourse = (courseId: number) => {
        navigate(`/admin/edit-course/${courseId}`);
    };

    const handleDeleteCourse = (courseId: number) => {
        modal.showConfirm({
            title: t('confirmations.deleteCourse.title'),
            message: t('confirmations.deleteCourse.message'),
            onConfirm: async () => {
                try {
                    await db.courses.delete(courseId);
                } catch (error) {
                    console.error('Failed to delete course:', error);
                    modal.showAlert({
                        title: t('errors.deleteCourse.title'),
                        message: t('errors.deleteCourse.message'),
                    });
                }
            },
        });
    };

    return (
        <div className="admin-dashboard">
            <div className="admin-dashboard__header">
                <h2 className="admin-dashboard__title">{t('dashboard.adminTitle')}</h2>
                {/* NEW: A wrapper for the action buttons. */}
                <div className="admin-dashboard__actions">
                    <Button variant="secondary" onClick={handleImportCourse}>
                        {t('buttons.importCourse')}
                    </Button>
                    <Button variant="primary" onClick={handleCreateCourse}>
                        {t('buttons.createNewCourse')}
                    </Button>
                </div>
            </div>

            {courses ? (
                <CourseList
                    courses={courses}
                    onEditCourse={handleEditCourse}
                    onDeleteCourse={handleDeleteCourse}
                />
            ) : (
                <p>{t('labels.loadingCourses')}</p>
            )}
        </div>
    );
};

export default AdminDashboardPage;
