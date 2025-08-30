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

// --- Question and Answer Models (REFACTORED) ---

/**
 * Represents a single option for a Multiple Choice Question.
 */
export interface IMCQOption {
    id: string; // UUID for React keys
    text: string;
    isCorrect: boolean;
}

/**
 * Base interface for all question types. The 'type' property is the discriminant.
 */
interface IQuestionBase {
    id: string; // UUID for React keys
    questionText: string;
}

/**
 * Stricter type for Multiple Choice Questions.
 * It MUST have an 'options' array.
 */
export interface IMultipleChoiceQuestion extends IQuestionBase {
    type: 'mcq';
    options: IMCQOption[];
}

/**
 * Stricter type for Fill-in-the-blank Questions.
 * It MUST have a 'correctAnswer' string.
 */
export interface IFillInTheBlankQuestion extends IQuestionBase {
    type: 'fitb';
    correctAnswer: string;
}

/**
 * A discriminated union of all possible question types.
 * This allows TypeScript to intelligently narrow down the type based on the 'type' property.
 */
export type IQuestion = IMultipleChoiceQuestion | IFillInTheBlankQuestion;

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
