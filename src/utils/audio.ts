// Web Audio API based sound generator for study focus & timer bells

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Harmonic bell chime
    const freqs = [528, 792, 1056]; // Solfeggio / pleasant harmonic intervals
    freqs.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);

      gain.gain.setValueAtTime(0.2 / (index + 1), now + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 2.0);
    });
  } catch (err) {
    console.error('Audio play failed', err);
  }
}

// Ambient Sound Synthesizer
let ambientSource: AudioNode | null = null;
let ambientGain: GainNode | null = null;

export function stopAmbientSound() {
  if (ambientSource) {
    try {
      if ('stop' in ambientSource && typeof (ambientSource as AudioScheduledSourceNode).stop === 'function') {
        (ambientSource as AudioScheduledSourceNode).stop();
      }
      ambientSource.disconnect();
    } catch {
      // ignore
    }
    ambientSource = null;
  }
  if (ambientGain) {
    ambientGain.disconnect();
    ambientGain = null;
  }
}

export function playAmbientSound(type: 'none' | 'rain' | 'whitenoise' | 'binaural', volume = 0.2) {
  stopAmbientSound();
  if (type === 'none') return;

  try {
    const ctx = getAudioContext();
    ambientGain = ctx.createGain();
    ambientGain.gain.setValueAtTime(volume, ctx.currentTime);
    ambientGain.connect(ctx.destination);

    if (type === 'whitenoise' || type === 'rain') {
      // Buffer white noise generator
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      if (type === 'rain') {
        // Lowpass filter to simulate calming rain
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, ctx.currentTime);
        filter.Q.setValueAtTime(1.5, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(ambientGain);
      } else {
        // Soft white noise
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        whiteNoise.connect(filter);
        filter.connect(ambientGain);
      }

      whiteNoise.start();
      ambientSource = whiteNoise;
    } else if (type === 'binaural') {
      // 40Hz Gamma wave / Focus tone (160Hz and 200Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(180, ctx.currentTime);
      osc2.frequency.setValueAtTime(180 + 40, ctx.currentTime); // 40Hz difference for focus

      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.5, ctx.currentTime);

      osc1.connect(subGain);
      osc2.connect(subGain);
      subGain.connect(ambientGain);

      osc1.start();
      osc2.start();
      ambientSource = subGain;
    }
  } catch (err) {
    console.error('Ambient audio error:', err);
  }
}

export function setAmbientVolume(volume: number) {
  if (ambientGain && audioCtx) {
    ambientGain.gain.setValueAtTime(volume, audioCtx.currentTime);
  }
}
