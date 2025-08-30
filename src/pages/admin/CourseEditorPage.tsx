// src/pages/admin/CourseEditorPage.tsx

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { db } from '../../lib/db';
import { ModalContext } from '../../contexts/ModalContext';
import type { ICourse, IQuestion, QuestionType } from '../../types/database';

import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Form/Input/Input';
import Label from '../../components/common/Form/Label/Label';
import Select from '../../components/common/Form/Select/Select';
import QuestionEditor from '../../components/admin/QuestionEditor/QuestionEditor';

// Updated factory function to handle different question types
const createNewQuestion = (type: QuestionType = 'mcq'): IQuestion => {
    const baseQuestion = {
        id: uuidv4(),
        type: type,
        questionText: '',
    };

    if (type === 'mcq') {
        const optionIds = [uuidv4(), uuidv4(), uuidv4(), uuidv4()];
        return {
            ...baseQuestion,
            options: [
                { id: optionIds[0], text: '', isCorrect: true },
                { id: optionIds[1], text: '', isCorrect: false },
                { id: optionIds[2], text: '', isCorrect: false },
                { id: optionIds[3], text: '', isCorrect: false },
            ],
        };
    } else if (type === 'fitb') {
        return {
            ...baseQuestion,
            correctAnswer: '',
        };
    }
    // Default fallback, though should not be reached with proper UI
    return createNewQuestion('mcq');
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

    // --- Data Fetching Effect ---
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
                        console.error('Course not found!');
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

    // --- Question Management Handlers ---
    const handleAddQuestion = (type: QuestionType) => {
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

    // --- Save Handler ---
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

    if (isLoading) {
        return <div>Loading course data...</div>;
    }

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
                        placeholder="e.g., Basic Addition"
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
                    <div className="add-question-controls">
                        <Button onClick={() => handleAddQuestion('mcq')}>
                            Add Multiple Choice
                        </Button>
                        <Button onClick={() => handleAddQuestion('fitb')}>
                            Add Fill-in-the-blank
                        </Button>
                    </div>
                </div>
                {questions.map((q, index) => (
                    <QuestionEditor
                        key={q.id} // Use a stable unique key
                        index={index}
                        question={q}
                        onQuestionChange={handleQuestionChange}
                        onRemoveQuestion={handleRemoveQuestion}
                    />
                ))}
            </div>

            <footer className="course-editor-page__footer">
                <Button variant="secondary" onClick={() => navigate('/admin')}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSaveCourse}>
                    Save Course
                </Button>
            </footer>
        </div>
    );
};

export default CourseEditorPage;
