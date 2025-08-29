// src/types/database.ts

// This file defines the core data structures for the application's database.
// By centralizing these types, we ensure consistency across the entire codebase.

/**
 * Represents a user account in the database.
 */
export interface IUser {
    id?: number; // Optional: The auto-incrementing primary key from Dexie.
    name: string; // The user's display name, which must be unique.
    type: 'admin' | 'learner'; // The user's role, determining their permissions.

    // NEW: An optional password for the user account.
    // This is optional to allow for password-less accounts, providing flexibility
    // for different use cases (e.g., young children who don't need a password).
    password?: string;
}

/**
 * Represents a single multiple-choice question option.
 */
export interface IMCQOption {
    id: string; // A unique identifier for the option.
    text: string; // The answer text to be displayed.
    isCorrect: boolean; // Flag indicating if this is the correct answer.
}

/**
 * Represents a single question within a course.
 */
export interface IQuestion {
    id: string; // A unique identifier for the question.
    type: 'mcq'; // The type of question (extensible for future types).
    questionText: string; // The main text of the question.
    options: IMCQOption[]; // The list of possible answers for the question.
}

/**
 * Represents a course, which is a collection of questions.
 */
export interface ICourse {
    id?: number; // Optional: The auto-incrementing primary key from Dexie.
    title: string; // The title of the course.
    subject: 'Math' | 'Reading' | 'Writing'; // The subject category for the course.
    questions: IQuestion[]; // The array of questions that make up the course.
}

/**
 * Represents a log of a user's progress on a course.
 */
export interface IProgressLog {
    id?: number; // Optional: The auto-incrementing primary key from Dexie.
    userId: number; // The ID of the user who completed the course.
    courseId: number; // The ID of the course that was completed.
    score: number; // The user's score (e.g., number of correct answers).
    totalQuestions: number; // The total number of questions in the course.
    timestamp: Date; // The date and time when the course was completed.
}
