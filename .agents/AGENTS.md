# AI Agent Strict Rules & Best Practices
These rules apply to all tasks in this workspace to ensure the highest standards of code quality, UI/UX consistency, and robust engineering.

## 1. UI/UX & Design Excellence (Strict Enforcement)
- **Frameworks:** Use standard React, Tailwind CSS, and `shadcn/ui` components exclusively. DO NOT invent custom CSS classes unless absolutely necessary (e.g., specific 3D animations).
- **Aesthetics First:** Every UI component must look premium. Implement hover effects (`hover:-translate-y-1`, `hover:shadow-xl`), glassmorphism (`backdrop-blur-sm`, `bg-white/50`), and subtle entry animations (`animate-in fade-in slide-in-from-bottom-4`).
- **Responsiveness:** Ensure all grids and layouts are responsive (use `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` or similar).

## 2. Code Quality & Modularity
- **No Direct Mutation:** Never modify `CourseManager.jsx` unless explicitly instructed. Keep data structures isolated and immutable.
- **Robustness:** Implement fallback mechanisms for all API calls. Never leave an unhandled Promise or an unhandled JSON parse error.
- **Syntax Integrity:** Before committing code, double-check bracket matching, imports, and exports. Do not delete existing valid functions when updating files.

## 3. Testing & Verification
- **Unit Testing:** Ensure all mocks and test setups exactly match the shape of data returned by the real APIs.
- **Validation Before Feedback:** Do not present a solution to the user until you are 100% sure the application compiles without Vite HMR errors.

## 4. Agentic Workflow
- Always verify the state of a file using `view_file` or `grep_search` before making an assumption about its contents.
- Do not use generic tools like `cat`, `grep`, or `sed` via `run_command`. Stick to `view_file`, `grep_search`, `replace_file_content`.

## 5. Strict Zero-Hardcoded Text & 100% Bilingual Parity (EN / VI)
- **Zero Hardcoded Strings:** NEVER hardcode Vietnamese or English raw text directly in JSX templates, button labels, placeholders, input hints, tooltips, sample presets, or badge text.
- **Mandatory i18n Dictionary Lookup:** ALL user-facing UI text MUST use `t('key')` from `useLanguage()` and have full, accurate definitions in BOTH `translations.vi` and `translations.en` inside `src/services/i18n.js`.
- **Lesson Data Dynamic Localization:** When rendering curriculum or lesson content (`grammar`, `phonetics`, `vocabulary`), always pass the data through `getLocalizedLesson(rawLessonData, lang)` so grammar explanations, formula labels (`Affirmative (+)`, `Negative (-)`), and word definitions dynamically switch to English/Vietnamese with ZERO language leakage.
- **Bilingual Verification:** Always verify and test both `English` and `Tiếng Việt` language states before finalizing any implementation.
