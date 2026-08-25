"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

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
      className={`no-print inline-flex min-h-10 items-center gap-2 rounded-xl border px-3.5 py-1.5 text-sm font-semibold transition-colors shadow-2xs cursor-pointer ${
        speaking
          ? "border-rose-300 bg-rose-50 text-rose-800"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
      }`}
    >
      {speaking ? (
        <VolumeX className="size-4 text-rose-600" aria-hidden="true" />
      ) : (
        <Volume2 className="size-4 text-teal-600" aria-hidden="true" />
      )}
      <span>{speaking ? "Parar leitura" : label}</span>
    </button>
  );
}
