// src/components/admin/QuestionEditor/SentenceOrderEditor.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Plus } from 'lucide-react';
import type { IQuestionSentenceOrder } from '../../../types/database';
import Button from '../../common/Button';
import Label from '../../common/Form/Label';
import Textarea from '../../common/Form/Textarea';

interface SentenceOrderEditorProps {
    index: number;
    question: IQuestionSentenceOrder;
    onQuestionChange: (index: number, question: IQuestionSentenceOrder) => void;
    onRemoveQuestion: (index: number) => void;
}

/**
 * An editor component for the "Sentence/Paragraph Ordering" question type.
 * Allows admins to create and manage a list of text items that learners
 * will later need to arrange in the correct sequence.
 */
const SentenceOrderEditor: React.FC<SentenceOrderEditorProps> = ({
    index,
    question,
    onQuestionChange,
    onRemoveQuestion,
}) => {
    const { t } = useTranslation();

    const handleItemChange = (itemIndex: number, value: string) => {
        const newItems = [...question.items];
        newItems[itemIndex] = value;
        onQuestionChange(index, { ...question, items: newItems });
    };

    const handleAddItem = () => {
        const newItems = [...question.items, ''];
        onQuestionChange(index, { ...question, items: newItems });
    };

    const handleRemoveItem = (itemIndex: number) => {
        // Prevent removing all items, as a question must have at least one.
        if (question.items.length <= 1) return;
        const newItems = question.items.filter((_, i) => i !== itemIndex);
        onQuestionChange(index, { ...question, items: newItems });
    };

    return (
        <div className="question-editor">
            <div className="question-editor__header">
                <h4 className="question-editor__title">
                    {t('editor.questionTitle', {
                        index: index + 1,
                        type: t('questionTypes.sentenceOrder'),
                    })}
                </h4>
                <Button variant="danger" onClick={() => onRemoveQuestion(index)}>
                    <X size={16} /> {t('buttons.remove')}
                </Button>
            </div>
            <div className="form-group">
                <Label htmlFor={`q-text-${question.id}`}>{t('labels.questionText')}</Label>
                <Textarea
                    id={`q-text-${question.id}`}
                    value={question.questionText}
                    onChange={(e) =>
                        onQuestionChange(index, { ...question, questionText: e.target.value })
                    }
                    placeholder={t('placeholders.sentenceOrder.questionText')}
                    rows={2}
                />
            </div>
            <div className="form-group">
                <Label>{t('labels.sentenceOrderItems')}</Label>
                <div className="sentence-order-editor__items-list">
                    {question.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="sentence-order-editor__item">
                            <span className="sentence-order-editor__item-number">
                                {itemIndex + 1}.
                            </span>
                            <Textarea
                                value={item}
                                onChange={(e) => handleItemChange(itemIndex, e.target.value)}
                                rows={2}
                                placeholder={t('placeholders.sentenceOrder.item', {
                                    index: itemIndex + 1,
                                })}
                            />
                            <Button
                                variant="danger"
                                onClick={() => handleRemoveItem(itemIndex)}
                                disabled={question.items.length <= 1}
                            >
                                <X size={16} />
                            </Button>
                        </div>
                    ))}
                </div>
                <Button variant="secondary" onClick={handleAddItem} className="add-item-button">
                    <Plus size={16} /> {t('buttons.addItem')}
                </Button>
            </div>
        </div>
    );
};

export default SentenceOrderEditor;
