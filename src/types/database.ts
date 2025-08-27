// src/types/db.ts

/**
 * Defines the structure for a User record in the database.
 */
export interface IUser {
    id?: number; // Optional: The auto-incrementing primary key from Dexie.
    name: string;
    type: 'admin' | 'learner';
}

/**
 * Defines the structure for a Course record in the database.
 * We will expand this later.
 */
export interface ICourse {
    id?: number;
    title: string;
    subject: 'Math' | 'Reading' | 'Writing';
    // questions: IQuestion[]; // To be defined later
}

/**
 * Defines the structure for a ProgressLog record in the database.
 * We will expand this later.
 */
export interface IProgressLog {
    id?: number;
    userId: number;
    courseId: number;
    score: number; // e.g., 80 for 80%
    timeSpent: number; // in seconds
    timestamp: Date;
}
