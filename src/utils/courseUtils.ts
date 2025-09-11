// src/utils/courseUtils.ts

import { db } from '../lib/db.ts';
import type { ICourse } from '../types/database.ts';

// --- TYPE DEFINITIONS ---

/**
 * Defines the structured, nested object that our grouping function will produce.
 * e.g., { "Math": { "2-4": [course1, course2] } }
 */
export type GroupedCourses = Record<string, Record<string, ICourse[]>>;

// --- NEW: COURSE SEEDING UTILITY ---

/**
 * Dynamically imports and seeds the starter courses for a given language.
 * This function is designed to be called during the initial application setup.
 * @param language - The language ('en' or 'de') of the starter courses to import.
 */
export async function seedInitialCourses(language: 'en' | 'de'): Promise<void> {
    try {
        // Use dynamic import() to load the correct JSON file based on the language.
        const courseModule =
            language === 'de'
                ? await import('../data/starter-courses_de.json')
                : await import('../data/starter-courses_en.json');

        // The default export of the JSON module is the array of courses.
        const starterCourses = courseModule.default;

        // Type assertion to ensure data integrity before adding to the database.
        const validCourses = starterCourses as Omit<ICourse, 'id'>[];

        // Use Dexie's bulkAdd for efficient batch insertion.
        await db.courses.bulkAdd(validCourses as ICourse[]);
    } catch (error) {
        console.error(`Failed to seed initial courses for language "${language}":`, error);
        // Re-throw the error to be handled by the calling function (e.g., in a modal).
        throw new Error('Could not load starter courses.');
    }
}

// --- IMPORT / EXPORT UTILITIES ---

/**
 * Validates that an imported object conforms to the ICourse interface.
 * This is a critical security and data integrity measure.
 * @param data - The unknown object to validate.
 * @returns True if the data is a valid ICourse, false otherwise.
 */
const validateCourseData = (data: any): data is Omit<ICourse, 'id'> => {
    if (typeof data !== 'object' || data === null) return false;
    if (typeof data.title !== 'string' || !data.title) return false;
    if (!['Math', 'Reading', 'Writing', 'English'].includes(data.subject)) return false;
    if (!['2-4', '6-8'].includes(data.gradeRange)) return false; // Added gradeRange validation
    if (!Array.isArray(data.questions)) return false;
    // We could add deeper validation for each question here if needed.
    return true;
};

/**
 * Takes a course object, converts it to JSON, and triggers a download.
 * @param course - The course object to export.
 */
export const exportCourseToJson = (course: ICourse): void => {
    // Create a clean version of the course, removing the database ID.
    const exportData = {
        ...course,
        id: undefined,
    };
    delete exportData.id;

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Create a clean filename from the course title.
    a.download = `${course.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/**
 * Reads a user-provided JSON file, validates its structure, and adds it to the database.
 * @param file - The JSON file to import.
 * @returns A promise that resolves when the course is successfully imported.
 * @throws An error if the file is invalid or the import fails.
 */
export const importCourseFromJson = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const content = event.target?.result;
                if (typeof content !== 'string') {
                    return reject(new Error('File content is not valid text.'));
                }
                const data = JSON.parse(content);

                // CRITICAL: Validate the data before adding it to the database.
                if (!validateCourseData(data)) {
                    return reject(new Error('Invalid course file format.'));
                }

                // The data is valid, so we can add it.
                await db.courses.add(data as ICourse);
                resolve();
            } catch (error) {
                console.error('Import failed:', error);
                reject(new Error('Failed to parse or import the JSON file.'));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read the file.'));
        reader.readAsText(file);
    });
};

// --- COURSE ORGANIZATION UTILITIES ---

/**
 * Takes a flat array of courses and groups them into a nested object
 * organized by subject, then by grade range.
 * @param courses - The array of course objects from the database.
 * @returns A GroupedCourses object.
 */
export const groupCourses = (courses: ICourse[]): GroupedCourses => {
    // We use the reduce function to transform the array into an object.
    return courses.reduce((acc, course) => {
        const { subject, gradeRange } = course;

        // If the subject key (e.g., "Math") doesn't exist yet, create it.
        if (!acc[subject]) {
            acc[subject] = {};
        }

        // If the gradeRange key (e.g., "2-4") doesn't exist for this subject, create it.
        if (!acc[subject][gradeRange]) {
            acc[subject][gradeRange] = [];
        }

        // Push the current course into the correct nested array.
        acc[subject][gradeRange].push(course);

        return acc;
    }, {} as GroupedCourses); // Start with an empty object of the correct type.
};
