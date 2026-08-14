import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ClassroomTimer from './ClassroomTimer';
import { LanguageProvider } from '../context/LanguageContext';

describe('ClassroomTimer Component', () => {
  it('renders timer correctly and shows default 5m preset', () => {
    render(
      <LanguageProvider>
        <ClassroomTimer />
      </LanguageProvider>
    );
    expect(screen.getByText('Classroom Timer')).toBeInTheDocument();
    // Default 5 mins: 05:00
    expect(screen.getByText('05:00')).toBeInTheDocument();
    // Start button
    expect(screen.getByText(/Bắt Đầu|Start/i)).toBeInTheDocument();
  });

  it('allows switching to stopwatch mode', () => {
    render(
      <LanguageProvider>
        <ClassroomTimer />
      </LanguageProvider>
    );
    const stopwatchBtn = screen.getByText(/Bấm Giờ|Stopwatch/i);
    fireEvent.click(stopwatchBtn);
    expect(screen.getByText('00:00')).toBeInTheDocument();
  });

  it('changes time when preset is clicked', () => {
    render(
      <LanguageProvider>
        <ClassroomTimer />
      </LanguageProvider>
    );
    const preset1m = screen.getByText('1m');
    fireEvent.click(preset1m);
    expect(screen.getByText('01:00')).toBeInTheDocument();
  });
});
