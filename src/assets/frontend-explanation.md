# Frontend Codebase Explanation

This document provides an overview of the frontend codebase for the Elisha-Fit project. It is intended to help new developers quickly understand the structure, key components, and development workflow.

---

## Project Structure

- `src/app/` — Main application source code
  - `components/` — Reusable UI components (e.g., home, program-wizard, exercise-selector, etc.)
  - `models/` — TypeScript interfaces and types for data models
  - `services/` — Angular services for API calls and business logic
  - `interceptors/` — HTTP interceptors (e.g., for authentication)
  - `app.module.ts` — Main Angular module
  - `app-routing.module.ts` — Application routing configuration
- `src/assets/` — Static assets (images, data, markdown docs, etc.)
- `src/environments/` — Environment configuration files
- `src/styles/` — Global and component SCSS styles

---

## Main Components

- **Home (`home/`)** — Dashboard and landing page for users, showing stats, quick actions, and recent activity.
- **Program Wizard (`program-wizard/`)** — Multi-step flow for creating custom workout programs (details, exercise selection, configuration, review).
- **Exercise Selector (`exercise-selector/`)** — UI for searching and filtering exercises to add to programs.
- **Program List/Detail/Edit** — Manage, view, and edit workout programs.
- **Profile, Progress, Analytics, Goals** — User profile, progress tracking, analytics, and goal management.

---

## Services

- **`exercise.service.ts`** — Fetches exercise data and filter options from the backend.
- **`program.service.ts`** — Handles CRUD operations for workout programs.
- **`user-stats.service.ts`** — Loads dashboard/user stats and analytics.
- **Other services** — For authentication, analytics, progress, etc.

---

## State Management

- Uses Angular component state and RxJS observables for data flow.
- Services provide data streams and handle API communication.
- Forms are managed with Angular Reactive Forms for validation and user input.

---

## Styling

- Uses SCSS for component and global styles.
- Bootstrap is used for layout and UI consistency.
- Custom styles are in `src/styles/` and component `.scss` files.

---

## Development & Running the Frontend

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run the development server:**
   ```bash
   ng serve
   ```
   The app will be available at `http://localhost:4200` by default.
3. **Build for production:**
   ```bash
   ng build --prod
   ```

---

## Notes

- Exercise data is sourced from the backend, which loads from `exercises.json`.
- Error and empty states are handled in each component for a smooth user experience.
- For more details on a specific component or service, see the corresponding TypeScript file and its comments.

---

*For backend/API details, see the backend explanation file.* 

---

## Component Details

### Home (`home/`)
- **Purpose:** Main dashboard/landing page for users after login.
- **Features:**
  - Displays user stats, quick actions, recent activity, and weekly progress.
  - Handles empty states and API errors gracefully.
  - Tabs for overview, calendar, and programs.
- **Key Files:**
  - `home.component.ts` — Logic for loading and displaying dashboard data.
  - `home.component.html` — UI template for dashboard cards and sections.
  - `home.component.scss` — Styling for dashboard layout.

### Program Wizard (`program-wizard/`)
- **Purpose:** Multi-step flow for creating a custom workout program.
- **Features:**
  - Step 1: Program details (name, description, target muscles, tags).
  - Step 2: Select exercises (uses `exercise-selector`).
  - Step 3: Configure sets, reps, rest, and notes for each exercise.
  - Step 4: Review and create the program.
  - Form validation and step navigation.
- **Key Files:**
  - `program-wizard.component.ts` — Main logic and state for the wizard.
  - `program-wizard.component.html` — Stepper UI and review screen.
  - `exercise-selector/` — Embedded for exercise selection.
  - `exercise-config/` — Embedded for exercise configuration.

### Exercise Selector (`exercise-selector/`)
- **Purpose:** UI for searching, filtering, and selecting exercises.
- **Features:**
  - Search by name, filter by category, muscle group, equipment.
  - Grid/list view, image navigation, and selection state.
  - Used in program wizard and other program-editing screens.
- **Key Files:**
  - `exercise-selector.component.ts` — Filtering, search, and selection logic.
  - `exercise-selector.component.html` — UI for filters, search, and exercise cards.
  - `exercise-selector.component.scss` — Styling for grid/list and filter controls.

### Program List (`program-list/`)
- **Purpose:** Shows all programs created by the user.
- **Features:**
  - List/grid of programs with search and filter options.
  - Actions for viewing, editing, duplicating, or deleting programs.
- **Key Files:**
  - `program-list.component.ts` — Loads and manages the list of programs.
  - `program-list.component.html` — UI for program cards and actions.

### Program Detail (`program-detail/`)
- **Purpose:** View details of a single program.
- **Features:**
  - Shows program info, exercise breakdown, and stats.
  - Tabs for overview, exercises, and progress.
- **Key Files:**
  - `program-detail.component.ts` — Loads program data and handles tab logic.
  - `program-detail.component.html` — UI for program details and exercise list.

### Program Edit (`program-edit/`)
- **Purpose:** Edit an existing program.
- **Features:**
  - Similar to the wizard, but pre-fills with existing program data.
  - Allows editing exercises, sets, reps, and notes.
- **Key Files:**
  - `program-edit.component.ts` — Handles loading, editing, and saving a program.
  - `program-edit.component.html` — UI for editing program details and exercises.

### Progress Dashboard (`progress-dashboard/`)
- **Purpose:** Visualizes user progress over time.
- **Features:**
  - Charts and stats for workouts, calories, and trends.
  - Weekly/monthly views.
- **Key Files:**
  - `progress-dashboard.component.ts` — Loads and processes progress data.
  - `progress-dashboard.component.html` — UI for charts and stats.

### Progress Entry (`progress-entry/`)
- **Purpose:** Log a new workout/progress entry.
- **Features:**
  - Select program, enter sets/reps/weight for each exercise.
  - Validation and feedback for entry.
- **Key Files:**
  - `progress-entry.component.ts` — Handles form logic and submission.
  - `progress-entry.component.html` — UI for progress entry form.

### Progress History (`progress-history/`)
- **Purpose:** View history of all logged workouts.
- **Features:**
  - List of past entries with details and stats.
  - Filtering and search.
- **Key Files:**
  - `progress-history.component.ts` — Loads and filters progress history.
  - `progress-history.component.html` — UI for history list.

### Profile (`profile/`)
- **Purpose:** User profile and settings.
- **Features:**
  - View and edit personal info, stats, and achievements.
  - Tabs for profile, stats, settings, achievements.
- **Key Files:**
  - `profile.component.ts` — Handles profile data and settings logic.
  - `profile.component.html` — UI for profile and settings.

### Login (`login/`)
- **Purpose:** User authentication (login screen).
- **Features:**
  - Email/password login form.
  - Error handling and feedback.
- **Key Files:**
  - `login.component.ts` — Handles login logic and API calls.
  - `login.component.html` — UI for login form.

### Sidebar (`sidebar/`)
- **Purpose:** Main navigation sidebar.
- **Features:**
  - Links to all main app sections.
  - Collapsible and responsive.
- **Key Files:**
  - `sidebar.component.ts` — Navigation logic and state.
  - `sidebar.component.html` — Sidebar UI.

### Header (`header/`)
- **Purpose:** Top navigation bar.
- **Features:**
  - App title/logo, user menu, and quick links.
- **Key Files:**
  - `header.component.ts` — Header logic.
  - `header.component.html` — Header UI.

### Breadcrumb (`breadcrumb/`)
- **Purpose:** Shows navigation path within the app.
- **Features:**
  - Dynamic breadcrumbs based on current route.
- **Key Files:**
  - `breadcrumb.component.ts` — Breadcrumb logic.
  - `breadcrumb.component.html` — Breadcrumb UI.

### Loading (`loading/`)
- **Purpose:** Loading spinner/indicator component.
- **Features:**
  - Used throughout the app for async operations.
- **Key Files:**
  - `loading.component.ts` — Loading state logic.
  - `loading.component.html` — Spinner UI.

### Dropdown (`dropdown/`)
- **Purpose:** Custom dropdown/select component.
- **Features:**
  - Used for filter and selection UIs.
- **Key Files:**
  - `dropdown.component.ts` — Dropdown logic.
  - `dropdown.component.html` — Dropdown UI.

### Confirm Dialog (`confirm-dialog/`)
- **Purpose:** Modal dialog for confirming actions.
- **Features:**
  - Used for delete, save, and other confirmations.
- **Key Files:**
  - `confirm-dialog.component.ts` — Dialog logic.
  - `confirm-dialog.component.html` — Dialog UI.

### Goal Management (`goal-management/`)
- **Purpose:** Create and manage fitness goals.
- **Features:**
  - Add, edit, and track goals.
- **Key Files:**
  - `goal-management.component.ts` — Goal logic.
  - `goal-management.component.html` — Goal UI.

### Select Program (`select-program/`)
- **Purpose:** UI for selecting a program (e.g., for logging progress).
- **Features:**
  - Search, filter, and select from available programs.
- **Key Files:**
  - `select-program.component.ts` — Selection logic.
  - `select-program.component.html` — UI for program selection.

### Progress Analytics (`progress-analytics/`)
- **Purpose:** Advanced analytics and charts for user progress.
- **Features:**
  - Visualizes trends and performance metrics.
- **Key Files:**
  - `progress-analytics.component.ts` — Analytics logic.
  - `progress-analytics.component.html` — Analytics UI.

### Analyic (`analyic/`)
- **Purpose:** Additional analytics and reporting.
- **Features:**
  - Weekly/monthly stats, goals, and performance.
- **Key Files:**
  - `analyic.component.ts` — Loads and displays analytics data.
  - `analyic.component.html` — Analytics UI.

### Calander (`calander/`)
- **Purpose:** Calendar view for workouts and progress.
- **Features:**
  - Visualizes workouts on a calendar.
- **Key Files:**
  - `calander.component.ts` — Calendar logic.
  - `calander.component.html` — Calendar UI.

### Duplicate Program Dialog (`duplicate-program-dialog/`)
- **Purpose:** Modal for duplicating an existing program.
- **Features:**
  - Lets user copy and modify a program.
- **Key Files:**
  - `duplicate-program-dialog.component.ts` — Dialog logic.
  - `duplicate-program-dialog.component.html` — Dialog UI.

--- 