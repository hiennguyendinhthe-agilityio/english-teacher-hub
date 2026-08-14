import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import VocabularyMatchingGame from './VocabularyMatchingGame';
import { LanguageProvider } from '../context/LanguageContext';

const mockVocab = [
  { word: 'apple', transcription: '/ˈæp.əl/', type: '(n)', meaning: 'quả táo' },
  { word: 'book', transcription: '/bʊk/', type: '(n)', meaning: 'quyển sách' },
  { word: 'cat', transcription: '/kæt/', type: '(n)', meaning: 'con mèo' },
];

describe('VocabularyMatchingGame Component', () => {
  it('renders pre-game screen initially and starts when start button is clicked', () => {
    render(
      <LanguageProvider>
        <VocabularyMatchingGame vocabulary={mockVocab} unitTitle="Test Unit" />
      </LanguageProvider>
    );
    expect(screen.getByText(/Sẵn Sàng Thử Thách Ghép Từ|Ready for the Word Match Challenge/i)).toBeInTheDocument();
    
    // Start game button
    const startBtn = screen.getByText(/Bắt Đầu Ghép Từ|Start Matching/i);
    expect(startBtn).toBeInTheDocument();

    // Click Start
    fireEvent.click(startBtn);

    // Tiles should now appear
    expect(screen.getByText('apple')).toBeInTheDocument();
    expect(screen.getByText('quả táo')).toBeInTheDocument();
  });

  it('allows clicking tiles and resets game', () => {
    render(
      <LanguageProvider>
        <VocabularyMatchingGame vocabulary={mockVocab} unitTitle="Test Unit" />
      </LanguageProvider>
    );
    // Start game
    const startBtn = screen.getByText(/Bắt Đầu Ghép Từ|Start Matching/i);
    fireEvent.click(startBtn);

    const appleTile = screen.getByText('apple');
    fireEvent.click(appleTile);
    
    // Check reset button
    const replayBtn = screen.getByText(/Chơi Lại|Replay/i);
    expect(replayBtn).toBeInTheDocument();
    fireEvent.click(replayBtn);
    expect(screen.getByText('apple')).toBeInTheDocument();
  });
});
