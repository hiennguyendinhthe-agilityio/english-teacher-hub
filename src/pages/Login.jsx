import React from 'react';
import { SignIn } from '@clerk/clerk-react';

/**
 * Login page using Clerk's pre-built SignIn component.
 * Clerk handles form validation, error messages, and session management.
 */
export default function Login() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Clerk SignIn Component */}
      <SignIn
        appearance={{
          elements: {
            rootBox: 'w-full max-w-md',
            card: 'bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl',
            headerTitle: 'text-foreground font-extrabold',
            headerSubtitle: 'text-muted-foreground',
            formButtonPrimary:
              'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl font-bold shadow-lg',
            formFieldInput:
              'bg-white dark:bg-zinc-950 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500',
          },
        }}
        redirectUrl="/admin"
        path="/login"
        routing="path"
      />
    </div>
  );
}
