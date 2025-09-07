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

// --- LEGACY & NEW PROGRESS TRACKING ---

/** @deprecated Replaced by the more detailed IUserTracking system. */
export interface IProgressLog {
    id?: number;
    userId: number;
    courseId: number;
    score: number;
    totalQuestions: number;
    timestamp: number;
}

// --- NEW LEARNER TRACKING SYSTEM (v2) ---

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F' | '1' | '2' | '3' | '4' | '5' | '6';

/** A record of a single completed course. */
export interface ITrackedCourse {
    courseId: number;
    courseTitle: string;
    timestamp: number; // Completion date
    timeSpent: number; // in seconds
    score: number;
    totalQuestions: number;
    grade: Grade;
}

/** Aggregated statistics for a specific subject. */
export interface ITrackedSubject {
    totalTimeSpent: number;
    coursesCompleted: number;
    // Note: Average score is calculated dynamically in the UI to avoid data duplication.
}

/** A log of time spent on a specific day. */
export interface IDailyActivity {
    date: string; // "YYYY-MM-DD"
    timeSpent: number; // in seconds
}

/** The main tracking document for a single user. */
export interface IUserTracking {
    id?: number; // Primary key for the table
    userId: number; // Foreign key to IUser, should be unique
    totalTimeSpent: number;
    completedCourses: ITrackedCourse[];
    dailyActivity: IDailyActivity[];
    statsBySubject: Record<ICourse['subject'], ITrackedSubject>;
}

// --- COURSE & QUESTION STRUCTURES ---

export interface IQuestionBase {
    id: string;
    questionText: string;
}
export interface IMCQOption {
    id: string;
    text: string;
    isCorrect: boolean;
}
export interface IQuestionMCQ extends IQuestionBase {
    type: 'mcq';
    options: IMCQOption[];
}
export interface IQuestionSTI extends IQuestionBase {
    type: 'sti';
    correctAnswers: string[];
    evaluationMode: 'case-insensitive' | 'exact-match';
}
export interface IQuestionAlgEquation extends IQuestionBase {
    type: 'alg-equation';
    equation: string;
    variables: string[];
}
export interface IQuestionFreeResponse extends IQuestionBase {
    type: 'free-response';
}
export interface IQuestionSentenceCorrection extends IQuestionBase {
    type: 'sentence-correction';
    sentenceWithMistake: string;
    correctedSentence: string;
}
export type IQuestion =
    | IQuestionMCQ
    | IQuestionSTI
    | IQuestionAlgEquation
    | IQuestionFreeResponse
    | IQuestionSentenceCorrection;

export interface ICourse {
    id?: number;
    title: string;
    subject: 'math' | 'reading' | 'writing' | 'english';
    questions: IQuestion[];
    gradeRange: string;
}
