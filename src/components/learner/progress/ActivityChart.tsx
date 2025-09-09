// src/components/learner/progress/ActivityChart.tsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import type { IDailyActivity } from '../../../types/database';

// --- TYPE DEFINITIONS ---
type ChartType = 'bar' | 'line';

interface ActivityChartProps {
    data: IDailyActivity[];
}

const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
    const { t } = useTranslation();
    const [chartType, setChartType] = useState<ChartType>('bar');

    // Process data for the chart, ensuring it's sorted by date for the line chart.
    const chartData = data
        .slice() // Create a shallow copy to avoid mutating the original prop
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-14) // Take the last 14 days
        .map((item) => ({
            date: new Date(item.date).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
            }),
            minutes: Math.round(item.timeSpent / 60),
        }));

    // Define the tooltip style once to be reused in both charts for consistency.
    const themedTooltipStyle = {
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-text-primary)',
        border: '1px solid var(--color-border)',
    };

    const renderChart = () => {
        if (chartType === 'line') {
            return (
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis
                        label={{ value: t('progress.minutes'), angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip contentStyle={themedTooltipStyle} />
                    <Line
                        type="monotone"
                        dataKey="minutes"
                        stroke="var(--color-accent)"
                        strokeWidth={2}
                    />
                </LineChart>
            );
        }

        // Default to bar chart
        return (
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis
                    label={{ value: t('progress.minutes'), angle: -90, position: 'insideLeft' }}
                />
                {/* FIX: The Tooltip cursor is styled to be transparent to avoid the default grey background on hover. */}
                <Tooltip contentStyle={themedTooltipStyle} cursor={{ fill: 'transparent' }} />
                <Bar dataKey="minutes" fill="var(--color-accent)" />
            </BarChart>
        );
    };

    return (
        <div className="chart-container">
            <div className="chart-container__header">
                <h3 className="chart-container__title">{t('progress.dailyActivityTitle')}</h3>
                <div className="chart-toggle">
                    <button
                        className={`chart-toggle__btn ${chartType === 'bar' ? 'active' : ''}`}
                        onClick={() => setChartType('bar')}
                    >
                        {t('progress.chart.bar')}
                    </button>
                    <button
                        className={`chart-toggle__btn ${chartType === 'line' ? 'active' : ''}`}
                        onClick={() => setChartType('line')}
                    >
                        {t('progress.chart.line')}
                    </button>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
};

export default ActivityChart;
