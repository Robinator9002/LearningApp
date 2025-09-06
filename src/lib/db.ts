// src/lib/db.ts

import Dexie, { type Table } from 'dexie';
import type { IUser, ICourse, IProgressLog, IAppSettings } from '../types/database';

export class LocalDatabase extends Dexie {
    // These tables will hold our application data.
    // The '!' asserts that Dexie will initialize them for us.
    users!: Table<IUser>;
    courses!: Table<ICourse>;
    progressLogs!: Table<IProgressLog>;
    appSettings!: Table<IAppSettings>;

    constructor() {
        super('learningAppDatabase');
        // Bumping the version number is crucial when changing the schema.
        // Dexie uses this to manage migrations automatically.
        // NEW: Version 5 adds the starterCoursesImported flag.
        this.version(5).stores({
            users: '++id, &name, type',
            courses: '++id, subject, gradeRange, title',
            progressLogs: '++id, userId, courseId, timestamp',
            appSettings: '++id', // No schema change needed here, Dexie handles adding new properties
        });

        // --- MIGRATION HISTORY ---
        // Previous versions are kept to allow Dexie to correctly migrate
        // users who have older database versions.

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

// Create a singleton instance of the database to be used throughout the app.
export const db = new LocalDatabase();
