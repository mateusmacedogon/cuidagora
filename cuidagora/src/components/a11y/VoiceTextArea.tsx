"use client";

import { useEffect, useRef, useState } from "react";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type RecognitionConstructor = new () => SpeechRecognitionLike;

function getRecognition(): RecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Campo de texto com ditado por voz.
 * O texto reconhecido é sempre mostrado para confirmação antes de entrar no campo.
 */
export function VoiceTextArea({
  label,
  name,
  hint,
  error,
  defaultValue = "",
  rows = 3,
  required = false,
}: {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  defaultValue?: string;
  rows?: number;
  required?: boolean;
}) {
  const [value, setValue] = useState(defaultValue);
  const [draft, setDraft] = useState("");
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setSupported(getRecognition() !== null);
    return () => recognitionRef.current?.stop();
  }, []);

  function startListening() {
    const Recognition = getRecognition();
    if (!Recognition) return;
    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = Array.from({ length: event.results.length }, (_, index) => {
        const result = event.results[index];
        return result?.[0]?.transcript ?? "";
      })
        .join(" ")
        .trim();
      setDraft(transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
    setListening(true);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-base font-semibold">
        {label}
        {!required ? (
          <span className="ml-2 text-sm font-normal text-[var(--color-ink-soft)]">(opcional)</span>
        ) : null}
      </label>
      {hint ? (
        <p id={`${name}-hint`} className="text-sm text-[var(--color-ink-soft)]">
          {hint}
        </p>
      ) : null}
      <textarea
        id={name}
        name={name}
        rows={rows}
        required={required}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={hint ? `${name}-hint` : undefined}
        className="field-control"
      />
      {supported ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={listening ? () => recognitionRef.current?.stop() : startListening}
            aria-pressed={listening}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--color-accent)]"
          >
            <span aria-hidden="true">🎤</span>
            {listening ? "Gravando… toque para parar" : "Ditar por voz"}
          </button>
          <span className="text-sm text-[var(--color-ink-soft)]">
            Você confere o texto antes de salvar.
          </span>
        </div>
      ) : null}
      {draft ? (
        <div
          className="rounded-2xl border-2 border-[var(--color-accent)] bg-[var(--color-accent-soft)] p-3"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-bold">Ouvi isto:</p>
          <p className="my-1 font-medium">“{draft}”</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setValue((current) => (current ? `${current} ${draft}` : draft));
                setDraft("");
              }}
              className="min-h-11 rounded-full bg-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-white"
            >
              ✅ Usar este texto
            </button>
            <button
              type="button"
              onClick={() => setDraft("")}
              className="min-h-11 rounded-full border border-[var(--color-line)] bg-white px-4 py-2 text-sm font-semibold"
            >
              ✖️ Descartar
            </button>
          </div>
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm font-semibold text-[var(--color-alert)]">
          ⚠️ {error}
        </p>
      ) : null}
    </div>
  );
}
