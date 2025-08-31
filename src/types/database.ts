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

// --- Discriminated Union for Question Types ---
// By creating specific types for each question format and uniting them,
// we gain immense type safety. TypeScript can now understand that
// an 'mcq' question MUST have 'options' and a 'sti' MUST have 'correctAnswers'.

/**
 * A base interface that all question types will extend.
 */
interface IQuestionBase {
    id: string; // UUID for React keys
    questionText: string;
}

/**
 * Represents a Multiple Choice Question.
 */
export interface IMultipleChoiceQuestion extends IQuestionBase {
    type: 'mcq';
    options: IMCQOption[];
}

/**
 * NEW: Represents a Smart Text Input question (formerly Fill-in-the-Blank).
 * This new structure is more flexible and powerful.
 */
export interface ISmartTextInputQuestion extends IQuestionBase {
    type: 'sti';
    // Allows for multiple acceptable answers (e.g., "Paris", "paris").
    correctAnswers: string[];
    // Defines how the learner's input should be evaluated.
    evaluationMode: 'case-insensitive' | 'exact-match';
}

/**
 * The main IQuestion type is now a discriminated union of all possible question types.
 * This is the cornerstone of our new, extensible question system.
 */
export type IQuestion = IMultipleChoiceQuestion | ISmartTextInputQuestion;

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
