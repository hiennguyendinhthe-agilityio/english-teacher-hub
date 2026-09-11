import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Globe, Sun, Moon, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES } from '../services/i18n';
import { useThemeStore } from '../store/useThemeStore';
import { Button } from '@/components/ui/button';

/**
 * Login page using Clerk's pre-built SignIn component with full dark mode parity,
 * top navigation bar with "Back to Home", Language switcher, and Theme toggle.
 */
export default function Login() {
  const [searchParams] = useSearchParams();
  const targetRedirect = searchParams.get('redirect_url') || '/';
  const { t, lang, setLanguage } = useLanguage();
  const { isDarkMode, toggleTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col justify-between items-center p-4 sm:p-6 relative overflow-x-hidden text-foreground">
      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/15 dark:bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/15 dark:bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Top Header Navigation */}
      <div className="w-full max-w-4xl flex items-center justify-between z-20 pt-2 pb-6">
        {/* Back to Home Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-foreground bg-white/70 dark:bg-zinc-900/70 hover:bg-white dark:hover:bg-zinc-800 border border-border/70 backdrop-blur-md shadow-xs transition-all hover:-translate-x-0.5 cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>{t('authBackToHome')}</span>
        </Link>

        {/* Language & Theme Controls */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="flex items-center bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-border/70 text-xs shadow-xs">
            <Globe size={13} className="text-primary mr-1 shrink-0" />
            <select
              value={lang}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent border-none text-foreground font-semibold text-xs outline-none cursor-pointer"
              aria-label="Select Language"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="text-foreground bg-background">
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Switcher */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full h-8 w-8 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-border/70 text-muted-foreground hover:text-foreground cursor-pointer shadow-xs"
            aria-label={isDarkMode ? t('adminThemeLight') : t('adminThemeDark')}
          >
            {isDarkMode ? <Sun size={15} className="text-amber-500" /> : <Moon size={15} className="text-indigo-500" />}
          </Button>
        </div>
      </div>

      {/* Main Form Center Box */}
      <div className="w-full flex-1 flex flex-col items-center justify-center z-10 py-4">
        {/* Brand Greeting */}
        <div className="text-center mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold shadow-lg shadow-indigo-500/25 mx-auto mb-3">
            <Sparkles size={22} className="text-amber-300" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            {t('brandName')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {t('brandSubtitle')}
          </p>
        </div>

        {/* Clerk SignIn Component with Enhanced Glassmorphism */}
        <SignIn
          appearance={{
            elements: {
              rootBox: 'w-full max-w-md mx-auto',
              card: 'bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-border/60 shadow-2xl rounded-3xl overflow-hidden',
              headerTitle: 'text-foreground font-extrabold text-xl',
              headerSubtitle: 'text-muted-foreground text-sm',
              socialButtonsBlockButton:
                'bg-secondary/60 hover:bg-secondary border border-border text-foreground rounded-xl transition-all',
              socialButtonsBlockButtonText: 'text-foreground font-semibold text-xs',
              dividerLine: 'bg-border',
              dividerText: 'text-muted-foreground text-xs uppercase font-medium',
              formFieldLabel: 'text-foreground font-semibold text-xs',
              formFieldInput:
                'bg-slate-50 dark:bg-zinc-950 border border-border rounded-xl text-foreground focus:ring-2 focus:ring-indigo-500 text-sm',
              formButtonPrimary:
                'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 py-2.5',
              footer: '!bg-slate-50/90 dark:!bg-zinc-900/90 !border-t !border-border/40',
              footerAction: '!bg-transparent',
              footerActionText: 'text-muted-foreground text-xs',
              footerActionLink: 'text-primary font-bold hover:text-primary/80',
              footerPages: 'hidden',
              identityPreviewText: 'text-foreground',
              identityPreviewEditButton: 'text-primary',
            },
          }}
          fallbackRedirectUrl={targetRedirect}
          signUpFallbackRedirectUrl={targetRedirect}
          forceRedirectUrl={searchParams.get('redirect_url') ? targetRedirect : undefined}
          path="/login"
          routing="path"
        />
      </div>

      {/* Footer Copyright */}
      <div className="text-center text-[11px] text-muted-foreground py-3 z-10">
        &copy; {new Date().getFullYear()} {t('brandName')}. All rights reserved.
      </div>
    </div>
  );
}
