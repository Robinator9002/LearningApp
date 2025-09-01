// src/components/settings/AppearanceSection.tsx

import React from 'react';
import { useTheme, type Theme, type Accent } from '../../contexts/ThemeContext';
import Button from '../common/Button/Button';
import Label from '../common/Form/Label';

/**
 * A helper component to render a group of options for a specific theme setting.
 * It highlights the currently active option.
 */
const SettingsOptionGroup = <T extends string>({
    label,
    options,
    currentValue,
    setter,
}: {
    label: string;
    options: readonly T[];
    currentValue: T;
    setter: (value: T) => void;
}) => (
    <div className="settings-option-group">
        <Label>{label}</Label>
        <div className="settings-option-group__buttons">
            {options.map((option) => (
                <Button
                    key={option}
                    // Conditionally apply the 'primary' variant to the active button
                    variant={currentValue === option ? 'primary' : undefined}
                    onClick={() => setter(option)}
                    // Add a basic style for non-primary buttons for clarity
                    style={{ textTransform: 'capitalize' }}
                >
                    {option}
                </Button>
            ))}
        </div>
    </div>
);

/**
 * AppearanceSection provides UI controls for customizing the application's theme.
 * It consumes the ThemeContext to read and update visual settings like
 * theme (light/dark) and accent color.
 */
const AppearanceSection: React.FC = () => {
    // Consume the full theme context, including state and setters
    const { theme, setTheme, accent, setAccent } = useTheme();

    // Define the available options for each setting
    const themeOptions: readonly Theme[] = ['light', 'dark'];
    const accentOptions: readonly Accent[] = ['blue', 'purple', 'green'];

    return (
        <section className="settings-section">
            <h3 className="settings-section__title">Appearance</h3>
            <div className="settings-section__content">
                <SettingsOptionGroup
                    label="Theme"
                    options={themeOptions}
                    currentValue={theme}
                    setter={setTheme}
                />
                <SettingsOptionGroup
                    label="Accent Color"
                    options={accentOptions}
                    currentValue={accent}
                    setter={setAccent}
                />
            </div>
        </section>
    );
};

export default AppearanceSection;
