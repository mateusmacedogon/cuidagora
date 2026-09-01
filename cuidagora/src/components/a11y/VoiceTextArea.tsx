"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AlertCircle, Check, Mic, MicOff, X } from "lucide-react";

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

function subscribe(callback: () => void) {
  return () => {};
}

function getSnapshot() {
  return getRecognition() !== null;
}

function getServerSnapshot() {
  return false;
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
  const supported = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [value, setValue] = useState(defaultValue);
  const [draft, setDraft] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
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
      <label htmlFor={name} className="text-sm sm:text-base font-semibold text-slate-900">
        {label}
        {!required ? (
          <span className="ml-2 text-xs sm:text-sm font-normal text-slate-500">(opcional)</span>
        ) : null}
      </label>
      {hint ? (
        <p id={`${name}-hint`} className="text-xs sm:text-sm text-slate-500">
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
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={listening ? () => recognitionRef.current?.stop() : startListening}
            aria-pressed={listening}
            className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer ${
              listening
                ? "border-rose-300 bg-rose-50 text-rose-800 animate-pulse"
                : "border-indigo-200 bg-indigo-50/80 text-indigo-900 hover:bg-indigo-100"
            }`}
          >
            {listening ? (
              <>
                <MicOff className="size-4 text-rose-600" aria-hidden="true" />
                Gravando… toque para parar
              </>
            ) : (
              <>
                <Mic className="size-4 text-indigo-600" aria-hidden="true" />
                Ditar relato por voz
              </>
            )}
          </button>
          <span className="text-xs text-slate-500">
            Você confere o texto antes de confirmar.
          </span>
        </div>
      ) : null}
      {draft ? (
        <div
          className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3.5 shadow-xs"
          role="status"
          aria-live="polite"
        >
          <p className="text-xs font-bold text-indigo-900 uppercase tracking-wide">Texto reconhecido:</p>
          <p className="my-1.5 text-sm font-medium text-slate-800 italic">“{draft}”</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setValue((current) => (current ? `${current} ${draft}` : draft));
                setDraft("");
              }}
              className="inline-flex items-center gap-1.5 min-h-9 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-700 transition-colors shadow-2xs cursor-pointer"
            >
              <Check className="size-3.5" aria-hidden="true" /> Inserir no campo
            </button>
            <button
              type="button"
              onClick={() => setDraft("")}
              className="inline-flex items-center gap-1.5 min-h-9 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <X className="size-3.5 text-slate-500" aria-hidden="true" /> Descartar
            </button>
          </div>
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-rose-600">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
