# Logify

A digital replacement for the paper SIWES logbook. Students record their daily work, and supervisors review it, all in one place.

**Live demo:** logify-rouge.vercel.app · **Team project**


## The problem
using a paper logbook can be stressful , easily misplaced , or inadequately filled.

## What it does

Two roles, each with their own view:

- **Student**: logs in, fills in a daily log, and submits the whole week for review.
- **Supervisor**: sees a dashboard of submitted weeks and reviews them.

This is a scoped MVP covering the login, student and supervisor pages.

## My contribution

I owned the frontend design and build:

- UI/UX design of the app
- The daily log forms
- The Submit Week flow
- The supervisor dashboard

## Tech stack

- React + Vite
- Tailwind CSS
- State kept in the browser with `localStorage`

## How it works

This is a front-end prototype, built to demonstrate the whole flow in a live presentation. There is **no backend**: data is stored in the browser's `localStorage`, so each feature works end to end but on a single device.

## Known limitations

- No real authentication or server. Data lives only in the browser it was entered on.
- Built as a prototype, so some features are intentionally shallow.

## What I learned

- Designing a form-heavy flow (daily entries, then a weekly submission) so it's quick for a student to use.
- Building two role-based views from one codebase.
- Persisting app state with `localStorage` in a React app.

## Run it locally

```bash
git clone [repo link]
cd [folder]
npm install
npm run dev
```
