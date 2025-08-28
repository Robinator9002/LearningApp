// src/pages/AdminDashboardPage.tsx
import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { db } from '../lib/db';

import CourseList from '../components/admin/CourseList/CourseList';
import Button from '../components/common/Button/Button';

import '../styles/pages/admin-dashboard.css';

const AdminDashboardPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate(); // Initialize the navigate function
    const courses = useLiveQuery(() => db.courses.toArray(), []);

    const handleCreateCourse = () => {
        navigate('/admin/create-course'); // Navigate to the new route
    };

    return (
        <div className="admin-dashboard">
            <div className="admin-dashboard__header">
                <h2 className="admin-dashboard__title">{t('dashboard.adminTitle')}</h2>
                <Button
                    variant="primary"
                    onClick={handleCreateCourse} // Use the new handler
                >
                    Create New Course
                </Button>
            </div>

            {courses ? <CourseList courses={courses} /> : <p>Loading courses...</p>}
        </div>
    );
};

export default AdminDashboardPage;
