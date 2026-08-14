import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EssayGrader from './EssayGrader';
import { LanguageProvider } from '../context/LanguageContext';

vi.mock('../services/aiService', () => ({
  gradeEssay: vi.fn().mockResolvedValue({
    overallScore: '7.0',
    generalComment: 'Good job on your essay!',
    grammarErrors: [
      { mistake: 'he go', correction: 'he goes', explanation: 'Subject-verb agreement' }
    ],
    vocabularyImprovements: [
      { original: 'good', suggestion: 'exceptional', reason: 'Better tone' }
    ],
    rewrittenEssay: 'Model Answer Essay Content'
  })
}));

if (typeof window !== 'undefined') {
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
}

describe('EssayGrader Component', () => {
  it('renders input fields correctly', () => {
    render(
      <LanguageProvider>
        <EssayGrader />
      </LanguageProvider>
    );
    expect(screen.getByText(/Chấm & Nhận Xét Bài Viết AI|AI Essay & Writing Grader/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Chấm Bài & Xuất Nhận Xét|Grade Essay & Get Feedback/i })).toBeInTheDocument();
  });

  it('submits form and displays feedback', async () => {
    render(
      <LanguageProvider>
        <EssayGrader />
      </LanguageProvider>
    );
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'This is an English essay submission that has more than ten words in total.' } });

    const submitBtn = screen.getByRole('button', { name: /Chấm Bài & Xuất Nhận Xét|Grade Essay & Get Feedback/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Điểm Tổng Thể|Overall Score/i)).toBeInTheDocument();
      expect(screen.getByText('7.0')).toBeInTheDocument();
      expect(screen.getByText(/Model Answer Essay Content/i)).toBeInTheDocument();
    });
  });
});
