// src/pages/AdminDashboardPage.tsx
import React, { useContext } from 'react'; // Import useContext
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/db';
import { ModalContext } from '../contexts/ModalContext'; // Import the ModalContext

import CourseList from '../components/admin/CourseList/CourseList';
import Button from '../components/common/Button/Button';

import '../styles/pages/admin-dashboard.css';

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
        modal.showConfirm({
            title: 'Delete Course',
            message: 'Are you sure you want to delete this course? This action cannot be undone.',
            onConfirm: async () => {
                try {
                    await db.courses.delete(courseId);
                    console.log(`Course with id ${courseId} deleted successfully.`);
                } catch (error) {
                    console.error('Failed to delete course:', error);
                    // Here we could use an alert modal in the future
                    alert('There was an error deleting the course.');
                }
            },
        });
    };

    return (
        <div className="admin-dashboard">
            <div className="admin-dashboard__header">
                <h2 className="admin-dashboard__title">{t('dashboard.adminTitle')}</h2>
                <Button variant="primary" onClick={handleCreateCourse}>
                    Create New Course
                </Button>
            </div>

            {courses ? (
                <CourseList
                    courses={courses}
                    onEditCourse={handleEditCourse}
                    onDeleteCourse={handleDeleteCourse}
                />
            ) : (
                <p>Loading courses...</p>
            )}
        </div>
    );
};

export default AdminDashboardPage;
