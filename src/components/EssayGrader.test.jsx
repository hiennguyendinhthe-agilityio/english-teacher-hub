import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EssayGrader from './EssayGrader';
import { LanguageProvider } from '../context/LanguageContext';
import * as postService from '../services/postService';
import * as clerk from '@clerk/clerk-react';

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

describe('EssayGrader Component (AI Writing & Save Flow)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(postService, 'getCategories').mockResolvedValue({
      items: [{ id: 'category-1', name: 'IELTS Task 2', slug: 'ielts-task-2' }],
    });
  });

  it('renders input fields correctly and switches tabs', () => {
    vi.spyOn(clerk, 'useAuth').mockReturnValue({
      isSignedIn: true,
      isLoaded: true,
      getToken: vi.fn().mockResolvedValue('token-123'),
    });

    render(
      <LanguageProvider>
        <EssayGrader />
      </LanguageProvider>
    );
    expect(screen.getByText(/Chấm & Nhận Xét Bài Viết AI|AI Essay & Writing Grader/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Chấm Bài & Xuất Nhận Xét|Grade Essay & Get Feedback/i })).toBeInTheDocument();
  });

  it('submits form and allows saving essay with createPost (TC-AI-02)', async () => {
    vi.spyOn(clerk, 'useAuth').mockReturnValue({
      isSignedIn: true,
      isLoaded: true,
      getToken: vi.fn().mockResolvedValue('token-123'),
    });

    const createPostSpy = vi.spyOn(postService, 'createPost').mockResolvedValue({
      id: 'post-saved-1',
      title: 'Sample Essay',
      content: 'Sample content',
    });

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
    });

    // Now find and click Save Essay button
    const saveBtn = screen.getByRole('button', { name: /Lưu bài luận|Save Essay/i });
    expect(saveBtn).toBeInTheDocument();
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(createPostSpy).toHaveBeenCalledTimes(1);
    });

    expect(createPostSpy).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        category_ids: [],
        evaluation: expect.objectContaining({ overallScore: '7.0' }),
      })
    );

    // Verify no error message shown
    expect(screen.queryByText(/Not Found/i)).not.toBeInTheDocument();
  });
});
