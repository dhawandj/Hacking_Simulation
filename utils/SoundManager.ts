
export class SoundManager {
  private static ctx: AudioContext | null = null;
  private static muted: boolean = false;
  private static masterGain: GainNode | null = null;

  static init() {
    // Safety check for SSR or non-browser environments
    if (typeof window === 'undefined') return;

    // If context exists, ensure it's running
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    try {
      // Robustly fetch the constructor, handling vendor prefixes
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      
      // Check if AudioCtx is actually a constructor function before invoking 'new'
      if (!AudioCtx || typeof AudioCtx !== 'function') {
        console.warn('SoundManager: AudioContext is not supported or not a constructor in this environment.');
        return;
      }

      // Safe instantiation
      this.ctx = new AudioCtx();
      
      // Master Gain for global volume control
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.25; // Keep global volume distinct but not ear-piercing
      this.masterGain.connect(this.ctx.destination);
      
    } catch (e) {
      // Specifically catch "Illegal constructor" or other instantiation errors
      console.warn("SoundManager: Failed to initialize AudioContext.", e);
      this.muted = true; // Auto-mute if audio system fails to init
    }
  }

  static toggleMute() {
    this.muted = !this.muted;
    if (this.ctx && this.masterGain) {
      const t = this.ctx.currentTime;
      // Smooth fade out/in to avoid clicks
      this.masterGain.gain.cancelScheduledValues(t);
      this.masterGain.gain.setTargetAtTime(this.muted ? 0 : 0.25, t, 0.1);
    }
    return this.muted;
  }

  static isMuted() {
    return this.muted;
  }

  /**
   * Helper: Generate White Noise Buffer
   */
  private static createNoiseBuffer() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds buffer
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  static play(type: 'click' | 'hover' | 'type' | 'success' | 'error' | 'lock' | 'static' | 'scan' | 'refresh' | 'tone') {
    if (this.muted) return;
    
    // Attempt init if not ready, but handle failure gracefully
    if (!this.ctx) {
      this.init();
      if (!this.ctx || !this.masterGain) return;
    }

    const t = this.ctx.currentTime;

    try {
      switch (type) {
        case 'click': {
          // High-tech UI "chirp"
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          
          osc.connect(gain);
          gain.connect(this.masterGain);

          // Fast sine sweep
          osc.frequency.setValueAtTime(2000, t);
          osc.frequency.exponentialRampToValueAtTime(1000, t + 0.05);
          
          // Very short envelope
          gain.gain.setValueAtTime(0.5, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

          osc.start(t);
          osc.stop(t + 0.05);
          break;
        }

        case 'hover': {
          // Subtle data tick
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          
          osc.connect(gain);
          gain.connect(this.masterGain);

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(800, t);
          
          // Micro-envelope
          gain.gain.setValueAtTime(0.05, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

          osc.start(t);
          osc.stop(t + 0.02);
          break;
        }

        case 'type': {
          // Mechanical/Digital hybrid keypress
          // Layer 1: The "click"
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.connect(gain);
          gain.connect(this.masterGain);
          
          osc.type = 'square';
          // Randomize pitch slightly for realism
          const freq = 600 + Math.random() * 200; 
          osc.frequency.setValueAtTime(freq, t);
          
          gain.gain.setValueAtTime(0.05, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

          osc.start(t);
          osc.stop(t + 0.05);

          // Layer 2: The "thud" (Lower frequency sine)
          const osc2 = this.ctx.createOscillator();
          const gain2 = this.ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(this.masterGain);
          
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(200, t);
          gain2.gain.setValueAtTime(0.05, t);
          gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
          
          osc2.start(t);
          osc2.stop(t + 0.08);
          break;
        }

        case 'success': {
          // Futuristic Major Chord Swipe
          const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C Major
          frequencies.forEach((f, i) => {
            if (!this.ctx || !this.masterGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.type = 'sine';
            // Stagger starts for an arpeggio effect
            const startTime = t + (i * 0.03); 
            
            osc.frequency.setValueAtTime(f, startTime);
            
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

            osc.start(startTime);
            osc.stop(startTime + 0.5);
          });
          break;
        }

        case 'error': {
          // FM Synthesis "Growl"
          const carrier = this.ctx.createOscillator();
          const modulator = this.ctx.createOscillator();
          const modGain = this.ctx.createGain();
          const outGain = this.ctx.createGain();

          // Modulator modulates Carrier frequency
          modulator.connect(modGain);
          modGain.connect(carrier.frequency);
          carrier.connect(outGain);
          outGain.connect(this.masterGain);

          carrier.type = 'sawtooth';
          carrier.frequency.setValueAtTime(150, t);
          carrier.frequency.linearRampToValueAtTime(100, t + 0.4); // Slide down

          modulator.type = 'square';
          modulator.frequency.setValueAtTime(50, t); // Modulation rate
          
          modGain.gain.setValueAtTime(500, t); // Modulation depth (richness)
          modGain.gain.exponentialRampToValueAtTime(10, t + 0.4);

          outGain.gain.setValueAtTime(0.3, t);
          outGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

          carrier.start(t);
          modulator.start(t);
          carrier.stop(t + 0.4);
          modulator.stop(t + 0.4);
          break;
        }

        case 'lock': {
          // Sharp target acquisition tone
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.connect(gain);
          gain.connect(this.masterGain);

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(880, t);
          osc.frequency.setValueAtTime(1760, t + 0.05);
          osc.frequency.setValueAtTime(880, t + 0.1);

          gain.gain.setValueAtTime(0.1, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

          osc.start(t);
          osc.stop(t + 0.2);
          break;
        }

        case 'static': {
          // Bandpass filtered noise
          const buffer = this.createNoiseBuffer();
          if (!buffer) return;

          const source = this.ctx.createBufferSource();
          source.buffer = buffer;
          
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.Q.value = 1;
          filter.frequency.setValueAtTime(1000, t);
          // Sweep filter for "glitch" movement
          filter.frequency.linearRampToValueAtTime(3000, t + 0.1);

          const gain = this.ctx.createGain();
          
          source.connect(filter);
          filter.connect(gain);
          gain.connect(this.masterGain);

          gain.gain.setValueAtTime(0.15, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

          source.start(t);
          source.stop(t + 0.15);
          break;
        }

        case 'scan': {
          // Sci-fi Radar/Sonar
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.connect(gain);
          gain.connect(this.masterGain);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, t);
          osc.frequency.exponentialRampToValueAtTime(2000, t + 0.1); // Ping up
          
          gain.gain.setValueAtTime(0.05, t);
          gain.gain.linearRampToValueAtTime(0.08, t + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5); // Long tail reverb-like

          osc.start(t);
          osc.stop(t + 0.5);
          break;
        }

        case 'refresh': {
          // Digital "Woosh" or Slide
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.masterGain);

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(100, t);
          osc.frequency.exponentialRampToValueAtTime(800, t + 0.3);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(200, t);
          filter.frequency.linearRampToValueAtTime(2000, t + 0.3);

          gain.gain.setValueAtTime(0.1, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.35);

          osc.start(t);
          osc.stop(t + 0.35);
          break;
        }

        case 'tone': {
          // Simple UI feedback tone for sliders
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          
          osc.connect(gain);
          gain.connect(this.masterGain);

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, t);
          
          gain.gain.setValueAtTime(0.05, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

          osc.start(t);
          osc.stop(t + 0.05);
          break;
        }
      }
    } catch (err) {
      console.warn("SoundManager error playing sound:", err);
    }
  }
}
