// src/components/learner/progress/ActivityChart.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { IDailyActivity } from '../../../types/database';

interface ActivityChartProps {
    data: IDailyActivity[];
}

const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
    const { t } = useTranslation();

    // Process data for the chart
    const chartData = data.slice(-14).map((item) => ({
        // format date for display
        date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        minutes: Math.round(item.timeSpent / 60),
    }));

    return (
        <div className="chart-container">
            <h3 className="chart-container__title">{t('progress.dailyActivityTitle')}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis
                        label={{ value: t('progress.minutes'), angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip />
                    <Bar dataKey="minutes" fill="var(--color-accent)" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ActivityChart;
