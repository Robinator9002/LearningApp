// src/pages/admin/editor/GradeAssignmentEditor.tsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// FIX: Corrected import paths for the new file location.
import Label from '../../../components/common/Form/Label.tsx';
import Select from '../../../components/common/Form/Select.tsx';
import Input from '../../../components/common/Form/Input.tsx';

// --- TYPE DEFINITIONS ---
type GradeMode = 'direct' | 'range';

interface GradeAssignmentEditorProps {
    gradeRange: string;
    setGradeRange: (value: string) => void;
}

/**
 * A dedicated component for selecting a course's grade level,
 * supporting both direct selection and a validated range.
 */
const GradeAssignmentEditor: React.FC<GradeAssignmentEditorProps> = ({
    gradeRange,
    setGradeRange,
}) => {
    const { t } = useTranslation();

    // --- STATE MANAGEMENT ---
    const [mode, setMode] = useState<GradeMode>('direct');
    const [directValue, setDirectValue] = useState<string>('1');
    const [rangeValue1, setRangeValue1] = useState<string>('1');
    const [rangeValue2, setRangeValue2] = useState<string>('2');
    const [error, setError] = useState<string | null>(null);

    /**
     * Effect to parse the incoming gradeRange prop and initialize the component's state.
     * This allows the component to correctly display the saved value when editing a course.
     */
    useEffect(() => {
        if (gradeRange.includes('-')) {
            const parts = gradeRange.split('-');
            if (parts.length === 2 && !isNaN(parseInt(parts[0])) && !isNaN(parseInt(parts[1]))) {
                setMode('range');
                setRangeValue1(parts[0]);
                setRangeValue2(parts[1]);
                return;
            }
        }
        setMode('direct');
        setDirectValue(gradeRange || '1');
    }, [gradeRange]);

    /**
     * Validates the range inputs according to the business rules.
     * Sets an error message if validation fails.
     * @returns True if the range is valid, otherwise false.
     */
    const validateRange = (r1: number, r2: number): boolean => {
        if (r1 < 1 || r2 > 13) {
            setError(t('errors.gradeRange.outOfBounds'));
            return false;
        }
        if (r1 >= r2) {
            setError(t('errors.gradeRange.invalidOrder'));
            return false;
        }
        setError(null);
        return true;
    };

    // --- EVENT HANDLERS ---

    const handleModeChange = (newMode: GradeMode) => {
        setMode(newMode);
        setError(null); // Clear errors when switching modes
        // When switching, immediately update the parent with the current valid value of the new mode.
        if (newMode === 'direct') {
            setGradeRange(directValue);
        } else {
            const r1 = parseInt(rangeValue1, 10);
            const r2 = parseInt(rangeValue2, 10);
            if (validateRange(r1, r2)) {
                setGradeRange(`${r1}-${r2}`);
            }
        }
    };

    const handleDirectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setDirectValue(value);
        setGradeRange(value);
    };

    const handleRangeChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
        const r1String = e.target.value;
        setRangeValue1(r1String);
        const r1 = parseInt(r1String, 10);
        const r2 = parseInt(rangeValue2, 10);
        if (!isNaN(r1) && !isNaN(r2) && validateRange(r1, r2)) {
            setGradeRange(`${r1}-${r2}`);
        }
    };

    const handleRangeChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
        const r2String = e.target.value;
        setRangeValue2(r2String);
        const r1 = parseInt(rangeValue1, 10);
        const r2 = parseInt(r2String, 10);
        if (!isNaN(r1) && !isNaN(r2) && validateRange(r1, r2)) {
            setGradeRange(`${r1}-${r2}`);
        }
    };

    return (
        <div className="grade-assignment-editor">
            <div className="form-group--horizontal">
                <Label>{t('labels.gradeAssignmentMode')}</Label>
                <div className="radio-group">
                    <input
                        type="radio"
                        id="grade-mode-direct"
                        name="grade-mode"
                        value="direct"
                        checked={mode === 'direct'}
                        onChange={() => handleModeChange('direct')}
                    />
                    <Label htmlFor="grade-mode-direct">{t('labels.direct')}</Label>
                    <input
                        type="radio"
                        id="grade-mode-range"
                        name="grade-mode"
                        value="range"
                        checked={mode === 'range'}
                        onChange={() => handleModeChange('range')}
                    />
                    <Label htmlFor="grade-mode-range">{t('labels.range')}</Label>
                </div>
            </div>

            {mode === 'direct' ? (
                <div className="form-group">
                    <Select value={directValue} onChange={handleDirectChange}>
                        {Array.from({ length: 13 }, (_, i) => i + 1).map((grade) => (
                            <option key={grade} value={grade}>
                                {t('labels.grade', { grade })}
                            </option>
                        ))}
                        <option value="advanced">{t('labels.advanced')}</option>
                    </Select>
                </div>
            ) : (
                <div className="form-group">
                    <div className="range-inputs">
                        <Input
                            type="number"
                            min="1"
                            max="12"
                            value={rangeValue1}
                            onChange={handleRangeChange1}
                            aria-label={t('labels.rangeFrom')}
                        />
                        <span>-</span>
                        <Input
                            type="number"
                            min="2"
                            max="13"
                            value={rangeValue2}
                            onChange={handleRangeChange2}
                            aria-label={t('labels.rangeTo')}
                        />
                    </div>
                    {error && <p className="form-error">{error}</p>}
                </div>
            )}
        </div>
    );
};

export default GradeAssignmentEditor;
