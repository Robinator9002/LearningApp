// src/types/database.ts

// --- APPLICATION SETTINGS ---
export interface IAppSettings {
    id?: number;
    defaultLanguage: 'en' | 'de';
    seedCoursesOnFirstRun: boolean;
    defaultTheme: 'light' | 'dark';
    starterCoursesImported: boolean;
}

// --- THEME & SETTINGS ---
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
export interface IQuestionFreeResponse extends IQuestionBase {
    type: 'free-response';
}

// --- QUESTION TYPE: Sentence Correction ---
export interface IQuestionSentenceCorrection extends IQuestionBase {
    type: 'sentence-correction';
    sentenceWithMistake: string;
    correctedSentence: string;
}

// --- NEW QUESTION TYPE: Highlight the Error ---
export interface IQuestionHighlightError extends IQuestionBase {
    type: 'highlight-error';
    sentence: string; // The full sentence with one or more errors
    correctAnswerIndices: number[]; // Array of zero-based indices of the incorrect words
}

// --- NEW: QUESTION TYPE: Sentence / Paragraph Ordering ---
export interface IQuestionSentenceOrder extends IQuestionBase {
    type: 'sentence-order';
    items: string[]; // The sentences/paragraphs in the correct order
}

// A union type that can represent any type of question in the system.
export type IQuestion =
    | IQuestionMCQ
    | IQuestionSTI
    | IQuestionAlgEquation
    | IQuestionFreeResponse
    | IQuestionSentenceCorrection
    | IQuestionHighlightError; // Added the new type to the union

// --- MAIN COURSE INTERFACE ---
export interface ICourse {
    id?: number;
    title: string;
    subject: 'math' | 'reading' | 'writing' | 'english';
    questions: IQuestion[];
    gradeRange: string;
    // NEW: Added the targetAudience property for age-based sorting.
    // It's an optional tuple containing [minAge, maxAge].
    targetAudience?: [number, number];
}

// --- LEARNER TRACKING SYSTEM ---

// Defines the grade a learner can receive.
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F' | '1' | '2' | '3' | '4' | '5' | '6';

// Represents a single completed course in the user's history.
export interface ITrackedCourse {
    courseId: number;
    title: string; // FIX: Renamed from courseTitle for consistency
    subject: ICourse['subject']; // FIX: Added subject for filtering/stats
    score: number;
    totalQuestions: number;
    timeSpent: number; // in seconds
    completedAt: number; // timestamp
    grade: Grade;
}

// Represents a log of activity for a single day.
export interface IDailyActivity {
    date: string; // YYYY-MM-DD
    timeSpent: number; // in seconds
}

// Represents aggregated stats for a single subject (e.g., "Math").
export interface ITrackedSubject {
    coursesCompleted: number;
    totalTimeSpent: number; // FIX: Re-added this essential property
}

// A flexible record for storing stats for each subject.
export type IStatsBySubject = Partial<Record<ICourse['subject'], ITrackedSubject>>;

// The main, comprehensive tracking document for a single user.
export interface IUserTracking {
    userId: number; // Foreign key to the User table
    totalTimeSpent: number; // in seconds
    completedCourses: ITrackedCourse[];
    dailyActivity: IDailyActivity[];
    statsBySubject: IStatsBySubject;
    averageScore: number; // Overall average percentage
}
