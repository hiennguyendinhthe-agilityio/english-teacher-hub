import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminDashboard from './AdminDashboard';
import { LanguageProvider } from '../context/LanguageContext';
import * as clerk from '@clerk/clerk-react';
import * as authService from '../services/authService';
import * as postService from '../services/postService';

vi.mock('../services/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn().mockResolvedValue({ forEach: vi.fn() }),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
}));

describe('AdminDashboard Component (Theme, i18n, Responsive, Error States & Pagination)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('db_role', 'admin');

    vi.spyOn(clerk, 'useAuth').mockReturnValue({
      signOut: vi.fn(),
      getToken: vi.fn().mockResolvedValue('fake-token'),
    });

    vi.spyOn(clerk, 'useUser').mockReturnValue({
      user: {
        id: 'admin_test',
        primaryEmailAddress: { emailAddress: 'admin@test.com' },
        publicMetadata: { role: 'admin' },
      },
    });
  });

  const renderDashboard = () => {
    return render(
      <LanguageProvider>
        <AdminDashboard />
      </LanguageProvider>
    );
  };

  it('renders 403 Forbidden error banner when getAllUsers returns 403', async () => {
    const error403 = new Error('Forbidden');
    error403.status = 403;
    vi.spyOn(authService, 'getAllUsers').mockRejectedValueOnce(error403);

    renderDashboard();

    // Switch to Students tab (from either desktop sidebar or mobile drawer)
    const studentsTab = screen.getAllByRole('button', { name: /quản lý học viên|student management/i })[0];
    fireEvent.click(studentsTab);

    // Verify error banner renders with 403 information
    await waitFor(() => {
      expect(screen.getByText(/Lỗi tải dữ liệu \(403\)|Data Loading Error \(403\)/)).toBeInTheDocument();
    });
    expect(screen.getAllByRole('button', { name: /thử lại|retry/i })[0]).toBeInTheDocument();
  });

  it('renders student list with formatted joined date instead of N/A', async () => {
    vi.spyOn(authService, 'getAllUsers').mockResolvedValueOnce({
      items: [
        {
          id: 'u1',
          email: 'student1@test.com',
          role: 'student',
          is_active: true,
          created_at: '2026-09-10T12:00:00Z',
        },
      ],
      total: 1,
      skip: 0,
      limit: 10,
    });

    renderDashboard();

    const studentsTab = screen.getAllByRole('button', { name: /quản lý học viên|student management/i })[0];
    fireEvent.click(studentsTab);

    await waitFor(() => {
      expect(screen.getByText('student1@test.com')).toBeInTheDocument();
    });

    // Joined date should not be 'N/A'
    expect(screen.queryByText('N/A')).not.toBeInTheDocument();
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it('renders pagination controls when there are multiple pages of students', async () => {
    vi.spyOn(authService, 'getAllUsers').mockResolvedValueOnce({
      items: Array.from({ length: 10 }, (_, i) => ({
        id: `u-${i}`,
        email: `student${i}@test.com`,
        role: 'student',
        is_active: true,
        created_at: '2026-09-10T12:00:00Z',
      })),
      total: 25,
      skip: 0,
      limit: 10,
    });

    renderDashboard();

    const studentsTab = screen.getAllByRole('button', { name: /quản lý học viên|student management/i })[0];
    fireEvent.click(studentsTab);

    await waitFor(() => {
      expect(screen.getByText(/1 \/ 3/)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /trang sau|next/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /trang trước|previous/i })).toBeDisabled();
  });

  it('renders 403 Forbidden error banner when getPublicPosts returns 403 in essays tab', async () => {
    const error403 = new Error('Forbidden');
    error403.status = 403;
    vi.spyOn(postService, 'getPublicPosts').mockRejectedValueOnce(error403);

    renderDashboard();

    // Switch to Essays tab
    const essaysTab = screen.getAllByRole('button', { name: /bài nộp học viên|submitted essays/i })[0];
    fireEvent.click(essaysTab);

    await waitFor(() => {
      expect(screen.getByText(/Lỗi tải dữ liệu \(403\)|Data Loading Error \(403\)/)).toBeInTheDocument();
    });
  });

  it('renders essays pagination when total posts exceed limit', async () => {
    vi.spyOn(postService, 'getPublicPosts').mockResolvedValueOnce({
      items: Array.from({ length: 10 }, (_, i) => ({
        id: `p-${i}`,
        title: `Essay Title ${i}`,
        content: `Essay Content ${i}`,
        author_email: `author${i}@test.com`,
        categories: [{ id: 'c1', name: 'IELTS Task 2' }],
        created_at: '2026-09-10T12:00:00Z',
      })),
      total: 15,
      skip: 0,
      limit: 10,
    });

    renderDashboard();

    const essaysTab = screen.getAllByRole('button', { name: /bài nộp học viên|submitted essays/i })[0];
    fireEvent.click(essaysTab);

    await waitFor(() => {
      expect(screen.getByText(/Essay Title 0/)).toBeInTheDocument();
    });

    expect(screen.getByText(/1 \/ 2/)).toBeInTheDocument();
  });

  it('renders theme switcher buttons and toggles theme', async () => {
    renderDashboard();

    const themeButtons = screen.getAllByRole('button', { name: /chuyển sang chế độ|switch to/i });
    expect(themeButtons.length).toBeGreaterThan(0);

    // Click theme toggle button
    fireEvent.click(themeButtons[0]);

    // Check if document class or localStorage changed
    expect(localStorage.getItem('app-theme')).toBeTruthy();
  });

  it('renders language selectors and switches language', async () => {
    renderDashboard();

    const langSelectors = screen.getAllByRole('combobox', { name: /select language/i });
    expect(langSelectors.length).toBeGreaterThan(0);

    // Switch to English
    fireEvent.change(langSelectors[0], { target: { value: 'en' } });

    await waitFor(() => {
      expect(localStorage.getItem('english_teacher_lang')).toBe('en');
    });
  });

  it('toggles mobile drawer when hamburger menu button is clicked', async () => {
    renderDashboard();

    const mobileMenuBtn = screen.getByRole('button', { name: /menu quản trị|admin menu/i });
    expect(mobileMenuBtn).toBeInTheDocument();

    fireEvent.click(mobileMenuBtn);

    // Drawer should become visible
    const asideDrawers = document.querySelectorAll('aside');
    expect(asideDrawers.length).toBe(2); // One desktop sidebar, one mobile drawer
  });
});
