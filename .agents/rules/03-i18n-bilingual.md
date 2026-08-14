# i18n & Bilingual Parity Rules

These rules enforce strict localization requirements. The platform MUST be perfectly bilingual (English / Tiếng Việt).

## 1. Zero Hardcoded Strings (Strict Enforcement)
- **NEVER** hardcode Vietnamese or English raw text directly in JSX templates, button labels, placeholders, input hints, tooltips, sample presets, or badge text.
- Example Violation: `<Button>Tạo Bài Giảng</Button>`
- Example Correct: `<Button>{t('impGenerateBtn')}</Button>`

## 2. Mandatory i18n Dictionary Lookup
- ALL user-facing UI text MUST use the `t('key')` function from the `useLanguage()` context.
- Every key MUST have full, accurate, and contextually appropriate definitions in BOTH `translations.vi` and `translations.en` inside `src/services/i18n.js`.
- When adding a new feature, your first step should be adding the necessary keys to the translation dictionary.

## 3. Dynamic Lesson Data Localization
- When rendering curriculum or lesson content (`grammar`, `phonetics`, `vocabulary`), always pass the raw data through the `getLocalizedLesson(rawLessonData, lang)` helper.
- This ensures that grammar explanations, formula labels (e.g., `Affirmative (+)`, `Negative (-)`), and word definitions dynamically switch to English/Vietnamese with ZERO language leakage.

## 4. Bilingual Verification
- Always verify and test both `English` and `Tiếng Việt` language states before finalizing any implementation. Check for text overflow when switching between languages, as translated strings may vary significantly in length.
