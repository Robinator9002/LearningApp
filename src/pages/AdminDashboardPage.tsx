// src/pages/AdminDashboardPage.tsx
import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/db';

import CourseList from '../components/admin/CourseList/CourseList';
import Button from '../components/common/Button/Button';

import '../styles/pages/admin-dashboard.css';

const AdminDashboardPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const courses = useLiveQuery(() => db.courses.toArray(), []);

    const handleCreateCourse = () => {
        navigate('/admin/create-course');
    };

    /**
     * Handles the deletion of a course after user confirmation.
     */
    const handleDeleteCourse = async (courseId: number) => {
        // NOTE: In a real app, replace window.confirm with a custom, non-blocking modal component.
        const isConfirmed = window.confirm(
            'Are you sure you want to delete this course? This action cannot be undone.',
        );

        if (isConfirmed) {
            try {
                await db.courses.delete(courseId);
                console.log(`Course with id ${courseId} deleted successfully.`);
            } catch (error) {
                console.error('Failed to delete course:', error);
                alert('There was an error deleting the course.');
            }
        }
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
                <CourseList courses={courses} onDeleteCourse={handleDeleteCourse} />
            ) : (
                <p>Loading courses...</p>
            )}
        </div>
    );
};

export default AdminDashboardPage;
