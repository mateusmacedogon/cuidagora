"use client";

import { useEffect, useState } from "react";

/** Leitura em voz alta usando a síntese de voz nativa do navegador (quando existir). */
export function SpeakButton({ text, label = "Ouvir esta página" }: { text: string; label?: string }) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!supported) return null;

  function toggle() {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={speaking}
      className="no-print inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-[var(--color-brand)] bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-brand-strong)] hover:bg-[var(--color-brand-soft)]"
    >
      <span aria-hidden="true">🔊</span>
      {speaking ? "Parar leitura" : label}
    </button>
  );
}
