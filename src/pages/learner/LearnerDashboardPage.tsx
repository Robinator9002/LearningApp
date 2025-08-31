// src/pages/learner/LearnerDashboardPage.tsx

import React, { useContext } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/db';
import { AuthContext } from '../../contexts/AuthContext'; // Import AuthContext

// Import the new ProgressSummary component
import ProgressSummary from '../../components/learner/dashboard/ProgressSummary';
import CourseCard from '../../components/learner/course/CourseCard';

const LearnerDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const auth = useContext(AuthContext); // Get auth context
    const courses = useLiveQuery(() => db.courses.toArray(), []);

    if (!auth || !auth.currentUser) {
        // This should be handled by ProtectedRoute, but it's a good safeguard.
        return <div>Loading user...</div>;
    }

    const { currentUser } = auth;

    const handleSelectCourse = (courseId: number) => {
        navigate(`/player/${courseId}`);
    };

    return (
        <div className="learner-dashboard">
            {/* The ProgressSummary component is rendered here, receiving the
              current user's ID to fetch and display their specific progress.
            */}
            <ProgressSummary currentUserId={currentUser.id!} />

            {/* The existing course selection grid */}
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
