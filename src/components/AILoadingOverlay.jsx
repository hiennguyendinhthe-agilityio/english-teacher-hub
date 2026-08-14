import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, FileText, CheckCircle, Loader2, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * AILoadingOverlay
 * Shows animated step-by-step progress while AI is generating content.
 * Props:
 *  - isVisible: boolean
 *  - steps: array of { icon, labelKey } (i18n keys) OR { icon, label }
 *  - title: string (heading above steps)
 *  - subtitle: string (sub-heading)
 *  - estimatedSeconds: number (shows countdown hint, default 15)
 */
export default function AILoadingOverlay({
  isVisible,
  steps,
  title,
  subtitle,
  estimatedSeconds = 15,
}) {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isVisible) {
      setActiveStep(0);
      setElapsed(0);
      setDots('');
      return;
    }

    // Advance steps at intervals proportional to estimated time
    const stepInterval = Math.max(1200, (estimatedSeconds * 1000) / (steps.length + 1));
    const stepTimer = setInterval(() => {
      setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
    }, stepInterval);

    // Elapsed counter
    const elapsedTimer = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);

    // Animated dots
    const dotsTimer = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);

    return () => {
      clearInterval(stepTimer);
      clearInterval(elapsedTimer);
      clearInterval(dotsTimer);
    };
  }, [isVisible, steps.length, estimatedSeconds]);

  if (!isVisible) return null;

  const remaining = Math.max(0, estimatedSeconds - elapsed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background border border-border/60 rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex flex-col items-center mb-7">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Sparkles size={28} className="text-white" />
            </div>
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-2xl bg-emerald-500/30 animate-ping" />
          </div>

          <h2 className="text-xl font-bold text-foreground text-center leading-snug">
            {title || t('aiLoadingTitle')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            {subtitle || t('aiLoadingSubtitle')}{dots}
          </p>
        </div>

        {/* Step List */}
        <div className="space-y-3 mb-6">
          {steps.map((step, index) => {
            const Icon = step.icon || Brain;
            const label = step.label || t(step.labelKey) || step.labelKey;
            const isDone = index < activeStep;
            const isActive = index === activeStep;

            return (
              <div
                key={index}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 ${
                  isDone
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40'
                    : isActive
                    ? 'bg-primary/8 border border-primary/20 shadow-sm'
                    : 'bg-secondary/30 border border-transparent opacity-50'
                }`}
              >
                {/* Icon / Spinner / Check */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : isActive
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {isDone ? (
                    <CheckCircle size={16} />
                  ) : isActive ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Icon size={16} />
                  )}
                </div>

                {/* Label */}
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  isDone
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}>
                  {label}
                </span>

                {/* Active badge */}
                {isActive && (
                  <span className="ml-auto text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full animate-pulse">
                    {t('aiLoadingActive') || 'Processing'}
                  </span>
                )}
                {isDone && (
                  <span className="ml-auto text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    {t('aiLoadingDone') || 'Done'}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, (activeStep / Math.max(steps.length - 1, 1)) * 100)}%` }}
          />
        </div>

        {/* Footer hint */}
        <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
          <Zap size={12} className="text-amber-500" />
          {remaining > 0
            ? (t('aiLoadingEstimate') || 'Estimated remaining: ') + `~${remaining}s`
            : (t('aiLoadingAlmost') || 'Almost done, finalizing...')}
        </p>
      </div>
    </div>
  );
}
