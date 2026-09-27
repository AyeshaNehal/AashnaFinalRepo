// Spelling Bee word bank — tiered by difficulty for adaptive practice.
//
// Each tier adds longer words so beginners start with 3-letter words and
// advanced users are challenged with 7–8 letter finger-spelling marathons.
//
// Conventions:
// - All words are uppercase (matches the quiz / camera recognition flow).
// - Letters A–Z only — the camera recogniser doesn't handle digits in
//   phrases mode, so no numbers appear here.
// - Within each tier, words are shuffled at random on each session, so
//   ordering here is purely for readability during maintenance.

export type SpellingTier = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface SpellingTierDef {
  tier: SpellingTier;
  label: string;
  /** Short description shown in the UI tier badge. */
  description: string;
  words: string[];
}

export const spellingTiers: SpellingTierDef[] = [
  // ─── Beginner (3-letter words) ─────────────────────────────────────────────
  {
    tier: 'beginner',
    label: 'Beginner',
    description: 'Short, common words — perfect for your first finger-spelling practice.',
    words: [
      'CAT', 'DOG', 'SUN', 'HAT', 'BED', 'CUP', 'CAR', 'BUS',
      'RED', 'BIG', 'RUN', 'EAT', 'FLY', 'SKY', 'ICE', 'HOT',
      'OLD', 'NEW', 'BOX', 'MAP', 'KEY', 'PEN', 'SIT', 'TOP',
      'MOM', 'DAD', 'YES', 'NO',  'FUN', 'JOY', 'CRY', 'HUG',
      'DAY', 'NAP', 'WET', 'DRY', 'FAT', 'THIN','COW', 'PIG',
    ],
  },

  // ─── Intermediate (4–5-letter words) ──────────────────────────────────────
  {
    tier: 'intermediate',
    label: 'Intermediate',
    description: 'Everyday words with 4–5 letters — building real finger-spelling stamina.',
    words: [
      // 4-letter
      'BIRD', 'FISH', 'TREE', 'BLUE', 'BOOK', 'CAKE', 'DOOR', 'FIRE',
      'GOLD', 'HAND', 'HOME', 'KING', 'LAMP', 'MOON', 'NAME', 'RAIN',
      'RING', 'SHIP', 'STAR', 'TIME', 'WALL', 'WIND', 'WOLF', 'YEAR',
      'BABY', 'COLD', 'DARK', 'FAST', 'HELP', 'JUMP', 'KICK', 'LAST',
      'LOVE', 'MILK', 'NICE', 'OPEN', 'PLAY', 'READ', 'SAFE', 'TALK',
      'WALK', 'WARM', 'FOOD', 'GOOD',
      // 5-letter
      'APPLE', 'BEACH', 'BREAD', 'CHAIR', 'DANCE', 'EARTH', 'EVERY',
      'FLAME', 'GLASS', 'GRAPE', 'HEART', 'HORSE', 'HOUSE', 'JUICE',
      'LIGHT', 'MONEY', 'MUSIC', 'NIGHT', 'NORTH', 'PAPER', 'PARTY',
      'PEACE', 'PLANT', 'QUEEN', 'RIVER', 'SMILE', 'SNAKE', 'SPACE',
      'SPOON', 'STORM', 'STORY', 'TABLE', 'TEETH', 'THINK', 'TIGER',
      'TRAIN', 'TRUCK', 'WATCH', 'WATER', 'WOMAN', 'WORLD', 'WRITE',
      'HELLO', 'GOOD',
    ],
  },

  // ─── Advanced (6-letter words) ────────────────────────────────────────────
  {
    tier: 'advanced',
    label: 'Advanced',
    description: 'Longer words that demand precise finger-spelling and concentration.',
    words: [
      'ANIMAL', 'AUTUMN', 'BAKERY', 'BANANA', 'BASKET', 'BETTER',
      'BISHOP', 'BLANKET','BOTTLE', 'BRIDGE', 'BROKEN', 'BUTTER',
      'CASTLE', 'CHANGE', 'CHEESE', 'CHERRY', 'CHURCH', 'CIRCLE',
      'CLOSET', 'COFFEE', 'COOKIE', 'CORNER', 'COUSIN', 'DANGER',
      'DINNER', 'DOCTOR', 'DRIVER', 'FAMILY', 'FARMER', 'FINGER',
      'FLOWER', 'FOREST', 'FUTURE', 'GARDEN', 'GOLDEN', 'GUITAR',
      'HEALTH', 'HOCKEY', 'ISLAND', 'JACKET', 'JUNGLE', 'KITTEN',
      'LADDER', 'LEADER', 'LETTER', 'LISTEN', 'MARKET', 'MASTER',
      'MIRROR', 'MONKEY', 'MOTHER', 'MUSEUM', 'NATURE', 'NEEDLE',
      'NUMBER', 'OFFICE', 'ORANGE', 'PARCEL', 'PARROT', 'PEANUT',
      'PEOPLE', 'PICNIC', 'PLANET', 'POCKET', 'POLICE', 'PRINCE',
      'PURPLE', 'RABBIT', 'ROCKET', 'SCHOOL', 'SCREEN', 'SEARCH',
      'SECRET', 'SHADOW', 'SHOULD', 'SILVER', 'SIMPLE', 'SINGER',
      'SISTER', 'SLOWLY', 'SMOOTH', 'SOCKET', 'SPIDER', 'SPRING',
      'STRAIN', 'STREET', 'STRONG', 'SUMMER', 'SUNSET', 'TICKET',
      'TOMATO', 'TRAVEL', 'TUNNEL', 'TURTLE', 'VACATION','VIOLIN',
      'WINDOW', 'WINTER', 'WONDER', 'YELLOW',
    ],
  },

  // ─── Expert (7–8-letter words) ────────────────────────────────────────────
  {
    tier: 'expert',
    label: 'Expert',
    description: 'Marathon finger-spelling — for experienced signers pushing their limits.',
    words: [
      // 7-letter
      'AIRPORT', 'BALCONY', 'BATTERY', 'BECAUSE', 'BLANKET', 'BROTHER',
      'CABINET', 'CAPTAIN', 'CEILING', 'CENTRAL', 'CERTAIN', 'CHICKEN',
      'CLIMATE', 'COMPANY', 'COUNTRY', 'CRYSTAL', 'CURTAIN', 'DOLPHIN',
      'EVENING', 'FACTORY', 'FEATHER', 'FISHING', 'FOREIGN', 'FREEDOM',
      'GENERAL', 'HAPPILY', 'HISTORY', 'HOLIDAY', 'HUNDRED', 'IMAGINE',
      'JOURNEY', 'KITCHEN', 'LEATHER', 'LIBRARY', 'LOBSTER', 'MACHINE',
      'MEASURE', 'MINERAL', 'MORNING', 'MYSTERY', 'NOTHING', 'OCTOBER',
      'PAINTING','PANTHER', 'PATTERN', 'PICTURE', 'POULTRY', 'PROBLEM',
      'PRODUCE', 'PROGRAM', 'PROJECT', 'PUMPKIN', 'RAINBOW', 'RECEIPT',
      'SANDWICH','SAUSAGE', 'SCIENCE', 'SOLDIER', 'SOMEONE', 'STOMACH',
      'STUDENT', 'TEACHER', 'THUNDER', 'TONIGHT', 'TRAFFIC', 'TROUBLE',
      'VILLAGE', 'WEATHER', 'WELCOME', 'WESTERN', 'WHISPER', 'WITHOUT',
      // 8-letter
      'AIRPLANE','BASEBALL','BIRTHDAY','BUILDING','CALENDAR','CARNIVAL',
      'CEREMONY','CHAMPION','CHEMICAL','CHILDREN','COMPUTER','CONFLICT',
      'COOKBOOK','COSTUMES','CRIMINAL','CURRENCY','CUSTOMER','DAUGHTER',
      'DECISION','DESIGNER','DINOSAUR','DISCOVER','DISTANCE','ELEPHANT',
      'ENORMOUS','EVENTUAL','EXCHANGE','EXERCISE','EXPLICIT','FAMILIAR',
      'FEATURES','FESTIVAL','FOOTBALL','FRIENDLY','GENERATE','GRAPHICS',
      'GUARDIAN','HALLOWEEN','HAPPINESS','HOSPITAL','HUMIDITY','IDENTITY',
      'INNOCENT','INTERNET','JEWELERY','JUDGMENT','KANGAROO','LANGUAGE',
      'MARATHON','MATERIAL','MEDICINE','MIDNIGHT','MONUMENT','MOUNTAIN',
      'MUSHROOM','NATIONAL','NEGATIVE','NEIGHBOR','NINETEEN','NOTEBOOK',
      'OBSERVER','OFFICERS','OPERATOR','ORIGINAL','OUTDOORS','OVERCOME',
      'PANTHEON','PARADISE','PASSWORD','PATIENCE','PERSONAL','PHYSICAL',
      'PLATFORM','PLEASURE','POSITIVE','POVERTY','PRINCESS','PROGRESS',
      'PROPERTY','PROVIDER','QUESTION','RAILROAD','REMEMBER','REPUBLIC',
      'RESTAURANT','ROMANTIC','SANDWICHES','SATURDAY','SCENARIO','SCHEDULE',
      'SECURITY','SHIPPING','SHOELACE','SKELETON','SOMEWHAT','SPECIFIC',
      'SPINNING','STAIRCASE','STANDARD','STRENGTH','SURPRISE','SWIMMING',
      'SYMBOLIC','TERMINAL','THANKFUL','THINKING','THOUSAND','TOGETHER',
      'TOMORROW','TRIANGLE','TROUBLED','UMBRELLA','UNCOMMON','UNDERWAY',
      'UNIVERSE','UNUSUAL','UPSTAIRS','VACATION','VALUABLE','VIOLENCE',
      'VOLCANIC','WHATEVER','WHISPERED','WILDLIFE','YEARBOOK','YOURSELF',
    ],
  },
];

/** Fast lookup: how many consecutive correct words to advance one tier. */
export const WORDS_TO_ADVANCE = 3;
