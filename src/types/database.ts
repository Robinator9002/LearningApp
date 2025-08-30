// src/types/database.ts

// --- Theme and Settings Definitions ---

/**
 * Defines the shape of a user's personalized theme settings.
 * This object will be stored directly in the user's profile.
 */
export interface IThemeState {
    theme: 'light' | 'dark';
    accent: 'blue' | 'purple' | 'green';
    contrast: 'normal' | 'high';
    font: 'sans' | 'serif' | 'mono';
    fontSize: number; // e.g., 0.9, 1.0, 1.1
}

// --- Core Data Models ---

/**
 * Represents a user account in the application.
 */
export interface IUser {
    id?: number; // Optional: Dexie will auto-increment
    name: string;
    type: 'admin' | 'learner';
    password?: string; // Optional: for password-protected accounts
    settings?: IThemeState; // Optional: for per-user theme settings
}

/**
 * Represents a single course.
 */
export interface ICourse {
    id?: number;
    title: string;
    subject: 'Math' | 'Reading' | 'Writing';
    questions: IQuestion[];
}

// --- Question and Answer Models ---

/**
 * Represents a single option for a Multiple Choice Question.
 */
export interface IMCQOption {
    id: string; // UUID for React keys
    text: string;
    isCorrect: boolean;
}

/**
 * Represents a single question within a course.
 * This is a flexible structure designed to support multiple question types.
 */
export interface IQuestion {
    id: string; // UUID for React keys
    type: 'mcq' | 'fill-in-the-blank';
    questionText: string;
    // Options are only required for Multiple Choice Questions
    options?: IMCQOption[];
    // The correct answer for non-MCQ types (e.g., fill-in-the-blank)
    correctAnswer?: string;
}

/**
 * Represents a log of a completed course attempt by a user.
 */
export interface IProgressLog {
    id?: number;
    userId: number;
    courseId: number;
    score: number; // The number of questions answered correctly
    totalQuestions: number; // The total number of questions in the course
    timestamp: string; // ISO 8601 string of when the course was completed
}
