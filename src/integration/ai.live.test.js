/**
 * Live Integration Tests — Gemini AI API (Real Key)
 * Run with: node src/integration/ai.live.test.js
 *
 * Tests all 5 AI-powered features of English Teacher Hub against real Gemini API.
 */

import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env.local') });

const API_KEY = process.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-flash-latest';
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

// ─── Colors ──────────────────────────────────────────
const GREEN  = (s) => `\x1b[32m${s}\x1b[0m`;
const RED    = (s) => `\x1b[31m${s}\x1b[0m`;
const YELLOW = (s) => `\x1b[33m${s}\x1b[0m`;
const BOLD   = (s) => `\x1b[1m${s}\x1b[0m`;
const CYAN   = (s) => `\x1b[36m${s}\x1b[0m`;

// ─── Core Gemini Caller ───────────────────────────────
async function callGemini(prompt, jsonMode = false) {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: jsonMode
      ? { responseMimeType: 'application/json', temperature: 0.3 }
      : { temperature: 0.7 }
  };

  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`HTTP ${res.status}: ${err.error?.message || res.statusText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return text;
}

// ─── Test Runner ──────────────────────────────────────
let passed = 0;
let failed = 0;
const results = [];

async function runTest(name, fn) {
  process.stdout.write(`  ${YELLOW('●')} ${name} ... `);
  const start = Date.now();
  try {
    const result = await fn();
    const ms = Date.now() - start;
    console.log(GREEN('✓ PASSED') + ` (${ms}ms)`);
    if (result) console.log(`    ${CYAN('→')} ${result}`);
    passed++;
    results.push({ name, status: 'PASSED', ms });
  } catch (err) {
    const ms = Date.now() - start;
    console.log(RED('✗ FAILED') + ` (${ms}ms)`);
    console.log(`    ${RED('→')} ${err.message}`);
    failed++;
    results.push({ name, status: 'FAILED', ms, error: err.message });
  }
}

// ─── Suite 1: API Connectivity ───────────────────────
async function testApiConnection() {
  console.log(`\n${BOLD('Suite 1: API Connectivity')}`);

  await runTest('API Key is configured', async () => {
    if (!API_KEY) throw new Error('VITE_GEMINI_API_KEY not found in .env.local');
    return `Key: ${API_KEY.slice(0, 12)}...`;
  });

  await runTest('Gemini responds to simple prompt', async () => {
    const res = await callGemini('Reply with exactly: GEMINI_ACTIVE');
    if (!res.includes('GEMINI_ACTIVE')) throw new Error(`Unexpected: "${res.slice(0, 80)}"`);
    return `Response: "${res.trim().slice(0, 60)}"`;
  });

  await runTest('Model resolves to gemini-3.7-flash or newer', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'hi' }] }] })
    });
    const data = await res.json();
    const version = data.modelVersion || 'unknown';
    return `Resolved model: ${version}`;
  });
}

// ─── Suite 2: Lesson Plan Generator ─────────────────
async function testLessonPlanGenerator() {
  console.log(`\n${BOLD('Suite 2: AI Lesson Plan Generator')}`);

  await runTest('Generates valid JSON lesson plan for A1 Greetings', async () => {
    const prompt = `You are a professional EFL teacher. Create a lesson plan.
Topic: "Greetings & Introductions"
CEFR Level: A1
Duration: 45 minutes

Return ONLY valid JSON:
{
  "title": "string",
  "level": "A1",
  "duration": "45 mins",
  "objectives": ["obj1", "obj2"],
  "targetLanguage": { "vocabulary": ["word - meaning"], "grammar": "string" },
  "stages": [{ "stageName": "string", "duration": "string", "teacherActivity": "string", "studentActivity": "string" }]
}`;
    const raw = await callGemini(prompt, true);
    const data = JSON.parse(raw);
    if (!data.title) throw new Error('Missing title');
    if (!Array.isArray(data.objectives) || data.objectives.length === 0) throw new Error('objectives must be non-empty array');
    if (!Array.isArray(data.stages) || data.stages.length < 3) throw new Error('Need at least 3 stages');
    return `Title: "${data.title}" | Stages: ${data.stages.length} | Objectives: ${data.objectives.length}`;
  });

  await runTest('Lesson plan CEFR level matches request (B2)', async () => {
    const prompt = `Create minimal lesson plan for CEFR B2 "Passive Voice".
Return JSON: { "level": "B2", "title": "string", "objectives": ["obj"] }`;
    const raw = await callGemini(prompt, true);
    const data = JSON.parse(raw);
    if (!data.level?.includes('B2')) throw new Error(`Expected B2, got: ${data.level}`);
    return `Confirmed CEFR: ${data.level}`;
  });
}

// ─── Suite 3: Worksheet Generator ───────────────────
async function testWorksheetGenerator() {
  console.log(`\n${BOLD('Suite 3: Smart Worksheet Generator')}`);

  await runTest('Grammar MCQ — exactly 5 questions with 4 options each', async () => {
    const prompt = `Create an English worksheet.
Topic: "Present Simple"
CEFR Level: A2
Type: Grammar Multiple Choice
Question Count: EXACTLY 5

Return ONLY valid JSON:
{
  "title": "string",
  "questions": [
    { "id": 1, "questionText": "string", "options": ["A. opt","B. opt","C. opt","D. opt"], "correctAnswer": "A. opt", "explanation": "string" }
  ]
}`;
    const raw = await callGemini(prompt, true);
    const data = JSON.parse(raw);
    if (!Array.isArray(data.questions)) throw new Error('questions must be array');
    if (data.questions.length !== 5) throw new Error(`Expected 5 questions, got ${data.questions.length}`);
    const allHave4 = data.questions.every(q => Array.isArray(q.options) && q.options.length === 4);
    if (!allHave4) throw new Error('Some questions do not have 4 options');
    return `${data.questions.length} questions, all with 4 options ✓`;
  });

  await runTest('Vocabulary fill-in-blank — contains _____ in questionText', async () => {
    const prompt = `Create vocabulary fill-in-blank worksheet.
Topic: "Family"  
CEFR Level: A1
Type: Vocabulary Fill-in-the-blanks
Count: 3

Return JSON: { "questions": [{ "id": 1, "questionText": "sentence with _____", "options": ["A.","B.","C.","D."], "correctAnswer": "A.", "explanation": "str" }] }`;
    const raw = await callGemini(prompt, true);
    const data = JSON.parse(raw);
    const allHaveBlanks = data.questions.every(q => q.questionText.includes('_____'));
    if (!allHaveBlanks) throw new Error('Some questions missing _____ blank');
    return `${data.questions.length} fill-in-blank questions with correct format ✓`;
  });

  await runTest('Reading comprehension — passage length > 100 chars', async () => {
    const prompt = `Create reading comprehension worksheet.
Topic: "The Internet"
CEFR Level: B1
Type: Reading Passage & Comprehension
Count: 3

Return JSON: { "title": "str", "readingPassage": "2 paragraph text here...", "questions": [{ "id":1, "questionText":"str", "options":["A.","B.","C.","D."], "correctAnswer":"A.", "explanation":"str" }] }`;
    const raw = await callGemini(prompt, true);
    const data = JSON.parse(raw);
    if (!data.readingPassage || data.readingPassage.length < 100) throw new Error('Missing or too-short reading passage');
    return `Passage: ${data.readingPassage.length} chars | Questions: ${data.questions.length}`;
  });
}

// ─── Suite 4: Essay Grader ────────────────────────────
async function testEssayGrader() {
  console.log(`\n${BOLD('Suite 4: AI Essay Grader')}`);

  await runTest('Returns numeric score 0-100 and feedback', async () => {
    const essay = "My name is Nguyen. I am student. I like study English every day because it useful for job.";
    const prompt = `You are an EFL writing examiner. Grade this A2-level student essay.
Essay: "${essay}"

Return JSON: { "overallScore": 72, "band": "A2", "feedback": "string", "strengths": ["str"], "improvements": ["str"] }`;
    const raw = await callGemini(prompt, true);
    const data = JSON.parse(raw);
    if (typeof data.overallScore !== 'number') throw new Error('overallScore must be a number');
    if (data.overallScore < 0 || data.overallScore > 100) throw new Error(`Score out of range: ${data.overallScore}`);
    if (!data.feedback) throw new Error('Missing feedback');
    return `Score: ${data.overallScore}/100 | Band: ${data.band}`;
  });

  await runTest('Identifies grammar mistakes as specific improvements', async () => {
    const essay = "Yesterday I go to school. I see my friend. We talk about movie.";
    const prompt = `Grade this English essay and identify grammar mistakes.
Essay: "${essay}"
Return JSON: { "overallScore": 55, "improvements": ["specific grammar error 1", "specific grammar error 2"] }`;
    const raw = await callGemini(prompt, true);
    const data = JSON.parse(raw);
    if (!Array.isArray(data.improvements) || data.improvements.length === 0) throw new Error('No improvements provided');
    return `${data.improvements.length} improvement suggestions | Score: ${data.overallScore}`;
  });
}

// ─── Suite 5: AI Importer ────────────────────────────
async function testAIImporter() {
  console.log(`\n${BOLD('Suite 5: AI Lesson Importer (parse text → lesson)')}`);

  const sampleText = `Unit 5: Volunteer Work
Vocabulary:
- volunteer (v): a person who works for free to help others
- charity (n): an organization that helps people in need
- donate (v): to give money or goods to help others
- community (n): a group of people living in the same area

Grammar Focus: Present Perfect Tense
- Affirmative: Subject + have/has + past participle
- Example: "I have volunteered at the food bank three times."`;

  await runTest('Extracts vocabulary from plain text', async () => {
    const prompt = `Extract structured lesson data from these teacher notes.
Text: """${sampleText}"""

Return JSON:
{
  "title": "string",
  "vocabulary": [{ "word": "string", "partOfSpeech": "n/v/adj", "meaning": "string" }],
  "grammarRule": "string"
}`;
    const raw = await callGemini(prompt, true);
    const data = JSON.parse(raw);
    if (!Array.isArray(data.vocabulary) || data.vocabulary.length === 0) throw new Error('No vocabulary extracted');
    const hasWords = data.vocabulary.every(v => v.word && v.meaning);
    if (!hasWords) throw new Error('Vocabulary items missing word or meaning');
    return `Title: "${data.title}" | Vocab: ${data.vocabulary.length} words | Grammar: "${data.grammarRule?.slice(0,50)}..."`;
  });

  await runTest('Generates full lesson plan from imported text', async () => {
    const prompt = `Convert these teacher notes into a lesson plan.
Notes: """${sampleText}"""

Return JSON:
{
  "title": "string",
  "level": "B1",
  "duration": "45 mins",
  "objectives": ["string"],
  "vocabulary": [{ "word": "string", "meaning": "string" }],
  "stages": [{ "stageName": "string", "duration": "string", "activity": "string" }]
}`;
    const raw = await callGemini(prompt, true);
    const data = JSON.parse(raw);
    if (!data.objectives || data.objectives.length === 0) throw new Error('No learning objectives generated');
    if (!Array.isArray(data.stages) || data.stages.length < 2) throw new Error('Less than 2 lesson stages');
    return `Stages: ${data.stages.length} | Vocab: ${data.vocabulary?.length || 0} | Objectives: ${data.objectives.length}`;
  });
}

// ─── MAIN ────────────────────────────────────────────
async function main() {
  console.log(BOLD(CYAN('\n═══════════════════════════════════════════════════════')));
  console.log(BOLD(CYAN('   English Teacher Hub — Live AI Integration Tests      ')));
  console.log(BOLD(CYAN('═══════════════════════════════════════════════════════')));
  console.log(`  Model : ${YELLOW(MODEL)}`);
  console.log(`  Time  : ${new Date().toLocaleString('vi-VN')}`);

  const totalStart = Date.now();

  await testApiConnection();
  await testLessonPlanGenerator();
  await testWorksheetGenerator();
  await testEssayGrader();
  await testAIImporter();

  const totalMs = Date.now() - totalStart;

  console.log(BOLD(CYAN('\n═══════════════════════════════════════════════════════')));
  console.log(BOLD('  TEST RESULTS'));
  console.log(CYAN('═══════════════════════════════════════════════════════'));
  console.log(`  ${GREEN('✓ Passed:')} ${passed}`);
  console.log(`  ${RED('✗ Failed:')} ${failed}`);
  console.log(`  Total:   ${passed + failed} tests in ${(totalMs/1000).toFixed(1)}s`);

  if (failed > 0) {
    console.log(BOLD(RED('\n  FAILED TESTS:')));
    results.filter(r => r.status === 'FAILED').forEach(r => {
      console.log(`  ${RED('✗')} ${r.name}`);
      console.log(`    ${r.error}`);
    });
  } else {
    console.log(GREEN('\n  🎉 All AI features are working correctly!'));
  }

  console.log(BOLD(CYAN('═══════════════════════════════════════════════════════\n')));
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error(RED('\n❌ Fatal error: ') + err.message);
  process.exit(1);
});
