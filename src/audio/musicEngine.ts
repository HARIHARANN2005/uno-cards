// Ambient arcade procedural music generator using Web Audio API

class MusicEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private volume: number = 0.4;
  private stepTimer: number | null = null;
  private currentStep: number = 0;

  // Pentatonic chord progression in C: Cmaj7, Am7, Fmaj7, G7
  private chordProgression = [
    [261.63, 329.63, 392.00, 493.88], // C, E, G, B (Cmaj7)
    [220.00, 261.63, 329.63, 392.00], // A, C, E, G (Am7)
    [174.61, 220.00, 261.63, 329.63], // F, A, C, E (Fmaj7)
    [196.00, 246.94, 293.66, 349.23], // G, B, D, F (G7)
  ];

  private bassNotes = [130.81, 110.00, 87.31, 98.00];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.15, this.ctx.currentTime);
      this.musicGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.15, this.ctx.currentTime);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.15, this.ctx.currentTime);
    }
  }

  public start() {
    if (this.isPlaying) return;
    this.initContext();
    this.isPlaying = true;
    this.currentStep = 0;
    this.scheduleNextStep();
  }

  public stop() {
    this.isPlaying = false;
    if (this.stepTimer) {
      window.clearTimeout(this.stepTimer);
      this.stepTimer = null;
    }
  }

  public toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
    return this.isPlaying;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private scheduleNextStep = () => {
    if (!this.isPlaying || !this.ctx || !this.musicGain) return;

    const bar = Math.floor(this.currentStep / 4) % 4;
    const beat = this.currentStep % 4;
    const now = this.ctx.currentTime;

    // Trigger soft warm pad chord on beat 0
    if (beat === 0) {
      const chord = this.chordProgression[bar];
      chord.forEach(freq => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 1.8);

        osc.connect(gain);
        gain.connect(this.musicGain!);

        osc.start(now);
        osc.stop(now + 1.8);
      });

      // Bass note
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(this.bassNotes[bar], now);
      bassGain.gain.setValueAtTime(0.12, now);
      bassGain.gain.exponentialRampToValueAtTime(0.01, now + 1.6);
      bassOsc.connect(bassGain);
      bassGain.connect(this.musicGain);
      bassOsc.start(now);
      bassOsc.stop(now + 1.6);
    }

    // Gentle high arpeggio note on every beat
    const chord = this.chordProgression[bar];
    const arpFreq = chord[beat] * 2;
    const arpOsc = this.ctx.createOscillator();
    const arpGain = this.ctx.createGain();

    arpOsc.type = 'sine';
    arpOsc.frequency.setValueAtTime(arpFreq, now);

    arpGain.gain.setValueAtTime(0.03, now);
    arpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    arpOsc.connect(arpGain);
    arpGain.connect(this.musicGain);

    arpOsc.start(now);
    arpOsc.stop(now + 0.35);

    this.currentStep++;
    // Tempo: ~120 BPM => 500ms per beat
    this.stepTimer = window.setTimeout(this.scheduleNextStep, 480);
  };
}

export const musicEngine = new MusicEngine();
