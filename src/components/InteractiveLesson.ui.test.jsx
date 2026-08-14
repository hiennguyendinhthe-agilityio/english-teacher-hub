import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import InteractiveLesson from './InteractiveLesson';
import { LanguageProvider } from '../context/LanguageContext';

// Mock matchMedia for Radix UI Tabs used in shadcn
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

window.HTMLElement.prototype.hasPointerCapture = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }) => <div data-testid="tabs">{children}</div>,
  TabsList: ({ children }) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value }) => <button data-testid={`tab-${value}`} onClick={() => {
    // Simple mock to unhide the content
    document.querySelectorAll('[data-tab-content]').forEach(el => el.hidden = true);
    document.getElementById(`content-${value}`).hidden = false;
  }}>{children}</button>,
  TabsContent: ({ children, value }) => <div data-tab-content id={`content-${value}`} hidden={value !== 'vocabulary'}>{children}</div>
}));

const mockLessonData = {
  title: "Unit 1: Test Lesson",
  vocabulary: [
    { word: "activity", transcription: "/ækˈtɪv.ɪ.ti/", type: "(n)", meaning: "hoạt động" }
  ],
  grammar: [
    {
      title: "Grammar Test",
      sections: [
        { subtitle: "Test Subtitle", points: ["Point 1"] }
      ]
    }
  ],
  phonetics: [
    {
      title: "Phonetics Test",
      description: "Test Desc",
      examples: [{ word: "test", transcription: "/test/" }]
    }
  ],
  practice: [
    {
      id: "q1",
      type: "multiple_choice",
      question: "Test question",
      options: ["A", "B", "C", "D"],
      correctAnswer: 1
    }
  ]
};

describe('InteractiveLesson UI/UX Tests (Shadcn version)', () => {
  it('should render all Tabs (shadcn Tabs component) correctly', () => {
    render(
      <LanguageProvider>
        <InteractiveLesson lessonData={mockLessonData} onBack={() => {}} />
      </LanguageProvider>
    );
    
    // Check if the title is rendered with the gradient text class
    const title = screen.getByText('Unit 1: Test Lesson');
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('bg-clip-text');

    // Check if tabs triggers are rendered
    expect(screen.getByTestId('tab-vocabulary')).toBeInTheDocument();
    expect(screen.getByTestId('tab-grammar')).toBeInTheDocument();
    expect(screen.getByTestId('tab-practice')).toBeInTheDocument();
  });

  it('should switch to Practice tab and render shadcn Cards', () => {
    render(
      <LanguageProvider>
        <InteractiveLesson lessonData={mockLessonData} onBack={() => {}} />
      </LanguageProvider>
    );
    
    // Click Practice tab
    const practiceTab = screen.getByTestId('tab-practice');
    fireEvent.click(practiceTab);
    
    // It should render the practice question
    expect(screen.getByText('Test question')).toBeInTheDocument();
    
    // The options should be rendered as Buttons
    const optionB = screen.getByText('B');
    expect(optionB).toBeInTheDocument();
  });

  it('should allow submitting answers and show score', () => {
    render(
      <LanguageProvider>
        <InteractiveLesson lessonData={mockLessonData} onBack={() => {}} />
      </LanguageProvider>
    );
    
    fireEvent.click(screen.getByTestId('tab-practice'));
    
    // Click correct answer 'B' (index 1)
    const optionB = screen.getByText('B');
    fireEvent.click(optionB);
    
    // Click submit
    const submitBtn = screen.getByRole('button', { name: /Submit Answers/i });
    fireEvent.click(submitBtn);
    
    // Should show score
    expect(screen.getByText('Your Score')).toBeInTheDocument();
    // 1 / 1
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});

