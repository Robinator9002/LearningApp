// src/lib/db.ts

import Dexie, { type Table } from 'dexie';
import type { IUser, ICourse, IProgressLog, IAppSettings } from '../types/database';

export class LocalDatabase extends Dexie {
    users!: Table<IUser>;
    courses!: Table<ICourse>;
    progressLogs!: Table<IProgressLog>;
    appSettings!: Table<IAppSettings>;

    constructor() {
        super('learningAppDatabase');
        // MODIFICATION: Bumped version to 6 for the subject name migration.
        this.version(6)
            .stores({
                // Schema is unchanged, only data is being modified.
                users: '++id, &name, type',
                courses: '++id, subject, gradeRange, title',
                progressLogs: '++id, userId, courseId, timestamp',
                appSettings: '++id',
            })
            .upgrade((tx) => {
                // This upgrade function will run for any user who has a database version < 6.
                // It ensures that all existing course subjects are converted to lowercase.
                return tx
                    .table('courses')
                    .toCollection()
                    .modify((course) => {
                        course.subject = course.subject.toLowerCase();
                    });
            });

        // --- MIGRATION HISTORY ---
        this.version(5).stores({
            users: '++id, &name, type',
            courses: '++id, subject, gradeRange, title',
            progressLogs: '++id, userId, courseId, timestamp',
            appSettings: '++id, starterCoursesImported', // Technically this was added in v5 logic, schema helps Dexie
        });

        this.version(4).stores({
            users: '++id, &name, type',
            courses: '++id, subject, gradeRange, title',
            progressLogs: '++id, userId, courseId, timestamp',
            appSettings: '++id',
        });

        this.version(3).stores({
            users: '++id, &name, type',
            courses: '++id, subject, gradeRange, title',
            progressLogs: '++id, userId, courseId, timestamp',
            appSettings: '++id',
        });

        this.version(2).stores({
            users: '++id, &name, type',
            courses: '++id, subject, gradeRange, title',
            progressLogs: '++id, userId, courseId, timestamp',
        });

        this.version(1).stores({
            users: '++id, &name, type',
            courses: '++id, subject, title',
            progressLogs: '++id, userId, courseId, timestamp',
        });
    }
}

export const db = new LocalDatabase();
