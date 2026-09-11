import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { LanguageProvider } from '../context/LanguageContext';
import * as clerk from '@clerk/clerk-react';

describe('ProtectedRoute Component (RBAC & Navigation Suite)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderWithRouter = (ui, initialEntries = ['/admin']) => {
    return render(
      <LanguageProvider>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/admin" element={ui} />
            <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
            <Route path="/" element={<div data-testid="home-page">Home Page</div>} />
          </Routes>
        </MemoryRouter>
      </LanguageProvider>
    );
  };

  it('TC-AUTH-05: renders children when user is signed in with admin role', () => {
    vi.spyOn(clerk, 'useAuth').mockReturnValue({
      isSignedIn: true,
      isLoaded: true,
      getToken: vi.fn(),
    });
    vi.spyOn(clerk, 'useUser').mockReturnValue({
      user: { id: 'admin-123' },
      isSignedIn: true,
      isLoaded: true,
    });
    localStorage.setItem('db_role', 'admin');

    renderWithRouter(
      <ProtectedRoute requireAdmin={true}>
        <div data-testid="admin-content">Admin Secret Page</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId('admin-content')).toBeInTheDocument();
  });

  it('TC-AUTH-04: shows 403 access denied screen with Back to Home button when user is student', () => {
    vi.spyOn(clerk, 'useAuth').mockReturnValue({
      isSignedIn: true,
      isLoaded: true,
      getToken: vi.fn(),
    });
    vi.spyOn(clerk, 'useUser').mockReturnValue({
      user: { id: 'student-123' },
      isSignedIn: true,
      isLoaded: true,
    });
    localStorage.setItem('db_role', 'student');

    renderWithRouter(
      <ProtectedRoute requireAdmin={true}>
        <div data-testid="admin-content">Admin Secret Page</div>
      </ProtectedRoute>
    );

    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
    expect(screen.getByText(/403/i)).toBeInTheDocument();
    const backHomeLink = screen.getByRole('link', { name: /home|trang chủ/i });
    expect(backHomeLink).toBeInTheDocument();
    expect(backHomeLink.getAttribute('href')).toBe('/');
  });

  it('TC-AUTH-03: redirects guest to /login when not signed in', () => {
    vi.spyOn(clerk, 'useAuth').mockReturnValue({
      isSignedIn: false,
      isLoaded: true,
      getToken: vi.fn(),
    });
    vi.spyOn(clerk, 'useUser').mockReturnValue({
      user: null,
      isSignedIn: false,
      isLoaded: true,
    });

    renderWithRouter(
      <ProtectedRoute requireAdmin={true}>
        <div data-testid="admin-content">Admin Secret Page</div>
      </ProtectedRoute>
    );

    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });
});
