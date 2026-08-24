import { z } from "zod";

import { PERMISSION_KEYS } from "@/lib/domain";

const trimmed = (max: number) => z.string().trim().max(max);
const requiredText = (label: string, max = 120) =>
  z
    .string()
    .trim()
    .min(1, `Informe ${label}.`)
    .max(max, `Use no máximo ${max} caracteres.`);

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Escolha uma data válida.");
const timeOfDay = z.string().regex(/^\d{2}:\d{2}$/, "Escolha um horário válido.");

export const signUpSchema = z
  .object({
    name: requiredText("seu nome", 80),
    email: z.string().trim().toLowerCase().email("Digite um e-mail válido."),
    accountType: z.enum(["person", "caregiver"]).default("person"),
    password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres.").max(200),
    confirmPassword: z.string().min(1, "Repita a senha."),
    acceptedTerms: z.literal(true, {
      message: "É preciso concordar com o uso dos seus dados de saúde.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As duas senhas precisam ser iguais.",
  });

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Digite um e-mail válido."),
  password: z.string().min(1, "Digite sua senha."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Digite um e-mail válido."),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(10, "Link inválido."),
    password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres.").max(200),
    confirmPassword: z.string().min(1, "Repita a senha."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As duas senhas precisam ser iguais.",
  });

export const medicationSchema = z.object({
  id: z.string().uuid().optional(),
  name: requiredText("o nome do medicamento", 120),
  dose: trimmed(80).default(""),
  frequency: z.enum(["daily", "weekdays", "weekly", "as_needed"]).default("daily"),
  notes: trimmed(500).default(""),
  startDate: isoDate,
  endDate: z.union([isoDate, z.literal("")]).optional(),
  times: z.array(timeOfDay).min(1, "Informe pelo menos um horário.").max(8),
  createTasks: z.boolean().default(true),
});

export const careTaskSchema = z.object({
  id: z.string().uuid().optional(),
  title: requiredText("o nome do cuidado", 120),
  description: trimmed(300).default(""),
  kind: z.enum(["medication", "measurement", "hydration", "activity", "other"]).default("other"),
  timeOfDay,
});

export const checkinSchema = z.object({
  mood: z.enum(["good", "ok", "soso", "bad"]),
  hasPain: z.boolean().default(false),
  painNote: trimmed(300).default(""),
  didCare: z.boolean().default(true),
  note: trimmed(500).default(""),
});

export const symptomSchema = z.object({
  name: requiredText("o sintoma", 120),
  intensity: z.coerce.number().int().min(1).max(3),
  date: isoDate,
  time: timeOfDay,
  durationMinutes: z.coerce.number().int().min(0).max(10080).optional(),
  notes: trimmed(500).default(""),
});

export const bloodPressureSchema = z.object({
  systolic: z.coerce
    .number({ message: "Informe o número maior." })
    .int()
    .min(50, "Valor muito baixo, confira o número.")
    .max(300, "Valor muito alto, confira o número."),
  diastolic: z.coerce
    .number({ message: "Informe o número menor." })
    .int()
    .min(30, "Valor muito baixo, confira o número.")
    .max(200, "Valor muito alto, confira o número."),
  date: isoDate,
  time: timeOfDay,
  notes: trimmed(300).default(""),
});

export const glucoseSchema = z.object({
  value: z.coerce
    .number({ message: "Informe o valor da glicemia." })
    .min(10, "Valor muito baixo, confira o número.")
    .max(900, "Valor muito alto, confira o número."),
  context: trimmed(80).default(""),
  date: isoDate,
  time: timeOfDay,
  notes: trimmed(300).default(""),
});

export const hydrationSchema = z.object({
  amountMl: z.coerce
    .number({ message: "Informe a quantidade em ml." })
    .int()
    .min(10, "Quantidade muito pequena.")
    .max(3000, "Registre em porções menores."),
});

export const hydrationGoalSchema = z.object({
  hydrationGoalMl: z.coerce.number().int().min(500).max(6000),
});

export const appointmentSchema = z.object({
  id: z.string().uuid().optional(),
  specialty: requiredText("a especialidade", 120),
  professional: trimmed(120).default(""),
  location: trimmed(160).default(""),
  date: isoDate,
  time: timeOfDay,
  notes: trimmed(500).default(""),
});

export const appointmentQuestionSchema = z.object({
  appointmentId: z.string().uuid().optional(),
  question: requiredText("a pergunta", 300),
});

export const guidelineSchema = z.object({
  id: z.string().uuid().optional(),
  level: z.enum(["attention", "urgent"]),
  title: requiredText("um título para a orientação", 120),
  instruction: requiredText("a orientação recebida", 500),
  metric: z.enum([
    "systolic",
    "diastolic",
    "glucose",
    "missed_tasks",
    "mood_bad_days",
    "symptom_intensity",
    "hydration_percent",
  ]),
  comparator: z.enum(["gt", "gte", "lt", "lte"]),
  threshold: z.coerce.number().min(0).max(1000),
  source: trimmed(120).default(""),
});

const permissionShape = Object.fromEntries(
  PERMISSION_KEYS.map((key) => [key, z.boolean().default(false)]),
) as Record<(typeof PERMISSION_KEYS)[number], z.ZodDefault<z.ZodBoolean>>;

export const caregiverInviteSchema = z.object({
  caregiverName: requiredText("o nome do cuidador", 80),
  caregiverEmail: z.string().trim().toLowerCase().email("Digite um e-mail válido."),
  ...permissionShape,
});

export const caregiverPermissionsSchema = z.object({
  accessId: z.string().uuid(),
  ...permissionShape,
});

export const preferencesSchema = z.object({
  simplifiedMode: z.boolean().default(false),
  elderMode: z.boolean().default(false),
  highContrast: z.boolean().default(false),
  readAloud: z.boolean().default(false),
});

export const summaryRangeSchema = z.object({
  preset: z.enum(["7", "15", "30", "custom"]).default("7"),
  from: z.union([isoDate, z.literal("")]).optional(),
  to: z.union([isoDate, z.literal("")]).optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type MedicationInput = z.infer<typeof medicationSchema>;
export type CareTaskInput = z.infer<typeof careTaskSchema>;
export type SymptomInput = z.infer<typeof symptomSchema>;
export type GuidelineInput = z.infer<typeof guidelineSchema>;
