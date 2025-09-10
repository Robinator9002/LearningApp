// src/pages/admin/CourseEditorPage.tsx

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
// FIX: Changed the import to use a CDN URL to resolve the external dependency.
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';

import { db } from '../../lib/db.ts';
import { ModalContext } from '../../contexts/ModalContext.tsx';
import type { ICourse, IQuestion } from '../../types/database.ts';

import Button from '../../components/common/Button.tsx';
import QuestionList from './editor/QuestionList.tsx';
import AddQuestionModal from '../../components/admin/AddQuestionModal.tsx';
import CourseSettingsPanel from './editor/Course/CourseSettingsPanel.tsx';

/**
 * A factory function that generates a new question object with default values
 * based on the specified question type. This ensures data consistency.
 * @param type - The type of the question to create.
 * @returns A new IQuestion object.
 */
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
        case 'highlight-error':
            return {
                ...baseQuestion,
                type: 'highlight-error',
                sentence: '',
                correctAnswerIndices: [],
            };
        // NEW: Add the case for the 'sentence-order' type.
        // It starts with two empty items for the admin to fill in.
        case 'sentence-order':
            return {
                ...baseQuestion,
                type: 'sentence-order',
                items: ['', ''],
            };
        case 'free-response':
            throw new Error("Deprecated question type: 'free-response' should not be created.");
        default:
            // This ensures that if a new type is added to the data model but not handled
            // here, we get a clear error during development.
            const exhaustiveCheck: never = type;
            throw new Error(`Unhandled question type: ${exhaustiveCheck}`);
    }
};

/**
 * The main page component for creating and editing courses. It features a two-panel
 * layout with course settings on the left and the question list on the right.
 */
const CourseEditorPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { courseId } = useParams<{ courseId?: string }>();
    const modal = useContext(ModalContext);
    const isEditMode = Boolean(courseId);

    // --- STATE MANAGEMENT ---
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState<ICourse['subject']>('Math');
    const [gradeRange, setGradeRange] = useState('');
    const [questions, setQuestions] = useState<IQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(isEditMode);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    if (!modal) throw new Error('CourseEditorPage must be used within a ModalProvider');

    /**
     * Effect to fetch course data from the database when in edit mode.
     */
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

    // --- EVENT HANDLERS ---

    const handleAddQuestion = (type: IQuestion['type']) => {
        setQuestions((prev) => [...prev, createNewQuestion(type)]);
    };

    const handleQuestionChange = (index: number, updatedQuestion: IQuestion) => {
        setQuestions((prev) => prev.map((q, i) => (i === index ? updatedQuestion : q)));
    };

    const handleRemoveQuestion = (index: number) => {
        setQuestions((prev) => prev.filter((_, i) => i !== index));
    };

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

    return (
        <div className="course-editor-page">
            <CourseSettingsPanel
                title={title}
                setTitle={setTitle}
                subject={subject}
                setSubject={setSubject}
                gradeRange={gradeRange}
                setGradeRange={setGradeRange}
                onSave={handleSaveCourse}
            />
            <main className="course-editor-page__main-content">
                <div className="course-editor-page__questions-header">
                    <h3>{t('editor.questionsTitle')}</h3>
                    <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={16} /> {t('buttons.addQuestion')}
                    </Button>
                </div>
                <QuestionList
                    questions={questions}
                    onQuestionChange={handleQuestionChange}
                    onRemoveQuestion={handleRemoveQuestion}
                />
            </main>
            <AddQuestionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddQuestion={handleAddQuestion}
            />
        </div>
    );
};

export default CourseEditorPage;
