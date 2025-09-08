// src/utils/trackingUtils.ts

import { db } from '../lib/db';
import type {
    ICourse,
    IUserTracking,
    ITrackedCourse,
    IDailyActivity,
    ITrackedSubject,
} from '../types/database';

/**
 * Calculates a grade based on a percentage score.
 * @param percentage - The user's percentage score (0-100).
 * @param language - The user's language to determine the grading scale.
 * @returns A grade as a string (e.g., "A", "B" or "1", "2").
 */
export const calculateGrade = (percentage: number, language: 'en' | 'de'): string => {
    if (language === 'de') {
        if (percentage >= 92) return '1';
        if (percentage >= 81) return '2';
        if (percentage >= 67) return '3';
        if (percentage >= 50) return '4';
        if (percentage >= 30) return '5';
        return '6';
    } else {
        // Default to English 'en'
        if (percentage >= 93) return 'A';
        if (percentage >= 85) return 'B';
        if (percentage >= 75) return 'C';
        if (percentage >= 65) return 'D';
        return 'F';
    }
};

// --- NEWLY IMPLEMENTED FUNCTION ---

interface SaveTrackingDataArgs {
    userId: number;
    course: ICourse;
    score: number;
    timeSpent: number; // in seconds
    language: 'en' | 'de';
}

/**
 * The core logic for saving a user's progress after a course.
 * It finds the user's tracking document, or creates one, and updates it with the new data.
 */
export const saveTrackingData = async ({
    userId,
    course,
    score,
    timeSpent,
    language,
}: SaveTrackingDataArgs): Promise<void> => {
    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

        const percentage = (score / course.questions.length) * 100;
        const grade = calculateGrade(percentage, language);

        const newCompletedCourse: ITrackedCourse = {
            courseId: course.id!,
            title: course.title,
            subject: course.subject,
            completedAt: Date.now(),
            timeSpent,
            score,
            totalQuestions: course.questions.length,
            grade,
        };

        const existingTracking = await db.userTracking.where({ userId }).first();

        if (existingTracking) {
            // --- UPDATE EXISTING TRACKING DOCUMENT ---
            const dailyActivityUpdate = [...existingTracking.dailyActivity];
            const todayActivity = dailyActivityUpdate.find((d) => d.date === today);

            if (todayActivity) {
                todayActivity.timeSpent += timeSpent;
            } else {
                dailyActivityUpdate.push({ date: today, timeSpent });
            }

            const subjectStatsUpdate = { ...existingTracking.statsBySubject };
            const subjectData = subjectStatsUpdate[course.subject] || {
                coursesCompleted: 0,
                timeSpent: 0,
            };
            subjectData.coursesCompleted += 1;
            subjectData.timeSpent += timeSpent;
            subjectStatsUpdate[course.subject] = subjectData;

            await db.userTracking.update(existingTracking.id!, {
                totalTimeSpent: existingTracking.totalTimeSpent + timeSpent,
                completedCourses: [...existingTracking.completedCourses, newCompletedCourse],
                dailyActivity: dailyActivityUpdate,
                statsBySubject: subjectStatsUpdate,
            });
        } else {
            // --- CREATE NEW TRACKING DOCUMENT ---
            const newTrackingData: Omit<IUserTracking, 'id'> = {
                userId,
                totalTimeSpent: timeSpent,
                completedCourses: [newCompletedCourse],
                dailyActivity: [{ date: today, timeSpent }],
                statsBySubject: {
                    [course.subject]: {
                        coursesCompleted: 1,
                        timeSpent,
                    },
                },
            };
            await db.userTracking.add(newTrackingData as IUserTracking);
        }
    } catch (error) {
        console.error('Failed to save tracking data:', error);
    }
};
