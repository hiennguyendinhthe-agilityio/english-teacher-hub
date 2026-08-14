import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LessonPlanner from './LessonPlanner';
import { LanguageProvider } from '../context/LanguageContext';

vi.mock('../services/aiService', () => ({
  generateLessonPlan: vi.fn().mockResolvedValue({
    title: 'Test Lesson',
    level: 'B2',
    duration: '45 Mins',
    objectives: ['Mục Tiêu Bài Học 1'],
    stages: [{ stageName: 'Sẵn Sàng Cho Lớp Học', duration: '5m', teacherActivity: 'Test', studentActivity: 'Test' }]
  })
}));

// Mock pointer events for Radix UI
if (typeof window !== 'undefined') {
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
}

describe('LessonPlanner Component', () => {
  it('renders form inputs correctly', () => {
    render(
      <LanguageProvider>
        <LessonPlanner />
      </LanguageProvider>
    );
    expect(screen.getByText('AI Soạn Giáo Án Thông Minh')).toBeInTheDocument();
    expect(screen.getByLabelText(/Chủ Đề Bài Học/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tạo Giáo Án Ngay/i })).toBeInTheDocument();
  });

  it('submits form and displays generated lesson plan stages', async () => {
    render(
      <LanguageProvider>
        <LessonPlanner />
      </LanguageProvider>
    );
    
    const topicInput = screen.getByLabelText(/Chủ Đề Bài Học/i);
    fireEvent.change(topicInput, { target: { value: 'Shopping & Clothes' } });

    const submitBtn = screen.getByRole('button', { name: /Tạo Giáo Án Ngay/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/Mục Tiêu Bài Học/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Sẵn Sàng Cho Lớp Học/i).length).toBeGreaterThan(0);
    });
  });
});
