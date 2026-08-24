/** Constantes de domínio compartilhadas entre validação, serviços e interface. */

export const PERMISSION_KEYS = [
  "tasks",
  "medications",
  "measurements",
  "symptoms",
  "appointments",
  "timeline",
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export type PermissionSet = Record<PermissionKey, boolean>;

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  tasks: "Ver cuidados do dia",
  medications: "Ver medicamentos",
  measurements: "Ver medições (pressão, glicemia, água)",
  symptoms: "Ver sintomas",
  appointments: "Ver consultas",
  timeline: "Ver linha do tempo",
};

export const NO_PERMISSIONS: PermissionSet = {
  tasks: false,
  medications: false,
  measurements: false,
  symptoms: false,
  appointments: false,
  timeline: false,
};

export const ALL_PERMISSIONS: PermissionSet = {
  tasks: true,
  medications: true,
  measurements: true,
  symptoms: true,
  appointments: true,
  timeline: true,
};

export const MOODS = [
  { value: "good", emoji: "😄", label: "Bem" },
  { value: "ok", emoji: "🙂", label: "Normal" },
  { value: "soso", emoji: "😐", label: "Mais ou menos" },
  { value: "bad", emoji: "😟", label: "Não estou bem" },
] as const;

export type MoodValue = (typeof MOODS)[number]["value"];

export const MOOD_LABELS: Record<MoodValue, string> = {
  good: "Bem",
  ok: "Normal",
  soso: "Mais ou menos",
  bad: "Não estou bem",
};

export const TASK_KINDS = [
  { value: "medication", label: "Medicamento", icon: "💊" },
  { value: "measurement", label: "Medição", icon: "🩺" },
  { value: "hydration", label: "Hidratação", icon: "💧" },
  { value: "activity", label: "Atividade", icon: "🚶" },
  { value: "other", label: "Outro cuidado", icon: "📌" },
] as const;

export type TaskKind = (typeof TASK_KINDS)[number]["value"];

export function taskKindMeta(kind: string) {
  return TASK_KINDS.find((item) => item.value === kind) ?? TASK_KINDS[4];
}

export const FREQUENCIES = [
  { value: "daily", label: "Todos os dias" },
  { value: "weekdays", label: "De segunda a sexta" },
  { value: "weekly", label: "Uma vez por semana" },
  { value: "as_needed", label: "Somente quando necessário" },
] as const;

export function frequencyLabel(value: string): string {
  return FREQUENCIES.find((item) => item.value === value)?.label ?? value;
}

export const INTENSITIES = [
  { value: 1, label: "Leve" },
  { value: 2, label: "Moderado" },
  { value: 3, label: "Forte" },
] as const;

export function intensityLabel(value: number): string {
  return INTENSITIES.find((item) => item.value === value)?.label ?? "Leve";
}

export const MEASUREMENT_KINDS = [
  { value: "blood_pressure", label: "Pressão arterial", icon: "🩺", unit: "mmHg" },
  { value: "glucose", label: "Glicemia", icon: "🩸", unit: "mg/dL" },
  { value: "hydration", label: "Hidratação", icon: "💧", unit: "ml" },
] as const;

export type MeasurementKind = (typeof MEASUREMENT_KINDS)[number]["value"];

export function measurementMeta(kind: string) {
  return MEASUREMENT_KINDS.find((item) => item.value === kind) ?? MEASUREMENT_KINDS[0];
}

export const GLUCOSE_CONTEXTS = [
  "Em jejum",
  "Antes da refeição",
  "Depois da refeição",
  "Antes de dormir",
  "Outro momento",
] as const;

export const TIMELINE_CATEGORIES = [
  { value: "task", label: "Cuidados concluídos", icon: "✅" },
  { value: "medication", label: "Medicamentos", icon: "💊" },
  { value: "symptom", label: "Sintomas", icon: "📝" },
  { value: "checkin", label: "Check-in diário", icon: "😊" },
  { value: "measurement", label: "Medições", icon: "🩺" },
  { value: "appointment", label: "Consultas", icon: "📅" },
  { value: "note", label: "Observações", icon: "🗒️" },
] as const;

export type TimelineCategory = (typeof TIMELINE_CATEGORIES)[number]["value"];

export function timelineMeta(category: string) {
  return TIMELINE_CATEGORIES.find((item) => item.value === category) ?? TIMELINE_CATEGORIES[6];
}

export const GUIDELINE_METRICS = [
  { value: "systolic", label: "Pressão sistólica (o número maior)", unit: "mmHg" },
  { value: "diastolic", label: "Pressão diastólica (o número menor)", unit: "mmHg" },
  { value: "glucose", label: "Glicemia", unit: "mg/dL" },
  { value: "missed_tasks", label: "Cuidados não realizados hoje", unit: "cuidados" },
  { value: "mood_bad_days", label: "Dias seguidos se sentindo mal", unit: "dias" },
  { value: "symptom_intensity", label: "Intensidade de sintoma registrado", unit: "1 a 3" },
  { value: "hydration_percent", label: "Meta de água atingida", unit: "%" },
] as const;

export type GuidelineMetric = (typeof GUIDELINE_METRICS)[number]["value"];

export function guidelineMetricMeta(metric: string) {
  return GUIDELINE_METRICS.find((item) => item.value === metric) ?? GUIDELINE_METRICS[0];
}

export const COMPARATORS = [
  { value: "gte", label: "for maior ou igual a" },
  { value: "gt", label: "for maior que" },
  { value: "lte", label: "for menor ou igual a" },
  { value: "lt", label: "for menor que" },
] as const;

export function comparatorLabel(value: string): string {
  return COMPARATORS.find((item) => item.value === value)?.label ?? value;
}

export const SAFETY_NOTICE =
  "O CuidAgora organiza informações de cuidado. Ele não faz diagnósticos, não indica medicamentos ou doses e não substitui médicos ou outros profissionais de saúde.";

/** Sanitiza permissões vindas do banco/formulário: só `true` explícito libera. */
export function normalizePermissions(raw: unknown): PermissionSet {
  const source = (raw ?? {}) as Record<string, unknown>;
  const result = { ...NO_PERMISSIONS };
  for (const key of PERMISSION_KEYS) {
    result[key] = source[key] === true;
  }
  return result;
}
