export type TutorialLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  /** Human-readable length shown on the card, e.g. "3:00". */
  duration: string;
  level: TutorialLevel;
  /**
   * Path to the video file, served from frontend/public — e.g. drop the
   * recording in frontend/public/videos/welcome.mp4 and set this to
   * "/videos/welcome.mp4". Keep null until the recording exists: the card
   * and the player then show the "Video coming soon" placeholder.
   */
  videoUrl: string | null;
}

// Full ASL curriculum organised by difficulty. Each lesson describes a
// self-contained topic; recordings are dropped into frontend/public/videos/
// and the videoUrl is updated from null to the path when ready.
export const tutorials: Tutorial[] = [
  // ─── Beginner ─────────────────────────────────────────────────────────────
  {
    id: 'welcome-to-aashna',
    title: 'Welcome to Aashna',
    description:
      'A quick walkthrough of the app: signing to the camera, watching your text build up, and speaking it aloud.',
    duration: '3:00',
    level: 'Beginner',
    videoUrl: null,
  },
  {
    id: 'fingerspelling-first-letters',
    title: 'Fingerspelling: Your First Letters',
    description:
      'Learn the correct handshapes for the first letters of the ASL alphabet, shown slowly from two angles.',
    duration: '5:30',
    level: 'Beginner',
    videoUrl: null,
  },
  {
    id: 'signing-numbers',
    title: 'Signing Numbers 0–9',
    description:
      'How to form each number clearly, and how to switch the recognizer into Numbers mode for practice.',
    duration: '4:15',
    level: 'Beginner',
    videoUrl: null,
  },
  {
    id: 'alphabet-full-review',
    title: 'The Full Alphabet: A to Z',
    description:
      'A slow, complete run-through of every ASL letter handshape — ideal as a daily warm-up before practice.',
    duration: '6:00',
    level: 'Beginner',
    videoUrl: null,
  },
  {
    id: 'basic-greetings',
    title: 'Basic Greetings: Hi, Hello & Goodbye',
    description:
      'The three most-used signs in any conversation, plus "Good morning" and "See you later".',
    duration: '3:45',
    level: 'Beginner',
    videoUrl: null,
  },
  {
    id: 'family-signs',
    title: 'Family Signs: Mom, Dad, Brother, Sister',
    description:
      'How to sign the core family members — useful for introductions and talking about home.',
    duration: '4:30',
    level: 'Beginner',
    videoUrl: null,
  },
  {
    id: 'yes-no-please-thanks',
    title: 'Essential Manners: Yes, No, Please & Thank You',
    description:
      'Four signs you will use in every conversation — and the facial expressions that go with them.',
    duration: '3:00',
    level: 'Beginner',
    videoUrl: null,
  },

  // ─── Intermediate ─────────────────────────────────────────────────────────
  {
    id: 'better-camera-recognition',
    title: 'Getting the Best Camera Recognition',
    description:
      'Lighting, hand placement, and steadiness tips that make the recognizer catch your signs every time.',
    duration: '2:45',
    level: 'Intermediate',
    videoUrl: null,
  },
  {
    id: 'games-and-quizzes',
    title: 'Practicing with Games & Quizzes',
    description:
      'A tour of Flashcards, Duolingo Mode, the Numbers Game, and Spelling Bee — and how each one builds your skills.',
    duration: '4:00',
    level: 'Intermediate',
    videoUrl: null,
  },
  {
    id: 'fingerspelling-speed',
    title: 'Fingerspelling Speed Drills',
    description:
      'Techniques for moving from slow, deliberate signing to smooth, rapid finger-spelling without losing clarity.',
    duration: '5:00',
    level: 'Intermediate',
    videoUrl: null,
  },
  {
    id: 'common-expressions',
    title: 'Common Expressions & Idioms',
    description:
      'Signs for "I don\'t know", "I\'m sorry", "Excuse me", and other everyday expressions that make conversations flow.',
    duration: '5:30',
    level: 'Intermediate',
    videoUrl: null,
  },
  {
    id: 'asking-questions',
    title: 'Asking Questions in ASL',
    description:
      'How to form Who, What, Where, When, Why, and How questions — including the non-manual markers that signal a question.',
    duration: '4:45',
    level: 'Intermediate',
    videoUrl: null,
  },
  {
    id: 'food-and-drinks',
    title: 'Signing About Food & Drinks',
    description:
      'Vocabulary for common foods, drinks, and restaurant phrases — "I\'m hungry", "Water please", "Delicious".',
    duration: '5:15',
    level: 'Intermediate',
    videoUrl: null,
  },
  {
    id: 'describing-people',
    title: 'Describing People & Emotions',
    description:
      'Adjectives for appearance and feelings — "happy", "tired", "tall", "friendly" — and how to combine them into sentences.',
    duration: '4:30',
    level: 'Intermediate',
    videoUrl: null,
  },

  // ─── Advanced ─────────────────────────────────────────────────────────────
  {
    id: 'ai-chat-buddy',
    title: 'Chatting with Your AI Buddy',
    description:
      'How to sign a message, send it to the chat buddy in Roleplay mode, and follow the conversation.',
    duration: '3:30',
    level: 'Advanced',
    videoUrl: null,
  },
  {
    id: 'asl-grammar-basics',
    title: 'ASL Grammar: Topic-Comment Structure',
    description:
      'How ASL sentences are built differently from English — topic first, then comment — and how facial grammar replaces tone of voice.',
    duration: '6:00',
    level: 'Advanced',
    videoUrl: null,
  },
  {
    id: 'conversational-asl',
    title: 'Conversational ASL: Beyond Single Signs',
    description:
      'Putting signs together into fluent sentences — classifiers, directionality, and using space to track who did what.',
    duration: '7:00',
    level: 'Advanced',
    videoUrl: null,
  },
  {
    id: 'storytelling-in-asl',
    title: 'Storytelling in ASL',
    description:
      'Techniques for narrating a story: role-shifting, eye-gaze, and using signing space to show characters and action.',
    duration: '6:30',
    level: 'Advanced',
    videoUrl: null,
  },
  {
    id: 'deaf-culture-introduction',
    title: 'Introduction to Deaf Culture',
    description:
      'The history, values, and social norms of the Deaf community — and why ASL is much more than "English on the hands".',
    duration: '5:00',
    level: 'Advanced',
    videoUrl: null,
  },
  {
    id: 'advanced-fingerspelling',
    title: 'Advanced Fingerspelling: Long Words & Names',
    description:
      'Strategies for smoothly finger-spelling 7+ letter words, proper nouns, and technical terms without breaking flow.',
    duration: '5:30',
    level: 'Advanced',
    videoUrl: null,
  },
];
