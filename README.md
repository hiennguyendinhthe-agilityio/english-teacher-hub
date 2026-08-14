# 🎓 Ms Van's English Class - Interactive AI Student & Teacher Hub

An interactive English learning and teaching platform powered by **Google Gemini AI**. Features include an AI Lesson Importer, smart worksheet & quiz generators, automated IELTS essay scoring, 3D vocabulary flashcards, and a seamlessly integrated Course Manager.

**🚀 Live Demo:** [https://english-teacher-hub.vercel.app](https://english-teacher-hub.vercel.app)

![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![Zustand](https://img.shields.io/badge/Zustand-State_Management-764ABC.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)
![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## ✨ Key Features

- **📚 AI-Powered Course Manager**:
  - Pre-built interactive Units (1 - 5) with vocabulary, grammar, and exercises.
  - **Bridge Integration**: Automatically save and persist your AI-generated lessons directly into the Course Manager.
  - **TV Presenter Mode**: Fullscreen classroom presentation view with a built-in countdown timer and laser pointer simulation.
  - **⚡ Fast-Paced Match Game**: Vocabulary pairing game with live stopwatch and combo tracking.
- **🤖 Smart AI Importer & Lesson Planner**:
  - Copy-paste raw text/documents, and the AI automatically extracts vocabulary, grammar points, and interactive quizzes.
  - Generate full lesson plans based on CEFR levels and target age groups.
- **🃏 3D Vocabulary Flashcards**:
  - 3D perspective flip cards with realistic gesture swipe and sound effects.
  - Native browser audio pronunciation.
- **📝 Smart Worksheet & Quiz Builder**:
  - Generates reading comprehension passages, cloze fill-in-the-blank tests, and grammar quizzes.
  - Interactive in-browser quiz solving + Printable student/teacher versions.
- **✍️ AI Essay & Writing Grader**:
  - Automated IELTS 4-criteria scoring (*Task Response, Coherence, Lexical Resource, Grammar Accuracy*).
  - Sentence-by-sentence grammar error detection and academic vocabulary upgrade suggestions.
- **⚡ High-Performance & Persistent Architecture**:
  - Global state management using **Zustand** + LocalStorage for robust data persistence across sessions.
  - React.lazy & Suspense Code-Splitting (< 0.3s First Contentful Paint).
  - 100% Bilingual Parity (English / Tiếng Việt) with zero hardcoded strings.

---

## 🛠️ Tech Stack

- **Frontend Core**: React 18, Vite 5, JavaScript (ES2023)
- **State Management**: Zustand (Persist Middleware)
- **Styling & Components**: Tailwind CSS, shadcn/ui primitives, Lucide Icons, Canvas Confetti
- **Audio & Animations**: Web Audio API, Web Speech Synthesis, CSS 3D Transforms
- **AI Integration**: Google Gemini 1.5 Flash API
- **Testing**: Vitest, React Testing Library (**40 Unit Tests - 100% Passed**)
- **Deployment**: Vercel

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/hiennguyendinhthe-agilityio/english-teacher-hub.git
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
*(Note: For security reasons, the project also has a UI modal to input the API Key directly in the browser).*

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
