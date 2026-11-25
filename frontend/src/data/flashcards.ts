export interface FlashcardData {
  letter: string;
  word: string;
  emoji: string;
  image?: string;
  imageUrl?: string;
  frontImage?: string;
  backImage?: string;
  /** Optional alternative words for the same letter. Tap the card's swap
   *  button to cycle through them — helps learners associate each letter
   *  with multiple vocabulary items rather than a single fixed word. */
  variants?: Array<{
    word: string;
    emoji: string;
    image?: string;
    imageUrl?: string;
    frontImage?: string;
    backImage?: string;
  }>;
}

export const flashcards: FlashcardData[] = [
  { letter: 'a', word: 'Apple',      emoji: '🍎', variants: [{ word: 'Astronaut', emoji: '🧑‍🚀' }, { word: 'Airplane', emoji: '✈️'  }] },
  { letter: 'b', word: 'Ball',       emoji: '🏀', variants: [{ word: 'Butterfly', emoji: '🦋' }, { word: 'Banana',   emoji: '🍌'  }] },
  { letter: 'c', word: 'Cat',        emoji: '🐱', variants: [{ word: 'Car',       emoji: '🚗' }, { word: 'Camera',   emoji: '📷'  }] },
  { letter: 'd', word: 'Dog',        emoji: '🐶', variants: [{ word: 'Dolphin',   emoji: '🐬' }, { word: 'Drum',     emoji: '🥁'  }] },
  { letter: 'e', word: 'Elephant',   emoji: '🐘', variants: [{ word: 'Earth',     emoji: '🌍' }, { word: 'Eagle',    emoji: '🦅'  }] },
  { letter: 'f', word: 'Flower',     emoji: '🌸', variants: [{ word: 'Fish',      emoji: '🐟' }, { word: 'Flag',     emoji: '🏳️'  }] },
  { letter: 'g', word: 'Guitar',     emoji: '🎸', variants: [{ word: 'Globe',     emoji: '🌍' }, { word: 'Grapes',   emoji: '🍇'  }] },
  { letter: 'h', word: 'House',      emoji: '🏠', variants: [{ word: 'Heart',     emoji: '❤️' }, { word: 'Horse',    emoji: '🐴'  }] },
  { letter: 'i', word: 'Ice Cream',  emoji: '🍦', variants: [{ word: 'Island',    emoji: '🏝️' }, { word: 'Igloo',    emoji: '🛖'  }] },
  { letter: 'j', word: 'Juice',      emoji: '🧃', variants: [{ word: 'Jellyfish', emoji: '🪼' }, { word: 'Jacket',   emoji: '🧥'  }] },
  { letter: 'k', word: 'Kite',       emoji: '🪁', variants: [{ word: 'Key',       emoji: '🔑' }, { word: 'Kangaroo', emoji: '🦘'  }] },
  { letter: 'l', word: 'Lion',       emoji: '🦁', variants: [{ word: 'Lamp',      emoji: '🪔' }, { word: 'Leaf',     emoji: '🍃'  }] },
  { letter: 'm', word: 'Monkey',     emoji: '🐒', variants: [{ word: 'Moon',      emoji: '🌙' }, { word: 'Mountain', emoji: '🏔️'  }] },
  { letter: 'n', word: 'Nest',       emoji: '🪹', variants: [{ word: 'Notebook',  emoji: '📓' }, { word: 'Noodles',  emoji: '🍜'  }] },
  { letter: 'o', word: 'Orange',     emoji: '🍊', variants: [{ word: 'Octopus',   emoji: '🐙' }, { word: 'Owl',      emoji: '🦉'  }] },
  { letter: 'p', word: 'Penguin',    emoji: '🐧', variants: [{ word: 'Panda',     emoji: '🐼' }, { word: 'Pizza',    emoji: '🍕'  }] },
  { letter: 'q', word: 'Queen',      emoji: '👑', variants: [{ word: 'Quilt',     emoji: '🛏️' }, { word: 'Question', emoji: '❓'  }] },
  { letter: 'r', word: 'Rocket',     emoji: '🚀', variants: [{ word: 'Rainbow',   emoji: '🌈' }, { word: 'Robot',    emoji: '🤖'  }] },
  { letter: 's', word: 'Sun',        emoji: '☀️', variants: [{ word: 'Star',      emoji: '⭐' }, { word: 'Snake',    emoji: '🐍'  }] },
  { letter: 't', word: 'Tree',       emoji: '🌳', variants: [{ word: 'Tiger',     emoji: '🐯' }, { word: 'Turtle',   emoji: '🐢'  }] },
  { letter: 'u', word: 'Umbrella',   emoji: '☂️', variants: [{ word: 'Unicorn',   emoji: '🦄' }, { word: 'Universe', emoji: '🌌'  }] },
  { letter: 'v', word: 'Violin',     emoji: '🎻', variants: [{ word: 'Volcano',   emoji: '🌋' }, { word: 'Van',      emoji: '🚐'  }] },
  { letter: 'w', word: 'Watermelon', emoji: '🍉', variants: [{ word: 'Whale',     emoji: '🐋' }, { word: 'Watch',    emoji: '⌚'  }] },
  { letter: 'x', word: 'Xylophone',  emoji: '🎹', variants: [{ word: 'X-ray',     emoji: '🩻' }] },  // closest emoji available
  { letter: 'y', word: 'Yacht',      emoji: '🛥️', variants: [{ word: 'Yoga',      emoji: '🧘' }, { word: 'Yarn',     emoji: '🧶'  }] },
  { letter: 'z', word: 'Zebra',      emoji: '🦓', variants: [{ word: 'Zoo',       emoji: '🦁' }, { word: 'Zipper',   emoji: '🔗'  }] },
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
