// src/lib/courseUtils.ts

import { db } from './db';
import type { ICourse } from '../types/database';

/**
 * Validates the structure and content of a parsed JSON object to ensure
 * it conforms to the ICourse interface. This is a critical security and
 * data integrity measure before attempting to import a course.
 *
 * @param data The unknown data object parsed from JSON.
 * @returns A tuple where the first element is a boolean indicating validity,
 * and the second is an error message if invalid.
 */
const validateCourseData = (data: unknown): [boolean, string] => {
    // My foresight tells me that if a user *can* upload a file, they will
    // eventually upload the wrong file. We must be skeptical and validate everything.
    if (typeof data !== 'object' || data === null) {
        return [false, 'Imported data is not a valid object.'];
    }

    const course = data as Partial<ICourse>;

    // 1. Check for the existence and correct type of 'title' and 'subject'.
    if (typeof course.title !== 'string' || !course.title.trim()) {
        return [false, 'Course must have a non-empty title.'];
    }
    const validSubjects: ICourse['subject'][] = ['Math', 'Reading', 'Writing', 'English'];
    if (typeof course.subject !== 'string' || !validSubjects.includes(course.subject)) {
        return [false, `Course subject must be one of: ${validSubjects.join(', ')}.`];
    }

    // 2. Check that 'questions' is a valid array.
    if (!Array.isArray(course.questions)) {
        return [false, 'Course must have a valid array of questions.'];
    }

    // 3. (Optional but recommended) A deep validation of each question object
    // could be implemented here for maximum security, checking question types,
    // options, correct answers, etc. For now, we trust the structure within the array.

    return [true, '']; // If all checks pass, the data is valid.
};

/**
 * Exports a given course object to a JSON file and triggers a download in the browser.
 *
 * @param course The course object to be exported.
 */
export const exportCourseToJson = (course: ICourse) => {
    // We remove the database-specific 'id' before exporting. This makes the file
    // more portable and prevents potential ID conflicts on import.
    const { id, ...exportableCourse } = course;
    const jsonString = JSON.stringify(exportableCourse, null, 2); // Pretty-print the JSON
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Sanitize the course title to create a safe filename.
    const fileName = `${course.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.json`;

    // Create a temporary link element to trigger the download.
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Imports a course from a user-selected JSON file, validates it, and adds it to the database.
 *
 * @returns A promise that resolves to a success message or rejects with an error message.
 */
export const importCourseFromJson = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        // Create a hidden file input element.
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';

        input.onchange = (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (!file) {
                return reject('No file selected.');
            }

            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const content = e.target?.result;
                    if (typeof content !== 'string') {
                        throw new Error('File content could not be read as text.');
                    }
                    const parsedData = JSON.parse(content);

                    // CRITICAL: Validate the data before proceeding.
                    const [isValid, errorMessage] = validateCourseData(parsedData);
                    if (!isValid) {
                        throw new Error(`Invalid course file: ${errorMessage}`);
                    }

                    // If valid, add the new course to the database.
                    // Dexie will automatically assign a new auto-incrementing ID.
                    await db.courses.add(parsedData as Omit<ICourse, 'id'>);
                    resolve(`Course "${parsedData.title}" imported successfully!`);
                } catch (error) {
                    console.error('Import failed:', error);
                    const message =
                        error instanceof Error ? error.message : 'An unknown error occurred.';
                    reject(`Failed to import course. ${message}`);
                }
            };
            reader.onerror = () => reject('Error reading the file.');
            reader.readAsText(file);
        };

        input.click(); // Programmatically open the file dialog.
    });
};
