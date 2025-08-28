// src/pages/admin/CourseEditorPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'; // We'll need to install this library

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
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState<'Math' | 'Reading' | 'Writing'>('Math');
    const [questions, setQuestions] = useState<IQuestion[]>([]);

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

        const newCourse: ICourse = { title, subject, questions };

        try {
            await db.courses.add(newCourse);
            console.log('Course saved successfully!');
            navigate('/admin');
        } catch (error) {
            console.error('Failed to save course:', error);
            alert('There was an error saving the course.');
        }
    };

    return (
        <div className="course-editor-page">
            <header className="course-editor-page__header">
                <h2 className="course-editor-page__title">Create New Course</h2>
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
                {questions.map((q: any, index: any) => (
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
                    Save Course
                </Button>
            </footer>
        </div>
    );
};

export default CourseEditorPage;
