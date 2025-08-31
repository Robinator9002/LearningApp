// src/components/learner/qa/EquationDisplay.tsx

import React from 'react';

interface EquationDisplayProps {
    equation: string;
}

/**
 * A simple, presentational component dedicated to displaying a mathematical equation.
 * It uses specific styling to make the equation stand out from regular question text.
 */
const EquationDisplay: React.FC<EquationDisplayProps> = ({ equation }) => {
    return (
        <div className="equation-display">
            <p className="equation-display__text">{equation}</p>
        </div>
    );
};

export default EquationDisplay;
