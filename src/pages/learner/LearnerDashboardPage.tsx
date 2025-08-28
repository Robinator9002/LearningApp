// src/pages/learner/LearnerDashboardPage.tsx

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/db';
import CourseCard from '../../components/learner/Course/CourseCard';

const LearnerDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const courses = useLiveQuery(() => db.courses.toArray(), []);

    const handleSelectCourse = (courseId: number) => {
        // We will create this route in the next step
        navigate(`/player/${courseId}`);
    };

    return (
        <div>
            {courses && courses.length > 0 ? (
                <div className="learner-dashboard__grid">
                    {courses.map((course: any) => (
                        <CourseCard key={course.id} course={course} onSelect={handleSelectCourse} />
                    ))}
                </div>
            ) : (
                <div className="learner-dashboard__empty">
                    <p>No courses available yet. Ask an admin to create one!</p>
                </div>
            )}
        </div>
    );
};

export default LearnerDashboardPage;
