// src/pages/learner/CoursePlayerPage.tsx

import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';

import { db } from '../../lib/db';
import { AuthContext } from '../../contexts/AuthContext';
import type { IMCQOption, IProgressLog } from '../../types/database';

import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Form/Input/Input'; // Import Input for FITB
import QuestionDisplay from '../../components/learner/QA/QuestionDisplay';
import AnswerOption, { type AnswerStatus } from '../../components/learner/QA/AnswerOption';
import CourseSummary from '../../components/learner/Course/CourseSummary';

const CoursePlayerPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    // --- State Management ---
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    // State for MCQ answers
    const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
    // State for Fill-in-the-blank answers
    const [fitbAnswer, setFitbAnswer] = useState('');
    const [isFitbCorrect, setIsFitbCorrect] = useState<boolean | null>(null);

    const course = useLiveQuery(
        () => (courseId ? db.courses.get(parseInt(courseId, 10)) : undefined),
        [courseId],
    );

    if (!auth) throw new Error('CoursePlayerPage must be used within an AuthProvider');
    if (!course) return <div>Loading course...</div>;

    const currentQuestion = course.questions[currentQuestionIndex];
    const totalQuestions = course.questions.length;

    // --- Event Handlers ---
    const handleMcqAnswer = (option: IMCQOption) => {
        if (isAnswered) return;
        setIsAnswered(true);
        setSelectedAnswerId(option.id);
        if (option.isCorrect) {
            setScore((prev) => prev + 1);
        }
    };

    const handleFitbSubmit = () => {
        if (isAnswered || !currentQuestion.correctAnswer) return;
        setIsAnswered(true);
        const isCorrect =
            fitbAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();
        setIsFitbCorrect(isCorrect);
        if (isCorrect) {
            setScore((prev) => prev + 1);
        }
    };

    const handleNextQuestion = async () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            // Reset state for the next question
            setCurrentQuestionIndex((prev) => prev + 1);
            setIsAnswered(false);
            setSelectedAnswerId(null);
            setFitbAnswer('');
            setIsFitbCorrect(null);
        } else {
            // Log progress and finish
            const { currentUser } = auth;
            if (currentUser?.id && course.id) {
                const newLog: IProgressLog = {
                    userId: currentUser.id,
                    courseId: course.id,
                    score,
                    totalQuestions,
                    timestamp: new Date(),
                };
                try {
                    await db.progressLogs.add(newLog);
                } catch (error) {
                    console.error('Failed to log progress:', error);
                }
            }
            setIsFinished(true);
        }
    };

    // --- Render Logic ---
    const getMcqStatus = (option: IMCQOption): AnswerStatus => {
        if (!isAnswered) return 'default';
        if (option.isCorrect) return 'correct';
        if (selectedAnswerId === option.id) return 'incorrect';
        return 'default';
    };

    const getFitbInputClass = () => {
        if (!isAnswered) return '';
        return isFitbCorrect ? 'form-input--correct' : 'form-input--incorrect';
    };

    if (isFinished) {
        return <CourseSummary score={score} totalQuestions={totalQuestions} />;
    }

    return (
        <div className="course-player">
            <header className="course-player__header">
                <h2 className="course-player__title">{course.title}</h2>
                <div className="course-player__progress">
                    Question {currentQuestionIndex + 1} / {totalQuestions}
                </div>
            </header>

            <div className="course-player__content">
                <QuestionDisplay text={currentQuestion.questionText} />

                {/* CONDITIONAL RENDERING FOR QUESTION TYPE */}
                {currentQuestion.type === 'mcq' && (
                    <div className="answer-options-list">
                        {currentQuestion.options?.map((option: any) => (
                            <AnswerOption
                                key={option.id}
                                text={option.text}
                                status={getMcqStatus(option)}
                                onClick={() => handleMcqAnswer(option)}
                                disabled={isAnswered}
                            />
                        ))}
                    </div>
                )}

                {currentQuestion.type === 'fitb' && (
                    <div className="fitb-container">
                        <Input
                            className={getFitbInputClass()}
                            value={fitbAnswer}
                            onChange={(e) => setFitbAnswer(e.target.value)}
                            disabled={isAnswered}
                            placeholder="Type your answer here"
                            onKeyDown={(e) =>
                                e.key === 'Enter' && !isAnswered && handleFitbSubmit()
                            }
                        />
                        {!isAnswered && (
                            <Button onClick={handleFitbSubmit} disabled={!fitbAnswer.trim()}>
                                Submit
                            </Button>
                        )}
                        {isAnswered && !isFitbCorrect && (
                            <p className="fitb-correct-answer">
                                Correct Answer: {currentQuestion.correctAnswer}
                            </p>
                        )}
                    </div>
                )}
            </div>

            <footer className="course-player__footer">
                <Button onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={16} style={{ marginRight: '8px' }} />
                    Exit Course
                </Button>
                {isAnswered && (
                    <Button variant="primary" onClick={handleNextQuestion}>
                        {currentQuestionIndex < totalQuestions - 1 ? 'Next' : 'Finish'}
                    </Button>
                )}
            </footer>
        </div>
    );
};

export default CoursePlayerPage;
