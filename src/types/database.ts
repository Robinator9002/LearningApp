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
    password?: string; // An optional password for the user account.
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
 * Represents a single question within a course. This model is now extensible
 * to support multiple question formats.
 */
export interface IQuestion {
    id: string; // A unique identifier for the question.

    // The type of question, determining how it's rendered and graded.
    type: 'mcq' | 'fitb'; // 'mcq' = Multiple Choice, 'fitb' = Fill-in-the-blank

    questionText: string; // The main text of the question.

    // Optional: An array of possible answers. Only used for 'mcq' type questions.
    options?: IMCQOption[];

    // Optional: The correct string answer. Only used for 'fitb' type questions.
    correctAnswer?: string;
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
 * Represents a single, timestamped record of a user completing a course.
 */
export interface IProgressLog {
    id?: number; // Optional: The auto-incrementing primary key from Dexie.
    userId: number;
    courseId: number;
    score: number;
    totalQuestions: number;
    timestamp: Date;
}
