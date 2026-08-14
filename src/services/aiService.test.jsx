import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getStoredApiKey,
  setStoredApiKey,
  generateLessonPlan,
  generateWorksheet,
  gradeEssay,
  generateFlashcards
} from './aiService';

// ─── Mock geminiRequest so no real API calls are made ──────────────────────
// We intercept at the fetch level since geminiRequest is a module-level helper
const mockGeminiResponse = (payload) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      candidates: [{
        content: {
          parts: [{ text: typeof payload === 'string' ? payload : JSON.stringify(payload) }]
        }
      }],
      modelVersion: 'gemini-3.7-flash'
    })
  });
};

describe('aiService - API Storage & Mock Generators', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    // Reset fetch mock after each test
    global.fetch = undefined;
  });

  it('should get and set API key in localStorage', () => {
    setStoredApiKey('test-gemini-key-123');
    expect(getStoredApiKey()).toBe('test-gemini-key-123');
    setStoredApiKey('');
    expect(typeof getStoredApiKey()).toBe('string');
  });

  describe('generateWorksheet Logic & Case Accuracy', () => {
    it('Case 1: Reading Passage & Comprehension generates passage and matching questions', async () => {
      // Ensure no API key → uses Smart Fallback Engine (no network call)
      localStorage.removeItem('english_teacher_api_key');
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

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
      localStorage.removeItem('english_teacher_api_key');
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      const result = await generateWorksheet({
        topic: 'Environmental Protection',
        cefrLevel: 'B2',
        type: 'Vocabulary Fill-in-the-blanks',
        questionCount: 8
      });

      expect(result).toBeDefined();
      expect(result.readingPassage).toBeNull();
      expect(result.questions).toHaveLength(8);
      result.questions.forEach((q) => {
        expect(q.questionText).toContain('_____');
        expect(q.options.length).toBeGreaterThanOrEqual(4);
        expect(q.answer).toBeDefined();
      });
    });

    it('Case 3: Grammar Multiple Choice generates structured grammar problems', async () => {
      localStorage.removeItem('english_teacher_api_key');
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

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
      localStorage.removeItem('english_teacher_api_key');
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      const result = await generateWorksheet({
        topic: 'Space Exploration',
        cefrLevel: 'B2',
        type: 'Reading Passage & Comprehension Questions',
        questionCount: 10
      });

      expect(result.questions).toHaveLength(10);
      expect(result.questions[9].id).toBe(10);
    });

    it('Case 5: With valid API key — calls Gemini and parses AI response', async () => {
      localStorage.setItem('english_teacher_api_key', 'AIzaSy-fake-test-key');

      const fakeAiResponse = {
        title: 'Worksheet: Space (B2)',
        cefrLevel: 'B2',
        type: 'Grammar Multiple Choice',
        instructions: 'Choose the correct answer.',
        readingPassage: null,
        questions: [
          { id: 1, questionText: 'She _____ to the moon.', options: ['A. go', 'B. goes', 'C. went', 'D. gone'], correctAnswer: 'C. went', explanation: 'Past simple for completed action.' },
          { id: 2, questionText: 'They _____ stars last night.', options: ['A. see', 'B. sees', 'C. saw', 'D. seen'], correctAnswer: 'C. saw', explanation: 'Past simple tense.' },
          { id: 3, questionText: 'He _____ a telescope.', options: ['A. have', 'B. has', 'C. had', 'D. having'], correctAnswer: 'B. has', explanation: 'Present simple 3rd person.' }
        ]
      };

      mockGeminiResponse(fakeAiResponse);

      const result = await generateWorksheet({
        topic: 'Space Exploration',
        cefrLevel: 'B2',
        type: 'Grammar Multiple Choice',
        questionCount: 3
      });

      expect(result).toBeDefined();
      expect(result.title).toBe('Worksheet: Space (B2)');
      expect(result.questions).toHaveLength(3);
      expect(result.questions[0].options).toHaveLength(4);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('gradeEssay Dynamic Scoring & Correction Logic', () => {
    it('Case 1: detects basic grammar errors in beginner A2 text and scores appropriately', async () => {
      localStorage.removeItem('english_teacher_api_key');
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      const sampleA2 = "My favorite pet is dog. He have four legs and max wake up early. I think dog is most best animal.";
      const result = await gradeEssay({
        essayText: sampleA2,
        targetScoreSystem: 'IELTS Writing Band (1.0 - 9.0)'
      });

      expect(result).toBeDefined();
      expect(result.overallBand).toBe('4.5');
      expect(result.grammarCorrections.length).toBeGreaterThan(0);
      const correctedRules = result.grammarCorrections.map(c => c.rule || c.explanation).join(' ');
      expect(correctedRules.length).toBeGreaterThan(10);
      expect(result.rewrittenEssay || result.improvedParagraph).toBeDefined();
    });

    it('Case 2: scores high B2/C1 academic text with advanced band', async () => {
      localStorage.removeItem('english_teacher_api_key');
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      const sampleB2 = "The rapid proliferation of artificial intelligence in contemporary education has sparked contentious debates among proponents and skeptics.";
      const result = await gradeEssay({
        essayText: sampleB2,
        targetScoreSystem: 'IELTS Writing Band (1.0 - 9.0)'
      });

      expect(result).toBeDefined();
      expect(parseFloat(result.overallBand)).toBeGreaterThanOrEqual(7.0);
      expect(result.scores.lexicalResource).toBe('8.0');
    });

    it('Case 3: With valid API key — calls Gemini and returns structured feedback', async () => {
      localStorage.setItem('english_teacher_api_key', 'AIzaSy-fake-test-key');

      const fakeGradeResponse = {
        overallBand: '7.5',
        scores: { taskAchievement: '7.5', coherenceCohesion: '7.0', lexicalResource: '8.0', grammarAccuracy: '7.5' },
        strengths: ['Good vocabulary range', 'Clear arguments'],
        grammarCorrections: [{ original: 'he go', corrected: 'he goes', rule: 'Subject-verb agreement' }],
        improvedParagraph: 'A refined version of the essay with advanced vocabulary.'
      };

      mockGeminiResponse(fakeGradeResponse);

      const result = await gradeEssay({
        essayText: 'Some well written academic text.',
        targetScoreSystem: 'IELTS'
      });

      expect(result.overallBand).toBe('7.5');
      expect(result.grammarCorrections).toHaveLength(1);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  it('should generate vocabulary flashcards array', async () => {
    localStorage.removeItem('english_teacher_api_key');
    vi.stubEnv('VITE_GEMINI_API_KEY', '');

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
    localStorage.removeItem('english_teacher_api_key');
    vi.stubEnv('VITE_GEMINI_API_KEY', '');

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

  it('should generate fallback mock Lesson Plan when no API key', async () => {
    localStorage.setItem('english_teacher_api_key', 'AIzaSy-fake-test-key');

    const fakePlan = {
      title: 'Travel & Airport',
      level: 'B1',
      duration: '45 mins',
      objectives: ['obj1'],
      targetLanguage: { vocabulary: ['word - meaning'], grammar: 'Past Simple' },
      materialsNeeded: ['board'],
      stages: [
        { stageName: 'Warm-up', duration: '5 mins', teacherActivity: 'Intro', studentActivity: 'Listen' },
        { stageName: 'Presentation', duration: '15 mins', teacherActivity: 'Teach', studentActivity: 'Practice' }
      ]
    };

    mockGeminiResponse(fakePlan);

    const result = await generateLessonPlan({
      topic: 'Travel & Airport',
      cefrLevel: 'B1',
      duration: 45
    });

    expect(result.title).toContain('Travel');
    expect(result.stages.length).toBeGreaterThanOrEqual(2);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
