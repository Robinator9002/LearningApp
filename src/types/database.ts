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
// This is the old, simple progress log. We're keeping it for now.
export interface IProgressLog {
    id?: number;
    userId: number;
    courseId: number;
    score: number;
    totalQuestions: number;
    timestamp: number;
}

// --- QUESTION & COURSE INTERFACES (UNCHANGED) ---

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

export interface IQuestionSentenceCorrection extends IQuestionBase {
    type: 'sentence-correction';
    sentenceWithMistake: string;
    correctedSentence: string;
}

export type IQuestion =
    | IQuestionMCQ
    | IQuestionSTI
    | IQuestionAlgEquation
    | IQuestionSentenceCorrection;

// Defines the subjects available in the app.
export type Subject = 'math' | 'reading' | 'writing' | 'english';

export interface ICourse {
    id?: number;
    title: string;
    subject: Subject;
    questions: IQuestion[];
    gradeRange: string;
}

// --- NEW LEARNER TRACKING SYSTEM ---

// Defines the grade scales.
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F' | '1' | '2' | '3' | '4' | '5' | '6';

// Represents a single course completion record.
export interface ITrackedCourse {
    courseId: number;
    title: string;
    subject: Subject;
    completedAt: number; // timestamp
    timeSpent: number; // in seconds
    score: number;
    totalQuestions: number;
    grade: Grade;
}

// Represents daily activity.
export interface IDailyActivity {
    date: string; // YYYY-MM-DD
    timeSpent: number; // in seconds
}

// Represents aggregated stats for a single subject.
export interface ITrackedSubject {
    coursesCompleted: number;
    timeSpent: number; // in seconds
}

// The main document for storing all tracking data for a single user.
export interface IUserTracking {
    id?: number;
    userId: number; // Foreign key to the IUser table
    totalTimeSpent: number; // in seconds
    completedCourses: ITrackedCourse[];
    dailyActivity: IDailyActivity[];
    statsBySubject: Partial<Record<Subject, ITrackedSubject>>;
    // FIX: Added the missing property
    averageScore: number; // Overall average percentage
}
