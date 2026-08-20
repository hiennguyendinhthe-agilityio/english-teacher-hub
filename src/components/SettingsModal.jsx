import React, { useState } from 'react';
import { X, Key, Check, Sparkles, ExternalLink } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey } from '../services/aiService';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SettingsModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setStoredApiKey(apiKey);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-lg shadow-2xl border-none ring-1 ring-white/20 animate-in zoom-in-95 duration-200 bg-background/95 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Key size={24} className="text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">{t('aiSettings')}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors">
            <X size={20} />
          </Button>
        </CardHeader>
        
        <CardContent className="pt-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="gemini-api-key" className="text-base font-semibold">Google Gemini API Key</Label>
              <Input
                id="gemini-api-key"
                type="password"
                placeholder="Paste your Gemini API key (AIzaSy...)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono text-sm h-12 px-4 rounded-xl border-border/80 focus-visible:ring-primary"
              />
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                If left empty, the application uses the built-in <strong className="text-foreground">Smart Fallback Engine</strong> with pre-packaged educational datasets.
              </p>
            </div>

            <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl text-sm text-primary-foreground/90 flex items-start gap-3 shadow-inner">
              <Sparkles size={20} className="text-primary shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-primary font-bold block mb-1">Get your free Gemini API Key:</strong>
                You can get a free key from Google AI Studio. 
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-bold ml-1 text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                >
                  Get API Key <ExternalLink size={14} />
                </a>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="px-6 rounded-xl hover:bg-secondary">
                {t('btnCancel')}
              </Button>
              <Button type="submit" className="px-8 rounded-xl shadow-lg shadow-primary/20 font-bold transition-all hover:-translate-y-0.5">
                {saved ? <><Check size={18} className="mr-2" /> Saved!</> : t('btnSave')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
