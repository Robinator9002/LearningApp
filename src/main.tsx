import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

// --- The Fix ---
// Import the i18n configuration file here.
// This executes the file and initializes the i18next instance before the app renders.
import './lib/i18n';
// ---------------

import App from './App.tsx';
import './styles/main.css';

const rootElement = document.getElementById('root');

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <HashRouter>
                <App />
            </HashRouter>
        </React.StrictMode>,
    );
} else {
    console.error('Failed to find the root element');
}
