const RATE = 0.95
const NAME_GAP_MS = 700
const PASS_GAP_MS = 1100

export const SAMPLE_LINE = 'This is a volume check. If you can hear this clearly, you are ready to play.'

export interface SpokenLine {
  text: string
  pass: 1 | 2
  index: number
  total: number
  gapAfter: number
}

export interface SpeechHooks {
  onLine?: (line: SpokenLine) => void
  onDone?: () => void
  onError?: () => void
}

export interface SpeechRun {
  cancel: () => void
}

export function canSpeak(): boolean {
  return import.meta.client && 'speechSynthesis' in window
}

export function primeSpeech(): void {
  if (!canSpeak())
    return
  window.speechSynthesis.getVoices()
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    window.speechSynthesis.getVoices()
  }, { once: true })
}

export function buildReadout(first: readonly string[], second: readonly string[]): SpokenLine[] {
  const toLines = (names: readonly string[], pass: 1 | 2, trailingGap: number): SpokenLine[] =>
    names.map((text, index) => ({
      text,
      pass,
      index: index + 1,
      total: names.length,
      gapAfter: index === names.length - 1 ? trailingGap : NAME_GAP_MS,
    }))

  return [
    ...toLines(first, 1, PASS_GAP_MS),
    ...toLines(second, 2, 0),
  ]
}

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  return voices.find(voice => /^en(-|_)/i.test(voice.lang) && /samantha|google uk english|daniel|karen|moira/i.test(voice.name))
    ?? voices.find(voice => voice.lang.toLowerCase().startsWith('en'))
    ?? voices[0]
    ?? null
}

export function speakLines(lines: readonly SpokenLine[], hooks: SpeechHooks = {}): SpeechRun {
  if (!canSpeak()) {
    hooks.onError?.()
    return { cancel: () => {} }
  }

  const synth = window.speechSynthesis
  let stopped = false
  let resumeTimer = 0
  let gapTimer = 0

  const finish = (ok: boolean) => {
    window.clearInterval(resumeTimer)
    window.clearTimeout(gapTimer)
    if (ok)
      hooks.onDone?.()
    else
      hooks.onError?.()
  }

  const speakAt = (position: number) => {
    if (stopped)
      return
    const line = lines[position]
    if (!line) {
      finish(true)
      return
    }

    hooks.onLine?.(line)
    const utterance = new SpeechSynthesisUtterance(line.text)
    utterance.rate = RATE
    utterance.pitch = 1
    const voice = pickVoice()
    if (voice)
      utterance.voice = voice

    utterance.onend = () => {
      if (stopped)
        return
      gapTimer = window.setTimeout(() => speakAt(position + 1), line.gapAfter)
    }
    utterance.onerror = (event) => {
      if (stopped || event.error === 'canceled')
        return
      stopped = true
      synth.cancel()
      finish(false)
    }

    synth.resume()
    synth.speak(utterance)
  }

  resumeTimer = window.setInterval(() => {
    if (synth.speaking)
      synth.resume()
  }, 5000)

  speakAt(0)

  return {
    cancel: () => {
      stopped = true
      window.clearInterval(resumeTimer)
      window.clearTimeout(gapTimer)
      synth.cancel()
    },
  }
}

export function speakSample(hooks: Pick<SpeechHooks, 'onDone' | 'onError'> = {}): SpeechRun {
  return speakLines([{
    text: SAMPLE_LINE,
    pass: 1,
    index: 1,
    total: 1,
    gapAfter: 0,
  }], hooks)
}
