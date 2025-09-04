// src/types/database.ts

// --- APPLICATION SETTINGS ---
/**
 * Defines the structure for global application settings.
 * This will be stored as a single entry in a new 'settings' table.
 */
export interface IAppSettings {
    id?: number; // Should always be 1 for the singleton settings object
    defaultLanguage: 'en' | 'de';
    seedCoursesOnNewUser: boolean; // Controls if starter courses are added for new users
}

// --- THEME & USER SETTINGS ---
export interface IThemeState {
    theme: 'light' | 'dark';
    accent: 'blue' | 'purple' | 'green';
    contrast: 'normal' | 'high';
    font: 'sans' | 'serif' | 'mono';
    fontSize: number;
}

// --- USER & AUTH ---
export interface IUser {
    id?: number;
    name: string;
    type: 'learner' | 'admin';
    password?: string;
    settings?: IThemeState;
    // MODIFICATION: Added an optional language property to store user preference.
    language?: 'en' | 'de';
}

// --- PROGRESS ---
export interface IProgressLog {
    id?: number;
    userId: number;
    courseId: number;
    score: number;
    totalQuestions: number;
    timestamp: number;
}

// --- BASE QUESTION INTERFACES ---
export interface IQuestionBase {
    id: string;
    questionText: string;
}

// --- QUESTION TYPE: Multiple Choice ---
export interface IMCQOption {
    id: string;
    text: string;
    isCorrect: boolean;
}
export interface IQuestionMCQ extends IQuestionBase {
    type: 'mcq';
    options: IMCQOption[];
}

// --- QUESTION TYPE: Smart Text Input (Fill-in-the-blank) ---
export interface IQuestionSTI extends IQuestionBase {
    type: 'sti';
    correctAnswers: string[];
    evaluationMode: 'case-insensitive' | 'exact-match';
}

// --- QUESTION TYPE: Algebraic Equation ---
export interface IQuestionAlgEquation extends IQuestionBase {
    type: 'alg-equation';
    equation: string;
    variables: string[];
}

// --- QUESTION TYPE: Free Response (Essay) ---
// Note: This type is deprecated and no longer created, but the interface remains
// to support any legacy courses that might still exist in a user's database.
export interface IQuestionFreeResponse extends IQuestionBase {
    type: 'free-response';
}

// --- QUESTION TYPE: Sentence Correction ---
export interface IQuestionSentenceCorrection extends IQuestionBase {
    type: 'sentence-correction';
    sentenceWithMistake: string;
    correctedSentence: string;
}

// A union type that can represent any type of question in the system.
export type IQuestion =
    | IQuestionMCQ
    | IQuestionSTI
    | IQuestionAlgEquation
    | IQuestionFreeResponse
    | IQuestionSentenceCorrection;

// --- MAIN COURSE INTERFACE ---
export interface ICourse {
    id?: number;
    title: string;
    subject: 'Math' | 'Reading' | 'Writing' | 'English';
    questions: IQuestion[];
    gradeRange: string;
}
