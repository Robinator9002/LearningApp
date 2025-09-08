// src/pages/user/FirstAdminSetup.tsx

import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';

import { db } from '../../lib/db';
import { seedInitialCourses } from '../../utils/courseUtils';
import { AuthContext } from '../../contexts/AuthContext';
import { ModalContext } from '../../contexts/ModalContext';

import type { IUser, IAppSettings } from '../../types/database';

import Button from '../../components/common/Button';
import Input from '../../components/common/Form/Input';
import Label from '../../components/common/Form/Label';
import Select from '../../components/common/Form/Select';

// FIX: Removed the i18n prop as it was causing issues and is not the standard way to access the instance.
// interface FirstAdminSetupProps {
//     i18n: typeof i18n;
// }

const FirstAdminSetup: React.FC = () => {
    // FIX: Get the i18n instance directly from the hook, which is the correct and stable method.
    const { t, i18n } = useTranslation();
    const auth = useContext(AuthContext);
    const modal = useContext(ModalContext);

    const [adminName, setAdminName] = useState('');
    const [password, setPassword] = useState('');
    const [adminLanguage, setAdminLanguage] = useState<'en' | 'de'>('en');
    const [appLanguage, setAppLanguage] = useState<'en' | 'de'>('en');
    const [shouldSeedCourses, setShouldSeedCourses] = useState(true);
    const [isComplete, setIsComplete] = useState(false);

    if (!auth || !modal) throw new Error('Contexts not available');
    const { createUser, updateAppSettings, login } = auth;

    const handleSetup = async () => {
        if (!adminName.trim()) {
            return modal.showAlert({
                title: t('errors.validation.title'),
                message: t('errors.validation.nameMissing'),
            });
        }

        try {
            const newAdmin: Omit<IUser, 'id'> = {
                name: adminName.trim(),
                type: 'admin',
                language: adminLanguage,
                ...(password && { password }),
            };
            await createUser(newAdmin);

            const appSettingsUpdate: Partial<IAppSettings> = {
                defaultLanguage: appLanguage,
                seedCoursesOnFirstRun: shouldSeedCourses,
            };
            await updateAppSettings(appSettingsUpdate);

            if (shouldSeedCourses) {
                await seedInitialCourses(appLanguage);
                await updateAppSettings({ starterCoursesImported: true });
            }

            // The language change is now awaited properly because we get i18n from the hook.
            await i18n.changeLanguage(appLanguage);
            setIsComplete(true);

            setTimeout(async () => {
                const createdUser = await db.users.where('name').equals(adminName.trim()).first();
                if (createdUser) {
                    login(createdUser);
                }
            }, 2000);
        } catch (error) {
            console.error('First admin setup failed:', error);
            modal.showAlert({ title: t('errors.title'), message: t('errors.setupFailed') });
        }
    };

    if (isComplete) {
        return (
            <div className="first-run-success">
                <CheckCircle className="first-run-success__icon" size={64} />
                <h3 className="first-run-success__title">{t('setup.successTitle')}</h3>
                <p className="first-run-success__message">{t('setup.successMessage')}</p>
            </div>
        );
    }

    return (
        <div className="first-run-form">
            <div className="form-group">
                <Label htmlFor="admin-name">{t('setup.adminNameLabel')}</Label>
                <Input
                    id="admin-name"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                />
            </div>
            <div className="form-group">
                <Label htmlFor="admin-password">{t('labels.passwordOptional')}</Label>
                <Input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <div className="form-group">
                <Label htmlFor="admin-language">{t('setup.yourLanguageLabel')}</Label>
                <Select
                    id="admin-language"
                    value={adminLanguage}
                    onChange={(e) => setAdminLanguage(e.target.value as 'en' | 'de')}
                >
                    <option value="en">{t('languages.en')}</option>
                    <option value="de">{t('languages.de')}</option>
                </Select>
            </div>
            <hr className="form-divider" />
            <div className="form-group">
                <Label htmlFor="app-language">{t('setup.defaultLanguageLabel')}</Label>
                <Select
                    id="app-language"
                    value={appLanguage}
                    onChange={(e) => setAppLanguage(e.target.value as 'en' | 'de')}
                >
                    <option value="en">{t('languages.en')}</option>
                    <option value="de">{t('languages.de')}</option>
                </Select>
                <p className="form-hint">{t('setup.defaultLanguageDescription')}</p>
            </div>
            <div className="form-group form-group--checkbox">
                <input
                    id="seed-courses"
                    type="checkbox"
                    checked={shouldSeedCourses}
                    onChange={(e) => setShouldSeedCourses(e.target.checked)}
                    className="form-checkbox"
                />
                <Label htmlFor="seed-courses" className="form-checkbox-label">
                    {t('setup.seedCoursesLabel')}
                </Label>
            </div>
            <p className="form-hint">{t('setup.seedCoursesDescription')}</p>

            <div className="modal-footer">
                <Button variant="primary" size="large" onClick={handleSetup}>
                    {t('buttons.completeSetup')}
                </Button>
            </div>
        </div>
    );
};

export default FirstAdminSetup;
