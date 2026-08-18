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
    expect(screen.getByText(/Chinh Phục Tiếng Anh Từng Ngày/i)).toBeInTheDocument();
    expect(screen.getByText(/Góc Học Tập & Luyện Thi/i)).toBeInTheDocument();
  });

  it('navigates to Course Manager tab when clicked and resolves lazy component', async () => {
    render(<App />);
    const courseNavBtns = screen.getAllByText(/Khóa Học/i);
    fireEvent.click(courseNavBtns[0]);

    await waitFor(() => {
      expect(screen.getByText(/Khám phá các Unit bài học tương tác/i)).toBeInTheDocument();
    });
  });

  it('navigates to Flashcard tab when clicked and resolves lazy component', async () => {
    render(<App />);
    const flashcardNavBtns = screen.getAllByText(/Flashcard 3D/i);
    fireEvent.click(flashcardNavBtns[0]);

    await waitFor(() => {
      expect(screen.getByText(/Tạo Thẻ Từ Vựng & Flashcard 3D/i)).toBeInTheDocument();
    });
  });

  it('opens and closes settings modal with lazy loading', async () => {
    render(<App />);
    const settingsBtns = screen.getAllByText(/Cài Đặt/i);
    fireEvent.click(settingsBtns[0]);

    await waitFor(() => {
      expect(screen.getByText(/Google Gemini API Key/i)).toBeInTheDocument();
    });

    const cancelBtn = screen.getByText(/Hủy Bỏ|Cancel/i);
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Google Gemini API Key/i)).not.toBeInTheDocument();
    });
  });
});
