# Learning App 🚀

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-239120?&style=for-the-badge&logo=css3&logoColor=white)
![Dexie.js](https://img.shields.io/badge/Dexie.js-FFDF00?style=for-the-badge&logo=dexie-dot-js&logoColor=black)
![Electron](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white)
![Status](https://img.shields.io/badge/Status-Foundation%20In%20Progress-blue)

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
-   **Styling**: Vanilla CSS with CSS Modules (No utility-first frameworks)
-   **Data Persistence**: Dexie.js (a wrapper for IndexedDB) for robust offline storage.
-   **Routing**: React Router
-   **Internationalization**: i18next

---

## Project Roadmap

### ➡️ **Phase 1: The Core Application Loop (In Progress)**

This initial phase focuses on building a fully functional, end-to-end user experience.

-   **1. Foundational Setup:** Establish the project structure, version control, styling architecture, and database schema.
-   **2. Routing & Layout:** Implement the main application shell and navigation between pages.
-   **3. User Management:** Create the core user-switching logic (Admin/Learner) and persist the user state.
-   **4. Database Seeding:** Automatically populate the database with default users on first launch.
-   **5. User Selection UI:** Build the initial screen where a user can select their profile.

### **Phase 2: The Learning Engine**

-   **Course & Question Models:** Define the data structures for courses, exercises, and different question types (MCQ, Text Input).
-   **Admin Course Editor:** Develop a form-based interface for creating and editing courses and questions.
-   **Learner Course Player:** Build the UI for learners to take exercises and submit answers.
-   **Instant Feedback System:** Implement the visual feedback for correct/incorrect answers.

### **Future Milestones**

-   **Progress Tracking & Dashboard:** Create visualizations for learner progress.
-   **Advanced Question Types:** Add support for drag & drop, matching, etc.
-   **Theming:** Implement light/dark mode support.
-   **Data Import/Export:** Allow users to back up and restore their data.
