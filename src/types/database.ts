// src/types/database.ts

// --- THEME & SETTINGS ---
export interface IThemeState {
    theme: 'light' | 'dark';
    accent: 'blue' | 'purple' | 'green';
    contrast: 'normal' | 'high';
    font: 'sans' | 'serif' | 'mono';
    fontSize: number;
}

// --- USER DATA ---
export interface IUser {
    id?: number;
    name: string;
    type: 'learner' | 'admin';
    password?: string;
    settings?: IThemeState;
}

// --- LEARNING CONTENT ---
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
    subject: 'Math' | 'Reading' | 'Writing' | 'English';
    questions: IQuestion[];
}

// --- PROGRESS TRACKING ---
export interface IProgressLog {
    id?: number;
    userId: number;
    courseId: number;
    score: number;
    totalQuestions: number;
    timestamp: Date;
}
