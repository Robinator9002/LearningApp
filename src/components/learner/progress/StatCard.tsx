// src/components/learner/progress/StatCard.tsx

import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
    return (
        <div className="stat-card">
            <h3 className="stat-card__title">{title}</h3>
            <p className="stat-card__value">{value}</p>
        </div>
    );
};

export default StatCard;
