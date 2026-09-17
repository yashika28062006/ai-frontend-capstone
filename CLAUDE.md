# CLAUDE.md

## Project Overview

This repository contains my capstone project for the Front-end AI Engineering track.

## Tech Stack

* React
* JavaScript
* Node.js
* HTML
* CSS
* Git and GitHub

## Development Conventions

* Write clear and readable code.
* Prefer reusable React components.
* Keep components focused on a single responsibility.
* Use semantic HTML where appropriate.
* Keep styling organized and maintainable.
* Avoid unnecessary dependencies.
* Do not modify unrelated files when completing a task.
* Follow existing project patterns before introducing new ones.

## Git Conventions

Use Conventional Commits.

Examples:

* `feat: add user authentication`
* `fix: resolve navigation issue`
* `docs: update README`
* `chore: configure project`

## AI Development Guidelines

Before making significant changes:

1. Understand the existing project structure.
2. Inspect relevant files.
3. Make the smallest appropriate change.
4. Explain important changes clearly.
5. Avoid changing unrelated functionality.

## Code Quality

- Use meaningful variable and function names.
- Keep functions small and readable.
- Avoid duplicate code.
- Prefer simple solutions over unnecessary complexity.
## Project-Specific Rules

- Frontend components must use React functional components and hooks; do not introduce class components.
- Forms must use semantic labels and accessible error handling with `aria-invalid` and `aria-describedby` when validation errors are shown.
- Reusable form components must keep save logic injectable through an async callback such as `onSave(values)` instead of embedding API requests.
- Do not add new frontend dependencies when the existing React/Vite setup or Node built-in tooling can satisfy the requirement.
