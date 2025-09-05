// src/pages/admin/CourseEditorPage.tsx

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';

import { db } from '../../lib/db.ts';
import { ModalContext } from '../../contexts/ModalContext.tsx';
import type { ICourse, IQuestion } from '../../types/database.ts';
import Button from '../../components/common/Button.tsx';

import CourseEditorHeader from './editor/CourseEditorHeader.tsx';
import CourseMetaEditor from './editor/CourseMetaEditor.tsx';
import QuestionList from './editor/QuestionList.tsx';
import AddQuestionModal from '../../components/admin/AddQuestionModal.tsx';

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
        case 'free-response':
            throw new Error("Deprecated question type: 'free-response' should not be created.");
        default:
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

    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState<ICourse['subject']>('Math');
    // MODIFICATION: Added state for the new gradeRange field
    const [gradeRange, setGradeRange] = useState('');
    const [questions, setQuestions] = useState<IQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(isEditMode);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    if (!modal) throw new Error('CourseEditorPage must be used within a ModalProvider');

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
                    // MODIFICATION: Load the gradeRange from the fetched course
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
        // MODIFICATION: Added gradeRange to the data payload
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
                message: 'Failed to save course.', // Generic save error
            });
        }
    };

    if (isLoading) return <div>{t('labels.loading')}</div>;

    return (
        <div className="course-editor-page">
            <CourseEditorHeader
                isEditMode={isEditMode}
                onOpenAddQuestionModal={() => setIsAddModalOpen(true)}
            />
            <main className="course-editor-page__content">
                {/* FIX: Correctly pass the gradeRange state and setGradeRange function as props */}
                <CourseMetaEditor
                    title={title}
                    setTitle={setTitle}
                    subject={subject}
                    setSubject={setSubject}
                    gradeRange={gradeRange}
                    setGradeRange={setGradeRange}
                />
                <QuestionList
                    questions={questions}
                    onQuestionChange={handleQuestionChange}
                    onRemoveQuestion={handleRemoveQuestion}
                />
            </main>
            <footer className="course-editor-page__footer">
                <Button variant="secondary" onClick={() => navigate(-1)}>
                    {t('buttons.discardChanges')}
                </Button>
                <Button variant="primary" onClick={handleSaveCourse}>
                    {t('buttons.saveCourse')}
                </Button>
            </footer>
            <AddQuestionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddQuestion={handleAddQuestion}
            />
        </div>
    );
};

export default CourseEditorPage;
