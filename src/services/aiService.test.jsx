import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getStoredApiKey,
  setStoredApiKey,
  generateLessonPlan,
  generateWorksheet,
  gradeEssay,
  generateFlashcards
} from './aiService';

describe('aiService - API Storage & Mock Generators', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should get and set API key in localStorage', () => {
    setStoredApiKey('test-gemini-key-123');
    expect(getStoredApiKey()).toBe('test-gemini-key-123');
    setStoredApiKey('');
    // When cleared, returns either env key or empty
    expect(typeof getStoredApiKey()).toBe('string');
  });

  describe('generateWorksheet Logic & Case Accuracy', () => {
    it('Case 1: Reading Passage & Comprehension generates passage and matching questions', async () => {
      const result = await generateWorksheet({
        topic: 'Unit 1: My New School',
        cefrLevel: 'A2',
        type: 'Reading Passage & Comprehension Questions',
        questionCount: 5
      });

      expect(result).toBeDefined();
      expect(result.title).toContain('Unit 1: My New School');
      expect(result.cefrLevel).toBe('A2');
      expect(result.readingPassage).toBeTruthy();
      expect(typeof result.readingPassage).toBe('string');
      expect(result.questions).toHaveLength(5);
      expect(result.questions[0].options).toHaveLength(4);
      expect(result.questions[0].answer).toBeDefined();
      expect(result.questions[0].explanation).toBeDefined();
    });

    it('Case 2: Vocabulary Fill-in-the-blanks generates cloze sentences with _____ blanks and null reading passage', async () => {
      const result = await generateWorksheet({
        topic: 'Environmental Protection',
        cefrLevel: 'B2',
        type: 'Vocabulary Fill-in-the-blanks',
        questionCount: 8
      });

      expect(result).toBeDefined();
      expect(result.readingPassage).toBeNull();
      expect(result.questions).toHaveLength(8);
      
      // Verify cloze blanks exist
      result.questions.forEach((q) => {
        expect(q.questionText).toContain('_____');
        expect(q.options.length).toBeGreaterThanOrEqual(4);
        expect(q.answer).toBeDefined();
      });
    });

    it('Case 3: Grammar Multiple Choice generates structured grammar problems', async () => {
      const result = await generateWorksheet({
        topic: 'Present Perfect Tense',
        cefrLevel: 'B1',
        type: 'Grammar Multiple Choice',
        questionCount: 3
      });

      expect(result).toBeDefined();
      expect(result.readingPassage).toBeNull();
      expect(result.questions).toHaveLength(3);
      expect(result.questions[0].explanation).toBeTruthy();
    });

    it('Case 4: Question count compliance (e.g. 10 questions)', async () => {
      const result = await generateWorksheet({
        topic: 'Space Exploration',
        cefrLevel: 'B2',
        type: 'Reading Passage & Comprehension Questions',
        questionCount: 10
      });

      expect(result.questions).toHaveLength(10);
      expect(result.questions[9].id).toBe(10);
    });
  });

  describe('gradeEssay Dynamic Scoring & Correction Logic', () => {
    it('Case 1: detects basic grammar errors in beginner A2 text and scores appropriately', async () => {
      const sampleA2 = "My favorite pet is dog. He have four legs and max wake up early. I think dog is most best animal.";
      const result = await gradeEssay({
        essayText: sampleA2,
        targetScoreSystem: 'IELTS Writing Band (1.0 - 9.0)'
      });

      expect(result).toBeDefined();
      expect(result.overallBand).toBe('4.5');
      expect(result.grammarCorrections.length).toBeGreaterThan(0);
      
      // Should have caught "have four legs" or "most best"
      const correctedRules = result.grammarCorrections.map(c => c.rule || c.explanation).join(' ');
      expect(correctedRules.length).toBeGreaterThan(10);
      expect(result.rewrittenEssay || result.improvedParagraph).toBeDefined();
    });

    it('Case 2: scores high B2/C1 academic text with advanced band', async () => {
      const sampleB2 = "The rapid proliferation of artificial intelligence in contemporary education has sparked contentious debates among proponents and skeptics.";
      const result = await gradeEssay({
        essayText: sampleB2,
        targetScoreSystem: 'IELTS Writing Band (1.0 - 9.0)'
      });

      expect(result).toBeDefined();
      expect(parseFloat(result.overallBand)).toBeGreaterThanOrEqual(7.0);
      expect(result.scores.lexicalResource).toBe('8.0');
    });
  });

  it('should generate vocabulary flashcards array', async () => {
    const result = await generateFlashcards({
      topic: 'Academic Vocabulary'
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('word');
    expect(result[0]).toHaveProperty('ipa');
    expect(result[0]).toHaveProperty('definition');
  });

  it('should generate fallback mock Lesson Plan when no API key', async () => {
    const result = await generateLessonPlan({
      topic: 'Travel & Airport',
      cefrLevel: 'B1',
      duration: 45
    });

    expect(result).toBeDefined();
    expect(result.title).toContain('Travel & Airport');
    expect(result.level).toBe('B1');
    expect(result.stages.length).toBeGreaterThan(0);
  });
});
