import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SplashScreen from './SplashScreen';
import { LanguageProvider } from '../context/LanguageContext';

describe('SplashScreen Component', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  it('renders splash screen with brand title on first launch', () => {
    render(
      <LanguageProvider>
        <SplashScreen />
      </LanguageProvider>
    );

    expect(screen.getByText(/Ms Van English/i)).toBeInTheDocument();
    expect(screen.getByText(/Chạm để vào nhanh|Tap anywhere to skip/i)).toBeInTheDocument();
  });

  it('closes automatically after timer expires', () => {
    const handleFinish = vi.fn();
    render(
      <LanguageProvider>
        <SplashScreen onFinish={handleFinish} />
      </LanguageProvider>
    );

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(sessionStorage.getItem('msvan_splash_shown')).toBe('true');
    expect(handleFinish).toHaveBeenCalled();
  });

  it('skips splash screen immediately when tapped/clicked', () => {
    const handleFinish = vi.fn();
    render(
      <LanguageProvider>
        <SplashScreen onFinish={handleFinish} />
      </LanguageProvider>
    );

    const splashContainer = screen.getByText(/Ms Van English/i).closest('div');
    fireEvent.click(splashContainer);

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(sessionStorage.getItem('msvan_splash_shown')).toBe('true');
    expect(handleFinish).toHaveBeenCalled();
  });

  it('does not render if already shown in this session', () => {
    sessionStorage.setItem('msvan_splash_shown', 'true');
    const handleFinish = vi.fn();

    render(
      <LanguageProvider>
        <SplashScreen onFinish={handleFinish} />
      </LanguageProvider>
    );

    expect(screen.queryByText(/Chạm để vào nhanh|Tap anywhere to skip/i)).not.toBeInTheDocument();
    expect(handleFinish).toHaveBeenCalled();
  });
});
