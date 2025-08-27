// src/types/database.ts

// --- USER & PROGRESS ---

/**
 * Defines the structure for a User record in the database.
 */
export interface IUser {
    id?: number; // Optional: The auto-incrementing primary key from Dexie.
    name: string;
    type: 'admin' | 'learner';
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

// --- COURSE & QUESTION STRUCTURES ---

/**
 * Defines a single option for a Multiple Choice Question.
 */
export interface IMCQOption {
    id: string; // A unique identifier for the option (e.g., a UUID)
    text: string;
    isCorrect: boolean;
}

/**
 * Defines the structure for a single question within a course.
 * This is designed to be extensible for future question types.
 */
export interface IQuestion {
    id: string; // A unique identifier for the question
    type: 'mcq'; // For now, only 'mcq' is supported
    questionText: string;
    options: IMCQOption[];
}

/**
 * Defines the structure for a Course record in the database.
 * A course is a collection of questions.
 */
export interface ICourse {
    id?: number;
    title: string;
    subject: 'Math' | 'Reading' | 'Writing';
    questions: IQuestion[];
}
