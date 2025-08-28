// src/pages/AdminDashboardPage.tsx
import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { db } from '../lib/db';

import CourseList from '../components/admin/CourseList/CourseList';
import Button from '../components/common/Button/Button';

// We'll create a dedicated stylesheet for this page
import '../styles/pages/admin-dashboard.css';

const AdminDashboardPage: React.FC = () => {
    const { t } = useTranslation();
    const courses = useLiveQuery(() => db.courses.toArray(), []);

    return (
        <div className="admin-dashboard">
            <div className="admin-dashboard__header">
                <h2 className="admin-dashboard__title">{t('dashboard.adminTitle')}</h2>
                <Button variant="primary" onClick={() => alert('Navigate to course creator page')}>
                    Create New Course
                </Button>
            </div>

            {courses ? <CourseList courses={courses} /> : <p>Loading courses...</p>}
        </div>
    );
};

export default AdminDashboardPage;
