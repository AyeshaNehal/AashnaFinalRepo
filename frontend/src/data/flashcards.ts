export interface FlashcardData {
  letter: string;
  word: string;
  emoji: string;
  /** Optional alternative words for the same letter. Tap the card's swap
   *  button to cycle through them — helps learners associate each letter
   *  with multiple vocabulary items rather than a single fixed word. */
  variants?: Array<{ word: string; emoji: string }>;
}

export const flashcards: FlashcardData[] = [
  { letter: 'A', word: 'Apple',      emoji: '🍎', variants: [{ word: 'Astronaut', emoji: '🧑‍🚀' }, { word: 'Airplane', emoji: '✈️'  }] },
  { letter: 'B', word: 'Ball',       emoji: '🏀', variants: [{ word: 'Butterfly', emoji: '🦋' }, { word: 'Banana',   emoji: '🍌'  }] },
  { letter: 'C', word: 'Cat',        emoji: '🐱', variants: [{ word: 'Car',       emoji: '🚗' }, { word: 'Camera',   emoji: '📷'  }] },
  { letter: 'D', word: 'Dog',        emoji: '🐶', variants: [{ word: 'Dolphin',   emoji: '🐬' }, { word: 'Drum',     emoji: '🥁'  }] },
  { letter: 'E', word: 'Elephant',   emoji: '🐘', variants: [{ word: 'Earth',     emoji: '🌍' }, { word: 'Eagle',    emoji: '🦅'  }] },
  { letter: 'F', word: 'Flower',     emoji: '🌸', variants: [{ word: 'Fish',      emoji: '🐟' }, { word: 'Flag',     emoji: '🏳️'  }] },
  { letter: 'G', word: 'Guitar',     emoji: '🎸', variants: [{ word: 'Globe',     emoji: '🌍' }, { word: 'Grapes',   emoji: '🍇'  }] },
  { letter: 'H', word: 'House',      emoji: '🏠', variants: [{ word: 'Heart',     emoji: '❤️' }, { word: 'Horse',    emoji: '🐴'  }] },
  { letter: 'I', word: 'Ice Cream',  emoji: '🍦', variants: [{ word: 'Island',    emoji: '🏝️' }, { word: 'Igloo',    emoji: '🛖'  }] },
  { letter: 'J', word: 'Juice',      emoji: '🧃', variants: [{ word: 'Jellyfish', emoji: '🪼' }, { word: 'Jacket',   emoji: '🧥'  }] },
  { letter: 'K', word: 'Kite',       emoji: '🪁', variants: [{ word: 'Key',       emoji: '🔑' }, { word: 'Kangaroo', emoji: '🦘'  }] },
  { letter: 'L', word: 'Lion',       emoji: '🦁', variants: [{ word: 'Lamp',      emoji: '🪔' }, { word: 'Leaf',     emoji: '🍃'  }] },
  { letter: 'M', word: 'Monkey',     emoji: '🐒', variants: [{ word: 'Moon',      emoji: '🌙' }, { word: 'Mountain', emoji: '🏔️'  }] },
  { letter: 'N', word: 'Nest',       emoji: '🪹', variants: [{ word: 'Notebook',  emoji: '📓' }, { word: 'Noodles',  emoji: '🍜'  }] },
  { letter: 'O', word: 'Orange',     emoji: '🍊', variants: [{ word: 'Octopus',   emoji: '🐙' }, { word: 'Owl',      emoji: '🦉'  }] },
  { letter: 'P', word: 'Penguin',    emoji: '🐧', variants: [{ word: 'Panda',     emoji: '🐼' }, { word: 'Pizza',    emoji: '🍕'  }] },
  { letter: 'Q', word: 'Queen',      emoji: '👑', variants: [{ word: 'Quilt',     emoji: '🛏️' }, { word: 'Question', emoji: '❓'  }] },
  { letter: 'R', word: 'Rocket',     emoji: '🚀', variants: [{ word: 'Rainbow',   emoji: '🌈' }, { word: 'Robot',    emoji: '🤖'  }] },
  { letter: 'S', word: 'Sun',        emoji: '☀️', variants: [{ word: 'Star',      emoji: '⭐' }, { word: 'Snake',    emoji: '🐍'  }] },
  { letter: 'T', word: 'Tree',       emoji: '🌳', variants: [{ word: 'Tiger',     emoji: '🐯' }, { word: 'Turtle',   emoji: '🐢'  }] },
  { letter: 'U', word: 'Umbrella',   emoji: '☂️', variants: [{ word: 'Unicorn',   emoji: '🦄' }, { word: 'Universe', emoji: '🌌'  }] },
  { letter: 'V', word: 'Violin',     emoji: '🎻', variants: [{ word: 'Volcano',   emoji: '🌋' }, { word: 'Van',      emoji: '🚐'  }] },
  { letter: 'W', word: 'Watermelon', emoji: '🍉', variants: [{ word: 'Whale',     emoji: '🐋' }, { word: 'Watch',    emoji: '⌚'  }] },
  { letter: 'X', word: 'Xylophone',  emoji: '🎹', variants: [{ word: 'X-ray',     emoji: '🩻' }] },  // closest emoji available
  { letter: 'Y', word: 'Yacht',      emoji: '🛥️', variants: [{ word: 'Yoga',      emoji: '🧘' }, { word: 'Yarn',     emoji: '🧶'  }] },
  { letter: 'Z', word: 'Zebra',      emoji: '🦓', variants: [{ word: 'Zoo',       emoji: '🦁' }, { word: 'Zipper',   emoji: '🔗'  }] },
];

export const numberFlashcards: FlashcardData[] = [
  { letter: '0', word: 'Zero',  emoji: '0️⃣' },
  { letter: '1', word: 'One',   emoji: '1️⃣' },
  { letter: '2', word: 'Two',   emoji: '2️⃣' },
  { letter: '3', word: 'Three', emoji: '3️⃣' },
  { letter: '4', word: 'Four',  emoji: '4️⃣' },
  { letter: '5', word: 'Five',  emoji: '5️⃣' },
  { letter: '6', word: 'Six',   emoji: '6️⃣' },
  { letter: '7', word: 'Seven', emoji: '7️⃣' },
  { letter: '8', word: 'Eight', emoji: '8️⃣' },
  { letter: '9', word: 'Nine',  emoji: '9️⃣' },
];
