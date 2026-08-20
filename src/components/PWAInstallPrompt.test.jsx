import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PWAInstallPrompt from './PWAInstallPrompt';
import { LanguageProvider } from '../context/LanguageContext';

describe('PWAInstallPrompt Component', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
    // Default matchMedia for non-standalone mode
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('does not render when app is already in standalone mode', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes('standalone'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <LanguageProvider>
        <PWAInstallPrompt />
      </LanguageProvider>
    );

    expect(screen.queryByText(/Cài Đặt Ứng Dụng|Install Mobile App/i)).not.toBeInTheDocument();
  });

  it('renders install prompt when beforeinstallprompt event is fired and timer expires', () => {
    render(
      <LanguageProvider>
        <PWAInstallPrompt />
      </LanguageProvider>
    );

    const mockPromptEvent = new Event('beforeinstallprompt');
    mockPromptEvent.prompt = vi.fn();
    mockPromptEvent.userChoice = Promise.resolve({ outcome: 'accepted' });

    act(() => {
      window.dispatchEvent(mockPromptEvent);
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText(/Cài Đặt Ứng Dụng|Install Mobile App/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cài Đặt Ngay|Install App/i })).toBeInTheDocument();
  });

  it('dismisses install prompt when dismiss button is clicked', () => {
    render(
      <LanguageProvider>
        <PWAInstallPrompt />
      </LanguageProvider>
    );

    const mockPromptEvent = new Event('beforeinstallprompt');
    mockPromptEvent.prompt = vi.fn();
    mockPromptEvent.userChoice = Promise.resolve({ outcome: 'dismissed' });

    act(() => {
      window.dispatchEvent(mockPromptEvent);
      vi.advanceTimersByTime(3000);
    });

    const dismissBtn = screen.getByRole('button', { name: /Dismiss Install Prompt/i });
    expect(dismissBtn).toBeInTheDocument();

    fireEvent.click(dismissBtn);

    expect(screen.queryByText(/Cài Đặt Ứng Dụng|Install Mobile App/i)).not.toBeInTheDocument();
    expect(sessionStorage.getItem('pwa_prompt_dismissed')).toBe('true');
  });
});
