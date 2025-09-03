// src/pages/admin/AdminDashboardPage.tsx

import React, { useContext } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/db';
import { ModalContext } from '../../contexts/ModalContext';

import CourseList from '../../components/admin/CourseList/CourseList';
import Button from '../../components/common/Button/Button';

const AdminDashboardPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const modal = useContext(ModalContext);
    const courses = useLiveQuery(() => db.courses.toArray(), []);

    if (!modal) {
        throw new Error('AdminDashboardPage must be used within a ModalProvider');
    }

    const handleCreateCourse = () => {
        navigate('/admin/create-course');
    };

    const handleEditCourse = (courseId: number) => {
        navigate(`/admin/edit-course/${courseId}`);
    };

    const handleDeleteCourse = (courseId: number) => {
        // MODIFICATION: Replaced hardcoded strings with i18n keys for the confirmation modal.
        modal.showConfirm({
            title: t('confirmations.deleteCourse.title'),
            message: t('confirmations.deleteCourse.message'),
            onConfirm: async () => {
                try {
                    await db.courses.delete(courseId);
                    console.log(`Course with id ${courseId} deleted successfully.`);
                } catch (error) {
                    console.error('Failed to delete course:', error);
                    // MODIFICATION: Replaced hardcoded strings for the error alert.
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
                {/* MODIFICATION: Replaced hardcoded button text. */}
                <Button variant="primary" onClick={handleCreateCourse}>
                    {t('buttons.createNewCourse')}
                </Button>
            </div>

            {courses ? (
                <CourseList
                    courses={courses}
                    onEditCourse={handleEditCourse}
                    onDeleteCourse={handleDeleteCourse}
                />
            ) : (
                // MODIFICATION: Replaced hardcoded loading text.
                <p>{t('labels.loadingCourses')}</p>
            )}
        </div>
    );
};

export default AdminDashboardPage;
