import React from 'react';
import type {
    IQuestion,
    IQuestionMCQ,
    IQuestionSTI,
    IQuestionAlgEquation,
    IQuestionSentenceCorrection,
    IQuestionHighlightError,
    IQuestionSentenceOrder,
} from '../../../types/database';

// --- Component Imports ---
import MultipleChoiceEditor from '../../../components/admin/QuestionEditor/MultipleChoiceEditor';
import FillInTheBlankEditor from '../../../components/admin/QuestionEditor/FillInTheBlankEditor';
import AlgebraEquationEditor from '../../../components/admin/QuestionEditor/AlgebraEquationEditor';
import SentenceCorrectionEditor from '../../../components/admin/QuestionEditor/SentenceCorrectionEditor';
import HighlightTheErrorEditor from '../../../components/admin/QuestionEditor/HighlightTheErrorEditor';
import SentenceOrderEditor from '../../../components/admin/QuestionEditor/SentenceOrderEditor';

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
                switch (q.type) {
                    case 'mcq':
                        return (
                            <MultipleChoiceEditor
                                key={q.id}
                                index={index}
                                question={q as IQuestionMCQ}
                                onQuestionChange={onQuestionChange}
                                onRemoveQuestion={onRemoveQuestion}
                            />
                        );
                    case 'sti':
                        return (
                            <FillInTheBlankEditor
                                key={q.id}
                                index={index}
                                question={q as IQuestionSTI}
                                onQuestionChange={onQuestionChange}
                                onRemoveQuestion={onRemoveQuestion}
                            />
                        );
                    case 'alg-equation':
                        return (
                            <AlgebraEquationEditor
                                key={q.id}
                                index={index}
                                question={q as IQuestionAlgEquation}
                                onQuestionChange={onQuestionChange}
                                onRemoveQuestion={onRemoveQuestion}
                            />
                        );
                    case 'sentence-correction':
                        return (
                            <SentenceCorrectionEditor
                                key={q.id}
                                index={index}
                                question={q as IQuestionSentenceCorrection}
                                onQuestionChange={onQuestionChange}
                                onRemoveQuestion={onRemoveQuestion}
                            />
                        );
                    case 'highlight-error':
                        return (
                            <HighlightTheErrorEditor
                                key={q.id}
                                index={index}
                                question={q as IQuestionHighlightError}
                                onQuestionChange={onQuestionChange}
                                onRemoveQuestion={onRemoveQuestion}
                            />
                        );
                    case 'sentence-order':
                        return (
                            <SentenceOrderEditor
                                key={q.id}
                                index={index}
                                question={q as IQuestionSentenceOrder}
                                onQuestionChange={onQuestionChange}
                                onRemoveQuestion={onRemoveQuestion}
                            />
                        );
                    default:
                        console.warn(`No editor component for type: ${(q as any).type}`);
                        return null;
                }
            })}
        </div>
    );
};

export default QuestionList;
