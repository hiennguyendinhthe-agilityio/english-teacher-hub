import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import VocabularyMatchingGame from './VocabularyMatchingGame';
import { LanguageProvider } from '../context/LanguageContext';

const mockVocab = [
  { word: 'apple', transcription: '/ˈæp.əl/', type: '(n)', meaning: 'apple' },
  { word: 'book', transcription: '/bʊk/', type: '(n)', meaning: 'book' },
  { word: 'cat', transcription: '/kæt/', type: '(n)', meaning: 'cat' },
];

describe('VocabularyMatchingGame Component', () => {
  it('renders pre-game screen initially and starts when start button is clicked', () => {
    render(
      <LanguageProvider>
        <VocabularyMatchingGame vocabulary={mockVocab} unitTitle="Test Unit" />
      </LanguageProvider>
    );
    expect(screen.getByText(/Ready for the Word Match Challenge/i)).toBeInTheDocument();

    // Start game button
    const startBtn = screen.getByText(/Start Matching/i);
    expect(startBtn).toBeInTheDocument();

    // Click Start
    fireEvent.click(startBtn);

    // Tiles should now appear (apple appears twice: word tile + meaning tile)
    const appleTiles = screen.getAllByText('apple');
    expect(appleTiles.length).toBeGreaterThanOrEqual(1);
  });

  it('allows clicking tiles and resets game', () => {
    render(
      <LanguageProvider>
        <VocabularyMatchingGame vocabulary={mockVocab} unitTitle="Test Unit" />
      </LanguageProvider>
    );
    // Start game
    const startBtn = screen.getByText(/Start Matching/i);
    fireEvent.click(startBtn);

    // Use getAllByText since 'apple' appears as both word and meaning tile
    const appleTiles = screen.getAllByText('apple');
    expect(appleTiles.length).toBeGreaterThan(0);
    fireEvent.click(appleTiles[0]);

    // Check reset button
    const replayBtn = screen.getByText(/Replay/i);
    expect(replayBtn).toBeInTheDocument();
    fireEvent.click(replayBtn);
    // After replay, tiles reset so apple should appear again
    expect(screen.getAllByText(/Ready for the Word Match Challenge|apple/i).length).toBeGreaterThan(0);
  });
});
