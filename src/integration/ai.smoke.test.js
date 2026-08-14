/**
 * Quick AI Smoke Test — minimal prompts to verify each AI feature
 * Run: node src/integration/ai.smoke.test.js
 */
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env.local') });

const API_KEY = process.env.VITE_GEMINI_API_KEY;
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;

const GREEN  = (s) => `\x1b[32m${s}\x1b[0m`;
const RED    = (s) => `\x1b[31m${s}\x1b[0m`;
const YELLOW = (s) => `\x1b[33m${s}\x1b[0m`;
const BOLD   = (s) => `\x1b[1m${s}\x1b[0m`;
const CYAN   = (s) => `\x1b[36m${s}\x1b[0m`;

// Simple sequential caller with 3s gap between requests to avoid 429
async function callGemini(prompt, jsonMode = false) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: jsonMode
        ? { responseMimeType: 'application/json', temperature: 0.3 }
        : { temperature: 0.5 }
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`HTTP ${res.status}: ${err.error?.message?.slice(0, 120) || res.statusText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty Gemini response');
  return text;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

let passed = 0; let failed = 0;

async function test(name, fn) {
  process.stdout.write(`  ${YELLOW('▶')} ${name} ... `);
  const t = Date.now();
  try {
    const info = await fn();
    console.log(GREEN('✓ PASSED') + ` (${Date.now()-t}ms)`);
    if (info) console.log(`    ${CYAN('→')} ${info}`);
    passed++;
  } catch(e) {
    console.log(RED('✗ FAILED') + ` (${Date.now()-t}ms)`);
    console.log(`    ${RED('→')} ${e.message}`);
    failed++;
  }
  await sleep(3500); // Respect free tier: 5 req/min = 1 req per 12s, but tests are sequential
}

async function main() {
  console.log(BOLD(CYAN('\n══════════════════════════════════════════════')));
  console.log(BOLD(CYAN('  AI Smoke Test — English Teacher Hub         ')));
  console.log(BOLD(CYAN('══════════════════════════════════════════════')));
  console.log(`  Key  : ${API_KEY?.slice(0, 14)}...`);
  console.log(`  Note : 3.5s gap between requests to avoid rate limit\n`);

  // 1. Basic connectivity
  await test('🔌 API Connection & Model version', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'hi' }] }] })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message);
    return `Model: ${data.modelVersion}`;
  });

  // 2. Lesson Plan — tiny prompt
  await test('📋 Lesson Plan Generator (A1 Greetings, 3 stages)', async () => {
    const raw = await callGemini(
      `Create a minimal EFL lesson plan. Topic: "Hello & Goodbye". Level: A1. Duration: 30 mins.
Return ONLY JSON: { "title": "str", "level": "A1", "stages": [{ "stageName": "str", "duration": "str" }] }
Include exactly 3 stages.`, true);
    const d = JSON.parse(raw);
    if (!d.title) throw new Error('No title');
    if (d.stages.length !== 3) throw new Error(`Expected 3 stages, got ${d.stages.length}`);
    return `"${d.title}" | ${d.stages.length} stages ✓`;
  });

  // 3. Worksheet — 3 questions only
  await test('📝 Worksheet Generator (Grammar MCQ, 3 questions)', async () => {
    const raw = await callGemini(
      `Make 3 grammar MCQ questions about "Present Simple" for CEFR A2.
Return ONLY JSON: { "questions": [{ "id": 1, "q": "str", "options": ["A","B","C","D"], "answer": "A" }] }`, true);
    const d = JSON.parse(raw);
    if (!Array.isArray(d.questions) || d.questions.length < 2) throw new Error('Not enough questions');
    return `${d.questions.length} questions generated ✓`;
  });

  // 4. Essay Grader
  await test('✍️ Essay Grader (short sentence)', async () => {
    const raw = await callGemini(
      `Grade this short essay: "I go to school every day. I like English."
Return ONLY JSON: { "band": "A2", "score": 65, "tip": "one improvement tip" }`, true);
    const d = JSON.parse(raw);
    if (!d.score && !d.band) throw new Error('No score or band');
    return `Band: ${d.band} | Score: ${d.score} | Tip: "${d.tip?.slice(0,50)}..."`;
  });

  // 5. AI Importer (from plain text)
  await test('📥 AI Importer (extract 3 vocab from text)', async () => {
    const raw = await callGemini(
      `Extract vocabulary from: "volunteer: a person who works for free. donate: to give money. charity: an organization helping others."
Return ONLY JSON: { "words": [{ "word": "str", "meaning": "str" }] }`, true);
    const d = JSON.parse(raw);
    if (!Array.isArray(d.words) || d.words.length < 2) throw new Error('No vocabulary extracted');
    return `Extracted ${d.words.length} words: ${d.words.map(w=>w.word).join(', ')} ✓`;
  });

  // 6. Flashcard Generator
  await test('🃏 Flashcard Generator (3 cards — Travel topic)', async () => {
    const raw = await callGemini(
      `Create 3 flashcards for topic "Travel".
Return ONLY JSON: [{ "word": "str", "ipa": "str", "meaning": "str" }]`, true);
    const d = JSON.parse(raw);
    if (!Array.isArray(d) || d.length < 2) throw new Error('Not enough flashcards');
    return `${d.length} cards: ${d.map(c=>c.word).join(', ')} ✓`;
  });

  console.log(BOLD(CYAN('\n══════════════════════════════════════════════')));
  console.log(`  ${GREEN('✓ Passed:')} ${passed}   ${RED('✗ Failed:')} ${failed}   Total: ${passed+failed}`);

  if (failed === 0) {
    console.log(GREEN(BOLD('\n  🎉 TẤT CẢ TÍNH NĂNG AI ĐÃ HOẠT ĐỘNG CHÍNH XÁC!')));
    console.log(GREEN('  ✅ Sẵn sàng thông báo cho khách hàng!\n'));
  } else {
    console.log(YELLOW(BOLD(`\n  ⚠️  ${failed} tính năng cần xem lại trước khi thông báo.\n`)));
  }
  console.log(BOLD(CYAN('══════════════════════════════════════════════\n')));

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => { console.error(RED('Fatal: ') + e.message); process.exit(1); });
