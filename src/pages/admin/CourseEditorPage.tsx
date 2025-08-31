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
// 1. Import the new component
import AlgebraEquationEditor from '../../components/admin/QuestionEditor/AlgebraEquationEditor';

/**
 * A helper function to create a new question object with default values.
 * @param type The type of question to create.
 * @returns A new IQuestion object.
 */
const createNewQuestion = (type: IQuestion['type']): IQuestion => {
    const baseQuestion = {
        id: uuidv4(),
        questionText: '',
    };

    // 3. Update the logic to handle the new type
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
            return {
                ...baseQuestion,
                type: 'alg-equation',
                equation: '',
                variables: ['x'],
            };
        default:
            // This is a failsafe to ensure we never create an invalid question type.
            // It uses the 'never' type from TypeScript to enforce exhaustive checks.
            const exhaustiveCheck: never = type;
            throw new Error(`Unhandled question type: ${exhaustiveCheck}`);
    }
};

const CourseEditorPage: React.FC = () => {
    const navigate = useNavigate();
    const { courseId } = useParams<{ courseId?: string }>();
    const modal = useContext(ModalContext);
    const isEditMode = Boolean(courseId);

    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState<'Math' | 'Reading' | 'Writing'>('Math');
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

    // Handler for adding questions of any type
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

        // Basic validation for questions
        for (const q of questions) {
            if (!q.questionText.trim()) {
                modal.showAlert({
                    title: 'Validation Error',
                    message: 'All questions must have text.',
                });
                return;
            }
            if (q.type === 'mcq' && q.options.some((opt) => !opt.text.trim())) {
                modal.showAlert({
                    title: 'Validation Error',
                    message: 'All multiple choice options must have text.',
                });
                return;
            }
            if (q.type === 'sti' && q.correctAnswers.some((ans) => !ans.trim())) {
                modal.showAlert({
                    title: 'Validation Error',
                    message: 'All smart text input answers must have text.',
                });
                return;
            }
            if (q.type === 'alg-equation') {
                if (!q.equation.trim()) {
                    modal.showAlert({
                        title: 'Validation Error',
                        message: 'All algebraic questions must have an equation.',
                    });
                    return;
                }
                if (q.variables.length === 0 || q.variables.some((v) => !v)) {
                    modal.showAlert({
                        title: 'Validation Error',
                        message: 'All algebraic questions must have at least one valid variable.',
                    });
                    return;
                }
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
                        <Button onClick={() => handleAddQuestion('sti')}>+ Smart Text</Button>
                        {/* 2. Add the new button to the UI */}
                        <Button onClick={() => handleAddQuestion('alg-equation')}>
                            + Algebra Equation
                        </Button>
                    </div>
                </div>
                {questions.map((q, index) => {
                    // 4. Use a switch statement for clean, scalable conditional rendering
                    switch (q.type) {
                        case 'mcq':
                            return (
                                <QuestionEditor
                                    key={q.id}
                                    index={index}
                                    question={q}
                                    onQuestionChange={handleQuestionChange}
                                    onRemoveQuestion={handleRemoveQuestion}
                                />
                            );
                        case 'sti':
                            return (
                                <FillInTheBlankEditor
                                    key={q.id}
                                    index={index}
                                    question={q}
                                    onQuestionChange={handleQuestionChange}
                                    onRemoveQuestion={handleRemoveQuestion}
                                />
                            );
                        case 'alg-equation':
                            return (
                                <AlgebraEquationEditor
                                    key={q.id}
                                    index={index}
                                    question={q}
                                    onQuestionChange={handleQuestionChange}
                                    onRemoveQuestion={handleRemoveQuestion}
                                />
                            );
                        default:
                            return null;
                    }
                })}
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
