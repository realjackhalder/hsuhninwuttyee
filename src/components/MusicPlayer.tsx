import { useEffect, useRef, useState } from "react";

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  // Romantic chord progression in F Major / D Minor: F, C, Dm, Bb (arpeggios)
  const notes = [
    // Fmaj: F3, A3, C4, F4, A4
    [174.61, 220.0, 261.63, 349.23, 440.0],
    // Cmaj: C3, E3, G3, C4, E4
    [130.81, 164.81, 196.0, 261.63, 329.63],
    // Dmin: D3, F3, A3, D4, F4
    [146.83, 174.61, 220.0, 293.66, 349.23],
    // Bbmaj: Bb2, D3, F3, Bb3, D4
    [116.54, 146.83, 174.61, 233.08, 293.66],
  ];

  const playChime = (freq: number, time: number) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, time);

    // Warm soft bell / electric piano envelope
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.08, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 2.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 2.5);
  };

  const startMusic = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }

    setIsPlaying(true);

    let chordIndex = 0;
    let noteIndex = 0;

    const playNext = () => {
      if (!audioCtxRef.current) return;
      const now = audioCtxRef.current.currentTime;
      const currentChord = notes[chordIndex];

      playChime(currentChord[noteIndex], now);

      noteIndex++;
      if (noteIndex >= currentChord.length) {
        noteIndex = 0;
        chordIndex = (chordIndex + 1) % notes.length;
      }

      timerRef.current = window.setTimeout(playNext, 420);
    };

    playNext();
  };

  const stopMusic = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
  };

  const toggleMusic = () => {
    if (isPlaying) {
      stopMusic();
    } else {
      startMusic();
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  return (
    <div className="floating-music-control">
      <button
        className={`music-btn ${isPlaying ? "playing" : ""}`}
        onClick={toggleMusic}
        title={isPlaying ? "Mute Romantic Music" : "Play Romantic Music"}
        aria-label="Toggle romantic background music"
      >
        <span className="music-icon">{isPlaying ? "🎵" : "🔈"}</span>
        <span className="music-text">
          {isPlaying ? "Music Playing" : "Play Music"}
        </span>
        {isPlaying && (
          <div className="equalizer-bars" aria-hidden="true">
            <span className="bar bar-1"></span>
            <span className="bar bar-2"></span>
            <span className="bar bar-3"></span>
          </div>
        )}
      </button>
    </div>
  );
}
