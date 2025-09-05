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
        // Bumping the version number is crucial when changing the schema.
        // Dexie uses this to manage migrations automatically.
        // NOTE: We do not need to redefine the schema here, as we are only
        // adding a new, optional property to an existing table. Dexie handles this.
        this.version(4).stores({
            users: '++id, &name, type, language', // Added 'language' for indexing
            courses: '++id, subject, gradeRange, title',
            progressLogs: '++id, userId, courseId, timestamp',
            appSettings: '++id',
        });

        // --- MIGRATION HISTORY ---
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
