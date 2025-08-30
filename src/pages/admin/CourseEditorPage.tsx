// src/pages/admin/CourseEditorPage.tsx

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { db } from '../../lib/db';
import { ModalContext } from '../../contexts/ModalContext';
import type { ICourse, IQuestion } from '../../types/database';

import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Form/Input/Input';
import Label from '../../components/common/Form/Label/Label';
import Select from '../../components/common/Form/Select/Select';
import QuestionEditor from '../../components/admin/QuestionEditor/QuestionEditor';
import FillInTheBlankEditor from '../../components/admin/QuestionEditor/FillInTheBlankEditor';

/**
 * A helper function to create a new question object with default values.
 * It now uses the IQuestion['type'] to be robust against future changes.
 * @param type The type of question to create ('mcq' or 'fitb').
 * @returns A new IQuestion object.
 */
const createNewQuestion = (type: IQuestion['type']): IQuestion => {
    const baseQuestion = {
        id: uuidv4(),
        questionText: '',
    };

    if (type === 'mcq') {
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
    } else {
        // This handles the 'fitb' case.
        return {
            ...baseQuestion,
            type: 'fitb',
            correctAnswer: '',
        };
    }
};

const CourseEditorPage: React.FC = () => {
    const navigate = useNavigate();
    const { courseId } = useParams<{ courseId?: string }>();
    const modal = useContext(ModalContext);
    const isEditMode = Boolean(courseId);

    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState<ICourse['subject']>('Math');
    const [questions, setQuestions] = useState<IQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(isEditMode);

    if (!modal) {
        throw new Error('CourseEditorPage must be used within a ModalProvider');
    }

    useEffect(() => {
        if (isEditMode && courseId) {
            const fetchCourse = async () => {
                try {
                    const id = parseInt(courseId, 10);
                    const courseToEdit = await db.courses.get(id);
                    if (courseToEdit) {
                        setTitle(courseToEdit.title);
                        setSubject(courseToEdit.subject);
                        setQuestions(courseToEdit.questions);
                    } else {
                        // If course not found, redirect to admin dashboard
                        navigate('/admin');
                    }
                } catch (error) {
                    console.error('Failed to fetch course:', error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchCourse();
        }
    }, [courseId, isEditMode, navigate]);

    const handleAddQuestion = (type: IQuestion['type']) => {
        setQuestions([...questions, createNewQuestion(type)]);
    };

    const handleRemoveQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleQuestionChange = (index: number, updatedQuestion: IQuestion) => {
        const newQuestions = [...questions];
        newQuestions[index] = updatedQuestion;
        setQuestions(newQuestions);
    };

    const handleSaveCourse = async () => {
        if (!title.trim()) {
            modal.showAlert({ title: 'Validation Error', message: 'Please enter a course title.' });
            return;
        }

        // Validate that all questions and their fields are filled out.
        for (const q of questions) {
            if (!q.questionText.trim()) {
                modal.showAlert({
                    title: 'Validation Error',
                    message: `A question is missing its text. Please review all questions.`,
                });
                return;
            }
            if (q.type === 'mcq' && q.options.some((opt) => !opt.text.trim())) {
                modal.showAlert({
                    title: 'Validation Error',
                    message: `A multiple choice question is missing text in one of its options.`,
                });
                return;
            }
            if (q.type === 'fitb' && !q.correctAnswer.trim()) {
                modal.showAlert({
                    title: 'Validation Error',
                    message: `A fill-in-the-blank question is missing its correct answer.`,
                });
                return;
            }
        }

        const courseData: Omit<ICourse, 'id'> = { title, subject, questions };

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
                title: 'Save Error',
                message: 'There was an error saving the course.',
            });
        }
    };

    if (isLoading) return <div>Loading course data...</div>;

    return (
        <div className="course-editor-page">
            <header className="course-editor-page__header">
                <h2 className="course-editor-page__title">
                    {isEditMode ? 'Edit Course' : 'Create New Course'}
                </h2>
            </header>

            <div className="course-editor-page__meta">
                <div className="form-group">
                    <Label htmlFor="course-title">Course Title</Label>
                    <Input
                        id="course-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <Label htmlFor="course-subject">Subject</Label>
                    <Select
                        id="course-subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value as typeof subject)}
                    >
                        <option value="Math">Math</option>
                        <option value="Reading">Reading</option>
                        <option value="Writing">Writing</option>
                    </Select>
                </div>
            </div>

            <div className="course-editor-page__questions">
                <div className="course-editor-page__questions-header">
                    <h3 className="course-editor-page__questions-title">Questions</h3>
                    <div className="add-question-buttons">
                        <Button onClick={() => handleAddQuestion('mcq')}>+ Multiple Choice</Button>
                        <Button onClick={() => handleAddQuestion('fitb')}>
                            + Fill-in-the-blank
                        </Button>
                    </div>
                </div>
                {questions.map((q, index) =>
                    q.type === 'mcq' ? (
                        <QuestionEditor
                            key={q.id}
                            index={index}
                            question={q}
                            onQuestionChange={handleQuestionChange}
                            onRemoveQuestion={handleRemoveQuestion}
                        />
                    ) : (
                        <FillInTheBlankEditor
                            key={q.id}
                            index={index}
                            question={q}
                            onQuestionChange={handleQuestionChange}
                            onRemoveQuestion={handleRemoveQuestion}
                        />
                    ),
                )}
            </div>

            <footer className="course-editor-page__footer">
                <Button variant="primary" onClick={handleSaveCourse}>
                    Save Course
                </Button>
            </footer>
        </div>
    );
};

export default CourseEditorPage;
