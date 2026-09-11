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
    objectives: ['Objective 1'],
    stages: [{ stageName: 'Warm Up', duration: '5m', teacherActivity: 'Test', studentActivity: 'Test' }]
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
    // plannerTitle i18n key → "AI Lesson Planner" in English (default)
    expect(screen.getByText('AI Lesson Planner')).toBeInTheDocument();
    // plannerTopicLabel → "Lesson Topic / Focus Area *"
    expect(screen.getByLabelText(/Lesson Topic/i)).toBeInTheDocument();
    // plannerSubmitBtn → "Generate Lesson Plan"
    expect(screen.getByRole('button', { name: /Generate Lesson Plan/i })).toBeInTheDocument();
  });

  it('submits form and displays generated lesson plan stages', async () => {
    render(
      <LanguageProvider>
        <LessonPlanner />
      </LanguageProvider>
    );

    const topicInput = screen.getByLabelText(/Lesson Topic/i);
    fireEvent.change(topicInput, { target: { value: 'Shopping & Clothes' } });

    const submitBtn = screen.getByRole('button', { name: /Generate Lesson Plan/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      // plannerObjectives i18n → "Learning Objectives"
      expect(screen.getAllByText(/Learning Objectives|Ready for Class/i).length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });
});
