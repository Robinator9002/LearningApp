// src/components/admin/CourseImport.tsx

import React, { useRef, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload } from 'lucide-react';

// --- UTILITIES ---
import { importCourseFromJson } from '../../../lib/courseUtils.ts';

// --- CONTEXTS ---
import { ModalContext } from '../../../contexts/ModalContext.tsx';

// --- COMPONENTS ---
import Button from '../../common/Button.tsx';

/**
 * A dedicated component for handling the course import functionality.
 * It encapsulates the file input logic and interaction with the ModalContext.
 */
const CourseImport: React.FC = () => {
    const { t } = useTranslation();
    const modal = useContext(ModalContext);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!modal) {
        throw new Error('CourseImport must be used within a ModalProvider');
    }

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            await importCourseFromJson(file);
            modal.showAlert({
                title: t('success.title'),
                message: t('success.importSuccess', { title: file.name.replace('.json', '') }),
            });
        } catch (error) {
            console.error('Import failed:', error);
            modal.showAlert({
                title: t('errors.title'),
                message: t('errors.importFailed'),
            });
        }

        // Reset the file input so the user can import the same file again if needed
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".json,application/json"
                style={{ display: 'none' }}
            />
            <Button variant="secondary" onClick={handleImportClick}>
                <Upload size={16} /> {t('buttons.importCourse')}
            </Button>
        </>
    );
};

export default CourseImport;
