import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import App from './App';

vi.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }) => <>{children}</>,
  useAuth: () => ({ currentUser: null, login: vi.fn(), logout: vi.fn() })
}));

describe('App Main Component with Lazy Loading & Suspense', () => {
  it('renders Dashboard by default with Student Hub branding', () => {
    render(<App />);
    expect(screen.getByText(/Master English Step-by-Step/i)).toBeInTheDocument();
    expect(screen.getByText(/Learning & Practice Hub/i)).toBeInTheDocument();
  });

  it('navigates to Course Manager tab when clicked and resolves lazy component', async () => {
    render(<App />);
    const courseNavBtns = screen.getAllByText(/Units & Lessons/i);
    fireEvent.click(courseNavBtns[0]);

    await waitFor(() => {
      expect(screen.getByText(/Explore interactive Units/i)).toBeInTheDocument();
    });
  });

  it('navigates to Flashcard tab when clicked and resolves lazy component', async () => {
    render(<App />);
    const flashcardNavBtns = screen.getAllByText(/Flashcard 3D/i);
    fireEvent.click(flashcardNavBtns[0]);

    await waitFor(() => {
      expect(screen.getByText(/Create interactive, 3D flipping/i)).toBeInTheDocument();
    });
  });

  it('opens and closes settings modal with lazy loading', async () => {
    render(<App />);
    const settingsBtns = screen.getAllByText(/Settings/i);
    fireEvent.click(settingsBtns[0]);

    await waitFor(() => {
      expect(screen.getByText(/Google Gemini API Key/i)).toBeInTheDocument();
    });

    const cancelBtn = screen.getByText(/Cancel/i);
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Google Gemini API Key/i)).not.toBeInTheDocument();
    });
  });

  it('fades out native splash screen element when app mounts', () => {
    const splash = document.createElement('div');
    splash.id = 'app-splash';
    document.body.appendChild(splash);

    vi.useFakeTimers();
    render(<App />);

    vi.advanceTimersByTime(800);
    expect(splash.classList.contains('splash-fade-out')).toBe(true);

    vi.advanceTimersByTime(500);
    expect(splash.style.display).toBe('none');

    splash.remove();
    vi.useRealTimers();
  });
});
