import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FlashcardBuilder from './FlashcardBuilder';
import { LanguageProvider } from '../context/LanguageContext';

// No longer needs aiService mock as FlashcardBuilder loads data directly from unit files

if (typeof window !== 'undefined') {
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  // Mock SpeechSynthesis
  window.speechSynthesis = { speak: vi.fn() };
}

describe('FlashcardBuilder Component', () => {
  it('renders topic selector correctly', () => {
    render(
      <LanguageProvider>
        <FlashcardBuilder />
      </LanguageProvider>
    );
    expect(screen.getByText('Tạo Thẻ Từ Vựng & Flashcard 3D')).toBeInTheDocument();
    const select = document.querySelector('select');
    expect(select).toBeInTheDocument();
  });

  it('loads Unit 1 vocabulary by default', async () => {
    render(
      <LanguageProvider>
        <FlashcardBuilder />
      </LanguageProvider>
    );

    await waitFor(() => {
      // "activity" appears in the word list sidebar buttons
      const items = screen.getAllByText(/activity/i);
      expect(items.length).toBeGreaterThan(0);
      // Flip buttons and navigation should be present
      const flipBtns = screen.getAllByText(/Lật Thẻ|Bấm để lật/i);
      expect(flipBtns.length).toBeGreaterThan(0);
    });
  });
});

