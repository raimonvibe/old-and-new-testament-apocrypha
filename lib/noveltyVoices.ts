/**
 * Joke and character voices the operating system ships alongside real ones.
 *
 * Apple's "Novelty" set (Bubbles, Junior, Zarvox, Bad News…) all report as
 * en-US, so filtering by language does not remove them: they have to be
 * named. On iPhone, iPad and Mac, Safari also translates the display name
 * (Bulles, Burbujas, Bubbels…), so the voiceURI, which keeps Apple's English
 * identifier, is checked too. The Eloquence character set (Grandma, Rocko…)
 * comes with recent macOS/iOS in many languages.
 *
 * Shared across the read-aloud apps; keep the lists in step.
 */
const NOVELTY_VOICE_NAMES = new Set([
  'albert',
  'bad news',
  'bahh',
  'bells',
  'boing',
  'bubbles',
  'cellos',
  'deranged',
  'fred',
  'good news',
  'hysterical',
  'jester',
  'junior',
  'kathy',
  'organ',
  'pipe organ',
  'princess',
  'ralph',
  'superstar',
  'trinoids',
  'whisper',
  'wobble',
  'zarvox',
  // Eloquence-era character set
  'eddy',
  'flo',
  'grandma',
  'grandpa',
  'reed',
  'rocko',
  'sandy',
  'shelley',
  // Localized Apple novelty names (iOS 17+)
  'bulles',
  'burbujas',
  'bollicine',
  'bubbels',
  'belletjes',
  'mauvaises nouvelles',
  'malas noticias',
  'brutte notizie',
  'slecht nieuws',
  'cloches',
  'campanas',
  'campane',
  'klokken',
  'violoncelles',
  'violonchelos',
  'violoncelli',
  'bonnes nouvelles',
  'buenas noticias',
  'buone notizie',
  'goed nieuws',
  'bouffon',
  'bufón',
  'giullare',
  'orgue',
  'órgano',
  'orgel',
  'murmure',
  'susurro',
  'sussurro',
  'fluister',
  'gefluister',
  'trinoides',
  'trinoïdes',
])

/** Tokens in Apple voiceURIs such as com.apple.speech.synthesis.voice.Bubbles
 *  or com.apple.eloquence.nl-NL.Grandma. */
const NOVELTY_URI_TOKENS = [
  'albert',
  'badnews',
  'bahh',
  'bells',
  'boing',
  'bubbles',
  'cellos',
  'deranged',
  'fred',
  'goodnews',
  'hysterical',
  'jester',
  'junior',
  'kathy',
  'organ',
  'pipeorgan',
  'princess',
  'ralph',
  'superstar',
  'trinoids',
  'whisper',
  'wobble',
  'zarvox',
  'eddy',
  'flo',
  'grandma',
  'grandpa',
  'reed',
  'rocko',
  'sandy',
  'shelley',
]

/** "Grandma (Deutsch (Deutschland))" → "grandma"; "Microsoft David - English" → "microsoft david" */
function baseVoiceName(name: string): string {
  return name.split('(')[0].split(' - ')[0].trim().toLowerCase()
}

function hasNoveltyUriToken(uri: string): boolean {
  const normalised = (uri ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '.')
  return NOVELTY_URI_TOKENS.some(
    (token) =>
      normalised.includes(`.${token}.`) ||
      normalised.endsWith(`.${token}`) ||
      normalised.includes(`voice.${token}`),
  )
}

export function isNoveltyVoice(voice: SpeechSynthesisVoice): boolean {
  if (/eloquence/i.test(voice.name) || /eloquence/i.test(voice.voiceURI ?? '')) {
    return true
  }
  if (hasNoveltyUriToken(voice.voiceURI) || hasNoveltyUriToken(voice.name)) {
    return true
  }
  return NOVELTY_VOICE_NAMES.has(baseVoiceName(voice.name))
}

/** The voices a reader may hear: never a novelty voice, not even as a fallback. */
export function genuineVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  return voices.filter((v) => !isNoveltyVoice(v))
}
