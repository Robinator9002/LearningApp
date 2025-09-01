import React from 'react';
import type { IQuestion } from '../../../types/database';

// --- Existing Component Imports ---
import MultipleChoiceEditor from '../../../components/admin/QuestionEditor/MultipleChoiceEditor';
import FillInTheBlankEditor from '../../../components/admin/QuestionEditor/FillInTheBlankEditor';
import AlgebraEquationEditor from '../../../components/admin/QuestionEditor/AlgebraEquationEditor';

// --- NEW: Importing the new editor components ---
import HighlightTextEditor from '../../../components/admin/QuestionEditor/HighlightTextEditor';
// --- REMOVED: The import for FreeResponseEditor has been deleted. ---
import SentenceCorrectionEditor from '../../../components/admin/QuestionEditor/SentenceCorrectionEditor';

interface QuestionListProps {
    questions: IQuestion[];
    onQuestionChange: (index: number, question: IQuestion) => void;
    onRemoveQuestion: (index: number) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({
    questions,
    onQuestionChange,
    onRemoveQuestion,
}) => {
    return (
        <div className="course-editor-page__questions">
            {questions.map((q, index) => {
                // The switch statement acts as a router, determining which editor
                // component to render based on the question's 'type' property.
                switch (q.type) {
                    case 'mcq':
                        return (
                            <MultipleChoiceEditor
                                key={q.id}
                                index={index}
                                question={q}
                                onQuestionChange={onQuestionChange}
                                onRemoveQuestion={onRemoveQuestion}
                            />
                        );
                    case 'sti':
                        return (
                            <FillInTheBlankEditor
                                key={q.id}
                                index={index}
                                question={q}
                                onQuestionChange={onQuestionChange}
                                onRemoveQuestion={onRemoveQuestion}
                            />
                        );
                    case 'alg-equation':
                        return (
                            <AlgebraEquationEditor
                                key={q.id}
                                index={index}
                                question={q}
                                onQuestionChange={onQuestionChange}
                                onRemoveQuestion={onRemoveQuestion}
                            />
                        );
                    // --- NEW: Adding cases for the new question types ---
                    case 'highlight-text':
                        return (
                            <HighlightTextEditor
                                key={q.id}
                                index={index}
                                question={q}
                                onQuestionChange={onQuestionChange}
                                onRemoveQuestion={onRemoveQuestion}
                            />
                        );
                    // --- REMOVED: The case for 'free-response' has been excised. ---
                    case 'sentence-correction':
                        return (
                            <SentenceCorrectionEditor
                                key={q.id}
                                index={index}
                                question={q}
                                onQuestionChange={onQuestionChange}
                                onRemoveQuestion={onRemoveQuestion}
                            />
                        );
                    default:
                        // This ensures that if a new type is added to the data model but
                        // not here, we don't crash the app. It's a good defensive measure.
                        console.warn(
                            `No editor component found for question type: ${(q as any).type}`,
                        );
                        return null;
                }
            })}
        </div>
    );
};

export default QuestionList;
