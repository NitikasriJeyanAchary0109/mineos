/**
 * Web Audio API Industrial Emergency Evacuation Siren
 * Generates an authentic, penetrating subterranean mine alarm wail
 * without relying on external assets or streaming URLs.
 */

class SirenAudioService {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private osc: OscillatorNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private lfo: OscillatorNode | null = null;
  private isPlaying: boolean = false;
  private isSilenced: boolean = false;

  public start(): void {
    // Prevent multiple audio instances or restarting on React re-renders
    if (this.isPlaying) {
      if (this.isSilenced) {
        // If silenced and start is called, remain silenced unless resumed
        return;
      }
      return;
    }

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) {
        console.warn('Web Audio API is not supported in this browser.');
        return;
      }

      this.audioCtx = new AudioCtxClass();
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      // Master Gain: controlled, audible, non-clipping volume level
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, now);
      // Fade in smoothly over 150ms to prevent clicking
      this.masterGain.gain.exponentialRampToValueAtTime(0.22, now + 0.15);
      this.masterGain.connect(this.audioCtx.destination);

      // Lowpass filter to shape the tone into a heavy industrial horn/siren
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1250, now);
      filter.Q.setValueAtTime(3.5, now);
      filter.connect(this.masterGain);

      // Primary Carrier Oscillator (Gritty sawtooth industrial timbre)
      this.osc = this.audioCtx.createOscillator();
      this.osc.type = 'sawtooth';
      this.osc.frequency.setValueAtTime(520, now);

      // Low-Frequency Oscillator (LFO) for the slow, ominous rising/falling wail (~3.6s cycle)
      this.lfo = this.audioCtx.createOscillator();
      this.lfo.type = 'triangle';
      this.lfo.frequency.setValueAtTime(0.28, now); // ~0.28 Hz wail cycle

      const lfoGain = this.audioCtx.createGain();
      lfoGain.gain.setValueAtTime(320, now); // Swings frequency between ~200Hz and ~840Hz

      this.lfo.connect(lfoGain);
      lfoGain.connect(this.osc.frequency);

      // Sub-harmonic oscillator for low-frequency subterranean rumble
      this.subOsc = this.audioCtx.createOscillator();
      this.subOsc.type = 'sine';
      this.subOsc.frequency.setValueAtTime(260, now);

      const subLfoGain = this.audioCtx.createGain();
      subLfoGain.gain.setValueAtTime(160, now);
      this.lfo.connect(subLfoGain);
      subLfoGain.connect(this.subOsc.frequency);

      // Connect sources to filter
      this.osc.connect(filter);
      this.subOsc.connect(filter);

      // Start all audio nodes
      this.lfo.start(now);
      this.osc.start(now);
      this.subOsc.start(now);

      this.isPlaying = true;
      this.isSilenced = false;
      this.notifyState();
    } catch (err) {
      console.error('Failed to initialize siren audio:', err);
    }
  }

  /**
   * Silences the siren audio output (audio only)
   * The critical hazard remains visually active until resolved.
   */
  public silence(): void {
    if (!this.isPlaying || !this.masterGain || !this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      this.isSilenced = true;
      this.notifyState();
    } catch (err) {
      console.error('Error silencing siren:', err);
    }
  }

  /**
   * Resumes the audible siren wail if currently silenced.
   */
  public resume(): void {
    if (!this.isPlaying || !this.masterGain || !this.audioCtx) {
      this.start();
      return;
    }
    try {
      const now = this.audioCtx.currentTime;
      this.masterGain.gain.setValueAtTime(0.001, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.22, now + 0.1);
      this.isSilenced = false;
      this.notifyState();
    } catch (err) {
      console.error('Error resuming siren:', err);
    }
  }

  public stop(): void {
    if (!this.isPlaying || !this.audioCtx || !this.masterGain) {
      this.isPlaying = false;
      this.isSilenced = false;
      this.notifyState();
      return;
    }

    try {
      const now = this.audioCtx.currentTime;
      // Fade out smoothly over 80ms to avoid audio click/pop
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      const ctx = this.audioCtx;
      const osc = this.osc;
      const subOsc = this.subOsc;
      const lfo = this.lfo;

      setTimeout(() => {
        try {
          osc?.stop();
          subOsc?.stop();
          lfo?.stop();
          ctx.close();
        } catch {
          // already closed
        }
      }, 100);
    } catch (err) {
      console.error('Error stopping siren audio:', err);
    } finally {
      this.audioCtx = null;
      this.masterGain = null;
      this.osc = null;
      this.subOsc = null;
      this.lfo = null;
      this.isPlaying = false;
      this.isSilenced = false;
      this.notifyState();
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }

  public getIsSilenced(): boolean {
    return this.isSilenced;
  }

  private notifyState(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('msafe_siren_state_change', {
          detail: { isPlaying: this.isPlaying, isSilenced: this.isSilenced },
        })
      );
    }
  }
}

export const sirenAudio = new SirenAudioService();
