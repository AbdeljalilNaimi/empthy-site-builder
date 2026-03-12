/**
 * Play a bell/chime notification sound using Web Audio API.
 * No external audio file needed.
 */
export const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    // Two-tone chime: C6 → E6
    playTone(1047, now, 0.25);
    playTone(1319, now + 0.15, 0.3);
  } catch {
    // Silently fail if audio not supported
  }
};

/**
 * Play a celebratory 3-tone ascending chime for approval (C6 → E6 → G6).
 */
export const playApprovalSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    const playTone = (freq: number, startTime: number, duration: number, volume = 0.3) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    // Ascending triad: C6 → E6 → G6
    playTone(1047, now, 0.3, 0.25);
    playTone(1319, now + 0.2, 0.3, 0.3);
    playTone(1568, now + 0.4, 0.5, 0.35);
  } catch {
    // Silently fail
  }
};

/**
 * Play a descending alert tone for rejection (E6 → C6).
 */
export const playRejectionSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    // Descending: E6 → C6
    playTone(1319, now, 0.3);
    playTone(1047, now + 0.25, 0.4);
  } catch {
    // Silently fail
  }
};
