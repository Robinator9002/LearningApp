// src/pages/admin/AdminDashboardPage.tsx

import React, { useContext } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/db.ts';
import { ModalContext } from '../../contexts/ModalContext.tsx';

// --- COMPONENT IMPORTS ---
import CourseList from '../../components/admin/CourseList.tsx';
import Button from '../../components/common/Button.tsx';
// FIX: We now import the dedicated component for handling imports.
import CourseImport from '../../components/admin/CourseImport.tsx';

const AdminDashboardPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const modal = useContext(ModalContext);
    const courses = useLiveQuery(() => db.courses.toArray(), []);

    if (!modal) {
        throw new Error('AdminDashboardPage must be used within a ModalProvider');
    }

    // FIX: The complex import logic has been removed from this component
    // and is now handled entirely by the <CourseImport /> component.
    // This resolves both of the TypeScript errors.

    const handleCreateCourse = () => {
        navigate('/admin/create-course');
    };

    const handleEditCourse = (courseId: number) => {
        navigate(`/admin/edit-course/${courseId}`);
    };

    const handleDeleteCourse = (courseId: number) => {
        // Find the course title for a more descriptive confirmation message.
        const courseToDelete = courses?.find((c) => c.id === courseId);
        modal.showConfirm({
            title: t('confirmations.deleteCourse.title'),
            // NEW: Added the course title to the message for clarity.
            message: t('confirmations.deleteCourse.message', {
                title: courseToDelete?.title || 'this course',
            }),
            onConfirm: async () => {
                try {
                    await db.courses.delete(courseId);
                } catch (error) {
                    console.error('Failed to delete course:', error);
                    modal.showAlert({
                        title: t('errors.title'),
                        // FIX: Changed to a more generic error message key.
                        message: t('errors.deleteCourseFailed'),
                    });
                }
            },
        });
    };

    return (
        <div className="admin-dashboard">
            <div className="admin-dashboard__header">
                <h2 className="admin-dashboard__title">{t('dashboard.adminTitle')}</h2>
                <div className="admin-dashboard__actions">
                    {/* FIX: Replaced the old button with the new component. */}
                    <CourseImport />
                    <Button variant="primary" onClick={handleCreateCourse}>
                        {/* The key 'buttons.createCourse' will be added to the JSON files next. */}
                        {t('buttons.createCourse')}
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
