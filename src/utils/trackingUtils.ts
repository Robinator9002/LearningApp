// src/utils/trackingUtils.ts

import { db } from '../lib/db';
import type { ICourse, Grade, IUserTracking, ITrackedCourse } from '../types/database';

/**
 * Calculates a grade based on a percentage score.
 * Assigns A-F for English and 1-6 for German.
 * @param percentage - The score percentage (0-100).
 * @param language - The user's language setting.
 * @returns The calculated grade.
 */
export const calculateGrade = (percentage: number, language: 'en' | 'de'): Grade => {
    if (language === 'de') {
        if (percentage >= 92) return '1';
        if (percentage >= 81) return '2';
        if (percentage >= 67) return '3';
        if (percentage >= 50) return '4';
        if (percentage >= 23) return '5';
        return '6';
    } else {
        // Default to English grading
        if (percentage >= 93) return 'A';
        if (percentage >= 85) return 'B';
        if (percentage >= 75) return 'C';
        if (percentage >= 65) return 'D';
        return 'F';
    }
};

/**
 * Retrieves, updates, and saves a user's tracking data after course completion.
 * @param userId - The ID of the user.
 * @param course - The course that was just completed.
 * @param score - The user's score in the course.
 * @param timeSpent - The time spent in the course, in seconds.
 * @param language - The user's language, for grade calculation.
 */
export const saveTrackingData = async (
    userId: number,
    course: ICourse,
    score: number,
    timeSpent: number,
    language: 'en' | 'de' = 'en',
): Promise<void> => {
    // CRITICAL: Add a guard to prevent crashes if the course object is invalid.
    if (!course || !course.id || !course.questions || course.questions.length === 0) {
        console.error('saveTrackingData called with invalid course object. Aborting.');
        return;
    }

    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const percentage = (score / course.questions.length) * 100;
        const grade = calculateGrade(percentage, language);

        // DATABASE FIX: Use .where() to query by the 'userId' index, not the primary key.
        // The .get() method only works on the primary key ('++id').
        const existingData = await db.userTracking.where('userId').equals(userId).first();

        const newCourseRecord: ITrackedCourse = {
            courseId: course.id,
            title: course.title,
            subject: course.subject,
            score,
            totalQuestions: course.questions.length,
            timeSpent,
            completedAt: Date.now(),
            grade,
        };

        if (existingData) {
            // --- UPDATE EXISTING RECORD ---
            const updatedCompletedCourses = [...existingData.completedCourses, newCourseRecord];

            const todayActivity = existingData.dailyActivity.find((a) => a.date === today);
            const updatedDailyActivity = todayActivity
                ? existingData.dailyActivity.map((a) =>
                      a.date === today ? { ...a, timeSpent: a.timeSpent + timeSpent } : a,
                  )
                : [...existingData.dailyActivity, { date: today, timeSpent }];

            const subjectStats = existingData.statsBySubject[course.subject] || {
                coursesCompleted: 0,
                totalTimeSpent: 0,
            };
            const updatedSubjectStats = {
                ...existingData.statsBySubject,
                [course.subject]: {
                    coursesCompleted: subjectStats.coursesCompleted + 1,
                    totalTimeSpent: subjectStats.totalTimeSpent + timeSpent,
                },
            };

            const totalScore = updatedCompletedCourses.reduce((sum, c) => sum + c.score, 0);
            const totalQs = updatedCompletedCourses.reduce((sum, c) => sum + c.totalQuestions, 0);
            const newAverageScore = totalQs > 0 ? (totalScore / totalQs) * 100 : 0;

            // Use .put() to update the existing record.
            await db.userTracking.put({
                ...existingData,
                totalTimeSpent: existingData.totalTimeSpent + timeSpent,
                completedCourses: updatedCompletedCourses,
                dailyActivity: updatedDailyActivity,
                statsBySubject: updatedSubjectStats,
                averageScore: newAverageScore,
            });
        } else {
            // --- CREATE NEW RECORD ---
            const newTrackingData: IUserTracking = {
                userId,
                totalTimeSpent: timeSpent,
                completedCourses: [newCourseRecord],
                dailyActivity: [{ date: today, timeSpent }],
                statsBySubject: {
                    [course.subject]: { coursesCompleted: 1, totalTimeSpent: timeSpent },
                },
                averageScore: percentage,
            };
            // Use .add() for a new record.
            await db.userTracking.add(newTrackingData);
        }
    } catch (error) {
        console.error('Failed to save tracking data:', error);
    }
};
