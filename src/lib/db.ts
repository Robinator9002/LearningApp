// src/lib/db.ts

import Dexie, { type Table } from 'dexie';
import type {
    IUser,
    ICourse,
    IProgressLog,
    IAppSettings,
    IUserTracking, // MODIFICATION: Import the new tracking type
} from '../types/database';

export class LocalDatabase extends Dexie {
    users!: Table<IUser>;
    courses!: Table<ICourse>;
    progressLogs!: Table<IProgressLog>;
    appSettings!: Table<IAppSettings>;
    userTracking!: Table<IUserTracking>; // MODIFICATION: Added the new table definition

    constructor() {
        super('learningAppDatabase');

        // MODIFICATION: Bumped version to 7 for the new userTracking table.
        this.version(7).stores({
            users: '++id, &name, type',
            courses: '++id, subject, gradeRange, title',
            progressLogs: '++id, userId, courseId, timestamp',
            appSettings: '++id',
            // NEW TABLE: Stores detailed analytics for each learner.
            // We'll query this table by the userId, which should be unique.
            userTracking: '++id, &userId',
        });

        // --- MIGRATION HISTORY ---
        this.version(6).stores({
            users: '++id, &name, type',
            courses: '++id, subject, gradeRange, title',
            progressLogs: '++id, userId, courseId, timestamp',
            appSettings: '++id',
        });
        // Previous migration steps remain for users on older versions...
        this.version(5).stores({
            users: '++id, &name, type',
            courses: '++id, subject, gradeRange, title',
            progressLogs: '++id, userId, courseId, timestamp',
            appSettings: '++id, starterCoursesImported',
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
