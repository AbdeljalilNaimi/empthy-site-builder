// Profanity filter for FR, AR, EN
// Covers common profanity with bypass detection

const BANNED_FR = [
  'merde', 'putain', 'connard', 'connasse', 'enculé', 'enculer', 'salaud', 'salope',
  'bordel', 'foutre', 'nique', 'niquer', 'bâtard', 'batard', 'pétasse', 'petasse',
  'fils de pute', 'fdp', 'ntm', 'tg', 'ferme ta gueule', 'gueule', 'con',
  'bite', 'couilles', 'chier', 'emmerdeur', 'enfoiré', 'enfoire', 'branleur',
  'pute', 'cul', 'dégueulasse', 'degueulasse', 'salopard', 'abruti',
  'crétin', 'cretin', 'imbécile', 'imbecile', 'débile', 'debile',
];

const BANNED_AR = [
  'كلب', 'حمار', 'زبي', 'نيك', 'طبون', 'قحبة', 'شرموطة', 'عاهرة',
  'زنديق', 'ابن الكلب', 'ابن القحبة', 'منيوك', 'تفو', 'خرا', 'زب',
  'لعنة', 'يلعن', 'واطي', 'حقير', 'نجس', 'كفر', 'ملعون',
  'احمق', 'غبي', 'تافه', 'وسخ', 'قذر', 'حيوان', 'بهيمة',
];

const BANNED_EN = [
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'damn', 'crap', 'dick',
  'pussy', 'cock', 'cunt', 'whore', 'slut', 'nigger', 'nigga', 'faggot',
  'retard', 'motherfucker', 'bullshit', 'dumbass', 'jackass', 'piss',
  'stfu', 'wtf', 'lmao', 'idiot', 'moron', 'scumbag', 'douche',
];

const ALL_BANNED = [...BANNED_FR, ...BANNED_AR, ...BANNED_EN];

/**
 * Normalize text to detect bypass attempts:
 * - Lowercase
 * - Remove spaces, dots, underscores, dashes between letters
 * - Remove zero-width chars
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width chars
    .replace(/[.\-_*@!#$%^&()+=~`|\\/<>]/g, '') // special chars
    .replace(/\s+/g, ' ');
}

/**
 * Check if text contains any banned words.
 * Checks both the normalized (no-space) version and original normalized version.
 */
export function containsProfanity(text: string): boolean {
  if (!text || !text.trim()) return false;

  const normalized = normalize(text);
  const noSpaces = normalized.replace(/\s/g, '');

  return ALL_BANNED.some(word => {
    const normalizedWord = word.toLowerCase().replace(/\s/g, '');
    return normalized.includes(normalizedWord) || noSpaces.includes(normalizedWord);
  });
}
