// src/pages/admin/CourseEditorPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { db } from '../../lib/db';
import type { ICourse, IQuestion } from '../../types/database';

import Button from '../../components/common/Button/Button';
import Input from '../../components/common/forms/Input/Input';
import Label from '../../components/common/forms/Label/Label';
import Select from '../../components/common/forms/Select/Select';
import QuestionEditor from '../../components/admin/QuestionEditor/QuestionEditor';

const createNewQuestion = (): IQuestion => {
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
};

const CourseEditorPage: React.FC = () => {
    const navigate = useNavigate();
    const { courseId } = useParams<{ courseId?: string }>();
    const isEditMode = Boolean(courseId);

    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState<'Math' | 'Reading' | 'Writing'>('Math');
    const [questions, setQuestions] = useState<IQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(isEditMode); // Only load if in edit mode

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
                        navigate('/admin'); // Redirect if course doesn't exist
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

    const handleAddQuestion = () => {
        setQuestions([...questions, createNewQuestion()]);
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
            alert('Please enter a course title.');
            return;
        }

        const courseData: ICourse = { title, subject, questions };

        try {
            if (isEditMode && courseId) {
                // Update existing course
                await db.courses.put({ ...courseData, id: parseInt(courseId, 10) });
                console.log('Course updated successfully!');
            } else {
                // Add new course
                await db.courses.add(courseData);
                console.log('Course saved successfully!');
            }
            navigate('/admin');
        } catch (error) {
            console.error('Failed to save course:', error);
            alert('There was an error saving the course.');
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
                    <Button onClick={handleAddQuestion}>Add Question</Button>
                </div>
                {questions.map((q, index) => (
                    <QuestionEditor
                        key={q.id}
                        index={index}
                        question={q}
                        onQuestionChange={handleQuestionChange}
                        onRemoveQuestion={handleRemoveQuestion}
                    />
                ))}
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
