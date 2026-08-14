import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  GraduationCap, 
  Sparkles, 
  Settings,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  UploadCloud,
  Flame,
  Star
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function Sidebar({ activeTab, setActiveTab, openSettings, isCollapsed, setIsCollapsed }) {
  const { t } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { 
      id: 'courseManager', 
      label: t('navCourses'), 
      icon: FolderOpen, 
      badge: 'HOT',
      badgeStyle: 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-extrabold shadow-sm' 
    },
    { 
      id: 'flashcard', 
      label: t('navFlashcard'), 
      icon: Sparkles, 
      badge: 'TOP',
      badgeStyle: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-extrabold shadow-sm'
    },
    { id: 'worksheet', label: t('navWorksheet'), icon: FileText },
    { id: 'essay', label: t('navEssay'), icon: GraduationCap },
    { id: 'aiImporter', label: t('impTitle'), icon: UploadCloud },
  ];

  return (
    <aside 
      className={cn(
        "flex flex-col h-full bg-secondary/30 backdrop-blur-xl border-r border-border transition-all duration-300 relative z-20 shrink-0 select-none",
        isCollapsed ? "w-[78px]" : "w-[280px]"
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-border min-h-[76px]">
        {!isCollapsed && (
          <div className="flex items-center gap-3 min-w-0 animate-in fade-in duration-300">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <BookOpen size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-extrabold leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 whitespace-nowrap">
                {t('brandName')}
              </h2>
              <p className="text-[11px] text-muted-foreground font-medium truncate mt-0.5">
                {t('brandSubtitle')}
              </p>
            </div>
          </div>
        )}

        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "rounded-full h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 shrink-0",
            isCollapsed && "mx-auto"
          )}
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3">
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full h-11 relative overflow-hidden transition-all group rounded-xl",
                    isCollapsed ? "p-0 flex items-center justify-center" : "flex items-center justify-between px-3.5",
                    isActive 
                      ? "bg-primary/10 text-primary font-bold shadow-sm" 
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground font-medium"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  {isActive && !isCollapsed && (
                    <div className="absolute left-0 top-[15%] bottom-[15%] w-1 bg-primary rounded-r-md" />
                  )}
                  
                  {isCollapsed ? (
                    <Icon 
                      size={20} 
                      className={cn(
                        "transition-transform",
                        isActive ? "text-primary scale-110" : "text-muted-foreground group-hover:text-foreground"
                      )} 
                    />
                  ) : (
                    <>
                      <div className="flex items-center min-w-0 flex-1">
                        <Icon 
                          size={19} 
                          className={cn(
                            "shrink-0 transition-transform mr-3",
                            isActive ? "text-primary scale-110" : "text-muted-foreground group-hover:text-foreground"
                          )} 
                        />
                        <span className="text-left text-sm whitespace-nowrap">
                          {item.label}
                        </span>
                      </div>
                      
                      {item.badge && (
                        <span 
                          className={cn(
                            "shrink-0 text-[9px] px-1.5 py-0.5 rounded-md tracking-wider uppercase leading-none ml-2",
                            item.badgeStyle
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Settings Footer */}
      <div className="p-3 border-t border-border bg-secondary/10">
        <Button
          variant="ghost"
          onClick={openSettings}
          className={cn(
            "w-full h-11 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-xl",
            isCollapsed ? "p-0 flex items-center justify-center" : "flex items-center justify-start px-3.5"
          )}
          title={isCollapsed ? t('aiSettings') : undefined}
        >
          <Settings size={19} className={cn(!isCollapsed && "mr-3")} />
          {!isCollapsed && <span className="text-sm font-medium">{t('aiSettings')}</span>}
        </Button>
      </div>
    </aside>
  );
}
