---
name: run-tests
description: >-
  Use this skill when you need to verify code changes, ensure no regressions have occurred, or when you are explicitly asked to run unit tests. It guides the agent through running tests, identifying errors, and fixing common testing pitfalls in this project (like Zustand state leakage or missing i18n contexts).
---

# Run and Analyze Tests Skill

This skill provides a standard runbook for executing and troubleshooting unit tests in the Ms Van's English Class project.

## Execution Steps

### 1. Run the Test Suite
Use the `run_command` tool to execute the test runner:
```bash
npm run test
```
- Set `WaitMsBeforeAsync` to a sufficiently large value (e.g., 20000ms) since tests may take a few seconds to boot up and run.

### 2. Analyze the Output
If the command exits with code `0`, all tests passed! You may proceed with confidence.
If the command exits with a non-zero code, you must investigate the failure.

### 3. Common Troubleshooting Scenarios

#### Scenario A: `ReferenceError: useLanguage is not defined`
**Cause:** A component is using the `useLanguage` hook for i18n, but the import statement was accidentally removed or is missing.
**Fix:** Ensure `import { useLanguage } from '../context/LanguageContext';` is present at the top of the file.

#### Scenario B: `Warning: An update to Component inside a test was not wrapped in act(...)`
**Cause:** React state updates (often triggered by async AI mock responses or Zustand state updates) are happening outside of React's `act()` wrapper.
**Fix:** This is often a warning and doesn't explicitly fail the test, but it indicates race conditions. Ensure asynchronous mock resolutions are properly awaited using `findByText` or `waitFor`.

#### Scenario C: `TestingLibraryElementError: Found multiple elements with the text...`
**Cause:** Global Zustand state leaked from a previous test block, causing multiple components (or lingering components) to render the same text.
**Fix:** Ensure `setupTests.js` has an `afterEach` hook calling `useAIStore.getState().clearAllHistory()`, and verify your component tests are tearing down properly.

#### Scenario D: Failed API Mocks
**Cause:** The component's API calls (e.g., `generateLessonPlan`) were refactored, but the tests are still mocking the old return format.
**Fix:** Update `vi.mock('../services/aiService')` in the test file to match the new object shape precisely.

### 4. Re-run Verification
After applying fixes, you **MUST** run the test suite again to verify the fix before reporting back to the user. Do not assume the fix works until the test runner outputs a success.
