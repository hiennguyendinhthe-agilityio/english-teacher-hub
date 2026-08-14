# UI/UX & Design Excellence Rules

These rules enforce strict UI/UX guidelines for Ms Van's English Class platform.

## 1. Allowed Frameworks
- **React** as the core library.
- **Tailwind CSS** for all styling.
- **shadcn/ui** for component primitives.
- **Lucide React** for icons.
- DO NOT invent custom CSS classes or create `.css` files unless absolutely necessary (e.g., specific complex 3D animations that Tailwind cannot handle like Card flips).

## 2. Aesthetics & Premium Feel
Every UI component must look premium and polished. Avoid generic "bootstrap" looks.
- **Glassmorphism**: Utilize `backdrop-blur-sm`, `bg-white/50`, `dark:bg-slate-900/60` for modern overlay aesthetics.
- **Hover Effects**: All interactive elements must have micro-interactions (`hover:-translate-y-1`, `hover:shadow-xl`, `transition-all duration-300`).
- **Entry Animations**: Use Tailwind's animate-in features or custom keyframes (`animate-in fade-in slide-in-from-bottom-4`) when components mount.
- **Color Palette**: Stick to the professional, educational themes (Emerald for success/AI, Indigo/Purple for primary learning features, Amber for writing).

## 3. Layouts & Responsiveness
- Ensure all grids and layouts are responsive.
- Always use breakpoints (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` or `lg:grid-cols-4`).
- Check padding and font sizes across mobile (`sm`), tablet (`md`), and desktop (`lg`) breakpoints.
