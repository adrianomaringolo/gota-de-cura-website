'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'

type Props = {
  /** Reading time in minutes, from the post summary. */
  minutes: number
  /** Title, spoken before the body. */
  title: string
  /** BCP 47 tag of the text itself (differs from the page locale on an untranslated post). */
  lang: string
}

type Status = 'idle' | 'playing' | 'paused'

const STORAGE_KEY = 'post-reading-mode'
const ARTICLE_ID = 'post-article'
const SPEAKING = 'data-speaking'

/** Blocks worth reading aloud, in document order. Nested list items are skipped
 * so a parent item is not read twice. */
const readableBlocks = (): HTMLElement[] =>
  Array.from(
    document.querySelectorAll<HTMLElement>('[data-post-text] :is(h2, h3, p, li, th, td)'),
  ).filter((el) => !el.querySelector('li'))

/** macOS ships joke/novelty voices that declare pt-BR too; never narrate with them. */
const NOVELTY =
  /\b(eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley|bad news|bahh|bells|boing|bubbles|cellos|albert|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|kathy|ralph)\b/i

/** Names that mark a neural / premium voice on the common platforms. */
const QUALITY = /natural|neural|online|premium|enhanced|google|siri/i

/**
 * Best voice for the text's language: exact locale first (pt-BR over pt-PT),
 * then neural/premium voices, then on-device ones (no network hiccups mid-read).
 * Novelty voices are excluded. Returns undefined to let the browser pick.
 */
const pickVoice = (
  lang: string,
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | undefined => {
  const prefix = lang.split('-')[0].toLowerCase()

  const score = (voice: SpeechSynthesisVoice) => {
    const code = voice.lang.replace('_', '-')
    let points = 0
    if (code.toLowerCase() === lang.toLowerCase()) points += 100
    else if (code.toLowerCase().startsWith(prefix)) points += 50
    if (QUALITY.test(voice.name)) points += 30
    if (voice.localService) points += 5
    if (voice.default) points += 1
    return points
  }

  return voices
    .filter((voice) => voice.lang.toLowerCase().startsWith(prefix))
    .filter((voice) => !NOVELTY.test(voice.name))
    .sort((a, b) => score(b) - score(a))[0]
}

/** Browsers fill the voice list asynchronously; the first call can come back empty. */
const loadVoices = (): Promise<SpeechSynthesisVoice[]> =>
  new Promise((resolve) => {
    const synth = window.speechSynthesis
    const ready = synth.getVoices()
    if (ready.length > 0) return resolve(ready)

    const done = () => {
      synth.removeEventListener('voiceschanged', done)
      clearTimeout(timer)
      resolve(synth.getVoices())
    }
    const timer = setTimeout(done, 1500)
    synth.addEventListener('voiceschanged', done)
  })

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
)

const buttonClass =
  'inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand aria-pressed:border-brand aria-pressed:bg-brand-tint aria-pressed:text-brand'

/**
 * Reading aids for a post: a progress bar with the time left, a "listen" button
 * that reads the text aloud with the browser's own voices (Web Speech API, no
 * service involved) and a distraction-free reading mode. All state lives in the
 * browser; the post stays fully readable without any of it.
 */
export function PostReader({ minutes, title, lang }: Props) {
  const t = useTranslations('post')
  const bar = useRef<HTMLDivElement>(null)
  const [left, setLeft] = useState(minutes)
  const [canSpeak, setCanSpeak] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [reading, setReading] = useState(false)

  // Bumped on every stop/restart so a late `onend` from a cancelled utterance
  // cannot advance the queue.
  const run = useRef(0)

  // --- progress ------------------------------------------------------------
  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const article = document.getElementById(ARTICLE_ID)
      if (!article || !bar.current) return

      const rect = article.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      const progress =
        scrollable <= 0 ? 1 : Math.min(1, Math.max(0, -rect.top / scrollable))

      bar.current.style.transform = `scaleX(${progress})`
      setLeft(Math.max(0, Math.ceil(minutes * (1 - progress))))
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [minutes, reading])

  // --- reading mode --------------------------------------------------------
  const applyReading = useCallback((on: boolean) => {
    document.getElementById(ARTICLE_ID)?.setAttribute('data-reading', String(on))
  }, [])

  useEffect(() => {
    let saved = false
    try {
      saved = window.localStorage.getItem(STORAGE_KEY) === 'on'
    } catch {
      // storage blocked: the mode simply is not remembered
    }
    // Restoring a saved preference after mount is the point of this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReading(saved)
    applyReading(saved)
  }, [applyReading])

  const toggleReading = () => {
    const next = !reading
    setReading(next)
    applyReading(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off')
    } catch {
      // see above
    }
  }

  // --- listen --------------------------------------------------------------
  const clearHighlight = () =>
    document
      .querySelectorAll(`[${SPEAKING}]`)
      .forEach((el) => el.removeAttribute(SPEAKING))

  const stop = useCallback(() => {
    run.current += 1
    window.speechSynthesis?.cancel()
    clearHighlight()
    setStatus('idle')
  }, [])

  useEffect(() => {
    // Feature detection has to wait for the browser; the server cannot know.
    // The option only shows when the API exists AND the browser has a usable
    // voice for the text's language; otherwise "Ouvir" is left out entirely.
    let alive = true
    if ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
      loadVoices()
        .then((voices) => {
          if (alive) setCanSpeak(pickVoice(lang, voices) !== undefined)
        })
        .catch(() => {
          if (alive) setCanSpeak(false)
        })
    }
    return () => {
      alive = false
      run.current += 1
      window.speechSynthesis?.cancel()
    }
  }, [lang])

  const play = async () => {
    const synth = window.speechSynthesis
    synth.cancel()
    run.current += 1
    const token = run.current

    // One voice for the whole read: picking per utterance let the title (spoken
    // first, possibly before the voice list loaded) differ from the body.
    const voice = pickVoice(lang, await loadVoices())
    if (token !== run.current) return

    const blocks = readableBlocks()
    const queue: { text: string; el?: HTMLElement }[] = [
      { text: title },
      ...blocks
        .map((el) => ({ text: (el.innerText || el.textContent || '').trim(), el }))
        .filter((item) => item.text),
    ]

    const speak = (index: number) => {
      if (token !== run.current) return
      clearHighlight()

      if (index >= queue.length) {
        setStatus('idle')
        return
      }

      const { text, el } = queue[index]
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      if (voice) utterance.voice = voice

      utterance.onstart = () => {
        if (token !== run.current || !el) return
        el.setAttribute(SPEAKING, 'true')
        const box = el.getBoundingClientRect()
        // Follow along only when the block has left the comfortable middle of the screen.
        if (box.top < 140 || box.bottom > window.innerHeight - 60) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
      utterance.onend = () => speak(index + 1)
      utterance.onerror = (event) => {
        // `canceled`/`interrupted` come from our own stop(); anything else ends the run.
        if (
          token === run.current &&
          event.error !== 'canceled' &&
          event.error !== 'interrupted'
        ) {
          clearHighlight()
          setStatus('idle')
        }
      }

      synth.speak(utterance)
    }

    setStatus('playing')
    speak(0)
  }

  const pause = () => {
    window.speechSynthesis.pause()
    setStatus('paused')
  }

  const resume = () => {
    window.speechSynthesis.resume()
    setStatus('playing')
  }

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[calc(var(--z-sticky)+1)] h-1 bg-transparent"
      >
        <div
          ref={bar}
          className="h-full origin-left scale-x-0 bg-terra-bright"
          data-testid="reading-progress"
        />
      </div>

      <div
        role="toolbar"
        aria-label={t('readerTools')}
        data-reading-toolbar
        className="sticky top-[5rem] z-[var(--z-raised)] mb-8 flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-canvas/95 px-3 py-2.5 backdrop-blur-md"
      >
        {canSpeak &&
          (status === 'idle' ? (
            <button type="button" onClick={play} className={buttonClass}>
              <Icon>
                <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
              </Icon>
              {t('listen')}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={status === 'playing' ? pause : resume}
                className={buttonClass}
              >
                <Icon>
                  {status === 'playing' ? (
                    <path d="M8 5v14M16 5v14" />
                  ) : (
                    <path d="M7 4.5v15l12-7.5-12-7.5Z" />
                  )}
                </Icon>
                {status === 'playing' ? t('pause') : t('resume')}
              </button>
              <button type="button" onClick={stop} className={buttonClass}>
                <Icon>
                  <rect x="6" y="6" width="12" height="12" rx="1.5" />
                </Icon>
                {t('stop')}
              </button>
            </>
          ))}

        <button
          type="button"
          onClick={toggleReading}
          aria-pressed={reading}
          className={buttonClass}
        >
          <Icon>
            <path d="M2 5h6a4 4 0 0 1 4 4v11a3 3 0 0 0-3-3H2V5Z" />
            <path d="M22 5h-6a4 4 0 0 0-4 4v11a3 3 0 0 1 3-3h7V5Z" />
          </Icon>
          {t('readingMode')}
        </button>

        <p className="ml-auto pr-2 text-sm text-ink-muted tabular-nums" aria-live="off">
          {left > 0 ? t('minutesLeft', { minutes: left }) : t('endOfText')}
        </p>
      </div>
    </>
  )
}
