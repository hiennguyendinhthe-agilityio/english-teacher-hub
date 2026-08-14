import React from 'react';
import { Sun, Moon, Key, Globe, Bell } from 'lucide-react';
import { getStoredApiKey } from '../services/aiService';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES } from '../services/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function Header({ isDarkMode, setIsDarkMode, openSettings }) {
  const hasApiKey = Boolean(getStoredApiKey());
  const { lang, setLanguage, t } = useLanguage();

  return (
    <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border px-8 flex items-center justify-between sticky top-0 z-30 w-full shadow-sm">
      {/* Search / Title */}
      <div className="flex-1 min-w-0 pr-4">
        <h3 className="text-lg md:text-xl font-bold text-foreground m-0 truncate">{t('welcomeHeader')}</h3>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 truncate hidden sm:block">{t('welcomeSubheader')}</p>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Language Selector Dropdown */}
        <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full border border-border hover:border-primary/30 transition-colors">
          <Globe size={18} className="text-primary" />
          <select
            value={lang}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent border-none text-foreground font-semibold text-sm outline-none cursor-pointer focus:ring-0"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="text-foreground bg-background">
                {l.flag} {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* API Status Badge */}
        <Button
          variant="outline"
          size="sm"
          onClick={openSettings}
          className={cn(
            "rounded-full h-9 px-4 flex items-center gap-2 hover:-translate-y-0.5 transition-transform",
            hasApiKey 
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20 hover:text-emerald-700" 
              : "bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20 hover:text-amber-700"
          )}
        >
          <Key size={14} />
          <span>{hasApiKey ? t('geminiActive') : t('smartMockActive')}</span>
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full relative text-muted-foreground hover:text-foreground hover:bg-secondary/80"
        >
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
        </Button>

        {/* Theme Switcher */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/80 hover:rotate-12 transition-transform"
          aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} className="text-indigo-500" />}
        </Button>

        <div className="w-[1px] h-6 bg-border mx-1"></div>

        {/* Student Avatar */}
        <div 
          className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md hover:scale-105 transition-transform cursor-pointer"
          title="Học Sinh"
        >
          HS
        </div>
      </div>
    </header>
  );
}
