/**
 * Utilidades de data centralizadas.
 * O produto é usado no Brasil; usamos um fuso fixo para que "hoje" seja o mesmo
 * no servidor e no navegador (o Brasil não usa horário de verão desde 2019).
 */
export const APP_TIME_ZONE = "America/Sao_Paulo";
const UTC_OFFSET = "-03:00";

// Formatadores memoizados em nível de módulo para alto desempenho e zero overhead de GC
const isoDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: APP_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: APP_TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const longDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: APP_TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
});

const hourFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: APP_TIME_ZONE,
  hour: "2-digit",
  hour12: false,
});

export function nowUtc(): Date {
  return new Date();
}

/** "YYYY-MM-DD" do dia atual no fuso do app. */
export function todayIso(reference: Date = new Date()): string {
  return isoDateFormatter.format(reference);
}

/** "HH:MM" do horário atual no fuso do app. */
export function currentTime(reference: Date = new Date()): string {
  return timeFormatter.format(reference);
}

/** Converte data local ("YYYY-MM-DD") + hora local ("HH:MM") no instante UTC correspondente. */
export function toInstant(dateIso: string, time = "00:00"): Date {
  const safeTime = /^\d{2}:\d{2}$/.test(time) ? time : "00:00";
  return new Date(`${dateIso}T${safeTime}:00${UTC_OFFSET}`);
}

export function addDaysIso(dateIso: string, days: number): string {
  const base = toInstant(dateIso, "12:00");
  base.setUTCDate(base.getUTCDate() + days);
  return todayIso(base);
}

export function startOfDay(dateIso: string): Date {
  return toInstant(dateIso, "00:00");
}

export function endOfDay(dateIso: string): Date {
  return new Date(toInstant(dateIso, "00:00").getTime() + 24 * 60 * 60 * 1000 - 1);
}

export function formatDate(value: Date | string): string {
  let date: Date;
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === "string") {
    if (value.includes("T") || value.includes("Z")) {
      date = new Date(value);
    } else {
      date = toInstant(value, "12:00");
    }
  } else {
    date = new Date();
  }
  return dateFormatter.format(date);
}

export function formatLongDate(value: Date | string): string {
  let date: Date;
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === "string") {
    if (value.includes("T") || value.includes("Z")) {
      date = new Date(value);
    } else {
      date = toInstant(value, "12:00");
    }
  } else {
    date = new Date();
  }
  return longDateFormatter.format(date);
}

export function formatTime(value: Date): string {
  return timeFormatter.format(value);
}

export function formatDateTime(value: Date): string {
  return `${formatDate(value)} às ${formatTime(value)}`;
}

/** Saudação de acordo com o horário local. */
export function greeting(reference: Date = new Date()): string {
  const hour = Number(hourFormatter.format(reference));
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function minutesFromTime(time: string): number {
  const [hours, minutes] = time.split(":").map((part) => Number(part));
  return (hours || 0) * 60 + (minutes || 0);
}

export function firstNameOf(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}
