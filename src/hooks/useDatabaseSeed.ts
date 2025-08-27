// src/hooks/useDatabaseSeed.ts
import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import { type IUser } from '../types/db';

/**
 * A custom hook to seed the database with initial data if it's empty.
 */
export const useDatabaseSeed = () => {
    const [isSeeding, setIsSeeding] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const seedDatabase = async () => {
            try {
                const userCount = await db.users.count();
                if (userCount === 0) {
                    console.log('Database is empty. Seeding initial users...');
                    const defaultUsers: IUser[] = [
                        { name: 'Admin', type: 'admin' },
                        { name: 'Bruder', type: 'learner' },
                    ];
                    await db.users.bulkAdd(defaultUsers);
                    console.log('Default users seeded successfully.');
                }
            } catch (err) {
                console.error('Failed to seed database:', err);
                setError(err instanceof Error ? err : new Error(String(err)));
            } finally {
                setIsSeeding(false);
            }
        };

        seedDatabase();
    }, []); // Empty dependency array ensures this runs only once on mount

    return { isSeeding, error };
};
