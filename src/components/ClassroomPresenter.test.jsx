import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ClassroomPresenter from './ClassroomPresenter';
import { LanguageProvider } from '../context/LanguageContext';

const mockLesson = {
  title: 'Unit 1: Presenter Test',
  vocabulary: [
    { word: 'teacher', transcription: '/ˈtiː.tʃər/', type: '(n)', meaning: 'giáo viên' }
  ],
  grammar: [
    {
      title: 'Grammar Section',
      sections: [
        { subtitle: 'Rule 1', points: ['Point A'] }
      ]
    }
  ]
};

describe('ClassroomPresenter Component', () => {
  it('renders title slide initially and allows navigating to vocab slide', () => {
    const handleExit = vi.fn();
    render(
      <LanguageProvider>
        <ClassroomPresenter lessonData={mockLesson} onExit={handleExit} />
      </LanguageProvider>
    );
    
    expect(screen.getAllByText('Unit 1: Presenter Test').length).toBeGreaterThan(0);
    expect(screen.getByText(/TV \/ Projector Mode/i)).toBeInTheDocument();

    // Click Next slide
    const nextBtn = screen.getByText(/Slide Tiếp|Next Slide/i);
    fireEvent.click(nextBtn);

    // Should show the vocabulary word 'teacher'
    expect(screen.getAllByText('teacher').length).toBeGreaterThan(0);
  });

  it('allows toggling laser pointer and exiting', () => {
    const handleExit = vi.fn();
    render(
      <LanguageProvider>
        <ClassroomPresenter lessonData={mockLesson} onExit={handleExit} />
      </LanguageProvider>
    );

    const laserBtn = screen.getByText(/Laser/i);
    fireEvent.click(laserBtn);

    const exitBtn = screen.getByTitle(/Thoát|Exit/i);
    fireEvent.click(exitBtn);
    expect(handleExit).toHaveBeenCalledTimes(1);
  });
});
