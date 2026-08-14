# Testing & Verification Rules

These rules dictate how code should be verified before being presented as a solution.

## 1. Unit Testing Enforcement
- The project uses **Vitest** and **React Testing Library**.
- All new logic and components should be covered by tests.
- **Mocks & Data Shapes:** Ensure all mocks and test setups exactly match the shape of data returned by the real APIs and state stores.
- Run tests via `npm run test`. Do not commit code that breaks the test suite.

## 2. Preventing State Leakage
- The project utilizes `Zustand` for global state management.
- Ensure that tests do not bleed state into each other. Use `afterEach` hooks to reset the Zustand store (`useAIStore.getState().clearAllHistory()`) to prevent `TestingLibraryElementError: Found multiple elements` errors caused by stale state.

## 3. Validation Before Feedback
- **Do not present a solution to the user until you are 100% sure the application compiles without Vite HMR errors.**
- Run build (`npm run build`) or dev (`npm run dev`) if necessary to verify syntax integrity.
- Before committing code, double-check bracket matching, imports, and exports. Do not delete existing valid functions when updating files.

## 4. Agentic Workflow
- Always verify the state of a file using `view_file` or `grep_search` before making an assumption about its contents.
- Do not use generic tools like `cat`, `grep`, or `sed` via `run_command` when dedicated tools (`view_file`, `grep_search`, `replace_file_content`) are available.
