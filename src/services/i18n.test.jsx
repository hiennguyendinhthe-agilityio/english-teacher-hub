import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { getStoredLanguage, setStoredLanguage } from './i18n';

function TestComponent() {
  const { lang, setLanguage, t } = useLanguage();
  return (
    <div>
      <span data-testid="current-lang">{lang}</span>
      <span data-testid="translated-title">{t('brandName')}</span>
      <button onClick={() => setLanguage('en')}>Switch to English</button>
      <button onClick={() => setLanguage('vi')}>Switch to Vietnamese</button>
    </div>
  );
}

describe('i18n Multi-Language Context & Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should store and retrieve language code', () => {
    expect(getStoredLanguage()).toBe('vi');
    setStoredLanguage('en');
    expect(getStoredLanguage()).toBe('en');
  });

  it('should toggle language context and render translations', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('current-lang')).toHaveTextContent('vi');
    expect(screen.getByTestId('translated-title')).toHaveTextContent("Ms Van English");

    const enBtn = screen.getByText('Switch to English');
    fireEvent.click(enBtn);

    expect(screen.getByTestId('current-lang')).toHaveTextContent('en');
  });
});
