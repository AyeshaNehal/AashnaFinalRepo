export const playSuccessSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Create oscillator for the main "ding"
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    // Start at C5
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    // Quickly slide up to C6 for a happy "ding"
    osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1);
    
    // Volume envelope
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.error("Audio error:", e);
  }
};

export const playBossWinSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Play a major arpeggio (C, E, G, C)
    const playNote = (freq: number, startTime: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    };

    const now = ctx.currentTime;
    playNote(523.25, now);         // C5
    playNote(659.25, now + 0.1);   // E5
    playNote(783.99, now + 0.2);   // G5
    playNote(1046.50, now + 0.3);  // C6
  } catch (e) {
    console.error("Audio error:", e);
  }
};

// Text-to-speech via the Web Speech API — the same pipeline ControlsBar's
// Speak button uses, wrapped for reuse. Cancels any ongoing speech first so
// consecutive bot replies don't queue up and play out of sync.
export const speakText = (text: string) => {
  try {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error("Speech error:", e);
  }
};

// Stop any in-progress speech (e.g. when muting the bot's voice).
export const stopSpeaking = () => {
  try {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  } catch (e) {
    console.error("Speech error:", e);
  }
};

export const playErrorSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sawtooth';
    // Low, sad buzz
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.error("Audio error:", e);
  }
};

// ─── Rising Stability Tone ───────────────────────────────────────────────────
// A subtle, pitch-ascending tone that plays during the commit gate's stability
// window.  The pitch starts low and climbs as the hold progresses, giving
// audible feedback that the model is converging on a letter.
//
// Controlled from CameraView's per-frame loop:
//   start()          — called when a new candidate letter is first detected
//   update(progress) — called each frame with progress 0→1
//   stop()           — called on successful commit (plays success sound)
//   cancel()         — called when the candidate is abandoned
//
// Respects prefers-reduced-motion and a localStorage toggle
// ('aashna_stabilityTone', defaults to 'true').

const TONE_STORAGE_KEY = 'aashna_stabilityTone';
const TONE_FREQ_START = 280;  // Hz — warm, low
const TONE_FREQ_END = 780;    // Hz — bright, ascending
const TONE_VOLUME = 0.04;     // very quiet — subtle ambient feedback

class StabilityToneController {
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  private active = false;

  private isEnabled(): boolean {
    if (typeof window === 'undefined') return false;
    // Respect prefers-reduced-motion: no rising tone if enabled.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
    // localStorage toggle: 'false' disables, anything else (or absent) enables.
    const stored = localStorage.getItem(TONE_STORAGE_KEY);
    return stored !== 'false';
  }

  /** Start a new tone for a fresh candidate. */
  start() {
    this.cancel();
    if (!this.isEnabled()) return;
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.osc = this.ctx.createOscillator();
      this.gain = this.ctx.createGain();

      this.osc.connect(this.gain);
      this.gain.connect(this.ctx.destination);

      this.osc.type = 'sine';
      this.osc.frequency.setValueAtTime(TONE_FREQ_START, this.ctx.currentTime);

      // Fade in gently so there's no click.
      this.gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.gain.gain.linearRampToValueAtTime(TONE_VOLUME, this.ctx.currentTime + 0.05);

      this.osc.start(this.ctx.currentTime);
      this.active = true;
    } catch {
      // Audio failures are non-fatal — the visual commit gate still works.
      this.cleanup();
    }
  }

  /** Ramp the pitch based on stability progress (0 = just started, 1 = about to commit). */
  update(progress: number) {
    if (!this.active || !this.ctx || !this.osc) return;
    try {
      const clamped = Math.min(1, Math.max(0, progress));
      const freq = TONE_FREQ_START * Math.pow(TONE_FREQ_END / TONE_FREQ_START, clamped);
      // Cancel any previously scheduled ramps before setting a new one.
      this.osc.frequency.cancelScheduledValues(this.ctx.currentTime);
      this.osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    } catch {
      // Non-fatal.
    }
  }

  /** Candidate committed — stop the tone.  The caller plays playSuccessSound() separately. */
  stop() {
    if (!this.active || !this.ctx || !this.gain) {
      this.cleanup();
      return;
    }
    try {
      this.gain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.gain.gain.setValueAtTime(this.gain.gain.value, this.ctx.currentTime);
      this.gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      this.osc?.stop(this.ctx.currentTime + 0.1);
    } catch {
      // Non-fatal.
    }
    this.cleanup();
  }

  /** Candidate abandoned (letter changed, hand lost, cooldown blocked) — fade out silently. */
  cancel() {
    if (!this.active || !this.ctx || !this.gain) {
      this.cleanup();
      return;
    }
    try {
      this.gain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.gain.gain.setValueAtTime(this.gain.gain.value, this.ctx.currentTime);
      this.gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);
      this.osc?.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Non-fatal.
    }
    this.cleanup();
  }

  private cleanup() {
    this.active = false;
    this.osc = null;
    this.gain = null;
    // Close the context after the fade-out has finished.
    const ctx = this.ctx;
    this.ctx = null;
    if (ctx) {
      setTimeout(() => ctx.close().catch(() => {}), 200);
    }
  }
}

// Singleton — reused across all CameraView instances.
export const stabilityTone = new StabilityToneController();
