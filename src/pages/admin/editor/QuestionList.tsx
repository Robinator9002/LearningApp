// src/pages/admin/editor/QuestionList.tsx

import React from 'react';
import type { IQuestion } from '../../../types/database';
import QuestionEditor from '../../../components/admin/QuestionEditor/MultipleChoiceEditor';
import FillInTheBlankEditor from '../../../components/admin/QuestionEditor/FillInTheBlankEditor';
import AlgebraEquationEditor from '../../../components/admin/QuestionEditor/AlgebraEquationEditor';

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
                            <QuestionEditor
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
                    default:
                        return null;
                }
            })}
        </div>
    );
};

export default QuestionList;
