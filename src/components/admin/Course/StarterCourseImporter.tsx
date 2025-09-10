// src/components/admin/Course/StarterCourseImporter.tsx

import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

// --- CONTEXTS ---
import { AuthContext } from '../../../contexts/AuthContext.tsx';
import { ModalContext } from '../../../contexts/ModalContext.tsx';

// --- UTILITIES ---
import { seedInitialCourses } from '../../../utils/courseUtils.ts';

// --- COMPONENTS ---
import Button from '../../common/Button.tsx';

/**
 * A dedicated component for admins to import the starter course pack.
 * It disables itself and shows a message if the courses have already been imported.
 */
const StarterCourseImporter: React.FC = () => {
    // --- HOOKS & CONTEXTS ---
    const { t } = useTranslation();
    const auth = useContext(AuthContext);
    const modal = useContext(ModalContext);

    // --- GUARDS ---
    // This component relies heavily on context, so we must ensure they are available.
    if (!auth || !modal) {
        throw new Error('StarterCourseImporter must be used within all required providers.');
    }
    const { appSettings, updateAppSettings } = auth;

    // Determine if the import has already been done.
    const hasBeenImported = appSettings?.starterCoursesImported || false;

    // --- EVENT HANDLERS ---

    /**
     * Handles the click event to seed the courses.
     * It uses the app's default language and updates the settings flag on success.
     */
    const handleImport = async () => {
        const language = appSettings?.defaultLanguage || 'en';
        try {
            await seedInitialCourses(language);
            // On successful import, permanently set the flag to true.
            await updateAppSettings({ starterCoursesImported: true });
            modal.showAlert({
                title: t('success.title'),
                message: t('success.starterCoursesImported'),
            });
        } catch (error) {
            console.error('Failed to seed starter courses:', error);
            modal.showAlert({
                title: t('errors.title'),
                message: t('errors.importFailed'), // A generic import error message
            });
        }
    };

    // --- RENDER ---
    return (
        <div className="starter-course-importer">
            <Button variant="secondary" onClick={handleImport} disabled={hasBeenImported}>
                {t('buttons.importStarter')}
            </Button>
        </div>
    );
};

export default StarterCourseImporter;
