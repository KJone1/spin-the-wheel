type WindowWithWebkitAudio = Window & {
  webkitAudioContext?: typeof AudioContext
}

let audioCtx: AudioContext | null = null
let soundMuted = false

export function setSoundMuted(muted: boolean): void {
  soundMuted = muted
}

export function ensureAudioContext(): AudioContext | null {
  if (typeof window === 'undefined' || soundMuted) {
    return null
  }

  if (!audioCtx) {
    const AudioContextCtor =
      window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext
    if (!AudioContextCtor) {
      return null
    }
    audioCtx = new AudioContextCtor()
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }

  return audioCtx
}

export function playTickSound(frequency = 1000, duration = 0.012): void {
  if (soundMuted) {
    return
  }

  try {
    const ctx = ensureAudioContext()
    if (!ctx) {
      return
    }

    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(frequency, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + duration)

    gainNode.gain.setValueAtTime(0.15, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    osc.start()
    osc.stop(ctx.currentTime + duration + 0.005)
  } catch (e) {
    console.warn('Audio synthesis not allowed or supported by browser:', e)
  }
}
