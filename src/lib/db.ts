import Dexie, { type Table } from 'dexie';

// We will define these interfaces in the /types folder later
// import { IUser, ICourse, IProgressLog } from '../types';

export class LocalDatabase extends Dexie {
  // These tables will hold our application data.
  // The '!' asserts that Dexie will initialize them for us.
  users!: Table<any>; // Replace 'any' with IUser
  courses!: Table<any>; // Replace 'any' with ICourse
  progressLogs!: Table<any>; // Replace 'any' with IProgressLog

  constructor() {
    super('learningAppDatabase'); // The name of our database
    this.version(1).stores({
      // Schema definition. '++id' creates an auto-incrementing primary key.
      // '&name' creates a unique index on the 'name' property for users.
      users: '++id, &name, type',
      courses: '++id, subject, title',
      progressLogs: '++id, userId, courseId, timestamp',
    });
  }
}

// Create a singleton instance of the database to be used throughout the app.
export const db = new LocalDatabase();
