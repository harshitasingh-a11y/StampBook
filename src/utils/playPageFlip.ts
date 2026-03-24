let audioCtx: AudioContext | null = null;
let decodedBuffer: AudioBuffer | null = null;
let rawBuffer: ArrayBuffer | null = null;
let fetchPromise: Promise<void> | null = null;

// Fetch the raw bytes eagerly (no AudioContext needed)
function prefetch() {
  if (fetchPromise) return;
  fetchPromise = fetch('/sounds/freesound_community-page-flip-47177.mp3')
    .then((r) => r.arrayBuffer())
    .then((ab) => { rawBuffer = ab; })
    .catch(() => {});
}

prefetch();

async function getBuffer(ac: AudioContext): Promise<AudioBuffer | null> {
  if (decodedBuffer) return decodedBuffer;
  if (!rawBuffer) {
    await fetchPromise;
    if (!rawBuffer) return null;
  }
  try {
    decodedBuffer = await ac.decodeAudioData(rawBuffer.slice(0));
    return decodedBuffer;
  } catch {
    return null;
  }
}

export function playPageFlip() {
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    const ac = audioCtx;
    if (ac.state === 'suspended') ac.resume();

    getBuffer(ac).then((buffer) => {
      if (!buffer) return;
      const source = ac.createBufferSource();
      source.buffer = buffer;
      source.connect(ac.destination);
      source.start();
    });
  } catch {
    // Audio not supported
  }
}
