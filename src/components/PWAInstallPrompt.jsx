import React, { useState, useEffect } from 'react';
import { Download, Share2, X, Smartphone, Sparkles, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function PWAInstallPrompt() {
  const { t, isEn } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone mode (PWA installed)
    const isAppStandalone = 
      (typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches) || 
      (typeof window !== 'undefined' && window.navigator?.standalone === true);

    setIsStandalone(isAppStandalone);
    if (isAppStandalone) return;

    // Check if device is iOS (Safari doesn't support beforeinstallprompt)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
    setIsIos(isIosDevice);

    // Listen for beforeinstallprompt event (Chrome, Android, Edge)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after brief delay for smooth entrance
      const dismissed = sessionStorage.getItem('pwa_prompt_dismissed');
      if (!dismissed) {
        setTimeout(() => setIsVisible(true), 2500);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
      console.log('[PWA] App successfully installed!');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Show iOS tip if first visit on iOS and not dismissed
    if (isIosDevice && !sessionStorage.getItem('pwa_prompt_dismissed')) {
      setTimeout(() => setIsVisible(true), 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Trigger native browser install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      // Open iOS step-by-step instruction popup
      setShowIosModal(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (isStandalone || !isVisible) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom PWA Install Banner */}
      <aside 
        aria-label="PWA Install Prompt"
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-[120] animate-in slide-in-from-bottom-5 fade-in duration-300"
      >
        <div className="bg-background/95 backdrop-blur-xl border border-indigo-200/80 dark:border-indigo-900/60 rounded-2xl p-3.5 sm:p-4 shadow-2xl shadow-indigo-500/20 flex items-center justify-between gap-3 text-foreground">
          {/* App Icon & Content */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0">
              <Smartphone size={22} className="animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-xs sm:text-sm tracking-tight flex items-center gap-1.5 truncate">
                <span>{t('pwaInstallTitle')}</span>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded-md">
                  <Sparkles size={10} /> App
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                {t('pwaInstallDesc')}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              id="pwa-install-btn"
              size="sm"
              onClick={handleInstallClick}
              className="rounded-xl h-9 px-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 gap-1.5 cursor-pointer"
            >
              <Download size={14} />
              <span>{t('pwaInstallBtn')}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
              title={t('pwaClose')}
              aria-label="Dismiss Install Prompt"
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      </aside>

      {/* iOS Step-by-Step Installation Modal */}
      {showIosModal && (
        <div className="fixed inset-0 z-[310] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background/95 backdrop-blur-xl border border-border rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <Share2 size={16} />
                </div>
                <h3 className="font-bold text-base">{t('pwaInstallTitle')}</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowIosModal(false)}
                className="rounded-full h-8 w-8"
              >
                <X size={18} />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('pwaIosModalIntro')}
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-3 bg-secondary/60 p-3 rounded-2xl border border-border/50">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <p className="font-semibold text-foreground">{t('pwaIosStep1Title')}</p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">{t('pwaIosStep1Desc')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-secondary/60 p-3 rounded-2xl border border-border/50">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <p className="font-semibold text-foreground">{t('pwaIosStep2Title')}</p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">{t('pwaIosStep2Desc')}</p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setShowIosModal(false)}
              className="w-full rounded-2xl h-11 font-bold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
            >
              <Check size={16} className="mr-1.5" /> {t('pwaIosGotIt')}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
