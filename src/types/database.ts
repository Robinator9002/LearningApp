// src/types/database.ts

/**
 * ============================================================================
 * BASE TYPES
 * ============================================================================
 */

/**
 * Defines the basic structure that all question types will share.
 * This includes a unique ID and the main text/prompt for the question.
 */
interface IBaseQuestion {
    id: string; // A unique identifier (UUID) for the question.
    questionText: string; // The main prompt or question text.
}

/**
 * ============================================================================
 * EXISTING QUESTION TYPES
 * ============================================================================
 */

/**
 * Represents a single answer option within a Multiple Choice Question.
 */
export interface IMCQOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

/**
 * A Multiple Choice Question (MCQ).
 * It consists of the question text and a list of options, one of which is correct.
 */
export interface IMCQQuestion extends IBaseQuestion {
    type: 'mcq';
    options: IMCQOption[];
}

/**
 * A "Smart Text Input" (sti) or Fill-in-the-Blank question.
 * It allows for multiple possible correct answers and can be graded
 * in a case-insensitive or exact-match manner.
 */
export interface ISTIQuestion extends IBaseQuestion {
    type: 'sti';
    correctAnswers: string[];
    evaluationMode: 'case-insensitive' | 'exact-match';
}

/**
 * An Algebraic Equation question.
 * Requires the student to solve for one or more variables in a given equation.
 */
export interface IAlgEquationQuestion extends IBaseQuestion {
    type: 'alg-equation';
    equation: string;
    variables: string[]; // e.g., ['x', 'y']
}

/**
 * ============================================================================
 * NEW QUESTION TYPES
 * ============================================================================
 */

/**
 * A "Highlight Text" question for Reading/English subjects.
 * The student is presented with a block of text and must select the
 * correct sentences or phrases.
 */
export interface IHighlightTextQuestion extends IBaseQuestion {
    type: 'highlight-text';
    passage: string; // The full block of text to be displayed.
    // An array of strings, where each string is an exact match for a correct sentence/phrase.
    correctHighlights: string[];
}

/**
 * A "Free Response" or essay-style question.
 * This type is not auto-graded and is intended for manual review.
 */
export interface IFreeResponseQuestion extends IBaseQuestion {
    type: 'free-response';
    // No extra fields are needed initially, but this could be extended later
    // with properties like min/max word count.
}

/**
 * A "Passage" question, which acts as a container.
 * It holds a large reading passage and an array of sub-questions
 * that relate to that passage.
 */
export interface IPassageQuestion extends IBaseQuestion {
    type: 'passage';
    passage: string; // The long-form reading passage.
    // Sub-questions can be any other question type EXCEPT another passage question.
    subQuestions: Exclude<IQuestion, IPassageQuestion>[];
}

/**
 * ============================================================================
 * MASTER TYPES
 * ============================================================================
 */

/**
 * A discriminated union of all possible question types.
 * The 'type' property is the discriminator, allowing TypeScript to know
 * which other properties are available for a given question.
 */
export type IQuestion =
    | IMCQQuestion
    | ISTIQuestion
    | IAlgEquationQuestion
    | IHighlightTextQuestion
    | IFreeResponseQuestion
    | IPassageQuestion;

/**
 * Defines the structure for a Course.
 * It includes metadata like title and subject, and contains an array
 * of questions that make up the course content.
 */
export interface ICourse {
    id?: number; // Optional because it's auto-incremented by the database.
    title: string;
    // The subject of the course. The new 'English' subject has been added.
    subject: 'Math' | 'Reading' | 'Writing' | 'English';
    questions: IQuestion[];
}
