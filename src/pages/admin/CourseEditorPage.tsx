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

// Updated helper to create different question types
const createNewQuestion = (type: 'mcq' | 'fitb'): IQuestion => {
    if (type === 'mcq') {
        const optionIds = [uuidv4(), uuidv4(), uuidv4(), uuidv4()];
        return {
            id: uuidv4(),
            type: 'mcq',
            questionText: '',
            options: [
                { id: optionIds[0], text: '', isCorrect: true },
                { id: optionIds[1], text: '', isCorrect: false },
                { id: optionIds[2], text: '', isCorrect: false },
                { id: optionIds[3], text: '', isCorrect: false },
            ],
        };
    } else {
        // 'fitb'
        return {
            id: uuidv4(),
            type: 'fitb',
            questionText: '',
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

    // Handlers for adding different question types
    const handleAddQuestion = (type: 'mcq' | 'fitb') => {
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
        const courseData: Omit<ICourse, 'id'> = { title, subject, questions };
        try {
            if (isEditMode && courseId) {
                await db.courses.put({ ...courseData, id: parseInt(courseId, 10) });
            } else {
                await db.courses.add(courseData);
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
                    // Conditionally render the correct editor based on question type
                    q.type === 'mcq' ? (
                        <QuestionEditor
                            key={q.id}
                            index={index}
                            question={q}
                            onQuestionChange={handleQuestionChange}
                            onRemoveQuestion={handleRemoveQuestion}
                        />
                    ) : (
                        // This is a placeholder for the new Fill-in-the-blank editor component
                        <div key={q.id} className="question-editor">
                            <div className="question-editor__header">
                                <h3 className="question-editor__title">
                                    Question {index + 1} (Fill-in-the-blank)
                                </h3>
                                <Button onClick={() => handleRemoveQuestion(index)}>Remove</Button>
                            </div>
                            <div className="form-group">
                                <Label htmlFor={`question-text-${q.id}`}>Question Text</Label>
                                <Input
                                    id={`question-text-${q.id}`}
                                    value={q.questionText}
                                    onChange={(e) =>
                                        handleQuestionChange(index, {
                                            ...q,
                                            questionText: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="form-group">
                                <Label htmlFor={`correct-answer-${q.id}`}>Correct Answer</Label>
                                <Input
                                    id={`correct-answer-${q.id}`}
                                    value={q.correctAnswer}
                                    onChange={(e) =>
                                        handleQuestionChange(index, {
                                            ...q,
                                            correctAnswer: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    ),
                )}
            </div>

            <footer className="course-editor-page__footer">
                <Button variant="primary" onClick={handleSaveCourse}>
                    Save Changes
                </Button>
            </footer>
        </div>
    );
};

export default CourseEditorPage;
