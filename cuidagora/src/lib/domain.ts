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
  tasks: "Visualizar cuidados do dia",
  medications: "Visualizar medicamentos e horários",
  measurements: "Visualizar medições (pressão, glicemia, hidratação)",
  symptoms: "Visualizar histórico de sintomas",
  appointments: "Visualizar consultas e agendamentos",
  timeline: "Visualizar linha do tempo geral",
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
  { value: "good", iconKey: "good", label: "Bem e disposto(a)" },
  { value: "ok", iconKey: "ok", label: "Normal / Estável" },
  { value: "soso", iconKey: "soso", label: "Mais ou menos" },
  { value: "bad", iconKey: "bad", label: "Indisposto(a) / Mal" },
] as const;

export type MoodValue = (typeof MOODS)[number]["value"];

export const MOOD_LABELS: Record<MoodValue, string> = {
  good: "Bem e disposto(a)",
  ok: "Normal / Estável",
  soso: "Mais ou menos",
  bad: "Indisposto(a) / Mal",
};

export const TASK_KINDS = [
  { value: "medication", label: "Medicamento", iconKey: "medication" },
  { value: "measurement", label: "Medição de sinal vital", iconKey: "measurement" },
  { value: "hydration", label: "Hidratação", iconKey: "hydration" },
  { value: "activity", label: "Atividade física / Exercício", iconKey: "activity" },
  { value: "other", label: "Outro cuidado", iconKey: "other" },
] as const;

export type TaskKind = (typeof TASK_KINDS)[number]["value"];

export function taskKindMeta(kind: string) {
  return TASK_KINDS.find((item) => item.value === kind) ?? TASK_KINDS[4];
}

export const FREQUENCIES = [
  { value: "daily", label: "Todos os dias" },
  { value: "weekdays", label: "De segunda a sexta" },
  { value: "weekly", label: "Uma vez por semana" },
  { value: "as_needed", label: "Somente se necessário" },
] as const;

export function frequencyLabel(value: string): string {
  return FREQUENCIES.find((item) => item.value === value)?.label ?? value;
}

export const INTENSITIES = [
  { value: 1, label: "Grau 1 — Leve" },
  { value: 2, label: "Grau 2 — Moderado" },
  { value: 3, label: "Grau 3 — Forte / Intenso" },
] as const;

export function intensityLabel(value: number): string {
  return INTENSITIES.find((item) => item.value === value)?.label ?? "Grau 1 — Leve";
}

export const MEASUREMENT_KINDS = [
  { value: "blood_pressure", label: "Pressão arterial", iconKey: "blood_pressure", unit: "mmHg" },
  { value: "glucose", label: "Glicemia capilar", iconKey: "glucose", unit: "mg/dL" },
  { value: "hydration", label: "Consumo de água", iconKey: "hydration", unit: "ml" },
] as const;

export type MeasurementKind = (typeof MEASUREMENT_KINDS)[number]["value"];

export function measurementMeta(kind: string) {
  return MEASUREMENT_KINDS.find((item) => item.value === kind) ?? MEASUREMENT_KINDS[0];
}

export const GLUCOSE_CONTEXTS = [
  "Em jejum",
  "Antes da refeição",
  "Após a refeição (2h pós-prandial)",
  "Antes de dormir",
  "Outro momento",
] as const;

export const TIMELINE_CATEGORIES = [
  { value: "task", label: "Cuidados concluídos", iconKey: "task" },
  { value: "medication", label: "Medicamentos administrados", iconKey: "medication" },
  { value: "symptom", label: "Sintomas registrados", iconKey: "symptom" },
  { value: "checkin", label: "Check-in diário", iconKey: "checkin" },
  { value: "measurement", label: "Medições clínicas", iconKey: "measurement" },
  { value: "appointment", label: "Consultas médicas", iconKey: "appointment" },
  { value: "note", label: "Anotações livres", iconKey: "note" },
] as const;

export type TimelineCategory = (typeof TIMELINE_CATEGORIES)[number]["value"];

export function timelineMeta(category: string) {
  return TIMELINE_CATEGORIES.find((item) => item.value === category) ?? TIMELINE_CATEGORIES[6];
}

export const GUIDELINE_METRICS = [
  { value: "systolic", label: "Pressão sistólica (máxima)", unit: "mmHg" },
  { value: "diastolic", label: "Pressão diastólica (mínima)", unit: "mmHg" },
  { value: "glucose", label: "Glicemia", unit: "mg/dL" },
  { value: "missed_tasks", label: "Cuidados pendentes no dia", unit: "cuidados" },
  { value: "mood_bad_days", label: "Dias consecutivos de indisposição", unit: "dias" },
  { value: "symptom_intensity", label: "Intensidade de sintoma", unit: "escala 1 a 3" },
  { value: "hydration_percent", label: "Percentual da meta de água", unit: "%" },
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
  "O CuidAgora organiza informações de rotina de cuidado e saúde. Ele não realiza diagnósticos autônomos, não prescreve tratamentos e não substitui a avaliação de profissionais de saúde.";

/** Sanitiza permissões vindas do banco/formulário: só `true` explícito libera. */
export function normalizePermissions(raw: unknown): PermissionSet {
  const source = (raw ?? {}) as Record<string, unknown>;
  const result = { ...NO_PERMISSIONS };
  for (const key of PERMISSION_KEYS) {
    result[key] = source[key] === true;
  }
  return result;
}
