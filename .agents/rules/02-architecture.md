# Code Architecture & Data Flow Rules

These rules dictate how data is managed, how components interact, and how state is preserved in the application.

## 1. Global State Management (Zustand)
- Use `useAIStore` (Zustand) for any state that needs to survive component unmounts, tab switching, or page reloads (e.g., generated AI content, form parameters).
- **Never use local `useState` for critical generated data** unless it is purely for transient UI states (like toggling a modal, loading spinners, or dragging states).
- Use `localStorage` persist middleware in Zustand to guarantee state survival.

## 2. Immutability & Safety
- **No Direct Mutation:** Treat all state objects and props as immutable.
- **CourseManager Safety:** The `CourseManager.jsx` relies on static curriculum data (`unit1Data` to `unit5Data`). Never mutate this static data directly.
- **State Bridging:** AI-generated lessons are bridged into the Course Manager via the `savedLessons` array in `useAIStore`. Keep the static units and dynamic AI lessons structurally separated.

## 3. Fallbacks and Error Handling
- **Robustness:** Implement fallback mechanisms for all API calls (especially Gemini AI calls).
- **Graceful Degradation:** Use `try/catch` blocks. Never leave an unhandled Promise or an unhandled JSON parse error.
- **Loading States:** Always provide an explicit loading UI (`AILoadingOverlay` or loading spinners) when executing async operations so the user is never left hanging.

## 4. Component Modularity
- Split large components into smaller, lazy-loaded pieces if they are not needed immediately.
- Use `React.lazy` and `Suspense` for heavy routing components (like the Flashcard Builder or AI Importer) to keep the initial bundle size small.
