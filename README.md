# PrepRoute Test Management App

A 5-page test management application : login, dashboard, test creation/editing, MCQ question authoring (manual + CSV bulk import), and preview/publish — plus a read-only "final published output" view.

## Tech stack

 **React 19 + TypeScript** (Vite)
- **React Router** for the page flow + protected routes
- **Zustand** for auth state and a cached tests store
- **React Hook Form + Zod** for form state and validation
- **TipTap** for the real rich-text question/solution editor (bold/italic/underline/strikethrough/lists/links/inline images)
- **PapaParse** for CSV bulk question import
- **Axios** with interceptors for auth token attachment and global 401 handling
- **Tailwind CSS v4** for styling, using design tokens pulled from the Figma file

## Getting started

```bash
npm install
npm run dev
```
The dev server runs on **port 3000**

The app is pre-configured to talk to the staging backend via `.env`:
```
VITE_API_BASE_URL=https://admin-moderator-backend-staging.up.railway.app/api
```

Login with:
- User ID: `vedant-admin`
- Password: `vedant123`

## Project structure

```
src/
├── api/          # One file per API resource (auth, subjects, topics, subtopics, tests, questions)
├── components/
│   ├── layout/   # AppLayout (sidebar + topbar)
│   └── ui/       # Reusable UI: MultiSelect, Select, NumberStepper, Field, StatusBadge,
│                 # TestSummaryCard, EditTestModal, RichTextEditor, Icons
├── hooks/        # useTestForm - shared cascading subject/topic/sub-topic + marking-scheme
│                 # form logic, used by both the full Create/Edit page and the Edit modal
├── pages/        # One folder per page: Login, Dashboard, TestCreate, QuestionCreation,
│                 # Confirmation, TestView (read-only published output), TestTracking (placeholder)
├── routes/       # ProtectedRoute auth guard
├── store/        # Zustand stores: auth, and a cached/paginated tests store
├── types/        # Shared TypeScript types matching the real API contract
└── utils/        # csvImport.ts - CSV parsing for bulk question upload
```

## Application flow
 
1. **Login** (`/login`)
2. **Dashboard** (`/dashboard`) — searchable, filterable, paginated list of all tests; Create/Edit/View actions
3. **Create/Edit Test** (`/tests/new`, `/tests/:id/edit`) — cascading Subject → Topic → Sub-topic, marking scheme, Save as Draft / Next
4. **Add Questions** (`/tests/:id/questions`) — manual MCQ entry with a real rich-text editor, CSV bulk import, per-question difficulty/topic/sub-topic
5. **Preview & Publish** (`/tests/:id/publish`) — full review, Publish Now / Schedule Publish, "Live Until" duration
6. **View published test** (`/tests/:id/view`) — read-only final output, reachable from Dashboard's "View" action or directly after publishing
An **Edit Test** modal (pencil icon) is also reachable directly from the Add Questions and Publish pages, so you don't have to leave the flow to tweak test details — matching the popup shown in Figma, while the full `/tests/:id/edit` route remains available from the Dashboard.
