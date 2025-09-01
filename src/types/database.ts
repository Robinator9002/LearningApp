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

// --- QUESTION TYPE: Highlight Text ---
export interface IQuestionHighlightText extends IQuestionBase {
    type: 'highlight-text';
    passage: string;
    // FIX: The property was 'correctAnswers' but used as 'correctPhrases' in the logic.
    // Standardizing to 'correctAnswers' for consistency with other types.
    correctAnswers: string[];
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
    | IQuestionHighlightText
    | IQuestionFreeResponse
    | IQuestionSentenceCorrection;

// The main Course interface
export interface ICourse {
    id?: number;
    title: string;
    subject: 'Math' | 'Reading' | 'Writing' | 'English';
    questions: IQuestion[];
}
