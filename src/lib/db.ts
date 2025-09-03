// src/lib/db.ts

import Dexie, { type Table } from 'dexie';
import type { IUser, ICourse, IProgressLog } from '../types/database';

export class LocalDatabase extends Dexie {
    // These tables will hold our application data.
    // The '!' asserts that Dexie will initialize them for us.
    users!: Table<IUser>;
    courses!: Table<ICourse>;
    progressLogs!: Table<IProgressLog>;

    constructor() {
        super('learningAppDatabase');
        // Bumping the version number is crucial when changing the schema.
        // Dexie uses this to manage migrations automatically.
        this.version(2).stores({
            users: '++id, &name, type',
            // MODIFICATION: Added 'gradeRange' to the index.
            // This allows for efficient querying of courses by their grade level.
            courses: '++id, subject, gradeRange, title',
            progressLogs: '++id, userId, courseId, timestamp',
        });

        // This is the previous version of the schema. It is kept here
        // to allow Dexie to correctly migrate from version 1 to version 2
        // for users who already have the database.
        this.version(1).stores({
            users: '++id, &name, type',
            courses: '++id, subject, title',
            progressLogs: '++id, userId, courseId, timestamp',
        });
    }
}

// Create a singleton instance of the database to be used throughout the app.
export const db = new LocalDatabase();
