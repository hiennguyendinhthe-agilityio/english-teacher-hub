import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WorksheetGenerator from './WorksheetGenerator';
import { LanguageProvider } from '../context/LanguageContext';

vi.mock('../services/aiService', () => ({
  generateWorksheet: vi.fn().mockImplementation(({ topic, cefrLevel, type, questionCount }) => {
    return Promise.resolve({
      title: `Worksheet: ${topic} (${cefrLevel})`,
      cefrLevel,
      type,
      readingPassage: type.includes('Reading') ? 'Test reading passage text.' : null,
      questions: Array.from({ length: questionCount || 5 }, (_, i) => ({
        id: i + 1,
        question: `Question ${i + 1} prompt`,
        questionText: `Question ${i + 1} with _____ blank`,
        options: ['A. Option 1', 'B. Option 2', 'C. Option 3', 'D. Option 4'],
        answer: 'A. Option 1',
        correctAnswer: 'A. Option 1',
        explanation: 'Test explanation'
      }))
    });
  })
}));

// Mock pointer events for Radix UI
if (typeof window !== 'undefined') {
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  window.matchMedia = window.matchMedia || function() {
    return { matches: false, addListener: function() {}, removeListener: function() {} };
  };
}

describe('WorksheetGenerator Component', () => {
  it('renders input fields and AI suggestion chips correctly', () => {
    render(
      <LanguageProvider>
        <WorksheetGenerator />
      </LanguageProvider>
    );
    expect(screen.getByText(/Tạo Đề Thi & Bài Tập Thông Minh|Smart Worksheet/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Chủ Đề \/ Đề Tài \*|Topic \/ Subject \*/i)).toBeInTheDocument();
    expect(screen.getByText(/Unit 1: My New School/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tạo Đề Bài Tập|Generate Worksheet/i })).toBeInTheDocument();
  });

  it('generates worksheet and allows interactive option selection', async () => {
    render(
      <LanguageProvider>
        <WorksheetGenerator />
      </LanguageProvider>
    );
    
    const submitBtn = screen.getByRole('button', { name: /Tạo Đề Bài Tập|Generate Worksheet/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Đáp Án & Lời Giải Chi Tiết|Teacher's Answer Key/i)).toBeInTheDocument();
      expect(screen.getByText(/Bản Làm Bài \(Học Sinh\)|Student Worksheet/i)).toBeInTheDocument();
    });

    // Test clicking an option
    const optionEls = screen.getAllByText(/Option 1/i);
    expect(optionEls.length).toBeGreaterThan(0);
    fireEvent.click(optionEls[0]);
  });
});
