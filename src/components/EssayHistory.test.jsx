import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EssayHistory from './EssayHistory';
import { LanguageProvider } from '../context/LanguageContext';
import * as postService from '../services/postService';
import * as clerk from '@clerk/clerk-react';

describe('EssayHistory Component (Tabs & Modals Verification Bot)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(clerk, 'useAuth').mockReturnValue({
      isSignedIn: true,
      isLoaded: true,
      getToken: vi.fn().mockResolvedValue('mock-token-abc'),
    });
  });

  it('TC-POST-01: loads and displays essays in "My Saved Essays" tab without 404 error', async () => {
    const mockPosts = [
      {
        id: 'post-101',
        title: 'IELTS Academic Writing Task 2 - AI Ethics',
        content: 'Artificial intelligence is reshaping society in profound ways...',
        created_at: '2026-09-11T08:00:00Z',
        categories: [{ id: 'cat-1', name: 'IELTS Task 2', slug: 'ielts-task-2' }],
      },
    ];

    vi.spyOn(postService, 'getMyPosts').mockResolvedValue({
      items: mockPosts,
      total: 1,
      skip: 0,
      limit: 30,
    });

    render(
      <LanguageProvider>
        <EssayHistory mode="myEssays" />
      </LanguageProvider>
    );

    // Verify loading and then rendered card
    await waitFor(() => {
      expect(screen.getByText('IELTS Academic Writing Task 2 - AI Ethics')).toBeInTheDocument();
      expect(screen.getByText(/Artificial intelligence is reshaping society/i)).toBeInTheDocument();
      expect(screen.getByText('IELTS Task 2')).toBeInTheDocument();
    });

    // Ensure NO "Not Found" error banner is rendered
    expect(screen.queryByText(/Not Found/i)).not.toBeInTheDocument();
  });

  it('TC-POST-02: loads and displays public essays in "Public Feed" tab without 404 error', async () => {
    const mockPublicPosts = [
      {
        id: 'post-202',
        title: 'Community Sample Essay - Environmental Conservation',
        content: 'Preserving natural ecosystems is crucial for future generations...',
        created_at: '2026-09-11T09:00:00Z',
      categories: [{ id: 'cat-2', name: 'Daily English Journal', slug: 'daily-journal' }],
      author_email: 'author@example.com',
      },
    ];

    vi.spyOn(postService, 'getPublicPosts').mockResolvedValue({
      items: mockPublicPosts,
      total: 1,
      skip: 0,
      limit: 30,
    });

    render(
      <LanguageProvider>
        <EssayHistory mode="public" />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Community Sample Essay - Environmental Conservation')).toBeInTheDocument();
      expect(screen.getByText('Daily English Journal')).toBeInTheDocument();
      expect(screen.getByText(/author@example.com/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/Not Found/i)).not.toBeInTheDocument();
  });

  it('TC-POST-03: opens Detail Modal with full essay content when clicking Read Full', async () => {
    const mockDetail = {
      id: 'post-101',
      title: 'Full Essay Detail Modal Test',
      content: 'This is the complete text of the essay showing all paragraphs and conclusions.',
      created_at: '2026-09-11T08:00:00Z',
      categories: [{ id: 'cat-1', name: 'IELTS Task 2' }],
    };

    vi.spyOn(postService, 'getMyPosts').mockResolvedValue({
      items: [mockDetail],
      total: 1,
    });
    vi.spyOn(postService, 'getPostDetail').mockResolvedValue(mockDetail);

    render(
      <LanguageProvider>
        <EssayHistory mode="myEssays" />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Full Essay Detail Modal Test')).toBeInTheDocument();
    });

    const readBtn = screen.getByRole('button', { name: /Xem chi tiết|Đọc toàn văn|Read Full/i });
    fireEvent.click(readBtn);

    await waitFor(() => {
      expect(screen.getByText(/This is the complete text of the essay showing all paragraphs/i)).toBeInTheDocument();
    });
  });
});
