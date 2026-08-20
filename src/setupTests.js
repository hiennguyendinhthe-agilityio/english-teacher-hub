import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { useAIStore } from './store/useAIStore';

// Mock window.matchMedia for JSDOM
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

afterEach(() => {
  useAIStore.getState().clearAllHistory();
  // Also reset the form parameters to their defaults if they were changed during tests
  useAIStore.setState({
    plannerParams: {
      topic: 'Job Interview Preparation',
      cefrLevel: 'B2',
      ageGroup: 'Adults',
      duration: '45',
      method: 'PPP Framework'
    },
    worksheetParams: {
      topic: 'Unit 1: My New School',
      cefrLevel: 'A2',
      type: 'Vocabulary Fill-in-the-blanks',
      questionCount: 5,
    },
    essayParams: {
      essayText: '',
      gradingScale: 'IELTS Writing Band (1.0 - 9.0)'
    },
    importerParams: {
      text: ''
    }
  });
});
