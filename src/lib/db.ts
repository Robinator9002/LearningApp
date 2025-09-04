// src/lib/db.ts

import Dexie, { type Table } from 'dexie';
// MODIFICATION: Imported the new IAppSettings type.
import type { IUser, ICourse, IProgressLog, IAppSettings } from '../types/database';

export class LocalDatabase extends Dexie {
    // These tables will hold our application data.
    // The '!' asserts that Dexie will initialize them for us.
    users!: Table<IUser>;
    courses!: Table<ICourse>;
    progressLogs!: Table<IProgressLog>;
    // NEW: Added the appSettings table.
    appSettings!: Table<IAppSettings>;

    constructor() {
        super('learningAppDatabase');
        // Bumping the version number is crucial when changing the schema.
        // Dexie uses this to manage migrations automatically.
        this.version(3).stores({
            users: '++id, &name, type',
            courses: '++id, subject, gradeRange, title',
            progressLogs: '++id, userId, courseId, timestamp',
            // NEW: Defined the schema for our new singleton settings table.
            appSettings: '++id',
        });

        // --- MIGRATION HISTORY ---
        // This is the previous version of the schema. It is kept here
        // to allow Dexie to correctly migrate from version 2 to version 3
        // for users who already have the database.
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
