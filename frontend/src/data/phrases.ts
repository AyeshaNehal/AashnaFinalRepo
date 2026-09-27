// Common ASL phrases and expressions for practice modules.
//
// Each category groups phrases that share a communicative context. The
// Spelling Bee and future phrase-practice features pull from this bank so
// learners practise real-world signing rather than isolated letters.
//
// Conventions:
// - All text is uppercase (matches the camera recognition pipeline).
// - Phrases are finger-spellable A–Z + spaces only.
// - Within each category, phrases are ordered roughly from shortest to longest.

export type PhraseCategory =
  | 'greetings'
  | 'questions'
  | 'daily'
  | 'feelings'
  | 'encouragement'
  | 'time';

export interface PhraseDef {
  category: PhraseCategory;
  label: string;
  emoji: string;
  phrases: string[];
}

export const phraseCategories: PhraseDef[] = [
  // ─── Greetings & Farewells ────────────────────────────────────────────────
  {
    category: 'greetings',
    label: 'Greetings & Farewells',
    emoji: '👋',
    phrases: [
      'HI',
      'HELLO',
      'HEY',
      'GOOD MORNING',
      'GOOD NIGHT',
      'HOW ARE YOU',
      'NICE TO MEET YOU',
      'SEE YOU LATER',
      'GOODBYE',
      'TAKE CARE',
      'HAVE A GOOD DAY',
      'WELCOME',
      'LONG TIME NO SEE',
    ],
  },

  // ─── Questions ─────────────────────────────────────────────────────────────
  {
    category: 'questions',
    label: 'Common Questions',
    emoji: '❓',
    phrases: [
      'WHAT',
      'WHERE',
      'WHEN',
      'WHY',
      'WHO',
      'HOW',
      'WHAT IS YOUR NAME',
      'WHERE ARE YOU FROM',
      'HOW OLD ARE YOU',
      'DO YOU UNDERSTAND',
      'CAN YOU HELP ME',
      'WHAT TIME IS IT',
      'HOW MUCH',
      'ARE YOU OKAY',
    ],
  },

  // ─── Daily Life ────────────────────────────────────────────────────────────
  {
    category: 'daily',
    label: 'Daily Life',
    emoji: '☀️',
    phrases: [
      'I AM HUNGRY',
      'I AM TIRED',
      'I NEED WATER',
      'I LIKE THIS',
      'I LOVE YOU',
      'THANK YOU',
      'PLEASE HELP',
      'EXCUSE ME',
      'I AM SORRY',
      'I AM FINE',
      'I AM LEARNING ASL',
      'I GO TO SCHOOL',
      'I AM GOING HOME',
      'WE ARE FRIENDS',
    ],
  },

  // ─── Feelings & Opinions ──────────────────────────────────────────────────
  {
    category: 'feelings',
    label: 'Feelings & Opinions',
    emoji: '💭',
    phrases: [
      'I AM HAPPY',
      'I AM SAD',
      'I AM EXCITED',
      'I FEEL GOOD',
      'I AM NERVOUS',
      'I AM PROUD',
      'I THINK SO',
      'I DO NOT KNOW',
      'I AGREE',
      'I DISAGREE',
      'I AM CONFUSED',
      'THAT IS AMAZING',
      'I AM BORED',
      'I LOVE THIS',
    ],
  },

  // ─── Encouragement ────────────────────────────────────────────────────────
  {
    category: 'encouragement',
    label: 'Encouragement',
    emoji: '⭐',
    phrases: [
      'GOOD JOB',
      'WELL DONE',
      'NICE WORK',
      'YOU CAN DO IT',
      'KEEP GOING',
      'TRY AGAIN',
      'DO NOT GIVE UP',
      'I BELIEVE IN YOU',
      'THAT IS RIGHT',
      'PERFECT',
      'AWESOME',
      'YOU ARE AMAZING',
      'PRACTICE MAKES PERFECT',
      'BE PROUD',
    ],
  },

  // ─── Time & Frequency ─────────────────────────────────────────────────────
  {
    category: 'time',
    label: 'Time & Frequency',
    emoji: '⏰',
    phrases: [
      'NOW',
      'LATER',
      'TODAY',
      'TOMORROW',
      'YESTERDAY',
      'THIS WEEK',
      'NEXT MONTH',
      'EVERY DAY',
      'SOMETIMES',
      'ALWAYS',
      'NEVER',
      'IN THE MORNING',
      'AT NIGHT',
      'RIGHT NOW',
    ],
  },
];

/** Flat list of every phrase (for random selection without category context). */
export const allPhrases: string[] = phraseCategories.flatMap((c) => c.phrases);
