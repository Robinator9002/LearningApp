// src/components/admin/QuestionEditor/AlgebraEquationEditor.tsx

import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // MODIFICATION: Imported useTranslation
import type { IQuestion } from '../../../types/database';
import Button from '../../common/Button';
import Input from '../../common/Form/Input';
import Label from '../../common/Form/Label';

interface AlgebraEquationEditorProps {
    question: IQuestion;
    index: number;
    onQuestionChange: (index: number, question: IQuestion) => void;
    onRemoveQuestion: (index: number) => void;
}

/**
 * A dedicated editor component for the 'alg-equation' question type.
 */
const AlgebraEquationEditor: React.FC<AlgebraEquationEditorProps> = ({
    question,
    index,
    onQuestionChange,
    onRemoveQuestion,
}) => {
    const { t } = useTranslation(); // MODIFICATION: Initialized useTranslation

    if (question.type !== 'alg-equation') {
        return null;
    }

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onQuestionChange(index, { ...question, questionText: e.target.value });
    };

    const handleEquationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onQuestionChange(index, { ...question, equation: e.target.value });
    };

    const handleVariablesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const variables = e.target.value.split(',').map((v) => v.trim());
        onQuestionChange(index, { ...question, variables });
    };

    return (
        <div className="question-editor">
            <div className="question-editor__header">
                {/* MODIFICATION: Title is now dynamically translated. */}
                <h3 className="question-editor__title">
                    {t('editor.questionTitle', {
                        index: index + 1,
                        type: t('questionTypes.algEquation'),
                    })}
                </h3>
                {/* MODIFICATION: Replaced hardcoded button text. */}
                <Button variant="danger" onClick={() => onRemoveQuestion(index)}>
                    <X size={16} /> {t('buttons.remove')}
                </Button>
            </div>
            <div className="form-group">
                {/* MODIFICATION: Replaced hardcoded label. */}
                <Label htmlFor={`question-text-${question.id}`}>{t('labels.questionText')}</Label>
                <Input
                    id={`question-text-${question.id}`}
                    value={question.questionText}
                    onChange={handleTextChange}
                    // MODIFICATION: Replaced hardcoded placeholder.
                    placeholder={t('placeholders.algEquation.questionText')}
                />
            </div>
            <div className="form-group">
                {/* MODIFICATION: Replaced hardcoded label. */}
                <Label htmlFor={`equation-${question.id}`}>{t('labels.equation')}</Label>
                <Input
                    id={`equation-${question.id}`}
                    value={question.equation}
                    onChange={handleEquationChange}
                    // MODIFICATION: Replaced hardcoded placeholder.
                    placeholder={t('placeholders.algEquation.equation')}
                />
            </div>
            <div className="form-group">
                {/* MODIFICATION: Replaced hardcoded label. */}
                <Label htmlFor={`variables-${question.id}`}>{t('labels.variables')}</Label>
                <Input
                    id={`variables-${question.id}`}
                    value={question.variables.join(', ')}
                    onChange={handleVariablesChange}
                    // MODIFICATION: Replaced hardcoded placeholder.
                    placeholder={t('placeholders.algEquation.variables')}
                />
            </div>
        </div>
    );
};

export default AlgebraEquationEditor;
