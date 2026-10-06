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
  /**
   * Path to the thumbnail image file.
   */
  thumbnailUrl?: string | null;
}

export const tutorials: Tutorial[] = [
  // ─── Beginner ─────────────────────────────────────────────────────────────
  {
    id: 'welcome-to-aashna',
    title: 'Welcome to Aashna',
    description:
      'A quick walkthrough of the app: signing to the camera, watching your text build up, and speaking it aloud.',
    duration: '2:58',
    level: 'Beginner',
    videoUrl: 'https://www.youtube.com/embed/2FlFkcJl7vM?autoplay=1',
    thumbnailUrl: '/videos/Welcome To Aashna thumbnail.png',
  },
  {
    id: 'learn-the-abcs',
    title: "Learn The ABC's",
    description:
      'Learn the correct handshapes for the ASL alphabet.',
    duration: '4:36',
    level: 'Beginner',
    videoUrl: 'https://www.youtube.com/embed/v7DSycHBhPs?autoplay=1',
    thumbnailUrl: '/videos/6c49776c-dd8a-4528-827f-a5e2d4efd570-Cover.jpg',
  },
  {
    id: 'learn-the-numbers',
    title: 'Learn The Numbers',
    description:
      'How to form each number clearly, and how to switch the recognizer into Numbers mode for practice.',
    duration: '1:16',
    level: 'Beginner',
    videoUrl: 'https://www.youtube.com/embed/75RmtFBY1DA?autoplay=1',
    thumbnailUrl: '/videos/Learn The Numbers-Cover.jpg',
  },

  // ─── Intermediate ─────────────────────────────────────────────────────────
  {
    id: 'the-duolingo-mode',
    title: 'The Duolingo Mode',
    description:
      'Practice your skills with our interactive Duolingo-style learning mode.',
    duration: '0:57',
    level: 'Intermediate',
    videoUrl: 'https://www.youtube.com/embed/dJpX1key6W4?autoplay=1',
    thumbnailUrl: '/videos/The Duolingo Mode-Cover.jpg',
  },
  {
    id: 'the-number-games',
    title: 'The Number Games',
    description:
      'Test your number signing speed and accuracy with this fun interactive game.',
    duration: '2:17',
    level: 'Intermediate',
    videoUrl: 'https://www.youtube.com/embed/lGqeCI1nYgw?autoplay=1',
    thumbnailUrl: '/videos/Screenshot 2026-09-30 152617.png',
  },
  {
    id: 'the-spelling-bee-mode',
    title: 'The Spelling Bee Mode',
    description:
      'Improve your fingerspelling speed and recognition with the Spelling Bee challenge.',
    duration: '2:15',
    level: 'Intermediate',
    videoUrl: 'https://www.youtube.com/embed/sAAT96HdTT8?autoplay=1',
    thumbnailUrl: '/videos/Screenshot 2026-09-30 152841.png',
  },
  
  // ─── Advanced ─────────────────────────────────────────────────────────────
  {
    id: 'the-reply-mode',
    title: 'The Reply Mode',
    description:
      'Advanced practice: signing full replies to conversational prompts in real-time.',
    duration: '0:43',
    level: 'Advanced',
    videoUrl: 'https://www.youtube.com/embed/24LvgnXSmjE?autoplay=1',
    thumbnailUrl: '/videos/The Reply Mode-Cover.jpg',
  }
];
