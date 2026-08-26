let audioCtx: AudioContext | null = null;
let sirenOscillator1: OscillatorNode | null = null;
let sirenOscillator2: OscillatorNode | null = null;
let sirenGain: GainNode | null = null;
let sirenInterval: any = null;

export function toggleSirenAudio(enable: boolean): boolean {
  try {
    if (!enable) {
      if (sirenInterval) {
        clearInterval(sirenInterval);
        sirenInterval = null;
      }
      if (sirenOscillator1) {
        try { sirenOscillator1.stop(); } catch (e) {}
        sirenOscillator1.disconnect();
        sirenOscillator1 = null;
      }
      if (sirenGain) {
        sirenGain.disconnect();
        sirenGain = null;
      }
      return false;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return false;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    sirenGain = audioCtx.createGain();
    sirenGain.gain.setValueAtTime(0.08, audioCtx.currentTime); // gentle volume
    sirenGain.connect(audioCtx.destination);

    sirenOscillator1 = audioCtx.createOscillator();
    sirenOscillator1.type = 'sawtooth';
    sirenOscillator1.frequency.setValueAtTime(650, audioCtx.currentTime);
    sirenOscillator1.connect(sirenGain);
    sirenOscillator1.start();

    let high = false;
    sirenInterval = setInterval(() => {
      if (!sirenOscillator1 || !audioCtx) return;
      high = !high;
      const targetFreq = high ? 900 : 650;
      sirenOscillator1.frequency.exponentialRampToValueAtTime(
        targetFreq,
        audioCtx.currentTime + 0.35
      );
    }, 450);

    return true;
  } catch (err) {
    console.warn('AudioContext not allowed or supported:', err);
    return false;
  }
}
