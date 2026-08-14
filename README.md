# 🎓 Ms Van's English Class - Interactive Student & Teacher Hub

An interactive English learning and teaching platform powered by AI, featuring 3D vocabulary flashcards, smart worksheet & quiz generators, automated IELTS essay scoring, and interactive lesson presenter.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)
![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## ✨ Key Features

- **📚 Interactive Courses & Lessons (Units 1 - 5)**:
  - Rich vocabulary lists with native audio pronunciation.
  - Interactive grammar explanations and exercises.
  - **TV Presenter Mode**: Fullscreen classroom presentation view with presentation timer.
  - **⚡ Fast-Paced Match Game**: Vocabulary pairing game with live stopwatch and high scores.
- **🃏 3D Vocabulary Flashcards**:
  - 3D perspective flip cards with realistic gesture swipe and sound effects.
  - Custom topic generator and CEFR level tags.
- **📝 Smart Worksheet & Quiz Builder**:
  - Generates reading comprehension passages, cloze fill-in-the-blank tests, and grammar quizzes.
  - Configurable question count (3, 5, 8, 10) and CEFR levels (A1 to C2).
  - Interactive in-browser quiz solving + Printable student and teacher answer keys.
- **✍️ AI Essay & Writing Grader**:
  - Automated IELTS 4-criteria scoring (*Task Response, Coherence, Lexical Resource, Grammar Accuracy*).
  - Sentence-by-sentence grammar error detection and academic vocabulary upgrade suggestions.
  - Rewritten model answer version.
- **⚡ High-Performance Architecture**:
  - React.lazy & Suspense Code-Splitting (< 0.3s First Contentful Paint).
  - Skeleton Shimmer UI placeholders for smooth transitions.
  - Full multi-language parity (English / Tiếng Việt).

---

## 🛠️ Tech Stack

- **Frontend Core**: React 18, Vite 5, JavaScript (ES2023)
- **Styling & Components**: Tailwind CSS, shadcn/ui primitives, Lucide Icons, Canvas Confetti
- **Audio & Animations**: Web Audio API, Web Speech Synthesis, CSS 3D Transforms
- **AI Integration**: Google Gemini 1.5 Flash API + Smart Deterministic Fallback Engine
- **Testing**: Vitest, React Testing Library (33 Unit Tests - 100% Passed)
- **Deployment**: Vercel

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/english-teacher-hub.git
cd english-teacher-hub
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables (Optional)
Create a `.env` file in the root directory:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: If left empty, the application uses the built-in Smart Deterministic Fallback Engine).*

### 4. Run development server
```bash
npm run dev
```

### 5. Run automated unit tests
```bash
npm run test
```

### 6. Build for production
```bash
npm run build
```

---

## 📄 License
MIT License © 2026 Ms Van's English Class.
