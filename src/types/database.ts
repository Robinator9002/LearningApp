// src/types/database.ts

// --- BASE INTERFACES ---
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
    // No extra fields needed, grading is manual
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

// The main Course interface
export interface ICourse {
    id?: number;
    title: string;
    subject: 'Math' | 'Reading' | 'Writing' | 'English';
    // MODIFICATION: Changed gradeRange to a flexible string.
    gradeRange: string;
    questions: IQuestion[];
}

// --- THEME & USER INTERFACES ---

export interface IThemeState {
    theme: 'light' | 'dark';
    accent: 'blue' | 'purple' | 'green';
    contrast: 'normal' | 'high';
    font: 'sans' | 'serif' | 'mono';
    fontSize: number;
}

// The main User interface
export interface IUser {
    id?: number;
    name: string;
    type: 'learner' | 'admin';
    password?: string;
    settings?: IThemeState;
}

// The Progress Log interface
export interface IProgressLog {
    id?: number;
    userId: number;
    courseId: number;
    score: number;
    totalQuestions: number;
    timestamp: Date;
}
