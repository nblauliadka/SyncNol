# SYNCNOL SYSTEM AUDIT & REPAIR ROADMAP

This document outlines the structured repair operation for the SyncNol application to resolve disconnected states and dead features.

## Phase 1: Core Database & Synchronization
**Objective:** Establish a single source of truth and reliable two-way synchronization between the local client state and the Supabase backend.

- [x] **1.1: Dashboard Manual Entry Sync:** Update `DashboardPage.jsx` manual entry submission handler. It must perform an asynchronous write to Supabase (via the backend API) *before* updating the local Zustand store.
- [x] **1.2: J.A.R.V.I.S State Reconciliation:** Modify the JARVIS API response handling. Ensure that when J.A.R.V.I.S processes a transaction, the backend successfully writes to Supabase, and the frontend fetches the *latest* state from the database instead of overwriting with stale cached data.
- [x] **1.3: Centralized Data Fetching:** Verify that the initial data load on the Dashboard correctly pulls from Supabase and populates the local state.

## Phase 2: PDF & Reporting Engine
**Objective:** Bring the "Boardroom Reports" feature online by implementing the PDF generation logic.

- [x] **2.1: Report Data Aggregation:** Implement logic in `ReportsPage.jsx` (or a dedicated utility) to gather the necessary user data (balances, transactions, analytics) for the report.
- [x] **2.2: PDF Generation Library Integration:** Utilize `jspdf` and `jspdf-autotable` (or a similar library) to format the aggregated data into a professional PDF document.
- [x] **2.3: Download Handler:** Connect the "Boardroom Reports" button to trigger the generation and download of the PDF file.

## Phase 3: Content Population (Vault & Academy)
**Objective:** Transform the empty placeholder pages into functional, engaging components.

- [x] **3.1: Academy Page Development:** Build out the `AcademyPage.jsx` with educational content, financial modules, or dynamic articles. Implement the necessary UI components (cards, lists, video placeholders).
- [x] **3.2: Vault (Brankas) Page Development:** Design and implement the `VaultPage.jsx`. This could serve as a document storage area, secure notes section, or advanced asset breakdown. Define the data structure and build the UI.

## Phase 4: Interactive Calendar
**Objective:** Convert the static Calendar UI into a fully functional, interactive scheduling tool.

- [x] **4.1: Calendar State Management:** Add state variables to `CalendarPage.jsx` to track the currently selected date, month, and year.
- [x] **4.2: Interactive Date Cells:** Make the calendar date cells clickable. Clicking a date should update the selected date state and display events/reminders for that day.
- [x] **4.3: Bill Reminder Integration:** Implement a modal or form to add new bill reminders. Connect this to the Supabase backend to persist reminders and display them on the calendar.

## Phase 5: Global Localization
**Objective:** Implement a global context provider to handle language switching between English and Indonesian.

- [x] **5.1: Localization Context:** Create a new React Context (`LanguageContext.jsx`) to manage the current language state globally.
- [x] **5.2: Translation Dictionary:** Create JSON files or a JavaScript object mapping keys to English and Indonesian strings.
- [x] **5.3: Settings Toggle Connection:** Wire the ID/EN button in `SettingsPage.jsx` to update the global language state via the Context.
- [x] **5.4: UI Translation Application:** Begin applying the translation dictionary to UI text elements across the application, starting with critical navigation and dashboard components.

---

## CTO Directive: Phase 2 Overhaul
**Executed:** 2026-04-22. Do not touch `main.py`.

### O1: Dashboard UI/UX Overhaul (`DashboardPage.jsx`)
- [x] **O1.1: BarChart:** Replaced `<AreaChart>` with `<BarChart>` using `<Cell>` per-bar coloring (blue for positive, red for negative balance).
- [x] **O1.2: Daily Budget:** Removed "Sisa Napas" metric. Replaced with "Batas Jajan Harian" — computed as `(netWorth - totalDebt) / remaining days in month`. Color-coded: green ≥ Rp 100k, amber < Rp 50k, red ≤ 0.
- [x] **O1.3: Negative Net Worth:** Net worth heading and badge now conditionally render red/defisit styling when `netWorth < 0`.

### O2: Planner Database Sync (`PlannerPage.jsx`)
- [x] **O2.1: Supabase Fetch on Mount:** `useEffect` fetches goals from `supabase.from("goals")` filtered by `user_id` on component mount.
- [x] **O2.2: Goal Creation Sync:** `handleAddGoal` inserts a new row into Supabase `goals` table before updating local state.
- [x] **O2.3: Deposit Sync:** Replaced `window.prompt` with a proper modal. Deposit calls `supabase.update({ current_saved })` on the goal row.
- [x] **O2.4: Delete Sync:** `removeGoal` calls `supabase.delete()` on the row before removing from local state.

### O3: Academy Curriculum (`AcademyPage.jsx`)
- [x] **O3.1: Financial Survival Kit:** Replaced dummy module grid with a real YouTube video gallery section.
- [x] **O3.2: 3 Embedded Videos:** YouTube iframes embedded with `loading="lazy"` for 3 real financial education videos: 50/30/20 budgeting, stock investing for beginners, and debt payoff strategies.
- [x] **O3.3: Typo Fix:** Fixed accidental `fimport` → `import` in `LanguageContext.jsx`.
