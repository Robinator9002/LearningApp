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

// --- QUESTION TYPE: Highlight The Error ---
export interface IQuestionHighlightError extends IQuestionBase {
    type: 'highlight-error';
    sentence: string;
    correctAnswerIndices: number[];
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
    | IQuestionHighlightError
    | IQuestionSentenceOrder;

// --- MAIN COURSE INTERFACE ---
export interface ICourse {
    id?: number;
    title: string;
    subject: 'Math' | 'Reading' | 'Writing' | 'English';
    questions: IQuestion[];
    gradeRange: string;
    targetAudience?: [number, number];
}

// --- LEARNER TRACKING SYSTEM ---
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F' | '1' | '2' | '3' | '4' | '5' | '6';

export interface ITrackedCourse {
    courseId: number;
    title: string;
    subject: ICourse['subject'];
    score: number;
    totalQuestions: number;
    timeSpent: number; // in seconds
    completedAt: number; // timestamp
    grade: Grade;
}

export interface IDailyActivity {
    date: string; // YYYY-MM-DD
    timeSpent: number; // in seconds
}

export interface ITrackedSubject {
    coursesCompleted: number;
    totalTimeSpent: number;
}

export type IStatsBySubject = Partial<Record<ICourse['subject'], ITrackedSubject>>;

export interface IUserTracking {
    userId: number;
    totalTimeSpent: number;
    completedCourses: ITrackedCourse[];
    dailyActivity: IDailyActivity[];
    statsBySubject: IStatsBySubject;
    averageScore: number;
}
