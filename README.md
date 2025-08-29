# Learning App 🚀

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-239120?&style=for-the-badge&logo=css3&logoColor=white)
![Dexie.js](https://img.shields.io/badge/Dexie.js-FFDF00?style=for-the-badge&logo=dexie-dot-js&logoColor=black)
![Electron](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white)
![Status](https://img.shields.io/badge/Status-Core%20Complete-brightgreen)

---

Welcome to the Learning App project, a local-first educational platform designed for children in class levels 1–3. This application provides a focused, distraction-free environment for practicing core skills in **Math, Reading, and Writing**.

Built for simplicity and engagement, this tool empowers both learners to practice at their own pace and admins (parents or teachers) to easily create and manage educational content.

---

## Core Philosophy

-   **Fast & Engaging**: Feedback is instant. The UI is designed to be responsive and snappy, keeping young learners engaged without frustrating delays or loading screens.

-   **Clean & Intuitive Design**: The interface is modern, clean, and easy to navigate. The goal is to create a calm, encouraging digital space that supports learning rather than distracting from it.

-   **Offline First**: All data is stored locally using IndexedDB. The application works perfectly with or without an internet connection, ensuring learning can happen anywhere, anytime.

-   **Extensible & Adaptable**: The architecture is designed to be modular, allowing for the easy addition of new subjects, question types, and features in the future.

---

## Tech Stack

-   **Framework**: React with TypeScript
-   **Desktop Shell**: Electron
-   **Styling**: Vanilla CSS with a powerful, custom-built theming engine (CSS Variables + React Context).
-   **Data Persistence**: Dexie.js (a wrapper for IndexedDB) for robust offline storage.
-   **Routing**: React Router
-   **Internationalization**: i18next

---

## Project Roadmap

### ✅ **Phase 1: Foundational Setup (Complete)**

This phase established the core architecture of the application.

-   **Project Structure:** Set up a scalable and maintainable folder structure.
-   **Styling Engine:** Built a powerful theming system from the ground up using CSS variables and React Context, supporting dynamic themes, accents, fonts, and contrast modes.
-   **Core Services:** Implemented routing, database connection (Dexie.js), and localization (i18next).

### ✅ **Phase 2: The Learning Engine (Complete)**

This phase delivered the core value of the application: a fully playable learning loop.

-   **Admin CRUD:** Developed a complete admin interface to **Create, Read, Update, and Delete** courses and their questions.
-   **Learner Dashboard:** Built an engaging, card-based dashboard for learners to select courses.
-   **Interactive Course Player:** Implemented the full course-taking experience, including question display, answer selection, an instant feedback loop, and a final summary screen.

### ➡️ **Phase 3: User & Personalization (Next Up)**

The next major initiative is to build out a full multi-user account system and the settings to personalize the experience.

-   **1. Account Management System:** Build an admin-controlled system to create, edit, and delete multiple user accounts (both 'admin' and 'learner' types). This will replace the current two-user seeded system.
-   **2. Settings Page:** Create a dedicated settings page where users can:
    -   **Customize Appearance:** Control their theme (light/dark), accent color, font, contrast, and font size using the theming engine.
    -   **Manage Profile:** Edit their own account details (e.g., change their name).

### **Future Milestones**

-   **Progress Tracking & Dashboard:** Create visualizations for learner progress over time.
-   **Advanced Question Types:** Add support for new formats like fill-in-the-blank, drag & drop, or matching.
-   **Data Import/Export:** Allow users to back up and restore their data.
-   **Achievements & Gamification:** Introduce streaks, badges, or other rewards to enhance engagement.
