import { useCallback, useEffect, useRef, useState } from 'react';

export const VOICE_SECONDS = 10;

/**
 * Short voice capture: listens at most 10 seconds, or until the person taps "Terminé".
 * `onText` receives the full text heard so far.
 */
export function useVoice(onText: (text: string) => void, seconds = VOICE_SECONDS) {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [left, setLeft] = useState(seconds);
  const recRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textRef = useRef(onText);
  textRef.current = onText;

  const clear = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const stop = useCallback(() => {
    clear();
    try {
      recRef.current?.stop();
    } catch {
      /* already stopped */
    }
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return setSupported(false);
    try {
      const r = new SR();
      r.lang = 'fr-FR';
      r.interimResults = true;
      r.onstart = () => {
        setListening(true);
        setLeft(seconds);
        clear();
        let n = seconds;
        timerRef.current = setInterval(() => {
          n -= 1;
          setLeft(n);
          if (n <= 0) stop();
        }, 1000);
      };
      r.onresult = (ev: any) => {
        const t = Array.from(ev.results)
          .map((x: any) => x[0].transcript)
          .join('');
        textRef.current(t);
      };
      r.onerror = () => stop();
      r.onend = () => {
        clear();
        setListening(false);
      };
      recRef.current = r;
      r.start();
    } catch {
      setSupported(false);
    }
  }, [seconds, stop]);

  const toggle = useCallback(() => (listening ? stop() : start()), [listening, start, stop]);

  useEffect(
    () => () => {
      clear();
      try {
        recRef.current?.abort?.();
      } catch {
        /* ignore */
      }
    },
    []
  );

  return { supported, listening, left, toggle, stop };
}
