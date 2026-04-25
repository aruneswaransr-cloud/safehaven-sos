import { useEffect, useRef, useState, useCallback } from "react";

// Minimal SpeechRecognition typing
type SR = any;

interface Options {
  onTranscript?: (text: string) => void;
  onMatch?: () => void;
  matchWords?: string[];
  lang?: string;
}

export function useSpeechRecognition({
  onTranscript,
  onMatch,
  matchWords = [],
  lang = "en-IN",
}: Options) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [transcript, setTranscript] = useState("");
  const recRef = useRef<SR | null>(null);
  const stoppedManually = useRef(false);
  const matchWordsRef = useRef(matchWords);
  const onMatchRef = useRef(onMatch);
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    matchWordsRef.current = matchWords;
  }, [matchWords]);
  useEffect(() => {
    onMatchRef.current = onMatch;
  }, [onMatch]);
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    const Ctor: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Ctor) {
      setSupported(false);
      return;
    }
    const r: SR = new Ctor();
    r.continuous = true;
    r.interimResults = true;
    r.lang = lang;

    r.onresult = (e: any) => {
      let text = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      const lower = text.toLowerCase();
      setTranscript(lower);
      onTranscriptRef.current?.(lower);
      const words = matchWordsRef.current.map((w) => w.trim().toLowerCase()).filter(Boolean);
      if (words.some((w) => w && lower.includes(w))) {
        onMatchRef.current?.();
      }
    };
    r.onend = () => {
      if (!stoppedManually.current) {
        try {
          r.start();
        } catch {
          /* ignore */
        }
      } else {
        setListening(false);
      }
    };
    r.onerror = (ev: any) => {
      // auto-restart on no-speech / network
      if (ev.error === "not-allowed" || ev.error === "service-not-allowed") {
        stoppedManually.current = true;
        setListening(false);
      }
    };
    recRef.current = r;
    return () => {
      stoppedManually.current = true;
      try {
        r.stop();
      } catch {
        /* ignore */
      }
    };
  }, [lang]);

  const start = useCallback(() => {
    if (!recRef.current) return;
    stoppedManually.current = false;
    try {
      recRef.current.start();
      setListening(true);
    } catch {
      /* already started */
    }
  }, []);
  const stop = useCallback(() => {
    if (!recRef.current) return;
    stoppedManually.current = true;
    try {
      recRef.current.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
  }, []);

  return { listening, supported, transcript, start, stop };
}
