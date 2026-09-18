// Web Audio API helper for zero-dependency sound chimes and focus sounds

class SoundManager {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private noiseGain: GainNode | null = null;
  private isNoisePlaying: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Play a pleasant bell / chime for study interval transition
   */
  public playChime(type: 'complete' | 'break' | 'start' = 'complete') {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      if (type === 'complete') {
        // Harmonious major chord chime (C5, E5, G5, C6)
        const freqs = [523.25, 659.25, 783.99, 1046.5];
        freqs.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);

          gain.gain.setValueAtTime(0.001, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.18 / (idx + 1), now + idx * 0.08 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.6);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 1.8);
        });
      } else if (type === 'break') {
        // Soft mellow dual tone (A4 -> F4)
        [440, 349.23].forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.2);

          gain.gain.setValueAtTime(0.001, now + idx * 0.2);
          gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.2 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.2 + 1.2);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(now + idx * 0.2);
          osc.stop(now + idx * 0.2 + 1.4);
        });
      } else {
        // Start block single bright tone
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.15, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.9);
      }
    } catch {
      // Audio context might be restricted before user interaction
    }
  }

  /**
   * Toggle gentle brown noise / rain-like study focus sound
   */
  public toggleFocusNoise(enable?: boolean): boolean {
    try {
      this.initContext();
      if (!this.ctx) return false;

      const shouldPlay = enable !== undefined ? enable : !this.isNoisePlaying;

      if (shouldPlay && !this.isNoisePlaying) {
        // Generate Brown noise (smoother, warmer than white noise for studying)
        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // boost level
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Lowpass filter for warm comforting sound
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.06, this.ctx.currentTime + 1);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        whiteNoise.start();
        this.noiseNode = whiteNoise;
        this.noiseGain = gain;
        this.isNoisePlaying = true;
        return true;
      } else if (!shouldPlay && this.isNoisePlaying) {
        if (this.noiseGain && this.ctx) {
          this.noiseGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
          setTimeout(() => {
            try {
              (this.noiseNode as any)?.stop();
              this.noiseNode?.disconnect();
              this.noiseGain?.disconnect();
              this.noiseNode = null;
              this.noiseGain = null;
            } catch {}
          }, 600);
        }
        this.isNoisePlaying = false;
        return false;
      }

      return this.isNoisePlaying;
    } catch {
      return false;
    }
  }

  public getIsFocusNoisePlaying(): boolean {
    return this.isNoisePlaying;
  }
}

export const sounds = new SoundManager();
