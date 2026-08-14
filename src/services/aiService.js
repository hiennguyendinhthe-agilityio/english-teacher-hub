/**
 * English Teacher Hub - AI Service & Smart Fallback Engine
 */

export const getStoredApiKey = () => {
  const stored = localStorage.getItem('english_teacher_api_key');
  if (stored && stored.trim()) return stored.trim();
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
      return import.meta.env.VITE_GEMINI_API_KEY.trim();
    }
  } catch (e) {}
  return '';
};

export const setStoredApiKey = (key) => {
  if (key) {
    localStorage.setItem('english_teacher_api_key', key.trim());
  } else {
    localStorage.removeItem('english_teacher_api_key');
  }
};

/**
 * Generate AI Lesson Plan
 */
export const generateLessonPlan = async ({ topic, cefrLevel, ageGroup, duration, method }) => {
  const apiKey = getStoredApiKey();

  if (!apiKey) {
    // Return Smart Fallback Generator
    return getMockLessonPlan({ topic, cefrLevel, ageGroup, duration, method });
  }

  try {
    const prompt = `You are a professional EFL/ESL Master Teacher. Create a detailed, highly structured Lesson Plan following the ${method || 'PPP (Presentation, Practice, Production)'} framework.
Topic: "${topic}"
CEFR Level: ${cefrLevel}
Target Students: ${ageGroup}
Lesson Duration: ${duration} minutes

Return JSON format with the following structure:
{
  "title": "Lesson Plan Title",
  "level": "${cefrLevel}",
  "duration": "${duration} mins",
  "objectives": ["Objective 1", "Objective 2", "Objective 3"],
  "targetLanguage": {
    "vocabulary": ["word1 (IPA) - meaning", "word2 (IPA) - meaning", "word3 (IPA) - meaning"],
    "grammar": "Key grammar target"
  },
  "materialsNeeded": ["Material 1", "Material 2"],
  "stages": [
    {
      "stageName": "1. Warm-up & Lead-in",
      "duration": "5-10 mins",
      "teacherActivity": "Description of teacher instructions",
      "studentActivity": "Description of student response"
    },
    {
      "stageName": "2. Presentation",
      "duration": "10-15 mins",
      "teacherActivity": "Description of teacher instructions",
      "studentActivity": "Description of student response"
    },
    {
      "stageName": "3. Controlled Practice",
      "duration": "10-15 mins",
      "teacherActivity": "Description of teacher instructions",
      "studentActivity": "Description of student response"
    },
    {
      "stageName": "4. Production & Free Practice",
      "duration": "10-15 mins",
      "teacherActivity": "Description of teacher instructions",
      "studentActivity": "Description of student response"
    },
    {
      "stageName": "5. Wrap-up & Homework",
      "duration": "5 mins",
      "teacherActivity": "Description of homework",
      "studentActivity": "Description of wrap-up"
    }
  ]
}`;

    const headers = { 'Content-Type': 'application/json' };
    if (apiKey.startsWith('AQ.') || apiKey.startsWith('ya29.')) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    headers['x-goog-api-key'] = apiKey;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.statusText}`);
    }

    const data = await res.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(responseText);
  } catch (err) {
    console.warn("AI API request failed, falling back to Smart Mock Engine:", err.message);
    return getMockLessonPlan({ topic, cefrLevel, ageGroup, duration, method });
  }
};

/**
 * Generate Smart Worksheet
 */
export const generateWorksheet = async ({ topic, cefrLevel, type, questionCount = 5 }) => {
  const apiKey = getStoredApiKey();

  if (!apiKey) {
    return getMockWorksheet({ topic, cefrLevel, type, questionCount });
  }

  const isReading = type.toLowerCase().includes('reading') || type === 'reading';
  const isVocab = type.toLowerCase().includes('vocabulary') || type.toLowerCase().includes('fill-in') || type === 'vocab';

  let formatRequirements = '';
  if (isReading) {
    formatRequirements = `
- "readingPassage": MUST provide a coherent, engaging 2-3 paragraph reading text on the topic "${topic}" written strictly at CEFR ${cefrLevel} level.
- "questions": MUST generate EXACTLY ${questionCount} reading comprehension questions based on the passage (testing main idea, specific details, vocabulary in context, and inferences).`;
  } else if (isVocab) {
    formatRequirements = `
- "readingPassage": MUST be null.
- "questions": MUST generate EXACTLY ${questionCount} vocabulary fill-in-the-blank questions where each "questionText" is a complete sentence containing a blank "_____" testing key vocabulary related to "${topic}" at CEFR ${cefrLevel} level.`;
  } else {
    formatRequirements = `
- "readingPassage": MUST be null.
- "questions": MUST generate EXACTLY ${questionCount} grammar multiple-choice questions testing grammar rules suitable for CEFR ${cefrLevel} (e.g. tenses, conditionals, passives, prepositions) within sentences contextualized around "${topic}".`;
  }

  const prompt = `You are a certified EFL/ESL curriculum designer. Create a complete, flawless English worksheet.
STRICT PARAMETERS:
1. Topic: "${topic}"
2. CEFR Level: ${cefrLevel}
3. Worksheet Type: ${type}
4. Question Count: EXACTLY ${questionCount} questions (no more, no less)

FORMAT RULES:
${formatRequirements}

Each question MUST have exactly 4 options ("A. ...", "B. ...", "C. ...", "D. ..."), a clearly specified "correctAnswer", and a concise "explanation".

Return ONLY valid JSON matching this schema:
{
  "title": "Worksheet: ${topic} (${cefrLevel})",
  "cefrLevel": "${cefrLevel}",
  "type": "${type}",
  "instructions": "Clear student instructions in English",
  "readingPassage": ${isReading ? '"...passage text..."' : 'null'},
  "questions": [
    {
      "id": 1,
      "questionText": "Question 1 prompt...",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      "correctAnswer": "A. Option 1",
      "explanation": "Explanation why this is correct..."
    }
  ]
}`;

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (apiKey.startsWith('AQ.') || apiKey.startsWith('ya29.')) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    headers['x-goog-api-key'] = apiKey;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.3 }
      })
    });

    if (!res.ok) throw new Error(`Gemini API returned ${res.status}`);
    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("Empty AI response");

    const parsed = JSON.parse(rawText);

    return {
      title: parsed.title || `Worksheet: ${topic} (${cefrLevel})`,
      cefrLevel: parsed.cefrLevel || cefrLevel,
      type: parsed.type || type,
      instructions: parsed.instructions || "Answer all questions below.",
      readingPassage: isReading ? (parsed.readingPassage || null) : null,
      questions: (parsed.questions || []).map((q, idx) => ({
        id: q.id || idx + 1,
        question: q.question || q.questionText || `Question ${idx + 1}`,
        questionText: q.questionText || q.question || `Question ${idx + 1}`,
        options: Array.isArray(q.options) && q.options.length > 0 ? q.options : ['A. Option 1', 'B. Option 2', 'C. Option 3', 'D. Option 4'],
        answer: q.correctAnswer || q.answer || (q.options ? q.options[0] : 'A'),
        correctAnswer: q.correctAnswer || q.answer || (q.options ? q.options[0] : 'A'),
        explanation: q.explanation || "Correct answer based on curriculum grammar & vocabulary rules."
      }))
    };
  } catch (err) {
    console.warn("AI API request fallback to Smart Deterministic Engine:", err.message);
    return getMockWorksheet({ topic, cefrLevel, type, questionCount });
  }
};

/**
 * Grade Student Essay
 */
export const gradeEssay = async ({ essayText, targetScoreSystem = 'IELTS' }) => {
  const apiKey = getStoredApiKey();

  if (!apiKey) {
    return getMockEssayFeedback(essayText);
  }

  try {
    const prompt = `You are an expert English examiner (${targetScoreSystem}). Grade the following student essay:
"${essayText}"

Return JSON:
{
  "overallBand": "6.5",
  "scores": {
    "taskAchievement": "6.5",
    "coherenceCohesion": "6.0",
    "lexicalResource": "7.0",
    "grammarAccuracy": "6.5"
  },
  "strengths": ["Strength 1", "Strength 2"],
  "grammarCorrections": [
    {
      "original": "Incorrect phrase",
      "corrected": "Correct phrase",
      "rule": "Explanation of grammar rule"
    }
  ],
  "improvedParagraph": "Rewritten upgraded paragraph with advanced vocabulary"
}`;

    const headers = { 'Content-Type': 'application/json' };
    if (apiKey.startsWith('AQ.') || apiKey.startsWith('ya29.')) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    headers['x-goog-api-key'] = apiKey;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!res.ok) throw new Error("API failed");
    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(raw);
    return {
      overallBand: parsed.overallBand || parsed.overallScore || '6.5',
      overallScore: parsed.overallScore || parsed.overallBand || '6.5',
      scores: parsed.scores || {
        taskAchievement: '6.5',
        coherenceCohesion: '6.5',
        lexicalResource: '6.5',
        grammarAccuracy: '6.5'
      },
      generalComment: parsed.generalComment || "Detailed writing evaluation completed.",
      strengths: parsed.strengths || ["Clear structure and effective communication."],
      grammarErrors: parsed.grammarErrors || parsed.grammarCorrections || [],
      grammarCorrections: parsed.grammarCorrections || parsed.grammarErrors || [],
      vocabularyImprovements: parsed.vocabularyImprovements || parsed.vocabularySuggestions || [],
      vocabularySuggestions: parsed.vocabularySuggestions || parsed.vocabularyImprovements || [],
      rewrittenEssay: parsed.rewrittenEssay || parsed.improvedParagraph || "Polished version available.",
      improvedParagraph: parsed.improvedParagraph || parsed.rewrittenEssay || "Polished version available."
    };
  } catch (err) {
    return getMockEssayFeedback(essayText);
  }
};

/**
 * Generate Flashcards
 */
export const generateFlashcards = async ({ topic, wordCount = 6 }) => {
  const apiKey = getStoredApiKey();

  if (!apiKey) {
    return getMockFlashcards(topic);
  }

  try {
    const prompt = `Generate a set of ${wordCount} vocabulary flashcards for topic "${topic}".
Return JSON array:
[
  {
    "word": "Word",
    "ipa": "/.../",
    "partOfSpeech": "noun",
    "definition": "Definition in English",
    "vietnameseMeaning": "Nghĩa tiếng Việt",
    "exampleSentence": "Example sentence using the word."
  }
]`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!res.ok) throw new Error("API Error");
    const data = await res.json();
    return JSON.parse(data.candidates[0].content.parts[0].text);
  } catch (err) {
    return getMockFlashcards(topic);
  }
};

/**
 * Generate Lesson Data From Raw Text (AI Importer)
 */
export const generateLessonFromText = async (rawText) => {
  const apiKey = getStoredApiKey();

  if (!apiKey) {
    return getMockLessonFromText(rawText);
  }

  try {
    const prompt = `You are an expert EFL/ESL curriculum designer. Analyze the following raw lesson text or notes provided by a teacher and extract the key information into a highly structured JSON format for an interactive lesson. 

Raw Text:
"${rawText}"

Return JSON format with the EXACT following structure:
{
  "title": "A concise, engaging title for the lesson",
  "vocabulary": [
    {
      "word": "The vocabulary word (e.g., activity)",
      "type": "Part of speech (e.g., noun, verb, adj)",
      "transcription": "IPA transcription (e.g., /ækˈtɪv.ɪ.ti/)",
      "meaning": "Meaning in Vietnamese"
    }
  ],
  "grammar": [
    {
      "title": "Grammar topic title (e.g., 1. The present simple)",
      "sections": [
        {
          "subtitle": "Subtitle (e.g., Cách dùng:)",
          "points": ["Usage point 1", "Usage point 2"],
          "formulas": [
            { "type": "Khẳng định (+)", "text": "Formula text" }
          ],
          "tags": ["tag1", "tag2"]
        }
      ]
    }
  ],
  "phonetics": [
    {
      "title": "Phonetics topic title (e.g., Sounds /aʊ/ and /əʊ/)",
      "description": "Short explanation",
      "examples": [
        { "word": "example word", "transcription": "IPA transcription" }
      ]
    }
  ],
  "practice": [
    {
      "id": 1,
      "question": "A multiple choice practice question based on the vocabulary or grammar from the text.",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}

Note: For "correctAnswer", provide the index (0, 1, 2, or 3) of the correct option. Generate at least 3-5 practice questions if possible. Extract as much vocabulary and grammar as you can find in the text.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!res.ok) throw new Error("API Error");
    const data = await res.json();
    return JSON.parse(data.candidates[0].content.parts[0].text);
  } catch (err) {
    console.warn("AI API request failed, falling back to Smart Mock Engine:", err.message);
    return getMockLessonFromText(rawText);
  }
};


/* --- SMART FALLBACK MOCK ENGINE --- */

function getMockLessonPlan({ topic, cefrLevel, duration = 45 }) {
  return {
    title: `Mastering ${topic || 'English Communication'} (${cefrLevel || 'B1'})`,
    level: cefrLevel || 'B1',
    duration: `${duration} mins`,
    objectives: [
      `Students will be able to confidently use key vocabulary related to ${topic || 'the topic'}.`,
      `Students will practice forming accurate spoken and written sentences.`,
      `Students will engage in practical role-play communication scenarios.`
    ],
    targetLanguage: {
      vocabulary: [
        `Essential Term 1 (/ɪˈsen.ʃəl/) - Primary key concept`,
        `Polite Phrase 2 (/pəˈlaɪt/) - Useful conversational expression`,
        `Collocation 3 (/ˌkɒl.əˈkeɪ.ʃən/) - Common word pairing`
      ],
      grammar: `Using conditional sentences and polite modal verbs (would like to, could you please)`
    },
    materialsNeeded: [`Worksheet handout`, `Flashcards set`, `Projector / Audio speaker`],
    stages: [
      {
        stageName: "1. Warm-up & Lead-in",
        duration: "5 mins",
        teacherActivity: `Shows engaging pictures of ${topic || 'the topic'} and asks open-ended discussion questions.`,
        studentActivity: "Brainstorming words in pairs and sharing experiences with the class."
      },
      {
        stageName: "2. Presentation (Target Language)",
        duration: "10 mins",
        teacherActivity: "Introduces key vocabulary using Flashcards and models target grammar structure on board.",
        studentActivity: "Repeats pronunciation after teacher (choral drill) and takes notes."
      },
      {
        stageName: "3. Controlled Practice",
        duration: "15 mins",
        teacherActivity: "Distributes fill-in-the-blanks worksheet and monitors student pairs.",
        studentActivity: "Completes grammar exercise in pairs and checks answers with partner."
      },
      {
        stageName: "4. Production (Role-Play Task)",
        duration: "12 mins",
        teacherActivity: "Sets up a realistic role-play scenario and acts as facilitator.",
        studentActivity: "Pairs up to perform role-play dialogue using target vocabulary."
      },
      {
        stageName: "5. Feedback & Homework",
        duration: "3 mins",
        teacherActivity: "Highlights good language use on board and assigns practice writing homework.",
        studentActivity: "Asks final questions and records homework assignment."
      }
    ]
  };
}

function getMockWorksheet({ topic, cefrLevel = 'B1', type = 'Reading Passage & Comprehension Questions', questionCount = 5 }) {
  const isReading = type.toLowerCase().includes('reading') || type === 'reading';
  const isVocab = type.toLowerCase().includes('vocabulary') || type.toLowerCase().includes('fill-in') || type === 'vocab';
  const isGrammar = type.toLowerCase().includes('grammar') || type === 'grammar';

  const cleanTopic = topic || 'General English';

  // 1. Generate Passage if Reading type
  let readingPassage = null;
  if (isReading) {
    readingPassage = `Learning about "${cleanTopic}" plays a crucial role in modern English communication. In today's interconnected world, mastering the vocabulary and core concepts of this subject allows students to express complex ideas with confidence and precision. Furthermore, engaging actively with real-world materials helps learners retain language structures naturally and communicate effectively with global peers.`;
  }

  // 2. Generate Exact Number of Questions (questionCount) matching Type & Topic & CEFR
  const generatedQuestions = [];

  for (let i = 1; i <= questionCount; i++) {
    if (isVocab) {
      // Vocabulary Cloze questions
      const vocabBank = [
        { word: 'essential', blank: `Understanding the core concepts of ${cleanTopic} is _____ for every student.`, opts: ['essential', 'hesitant', 'reluctant', 'careless'], ans: 'essential', exp: "'Essential' means absolutely necessary or extremely important." },
        { word: 'participate', blank: `All students are encouraged to _____ actively in discussions about ${cleanTopic}.`, opts: ['participate', 'hesitate', 'complain', 'postpone'], ans: 'participate', exp: "'Participate in' is the correct verb collocation for taking part in an activity." },
        { word: 'creative', blank: `Developing _____ solutions helps resolve issues related to ${cleanTopic}.`, opts: ['creative', 'tedious', 'clumsy', 'hostile'], ans: 'creative', exp: "'Creative' (adj) describes producing new and original ideas." },
        { word: 'equipment', blank: `Modern _____ is required to conduct proper research on ${cleanTopic}.`, opts: ['equipment', 'argument', 'accident', 'disaster'], ans: 'equipment', exp: "'Equipment' refers to the set of necessary tools or items." },
        { word: 'opportunity', blank: `This program provides a valuable _____ to learn more about ${cleanTopic}.`, opts: ['opportunity', 'obstacle', 'tragedy', 'crisis'], ans: 'opportunity', exp: "'Opportunity' means a set of circumstances that makes it possible to do something." },
        { word: 'environment', blank: `We should protect our natural _____ while studying ${cleanTopic}.`, opts: ['environment', 'punishment', 'discomfort', 'loneliness'], ans: 'environment', exp: "'Environment' refers to the natural surroundings." },
        { word: 'international', blank: `This project involves _____ cooperation between different schools.`, opts: ['international', 'hopeless', 'narrow', 'reckless'], ans: 'international', exp: "'International' means involving two or more countries." },
        { word: 'improve', blank: `Consistent daily practice will greatly _____ your knowledge of ${cleanTopic}.`, opts: ['improve', 'destroy', 'ignore', 'forget'], ans: 'improve', exp: "'Improve' means to make or become better." },
        { word: 'confidence', blank: `Speaking in public helps students build _____ and self-esteem.`, opts: ['confidence', 'confusion', 'weakness', 'doubt'], ans: 'confidence', exp: "'Confidence' means the feeling or belief that one can rely on someone or something." },
        { word: 'cooperate', blank: `Team members must _____ closely to complete the assignment on ${cleanTopic}.`, opts: ['cooperate', 'compete', 'disagree', 'quarrel'], ans: 'cooperate', exp: "'Cooperate' means to work together toward the same end." }
      ];

      const item = vocabBank[(i - 1) % vocabBank.length];
      generatedQuestions.push({
        id: i,
        question: `Question ${i}: Fill in the blank with the best vocabulary word: "${item.blank}"`,
        questionText: item.blank,
        options: item.opts.map((opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt}`),
        answer: `A. ${item.ans}`,
        correctAnswer: `A. ${item.ans}`,
        explanation: item.exp
      });
    } else if (isGrammar) {
      // Grammar Multiple Choice matching CEFR Level
      const grammarBank = [
        { q: `Which sentence about "${cleanTopic}" is grammatically correct?`, opts: [`She has studied ${cleanTopic} since 2022.`, `She study ${cleanTopic} since 2022.`, `She is study ${cleanTopic} since 2022.`, `She studied ${cleanTopic} since 2022.`], ans: `A. She has studied ${cleanTopic} since 2022.`, exp: "Present Perfect ('has studied + since + time') is used for an action that started in the past and continues to the present." },
        { q: `If we _____ more attention to ${cleanTopic}, we will achieve better results.`, opts: [`pay`, `paid`, `will pay`, `would pay`], ans: `A. pay`, exp: "First Conditional structure: If + Present Simple (pay), will + Verb." },
        { q: `The research paper on ${cleanTopic} was _____ by the professor yesterday.`, opts: [`published`, `publish`, `publishing`, `publishes`], ans: `A. published`, exp: "Passive voice in past simple requires 'was/were + past participle (V3/ed)'." },
        { q: `Neither the teacher nor the students _____ satisfied with the initial results.`, opts: [`were`, `was`, `is`, `be`], ans: `A. were`, exp: "Subject-verb agreement: with 'neither... nor...', the verb agrees with the closer subject ('the students' -> 'were')." },
        { q: `By the time the conference on ${cleanTopic} started, they _____ their presentation.`, opts: [`had completed`, `have completed`, `completed`, `were completing`], ans: `A. had completed`, exp: "Past Perfect ('had completed') describes an action completed before another past event ('started')." },
        { q: `Students are look forward to _____ more practical workshops on ${cleanTopic}.`, opts: [`attending`, `attend`, `attended`, `attendance`], ans: `A. attending`, exp: "'Look forward to + V-ing' is the standard gerund pattern." },
        { q: `Rarely _____ such dedication when researching ${cleanTopic}.`, opts: [`have we seen`, `we have seen`, `we saw`, `saw we`], ans: `A. have we seen`, exp: "Negative adverb inversion: 'Rarely + auxiliary verb (have) + subject (we) + main verb'." },
        { q: `The more you practice ${cleanTopic}, _____ you will become.`, opts: [`the more proficient`, `more proficient`, `the most proficient`, `proficienter`], ans: `A. the more proficient`, exp: "Double comparative structure: 'The more..., the more...'." },
        { q: `It is essential that every student _____ the safety rules before starting.`, opts: [`follow`, `follows`, `followed`, `following`], ans: `A. follow`, exp: "Subjunctive mood after 'It is essential that...': use bare infinitive (follow)." },
        { q: `He denied _____ the confidential notes about ${cleanTopic}.`, opts: [`leaking`, `to leak`, `leak`, `leaked`], ans: `A. leaking`, exp: "The verb 'deny' is followed by a gerund (V-ing)." }
      ];

      const item = grammarBank[(i - 1) % grammarBank.length];
      generatedQuestions.push({
        id: i,
        question: `Question ${i}: ${item.q}`,
        questionText: item.q,
        options: item.opts,
        answer: item.ans,
        correctAnswer: item.ans,
        explanation: item.exp
      });
    } else {
      // Reading Comprehension Questions
      const readingQuestions = [
        { q: `What is the primary objective of studying "${cleanTopic}" according to the passage?`, opts: [`A. To build confidence and express complex ideas effectively.`, `B. To memorize grammar rules without speaking.`, `C. To replace native languages entirely.`, `D. To avoid international communication.`], ans: `A. To build confidence and express complex ideas effectively.`, exp: "Stated directly in the passage: studying this subject allows learners to express complex ideas with confidence." },
        { q: `The author mentions that active engagement with real-world materials helps learners:`, opts: [`A. Retain language structures naturally and communicate with global peers.`, `B. Finish tests quickly without studying.`, `C. Memorize vocabulary lists only.`, `D. Avoid discussing complex topics.`], ans: `A. Retain language structures naturally and communicate with global peers.`, exp: "The passage explicitly highlights that active engagement fosters natural language retention." },
        { q: `Which of the following words in the passage is closest in meaning to "crucial"?`, opts: [`A. Extremely important / vital`, `B. Unnecessary`, `C. Complicated`, `D. Optional`], ans: `A. Extremely important / vital`, exp: "'Crucial' means of great importance, especially in the success of something." },
        { q: `What can be inferred about the future importance of "${cleanTopic}"?`, opts: [`A. It will remain valuable as global connectivity continues to grow.`, `B. It will become obsolete in a few years.`, `C. Only language experts need to study it.`, `D. It is only useful for written exams.`], ans: `A. It will remain valuable as global connectivity continues to grow.`, exp: "The text emphasizes international connectivity and ongoing real-world communication." },
        { q: `What is the overall tone of the author regarding "${cleanTopic}"?`, opts: [`A. Encouraging and constructive`, `B. Skeptical and critical`, `C. Sarcastic`, `D. Indifferent`], ans: `A. Encouraging and constructive`, exp: "The author advocates for active engagement and positive communication outcomes." },
        { q: `According to the passage, communicating with global peers requires:`, opts: [`A. Core concepts and confidence in expression.`, `B. Perfect native accent from day one.`, `C. Traveling to every country.`, `D. Memorizing every word in the dictionary.`], ans: `A. Core concepts and confidence in expression.`, exp: "Emphasized in the introduction paragraph." },
        { q: `Which title would be the most fitting alternative for this reading passage?`, opts: [`A. The Power of Mastering ${cleanTopic} in Modern Communication`, `B. The History of Ancient Languages`, `C. Difficult Grammar Challenges`, `D. Why Exams Are Hard`], ans: `A. The Power of Mastering ${cleanTopic} in Modern Communication`, exp: "A comprehensive title summarizing the main focus of the text." },
        { q: `The phrase "interconnected world" in the text suggests that:`, opts: [`A. People from different countries interact more frequently than ever.`, `B. Computers have replaced human communication.`, `C. Travel is no longer necessary.`, `D. Communication is becoming more isolated.`], ans: `A. People from different countries interact more frequently than ever.`, exp: "Interconnected describes globally linked societies." },
        { q: `How does the author support the main argument?`, opts: [`A. By explaining practical benefits of vocabulary and real-world practice.`, `B. By presenting statistical survey charts.`, `C. By criticizing traditional teaching methods.`, `D. By quoting historical poems.`], ans: `A. By explaining practical benefits of vocabulary and real-world practice.`, exp: "The text details how vocabulary mastery and active engagement create effective communication." },
        { q: `In summary, mastering "${cleanTopic}" enables students to:`, opts: [`A. Unlock international opportunities and express ideas with clarity.`, `B. Pass one exam and stop learning.`, `C. Speak only in formal lectures.`, `D. Avoid writing tasks.`], ans: `A. Unlock international opportunities and express ideas with clarity.`, exp: "Matches the concluding takeaway of the text." }
      ];

      const item = readingQuestions[(i - 1) % readingQuestions.length];
      generatedQuestions.push({
        id: i,
        question: `Question ${i}: ${item.q}`,
        questionText: item.q,
        options: item.opts,
        answer: item.ans,
        correctAnswer: item.ans,
        explanation: item.exp
      });
    }
  }

  return {
    title: `Worksheet: ${cleanTopic} (${cefrLevel})`,
    cefrLevel,
    type,
    instructions: isReading 
      ? "Read the passage carefully and answer all comprehension questions below."
      : isVocab 
      ? "Fill in the blanks with the correct vocabulary word from the given options."
      : "Choose the grammatically correct option for each question.",
    readingPassage,
    questions: generatedQuestions
  };
}

function getMockEssayFeedback(essayText) {
  const text = essayText || '';
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Dynamic Grammar Error Detection
  const grammarCorrections = [];
  const lower = text.toLowerCase();

  if (lower.includes('he go') || lower.includes('she go') || lower.includes('it go')) {
    grammarCorrections.push({
      mistake: 'he/she/it go',
      correction: 'he/she/it goes',
      original: 'he go',
      corrected: 'he goes',
      explanation: 'Third-person singular subject requires the verb ending "-s/-es" in Present Simple tense.',
      rule: 'Third-person singular subject requires "-s/-es" in Present Simple.'
    });
  }
  if (lower.includes('have four legs') || lower.includes('it have') || lower.includes('he have') || lower.includes('she have')) {
    grammarCorrections.push({
      mistake: 'it/he/she have',
      correction: 'it/he/she has',
      original: 'it have',
      corrected: 'it has',
      explanation: 'Use "has" for singular pronouns (he, she, it) instead of "have".',
      rule: 'Singular third-person subject takes "has".'
    });
  }
  if (lower.includes('wake up') && (lower.includes('max wake up') || lower.includes('he wake up'))) {
    grammarCorrections.push({
      mistake: 'wake up',
      correction: 'wakes up',
      original: 'wake up',
      corrected: 'wakes up',
      explanation: 'Singular subject requires "wakes up" in Present Simple.',
      rule: 'Subject-verb agreement.'
    });
  }
  if (lower.includes('most best')) {
    grammarCorrections.push({
      mistake: 'most best',
      correction: 'the best',
      original: 'most best',
      corrected: 'the best',
      explanation: '"Best" is already the superlative form of "good". Double superlatives ("most best") are grammatically incorrect.',
      rule: 'Avoid double superlatives.'
    });
  }
  if (lower.includes('am loving')) {
    grammarCorrections.push({
      mistake: 'am loving',
      correction: 'love',
      original: 'am loving',
      corrected: 'love',
      explanation: '"Love" is a stative verb and is rarely used in continuous (-ing) tenses for general preferences.',
      rule: 'Stative verbs do not take continuous forms.'
    });
  }
  if (lower.includes('which make')) {
    grammarCorrections.push({
      mistake: 'which make',
      correction: 'which makes',
      original: 'which make',
      corrected: 'which makes',
      explanation: 'Relative pronoun referring to a singular situation/clause takes a singular verb ("which makes").',
      rule: 'Singular relative clause agreement.'
    });
  }
  if (lower.includes('i thinks')) {
    grammarCorrections.push({
      mistake: 'I thinks',
      correction: 'I think',
      original: 'I thinks',
      corrected: 'I think',
      explanation: 'First-person pronoun "I" takes base verb form "think" without "-s".',
      rule: 'First-person subject agreement.'
    });
  }

  // Fallback if no specific common error matched
  if (grammarCorrections.length === 0) {
    grammarCorrections.push({
      mistake: text.slice(0, 30) || 'sample sentence',
      correction: 'Well-structured sentence with minor punctuation polish',
      original: text.slice(0, 30) || 'sample sentence',
      corrected: 'Polished phrasing with enhanced clarity',
      explanation: 'Ensure complex sentences maintain clear parallel structures and accurate comma placement.',
      rule: 'Parallel sentence structure and punctuation.'
    });
  }

  // 2. Dynamic Vocabulary Upgrades
  const vocabularyImprovements = [
    { original: 'very cute', suggestion: 'exceptionally endearing / charming', reason: 'Upgrades informal repetitive "very" with precise descriptive adjectives.' },
    { original: 'good', suggestion: 'advantageous / beneficial / commendable', reason: 'Replaces basic general adjective with academic and professional vocabulary.' },
    { original: 'a lot of', suggestion: 'a multitude of / numerous / substantial', reason: 'Provides formal phrasing suitable for academic essays.' }
  ];

  // 3. Score calculation
  let band = '6.5';
  let task = '6.5';
  let coh = '6.5';
  let lex = '7.0';
  let gra = '6.0';

  if (grammarCorrections.length >= 3 || lower.includes('have four legs') || lower.includes('most best')) {
    band = '4.5';
    task = '5.0';
    coh = '4.5';
    lex = '4.5';
    gra = '4.0';
  } else if (lower.includes('proliferation') || lower.includes('contentious') || lower.includes('proponents')) {
    band = '7.5';
    task = '8.0';
    coh = '7.5';
    lex = '8.0';
    gra = '7.5';
  } else if (lower.includes('advantages and disadvantages') || lower.includes('on the one hand')) {
    band = '6.0';
    task = '6.5';
    coh = '6.5';
    lex = '6.0';
    gra = '5.5';
  }

  return {
    overallBand: band,
    overallScore: band,
    scores: {
      taskAchievement: task,
      coherenceCohesion: coh,
      lexicalResource: lex,
      grammarAccuracy: gra
    },
    generalComment: `The essay demonstrates clear communication with ${wordCount} words. By addressing specific subject-verb agreements and incorporating higher-level descriptive synonyms, the writing can advance to the next CEFR band.`,
    strengths: [
      `Clear communicative intent and logical paragraph development.`,
      `Effective topic engagement with relevant contextual supporting details.`
    ],
    grammarErrors: grammarCorrections,
    grammarCorrections,
    vocabularyImprovements,
    vocabularySuggestions: vocabularyImprovements,
    rewrittenEssay: `Furthermore, effective communication in English substantially enhances academic and professional prospects. By replacing colloquial expressions with advanced vocabulary and ensuring strict subject-verb concord, learners articulate complex ideas with remarkable fluency and precision.`
  };
}

export const DEFAULT_FLASHCARDS = [
  {
    word: "activity",
    ipa: "/ækˈtɪv.ɪ.ti/",
    partOfSpeech: "noun",
    definition: "Something that you do for enjoyment, interest, or as part of a process.",
    vietnameseMeaning: "hoạt động",
    exampleSentence: "Outdoor activities are very popular in this school."
  },
  {
    word: "art",
    ipa: "/ɑːt/",
    partOfSpeech: "noun",
    definition: "The making or expression of things that are beautiful, especially paintings or drawings.",
    vietnameseMeaning: "nghệ thuật",
    exampleSentence: "She loves drawing and painting in the art class."
  },
  {
    word: "boarding school",
    ipa: "/ˈbɔː.dɪŋ skuːl/",
    partOfSpeech: "noun",
    definition: "A school where students live and study during the school term.",
    vietnameseMeaning: "trường nội trú",
    exampleSentence: "Many students live in the dormitory at this boarding school."
  },
  {
    word: "classmate",
    ipa: "/ˈklɑːs.meɪt/",
    partOfSpeech: "noun",
    definition: "A member of the same class in a school or college.",
    vietnameseMeaning: "bạn cùng lớp",
    exampleSentence: "Nick is my classmate; we study English together."
  },
  {
    word: "compass",
    ipa: "/ˈkʌm.pəs/",
    partOfSpeech: "noun",
    definition: "An instrument for drawing circles or finding directions.",
    vietnameseMeaning: "com-pa",
    exampleSentence: "You need a compass and a ruler for geometry class."
  },
  {
    word: "creative",
    ipa: "/kriˈeɪ.tɪv/",
    partOfSpeech: "adjective",
    definition: "Having the ability to produce new and original ideas.",
    vietnameseMeaning: "sáng tạo",
    exampleSentence: "She is a creative girl who writes wonderful stories."
  },
  {
    word: "equipment",
    ipa: "/ɪˈkwɪp.mənt/",
    partOfSpeech: "noun",
    definition: "The set of necessary tools or items for a particular purpose.",
    vietnameseMeaning: "thiết bị",
    exampleSentence: "The school gym has modern sports equipment."
  },
  {
    word: "excited",
    ipa: "/ɪkˈsaɪ.tɪd/",
    partOfSpeech: "adjective",
    definition: "Feeling or showing happiness and enthusiasm.",
    vietnameseMeaning: "phấn chấn, phấn khích",
    exampleSentence: "The students are very excited about the field trip."
  },
  {
    word: "greenhouse",
    ipa: "/ˈɡriːn.haʊs/",
    partOfSpeech: "noun",
    definition: "A glass building used for growing plants that need warmth and protection.",
    vietnameseMeaning: "nhà kính",
    exampleSentence: "We grow tomatoes and flowers in the school greenhouse."
  },
  {
    word: "help",
    ipa: "/help/",
    partOfSpeech: "noun, verb",
    definition: "To make it easier for someone to do something.",
    vietnameseMeaning: "giúp đỡ, trợ giúp",
    exampleSentence: "Can you help me with my English homework?"
  },
  {
    word: "international",
    ipa: "/ˌɪn.təˈnæʃ.ən.əl/",
    partOfSpeech: "adjective",
    definition: "Involving two or more countries.",
    vietnameseMeaning: "quốc tế",
    exampleSentence: "He goes to an international school in Hanoi."
  },
  {
    word: "interview",
    ipa: "/ˈɪn.tə.vjuː/",
    partOfSpeech: "noun, verb",
    definition: "A meeting in which someone is asked questions.",
    vietnameseMeaning: "phỏng vấn",
    exampleSentence: "The teacher will interview new students this afternoon."
  },
  {
    word: "judo",
    ipa: "/ˈdʒuː.dəʊ/",
    partOfSpeech: "noun",
    definition: "A sport and method of self-defense originating in Japan.",
    vietnameseMeaning: "môn võ judo",
    exampleSentence: "I do judo every Wednesday after school."
  },
  {
    word: "knock",
    ipa: "/nɒk/",
    partOfSpeech: "verb",
    definition: "To strike a surface noisily to attract attention.",
    vietnameseMeaning: "gõ (cửa)",
    exampleSentence: "Please knock on the door before entering the room."
  },
  {
    word: "overseas",
    ipa: "/ˌəʊ.vəˈsiːz/",
    partOfSpeech: "noun, adverb",
    definition: "In, from, or to countries that are across the sea.",
    vietnameseMeaning: "(ở) nước ngoài",
    exampleSentence: "My brother is studying overseas in the UK."
  },
  {
    word: "pocket money",
    ipa: "/ˈpɒk.ɪt ˈmʌn.i/",
    partOfSpeech: "noun",
    definition: "A small amount of money given to a child regularly by parents.",
    vietnameseMeaning: "tiền túi, tiền riêng",
    exampleSentence: "I save my pocket money to buy books."
  },
  {
    word: "poem",
    ipa: "/ˈpəʊ.ɪm/",
    partOfSpeech: "noun",
    definition: "A piece of writing that expresses emotions, often in short lines that rhyme.",
    vietnameseMeaning: "bài thơ",
    exampleSentence: "We have to learn this English poem by heart."
  },
  {
    word: "remember",
    ipa: "/rɪˈmem.bə(r)/",
    partOfSpeech: "verb",
    definition: "To bring back to mind; to have in one's memory.",
    vietnameseMeaning: "nhớ, ghi nhớ",
    exampleSentence: "Please remember to bring your English dictionary tomorrow."
  },
  {
    word: "share",
    ipa: "/ʃeə(r)/",
    partOfSpeech: "noun, verb",
    definition: "To divide and give a portion to others, or use together.",
    vietnameseMeaning: "chia sẻ",
    exampleSentence: "Good classmates always share school things with each other."
  },
  {
    word: "smart",
    ipa: "/smɑːt/",
    partOfSpeech: "adjective",
    definition: "Intelligent, neat, or stylish in appearance.",
    vietnameseMeaning: "bảnh bao, sáng sủa",
    exampleSentence: "He looks very smart in his new school uniform."
  },
  {
    word: "surround",
    ipa: "/səˈraʊnd/",
    partOfSpeech: "verb",
    definition: "To be all around someone or something.",
    vietnameseMeaning: "bao quanh",
    exampleSentence: "Beautiful green hills surround the school."
  },
  {
    word: "swimming pool",
    ipa: "/ˈswɪmɪŋ puːl/",
    partOfSpeech: "noun",
    definition: "An artificial pool for swimming.",
    vietnameseMeaning: "bể bơi",
    exampleSentence: "Our school has a large swimming pool for students."
  }
];

function getMockFlashcards(topic) {
  return DEFAULT_FLASHCARDS;
}

function getMockLessonFromText(rawText) {
  // Simple mock returning a fixed structure similar to unit1Data
  return {
    title: "AI Generated Lesson (Mock)",
    vocabulary: [
      { word: "extract", type: "verb", transcription: "/ɪkˈstrækt/", meaning: "trích xuất" },
      { word: "analyze", type: "verb", transcription: "/ˈæn.əl.aɪz/", meaning: "phân tích" },
      { word: "interactive", type: "adj", transcription: "/ˌɪn.təˈræk.tɪv/", meaning: "tương tác" }
    ],
    grammar: [
      {
        title: "1. AI Text Processing",
        sections: [
          {
            subtitle: "Usage:",
            points: ["Used to automatically parse raw teacher inputs into structured JSON."],
            formulas: [{ type: "Pattern", text: "AI + Prompt -> JSON" }],
            tags: ["smart", "automated"]
          }
        ]
      }
    ],
    phonetics: [
      {
        title: "Key Sounds",
        description: "Important pronunciations",
        examples: [{ word: "artificial", transcription: "/ˌɑː.tɪˈfɪʃ.əl/" }]
      }
    ],
    practice: [
      {
        id: 1,
        question: "What does the AI do with the raw text?",
        options: ["Deletes it", "Extracts vocabulary and grammar", "Translates it to French", "Ignores it"],
        correctAnswer: 1
      },
      {
        id: 2,
        question: "Which word means 'trích xuất'?",
        options: ["analyze", "interactive", "extract", "input"],
        correctAnswer: 2
      }
    ]
  };
}
