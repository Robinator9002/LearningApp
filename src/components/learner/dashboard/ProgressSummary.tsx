// src/components/learner/dashboard/ProgressSummary.tsx

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../lib/db';

// Define the props for the component, it needs the user's ID to fetch their data.
interface ProgressSummaryProps {
    currentUserId: number;
}

/**
 * A component that displays a summary of a learner's progress, including
 * total courses completed and average score.
 */
const ProgressSummary: React.FC<ProgressSummaryProps> = ({ currentUserId }) => {
    // Fetch all progress logs for the current user in real-time.
    const progressLogs = useLiveQuery(
        () => db.progressLogs.where('userId').equals(currentUserId).toArray(),
        [currentUserId], // Rerun the query if the userId changes
    );

    // --- Data Calculation ---
    // Render a loading state while the data is being fetched.
    if (!progressLogs) {
        return <div className="progress-summary">Loading progress...</div>;
    }

    // If there are no logs, display a welcoming message.
    if (progressLogs.length === 0) {
        return (
            <div className="progress-summary">
                <h3 className="progress-summary__title">Welcome!</h3>
                <p>Complete your first course to see your progress here.</p>
            </div>
        );
    }

    // Calculate the overall average score from all logs.
    const totalScore = progressLogs.reduce((sum: any, log: any) => sum + log.score, 0);
    const totalQuestions = progressLogs.reduce((sum: any, log: any) => sum + log.totalQuestions, 0);
    const averageScore = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;

    // --- Render ---
    return (
        <div className="progress-summary">
            <h3 className="progress-summary__title">Your Progress</h3>
            <div className="progress-summary__stats">
                <div className="stat-item">
                    <span className="stat-item__value">{progressLogs.length}</span>
                    <span className="stat-item__label">Courses Completed</span>
                </div>
                <div className="stat-item">
                    <span className="stat-item__value">{averageScore.toFixed(0)}%</span>
                    <span className="stat-item__label">Average Score</span>
                </div>
            </div>
        </div>
    );
};

export default ProgressSummary;
