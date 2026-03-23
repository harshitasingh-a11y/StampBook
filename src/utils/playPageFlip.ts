let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

export function playPageFlip() {
  try {
    const ac = getCtx();

    // Resume if suspended (browser autoplay policy)
    if (ac.state === 'suspended') ac.resume();

    const now = ac.currentTime;
    const duration = 0.38;

    // ── White noise source ─────────────────────────────────────────
    const bufferSize = ac.sampleRate * duration;
    const noiseBuffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ac.createBufferSource();
    noise.buffer = noiseBuffer;

    // ── Bandpass filter — sweeps from 2 kHz → 600 Hz (paper whoosh) ─
    const bandpass = ac.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.Q.value = 1.2;
    bandpass.frequency.setValueAtTime(2200, now);
    bandpass.frequency.exponentialRampToValueAtTime(600, now + duration * 0.75);

    // ── Low-pass to soften the top end ────────────────────────────
    const lowpass = ac.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 4000;

    // ── Gain envelope: fast attack → smooth decay ─────────────────
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.012);   // fast attack
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.10); // quick fall
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration); // tail out

    // ── Soft body thud at the landing point ───────────────────────
    const thudOsc = ac.createOscillator();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(180, now + 0.18);
    thudOsc.frequency.exponentialRampToValueAtTime(60, now + 0.32);

    const thudGain = ac.createGain();
    thudGain.gain.setValueAtTime(0, now + 0.18);
    thudGain.gain.linearRampToValueAtTime(0.06, now + 0.20);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

    // ── Graph ──────────────────────────────────────────────────────
    noise.connect(bandpass);
    bandpass.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(ac.destination);

    thudOsc.connect(thudGain);
    thudGain.connect(ac.destination);

    noise.start(now);
    noise.stop(now + duration);
    thudOsc.start(now + 0.18);
    thudOsc.stop(now + 0.36);
  } catch {
    // Audio not supported
  }
}
