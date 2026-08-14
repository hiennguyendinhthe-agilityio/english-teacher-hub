/**
 * English Teacher Hub - Full Lesson Bilingual Adapter (VI <-> EN)
 */

export const ENGLISH_VOCAB_DEFINITIONS = {
  // Unit 1
  "activity": "action / event / hobby",
  "art": "painting, drawing, or sculpture",
  "boarding school": "school where students live during term",
  "classmate": "a fellow student in the same class",
  "compass": "drawing instrument for circles",
  "creative": "having good imagination and original ideas",
  "equipment": "necessary tools or gear for an activity",
  "excited": "feeling very happy and enthusiastic",
  "greenhouse": "glass building for growing plants",
  "help": "assist or give aid to someone",
  "international": "involving two or more nations",
  "interview": "formal meeting with questions and answers",
  "judo": "Japanese martial art of self-defense",
  "knock": "strike a door loudly to attract attention",
  "overseas": "in or to a foreign country",
  "pocket money": "small cash allowance given to children",
  "poem": "piece of creative rhythmic writing",
  "remember": "retain in memory / not forget",
  "share": "use or enjoy together with others",
  "smart": "neat, well-dressed, or intelligent",
  "surround": "be all around on every side",
  "swimming pool": "artificial water basin for swimming",

  // Unit 2
  "air conditioner": "cooling and ventilation appliance",
  "apartment": "suite of rooms forming a home",
  "bathroom": "room containing bath/shower and toilet",
  "behind": "at or towards the back of",
  "between": "in the middle of two things",
  "chest of drawers": "furniture with drawers for clothes",
  "crazy": "unusual, eccentric, or bizarre",
  "cupboard": "cabinet with shelves for dishes",
  "department store": "large retail store with many sections",
  "dishwasher": "machine for washing dishes automatically",
  "fridge": "refrigerator for keeping food cold",
  "furniture": "movable items like chairs, tables, beds",
  "hall": "entrance area or corridor in a building",
  "in front of": "positioned ahead of someone or something",
  "kitchen": "room where food is prepared and cooked",
  "living room": "main room for relaxing and entertaining",
  "messy": "untidy, disordered, or cluttered",
  "microwave": "appliance for heating food rapidly",
  "move": "change place, position, or residence",
  "next to": "immediately adjacent to / beside",
  "sofa": "comfortable upholstered long seat",
  "stilt house": "house raised on tall wooden posts",
  "under": "directly beneath or below something",
  "wardrobe": "tall cabinet for hanging clothing",

  // Unit 3
  "active": "engaging in energetic pursuits",
  "appearance": "the way that someone or something looks",
  "arm": "upper limb of the human body",
  "body": "physical structure of a person",
  "careful": "taking care to avoid mistakes or danger",
  "caring": "displaying kindness and concern for others",
  "cheek": "either side of the face below the eye",
  "clever": "quick at learning and understanding",
  "confident": "feeling sure about one's ability",
  "curly": "having twists, waves, or spirals",
  "friendly": "kind, pleasant, and easy to talk to",
  "funny": "causing laughter or amusement",
  "hard-working": "putting continuous effort into work",
  "kind": "generous, helpful, and caring",
  "loving": "feeling or showing deep affection",
  "patient": "able to accept delays without getting angry",
  "reliable": "consistently good in quality and trustworthy",
  "shy": "nervous or timid in the company of others",
  "sporty": "fond of or good at sports",
  "talkative": "fond of talking a lot",

  // Unit 4
  "bakery": "shop where bread and cakes are baked and sold",
  "cathedral": "principal church of a diocese",
  "convenient": "fitting in well with one's needs or ease",
  "crowded": "full of people leaving little room",
  "historic": "famous or important in history",
  "memorial": "statue or structure commemorating a person/event",
  "modern": "relating to the present or recent times",
  "narrow": "having a small width; not wide",
  "neighbourhood": "the area surrounding a person's home",
  "peaceful": "free from disturbance; tranquil",
  "polluted": "contaminated with harmful substances",
  "railway station": "terminal where trains stop for passengers",
  "square": "open public four-sided area in a town",
  "suburb": "residential area on the outskirts of a city",
  "temple": "building devoted to religious worship",

  // Unit 5
  "backpack": "bag with shoulder straps carried on the back",
  "boot": "sturdy footwear covering the foot and ankle",
  "cave": "natural underground hollow chamber",
  "compass (tool)": "instrument for navigation and orientation",
  "cuisine": "style or method of cooking",
  "desert": "dry, barren area of land with little water",
  "forest": "large area covered chiefly with trees",
  "island": "piece of land surrounded by water",
  "lake": "large body of water surrounded by land",
  "mountain": "large natural elevation of the earth's surface",
  "plaster": "adhesive strip used for dressing small wounds",
  "sleeping bag": "warm padded bag to sleep in outdoors",
  "suncream": "lotion applied to skin to protect from UV rays",
  "waterfall": "cascade of water falling from a height",
  "wonder": "a magnificent and miraculous phenomenon",
  "travel agent's": "agency arranging travel and accommodation"
};

export const ENGLISH_GRAMMAR_OVERLAYS = {
  "unit-1-my-new-school": [
    {
      title: "I. The Present Simple Tense",
      sections: [
        {
          subtitle: "1. Usage & Rules",
          points: [
            "Expresses daily habits and repeated routines. (E.g., We go to school every day)",
            "Expresses universal truths and scientific facts. (E.g., The Earth moves around the Sun)",
            "Expresses general statements of fact or natural laws. (E.g., This festival occurs every 4 years)",
            "Expresses fixed timetables for trains, buses, or flights. (E.g., The train leaves at 8:00 AM tomorrow)"
          ]
        },
        {
          subtitle: "2. Sentence Structure",
          formulas: [
            { type: "Affirmative (+)", text: "I/We/You/They + V (base)  |  He/She/It + V-s/es" },
            { type: "Negative (-)", text: "I/We/You/They + do not + V  |  He/She/It + does not + V" },
            { type: "Interrogative (?)", text: "Do + I/we/you/they + V?  |  Does + he/she/it + V?" }
          ]
        },
        {
          subtitle: "3. Time Expressions & Signal Words",
          tags: ["always", "usually", "often", "frequently", "sometimes", "seldom", "rarely", "never", "every day", "once a week"]
        }
      ]
    },
    {
      title: "II. Adverbs of Frequency",
      sections: [
        {
          subtitle: "1. Meaning & Frequency Scale",
          points: ["Indicates how often an action happens on a scale from 0% to 100%."],
          tags: ["Always (100%)", "Usually (80%)", "Often (60%)", "Sometimes (40%)", "Rarely (10%)", "Never (0%)"]
        },
        {
          subtitle: "2. Word Order & Position",
          points: [
            "Placed BEFORE main verbs: (E.g., He always arrives on time)",
            "Placed AFTER the verb 'to be': (E.g., She is usually happy)",
            "Placed BETWEEN auxiliary verbs and main verbs: (E.g., They have never been abroad)"
          ]
        }
      ]
    }
  ],
  "unit-2": [
    {
      title: "I. Possessive Case ('s)",
      sections: [
        {
          subtitle: "1. Concept & Usage",
          points: [
            "Used to show ownership or relationship between the first noun and the noun that follows by adding 's.",
            "Example: Daniel's book, Jack's shoes, the teacher's desk"
          ]
        },
        {
          subtitle: "2. Punctuation Rules",
          points: [
            "Add 's to singular nouns and irregular plural nouns not ending in s. (E.g., the child's toy, the children's room)",
            "Add only an apostrophe (') to plural nouns ending in s. (E.g., the teachers' room, the parents' house)",
            "Note: Use 'of' for inanimate objects and abstract entities. (E.g., the roof of the house, the leg of the table)"
          ]
        }
      ]
    },
    {
      title: "II. Prepositions of Place",
      sections: [
        {
          subtitle: "1. Key Prepositions of Place",
          points: [
            "AT: at a specific point or small location. (E.g., He is at school / at the cinema)",
            "IN: inside an enclosed space or container. (E.g., in the kitchen / in Hanoi)",
            "ON: on a flat surface. (E.g., on the table / on the wall)",
            "NEAR / NEXT TO: close beside. (E.g., The bank is next to the bookstore)",
            "IN FRONT OF / BEHIND: ahead of or behind someone/something. (E.g., in front of the TV)",
            "UNDER: directly beneath something. (E.g., under the bed)"
          ]
        }
      ]
    }
  ],
  "unit-3": [
    {
      title: "I. The Present Continuous Tense",
      sections: [
        {
          subtitle: "1. Usage & Form",
          points: [
            "Used to describe actions happening right now at the moment of speaking.",
            "Used to describe temporary situations or ongoing trends.",
            "Affirmative: Subject + am/is/are + V-ing",
            "Negative: Subject + am/is/are + not + V-ing",
            "Interrogative: Am/Is/Are + Subject + V-ing?"
          ]
        },
        {
          subtitle: "2. Signal Words",
          tags: ["now", "at the moment", "at present", "right now", "Look!", "Listen!", "Be quiet!"]
        }
      ]
    }
  ],
  "unit-4": [
    {
      title: "I. Comparative Adjectives",
      sections: [
        {
          subtitle: "1. With Short Adjectives (1 Syllable)",
          points: [
            "Formula: S + be + adj-ER + than + Noun/Pronoun. (E.g., Bikes are slower than cars)",
            "General rule: add -er (slow → slower, tall → taller)",
            "Two-syllable adjectives ending in -y: change y → i and add -er (dirty → dirtier, happy → happier)",
            "Adjectives ending in -e: add only -r (large → larger, wide → wider)",
            "Single vowel + single consonant: double the consonant (big → bigger, hot → hotter)"
          ],
          formulas: [
            { type: "Formula", text: "Subject + be + adj-ER + THAN + Object" }
          ],
          tags: ["slow → slower", "tall → taller", "dirty → dirtier", "easy → easier", "big → bigger"]
        },
        {
          subtitle: "2. With Long Adjectives (2+ Syllables)",
          points: [
            "Formula: S + be + MORE + adj + than + Noun/Pronoun. (E.g., A lion is more dangerous than a dog)",
            "Add 'more' before the adjective (beautiful → more beautiful, expensive → more expensive)"
          ],
          formulas: [
            { type: "Formula", text: "Subject + be + MORE + adjective + THAN + Object" }
          ],
          tags: ["more beautiful", "more delicious", "more difficult", "more peaceful"]
        },
        {
          subtitle: "3. Irregular Comparative Adjectives",
          points: [
            "good → better (tốt hơn)",
            "bad → worse (tệ hơn)",
            "far → farther / further (xa hơn)",
            "little → less (ít hơn)",
            "many/much → more (nhiều hơn)"
          ],
          tags: ["good → better", "bad → worse", "far → farther/further", "little → less", "much → more"]
        }
      ]
    }
  ],
  "unit-5": [
    {
      title: "I. Countable & Uncountable Nouns",
      sections: [
        {
          subtitle: "1. Countable Nouns",
          points: [
            "Can be counted with numbers: singular (a book) and plural (two books).",
            "Singular countable nouns take 'a/an' and singular verbs. (E.g., This chair is new)",
            "Plural forms: add -s (books), -es after -s/-sh/-ch/-x (buses), -y → -ies (cities).",
            "Irregular plurals: woman → women, man → men, child → children, foot → feet."
          ],
          tags: ["a book / books", "a city / cities", "a child / children", "a person / people"]
        },
        {
          subtitle: "2. Uncountable Nouns",
          points: [
            "Cannot be counted directly (liquids, gases, abstract concepts, substances). E.g., water, milk, rice, sugar, information.",
            "Always take singular verbs and do NOT use 'a/an'. (E.g., Water is essential)",
            "Measured with quantity containers: a bottle of water, a cup of tea, a piece of advice."
          ],
          tags: ["water", "milk", "sugar", "a bottle of water", "a cup of coffee"]
        },
        {
          subtitle: "3. Quantifiers (Many / Much / Some / Any)",
          points: [
            "MANY: used with plural COUNTABLE nouns in negative sentences and questions. (E.g., How many islands are there?)",
            "MUCH: used with UNCOUNTABLE nouns in negative sentences and questions. (E.g., There isn't much time)",
            "SOME: used in affirmative sentences for both countable and uncountable nouns. (E.g., I need some water)",
            "ANY: used in negative sentences and questions. (E.g., Do you have any pens?)"
          ]
        }
      ]
    },
    {
      title: "II. Modal Verb: MUST & MUSTN'T",
      sections: [
        {
          subtitle: "1. Must (Obligation & Necessity)",
          points: [
            "Expresses a strong obligation, rule, or necessity. (E.g., You must wear a helmet)",
            "Formula: Subject + MUST + V (base form)"
          ],
          formulas: [
            { type: "Formula", text: "Subject + MUST + V (base form)" }
          ]
        },
        {
          subtitle: "2. Mustn't (Prohibition)",
          points: [
            "Expresses prohibition: something that is strictly forbidden by law or rule. (E.g., You mustn't litter here)",
            "Formula: Subject + MUSTN'T + V (base form)"
          ],
          formulas: [
            { type: "Formula", text: "Subject + MUSTN'T + V (base form)" }
          ]
        }
      ]
    }
  ]
};

export const ENGLISH_PHONETICS_OVERLAYS = {
  "unit-1-my-new-school": [
    {
      title: "I. Long vowel /ɑː/",
      description: "Long vowel /ɑː/ is commonly found in words spelled with 'ar' or 'a'.",
      examples: [
        { word: "smart", transcription: "/smɑːt/" },
        { word: "large", transcription: "/lɑːrdʒ/" },
        { word: "ask", transcription: "/ɑːsk/" },
        { word: "guard", transcription: "/gɑːd/" }
      ]
    },
    {
      title: "II. Short vowel /ʌ/",
      description: "Short vowel /ʌ/ is commonly found in words spelled with 'u', 'o', 'ou', 'oo'.",
      examples: [
        { word: "come", transcription: "/kʌm/" },
        { word: "cup", transcription: "/kʌp/" },
        { word: "blood", transcription: "/blʌd/" },
        { word: "country", transcription: "/ˈkʌntri/" }
      ]
    }
  ],
  "unit-2": [
    {
      title: "I. Final Sounds /s/, /z/, /ɪz/",
      description: "Rules for pronouncing plural nouns and third-person singular verb endings -s/-es.",
      examples: [
        { word: "lamps", transcription: "/læmps/ (/s/ after voiceless p, t, k, f, th)" },
        { word: "beds", transcription: "/bedz/ (/z/ after voiced b, d, g, v, m, n...)" },
        { word: "houses", transcription: "/ˈhaʊzɪz/ (/ɪz/ after s, z, ʃ, tʃ, dʒ)" }
      ]
    }
  ],
  "unit-3": [
    {
      title: "I. Consonants /p/ and /b/",
      description: "Pronunciation of voiceless bilabial plosive /p/ and voiced bilabial plosive /b/.",
      examples: [
        { word: "newspaper", transcription: "/ˈnuːzˌpeɪpər/" },
        { word: "baby", transcription: "/ˈbeɪbi/" }
      ]
    }
  ],
  "unit-4": [
    {
      title: "I. Consonants /iː/ and /ɪ/",
      description: "Distinguishing between long vowel /iː/ and short lax vowel /ɪ/.",
      examples: [
        { word: "historic", transcription: "/hɪˈstɒr.ɪk/" },
        { word: "convenient", transcription: "/kənˈviː.ni.ənt/" }
      ]
    }
  ],
  "unit-5": [
    {
      title: "I. Consonants /t/ and /d/",
      description: "Pronunciation of voiceless alveolar plosive /t/ and voiced alveolar plosive /d/.",
      examples: [
        { word: "desert", transcription: "/ˈdez.ət/" },
        { word: "island", transcription: "/ˈaɪ.lənd/" }
      ]
    }
  ]
};

/**
 * Returns localized lesson data based on current language
 */
export function getLocalizedLesson(lessonData, lang) {
  if (!lessonData) return lessonData;
  if (lang !== 'en') return lessonData;

  const unitId = lessonData.id;

  // Localized Vocabulary
  const localizedVocab = (lessonData.vocabulary || []).map(item => ({
    ...item,
    meaning: ENGLISH_VOCAB_DEFINITIONS[item.word.toLowerCase()] || item.meaning
  }));

  // Localized Grammar
  const localizedGrammar = ENGLISH_GRAMMAR_OVERLAYS[unitId] || lessonData.grammar || [];

  // Localized Phonetics
  const localizedPhonetics = ENGLISH_PHONETICS_OVERLAYS[unitId] || lessonData.phonetics || [];

  return {
    ...lessonData,
    vocabulary: localizedVocab,
    grammar: localizedGrammar,
    phonetics: localizedPhonetics
  };
}
