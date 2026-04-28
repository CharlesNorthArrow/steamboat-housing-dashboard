import { useState, useEffect, useCallback, useRef } from 'react'

const HL = 'reading-highlight'

function applyHL(readId)  { readId && document.querySelector(`[data-read-id="${readId}"]`)?.classList.add(HL) }
function removeHL(readId) { readId && document.querySelector(`[data-read-id="${readId}"]`)?.classList.remove(HL) }

// segments: Array<{ text: string, readId?: string }>
// One utterance per segment — onstart fires reliably; onboundary/charIndex is browser-unreliable.
export function useTextToSpeech() {
  const [status, setStatus] = useState('idle')
  const activeReadIdRef     = useRef(null)

  const clearHL = useCallback(() => {
    removeHL(activeReadIdRef.current)
    activeReadIdRef.current = null
  }, [])

  useEffect(() => () => { window.speechSynthesis?.cancel(); clearHL() }, [clearHL])

  const speak = useCallback((segments) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    clearHL()

    const last = segments.length - 1
    segments.forEach((seg, i) => {
      const utt   = new SpeechSynthesisUtterance(seg.text)
      utt.rate    = 0.92
      utt.pitch   = 1
      utt.onstart = () => {
        setStatus('playing')
        removeHL(activeReadIdRef.current)
        activeReadIdRef.current = seg.readId ?? null
        applyHL(activeReadIdRef.current)
      }
      utt.onend    = () => { if (i === last) { setStatus('idle'); clearHL() } }
      utt.onerror  = () => { setStatus('idle'); clearHL() }
      utt.onpause  = () => setStatus('paused')
      utt.onresume = () => setStatus('playing')
      window.speechSynthesis.speak(utt)
    })
  }, [clearHL])

  const pause  = useCallback(() => { window.speechSynthesis?.pause();  setStatus('paused')  }, [])
  const resume = useCallback(() => { window.speechSynthesis?.resume(); setStatus('playing') }, [])
  const stop   = useCallback(() => { window.speechSynthesis?.cancel(); clearHL(); setStatus('idle') }, [clearHL])

  return {
    status, speak, pause, resume, stop,
    isSupported: typeof window !== 'undefined' && 'speechSynthesis' in window,
  }
}
