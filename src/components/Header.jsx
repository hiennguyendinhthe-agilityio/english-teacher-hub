import React from 'react';
import { Sun, Moon, Key, Globe, Bell, Menu } from 'lucide-react';
import { getStoredApiKey } from '../services/aiService';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES } from '../services/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function Header({ isDarkMode, setIsDarkMode, openSettings, onOpenMobileMenu }) {
  const hasApiKey = Boolean(getStoredApiKey());
  const { lang, setLanguage, t } = useLanguage();

  return (
    <header className="h-[calc(4rem+env(safe-area-inset-top,0px))] sm:h-20 pt-[env(safe-area-inset-top,0px)] sm:pt-0 bg-background/85 backdrop-blur-xl border-b border-border px-3 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 w-full shadow-xs transition-all">
      {/* Left: Mobile Menu Toggle & Page Title */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 pr-2 sm:pr-4">
        {/* Hamburger Menu button for Mobile (< 768px) */}
        <Button
          id="mobile-menu-toggle-btn"
          variant="ghost"
          size="icon"
          onClick={onOpenMobileMenu}
          className="md:hidden rounded-xl h-10 w-10 text-foreground hover:bg-secondary shrink-0 cursor-pointer"
          aria-label="Open Mobile Menu"
        >
          <Menu size={22} />
        </Button>

        {/* Title & Subtitle */}
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-foreground m-0 truncate leading-tight">
            {t('welcomeHeader')}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 truncate hidden md:block">
            {t('welcomeSubheader')}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Language Selector Dropdown */}
        <div className="flex items-center gap-1 sm:gap-2 bg-secondary/60 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-border/80 hover:border-primary/40 transition-colors">
          <Globe size={15} className="text-primary shrink-0" />
          <select
            value={lang}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent border-none text-foreground font-semibold text-xs sm:text-sm outline-none cursor-pointer focus:ring-0"
            aria-label="Select Language"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="text-foreground bg-background">
                {l.flag} {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* API Status Badge (Icon on mobile, Text on tablet/desktop) */}
        <Button
          variant="outline"
          size="sm"
          onClick={openSettings}
          title={hasApiKey ? t('geminiActive') : t('smartMockActive')}
          className={cn(
            "rounded-full h-8 sm:h-9 px-2.5 sm:px-4 flex items-center gap-1.5 hover:-translate-y-0.5 transition-transform text-xs font-semibold cursor-pointer",
            hasApiKey 
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20 hover:text-emerald-700" 
              : "bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20 hover:text-amber-700"
          )}
        >
          <Key size={14} className="shrink-0" />
          <span className="hidden sm:inline truncate max-w-[130px]">{hasApiKey ? t('geminiActive') : t('smartMockActive')}</span>
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-8 w-8 sm:h-9 sm:w-9 relative text-muted-foreground hover:text-foreground hover:bg-secondary/80 hidden sm:flex cursor-pointer"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
        </Button>

        {/* Theme Switcher */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="rounded-full h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground hover:bg-secondary/80 hover:rotate-12 transition-transform cursor-pointer"
          aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-500" />}
        </Button>

        <div className="w-[1px] h-5 sm:h-6 bg-border mx-0.5 sm:mx-1 hidden sm:block"></div>

        {/* Student Avatar */}
        <div 
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-md hover:scale-105 transition-transform cursor-pointer shrink-0"
          title="Học Sinh"
        >
          HS
        </div>
      </div>
    </header>
  );
}
