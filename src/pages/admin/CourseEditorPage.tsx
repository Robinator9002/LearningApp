// src/pages/admin/CourseEditorPage.tsx

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';

import { db } from '../../lib/db.ts';
import { ModalContext } from '../../contexts/ModalContext.tsx';
import type { ICourse, IQuestion } from '../../types/database.ts';
import Button from '../../components/common/Button.tsx';

// NEW: Import the new settings panel component
import CourseSettingsPanel from './editor/Course/CourseSettingsPanel.tsx';
import QuestionList from './editor/QuestionList.tsx';
import AddQuestionModal from '../../components/admin/AddQuestionModal.tsx';

// This utility function remains unchanged.
const createNewQuestion = (type: IQuestion['type']): IQuestion => {
    const baseQuestion = { id: uuidv4(), questionText: '' };
    switch (type) {
        case 'mcq':
            const optionIds = [uuidv4(), uuidv4(), uuidv4(), uuidv4()];
            return {
                ...baseQuestion,
                type: 'mcq',
                options: [
                    { id: optionIds[0], text: '', isCorrect: true },
                    { id: optionIds[1], text: '', isCorrect: false },
                    { id: optionIds[2], text: '', isCorrect: false },
                    { id: optionIds[3], text: '', isCorrect: false },
                ],
            };
        case 'sti':
            return {
                ...baseQuestion,
                type: 'sti',
                correctAnswers: [''],
                evaluationMode: 'case-insensitive',
            };
        case 'alg-equation':
            return { ...baseQuestion, type: 'alg-equation', equation: '', variables: ['x'] };
        case 'sentence-correction':
            return {
                ...baseQuestion,
                type: 'sentence-correction',
                sentenceWithMistake: '',
                correctedSentence: '',
            };
        // This case is deprecated and should not be used.
        case 'free-response':
            throw new Error("Deprecated question type: 'free-response' should not be created.");
        default:
            // This ensures we get a compile-time error if a new question type is added
            // but not handled here, preventing runtime errors.
            const exhaustiveCheck: never = type;
            throw new Error(`Unhandled question type: ${exhaustiveCheck}`);
    }
};

const CourseEditorPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { courseId } = useParams<{ courseId?: string }>();
    const modal = useContext(ModalContext);
    const isEditMode = Boolean(courseId);

    // State management remains largely the same, but the layout will use it differently.
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState<ICourse['subject']>('math');
    const [gradeRange, setGradeRange] = useState('');
    const [questions, setQuestions] = useState<IQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(isEditMode);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    if (!modal) throw new Error('CourseEditorPage must be used within a ModalProvider');

    // Data fetching logic is unchanged.
    useEffect(() => {
        if (!isEditMode || !courseId) {
            setIsLoading(false);
            return;
        }
        const fetchCourse = async () => {
            try {
                const courseToEdit = await db.courses.get(parseInt(courseId, 10));
                if (courseToEdit) {
                    setTitle(courseToEdit.title);
                    setSubject(courseToEdit.subject);
                    setGradeRange(courseToEdit.gradeRange);
                    setQuestions(courseToEdit.questions);
                } else {
                    // If the course doesn't exist, redirect back to the admin dashboard.
                    navigate('/admin');
                }
            } catch (error) {
                console.error('Failed to fetch course:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourse();
    }, [courseId, isEditMode, navigate]);

    // Handlers for adding, updating, and removing questions remain unchanged.
    const handleAddQuestion = (type: IQuestion['type']) => {
        setQuestions((prev) => [...prev, createNewQuestion(type)]);
    };

    const handleQuestionChange = (index: number, updatedQuestion: IQuestion) => {
        setQuestions((prev) => prev.map((q, i) => (i === index ? updatedQuestion : q)));
    };

    const handleRemoveQuestion = (index: number) => {
        setQuestions((prev) => prev.filter((_, i) => i !== index));
    };

    // Save logic now includes a validation check for the title.
    const handleSaveCourse = async () => {
        if (!title.trim()) {
            return modal.showAlert({
                title: t('errors.validation.title'),
                message: t('errors.validation.nameMissing'),
            });
        }

        const courseData: Omit<ICourse, 'id'> = { title, subject, gradeRange, questions };
        try {
            if (isEditMode && courseId) {
                await db.courses.put({ ...courseData, id: parseInt(courseId, 10) });
            } else {
                await db.courses.add(courseData as ICourse);
            }
            navigate('/admin');
        } catch (error) {
            console.error('Failed to save course:', error);
            modal.showAlert({
                title: t('errors.title'),
                message: 'Failed to save course.',
            });
        }
    };

    if (isLoading) return <div>{t('labels.loading')}</div>;

    // REWORK: The entire layout has been restructured into a two-panel design.
    return (
        <div className="course-editor-layout">
            {/* The new settings panel on the left */}
            <CourseSettingsPanel
                title={title}
                setTitle={setTitle}
                subject={subject}
                setSubject={setSubject}
                gradeRange={gradeRange}
                setGradeRange={setGradeRange}
                onSave={handleSaveCourse}
            />

            {/* The main content area for questions on the right */}
            <main className="course-editor-main">
                <div className="course-editor-main__header">
                    <h2>{t('editor.questionsTitle')}</h2>
                    <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
                        {t('buttons.addQuestion')}
                    </Button>
                </div>
                <div className="course-editor-main__content">
                    <QuestionList
                        questions={questions}
                        onQuestionChange={handleQuestionChange}
                        onRemoveQuestion={handleRemoveQuestion}
                    />
                </div>
            </main>

            {/* The AddQuestionModal remains, as it's a good way to present many options. */}
            <AddQuestionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddQuestion={handleAddQuestion}
            />
        </div>
    );
};

export default CourseEditorPage;
