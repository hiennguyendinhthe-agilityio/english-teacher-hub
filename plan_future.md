# 🗺️ MASTER ROADMAP: "ENGLISH TEACHER HUB"
*(Master Roadmap to Production)*

This document serves as a **"Compass"**, ensuring you never lose direction while learning and upgrading the Teacher Planner project from a practice exercise to a full-fledged commercial product.

---

## 📌 PHASE 1: FOUNDATION (COMPLETED)
*Objective: Ensure the most basic workflow of the software runs smoothly.*

- [x] Build UI/UX using React + Tailwind (Glassmorphism design).
- [x] Create basic APIs with FastAPI (CRUD: Create, Read, Update, Delete).
- [x] Integrate basic Security: Login/Registration with JWT Tokens.
- [x] Use a temporary database (SQLite) for learning purposes.

---

## 🚀 PHASE 2: ADVANCED FEATURES (IN PROGRESS - Chapter 7-10)
*Objective: Deliver a Premium experience for users.*

- [x] **Background Tasks:** Send emails or process reports in the background without freezing the UI.
- [x] **WebSockets (Real-time):** Synchronize data between 2 computers instantly without F5.
- [x] **Monitoring & Best Practices (Chapter 9):** Professional Logging configuration, API performance metrics (Middleware), and Clean Architecture structure.
- [x] **Documentation & Developer Experience (Chapter 10):** Optimize Swagger UI/ReDoc, manage Environment Variables, and complete the final comprehensive exercise (Exercise 3).
---

## 🏗️ PHASE 3: ARCHITECTURE UPGRADE (PRE-LAUNCH)
*Objective: Achieve 100% standard compared to a Backend Engineer capability test.*

- [x] **Database Migration:** Tear down SQLite ➡️ Switch to **PostgreSQL** (Rent database hosting on Supabase or Neon.tech).
- [x] **Clean Architecture:** Refactor current Python code into 3 professional layers (Router ➡️ Service ➡️ Repository).
- [x] **Alembic Migration:** Apply database history management tools (to safely add columns/modify tables later without data loss).
- [x] **RBAC (Role-Based Access Control):** Build an authorization system: `Admin` (system administrator) and `Teacher` (regular teacher).
- [x] **Refresh Token:** Automatically maintain login sessions, preventing teachers from having to re-enter passwords after 30 minutes.

---

## ☁️ PHASE 4: DEPLOYMENT (JOURNEY TO THE OCEAN)
*Objective: Bring the project online 24/7.*

- [x] **Package Backend (Docker):** Write a `Dockerfile` to package the entire Python codebase.
- [x] **Deploy Backend:** Host the Python server on **Render.com** or **Railway.app** (obtain a standard HTTPS API link).
- [x] **Deploy Frontend:** Configure the `VITE_API_BASE_URL` environment variable to point to Render, then host the React UI on **Vercel.com**.
- [x] **Setup CORS:** Specify that ONLY the Vercel domain is allowed to communicate with the Render Backend (security/anti-hacking).

---

## 💎 PHASE 5: BRANDING & POLISH (OPTIONAL)
*Objective: Brand the product with your own copyright.*

- [ ] **Purchase Custom Domain:** Go to GoDaddy or MatBao to buy a domain (e.g., `www.msvan-english.com` or `teacherhub.edu.vn`).
- [ ] **Attach Domain to Vercel:** Point the purchased domain to Vercel to remove the `.vercel.app` suffix.
- [ ] **SSL Security:** Enable the green HTTPS padlock for the custom domain.
- [ ] **Integrate Google Analytics:** Track daily active students/teachers visiting the website.

---
> 💡 **EXPERT ADVICE:** 
> Please save this file. Every time you learn a new concept, you can return here and check `[x]` in the corresponding box. When all boxes are checked, you officially become a professional Full-Stack Developer! 🎓
