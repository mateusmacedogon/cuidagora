import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * CuidAgora — modelo relacional.
 * Regras gerais:
 *  - IDs uuid gerados no banco;
 *  - timestamps `createdAt` / `updatedAt` em todas as entidades mutáveis;
 *  - exclusão lógica (`deletedAt` / `archivedAt`) onde há histórico clínico do usuário;
 *  - índices por (userId, data) porque toda leitura é sempre escopada ao dono dos dados.
 */

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    /** "person" = cuida de si | "caregiver" = acompanha outra pessoa */
    accountType: text("account_type").notNull().default("person"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const userPreferences = pgTable("user_preferences", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  simplifiedMode: boolean("simplified_mode").notNull().default(false),
  elderMode: boolean("elder_mode").notNull().default(false),
  highContrast: boolean("high_contrast").notNull().default(false),
  readAloud: boolean("read_aloud").notNull().default(true),
  hydrationGoalMl: integer("hydration_goal_ml").notNull().default(2000),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    /** hash sha-256 do token guardado no cookie (o token puro nunca é persistido) */
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("sessions_user_idx").on(table.userId)],
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("password_reset_user_idx").on(table.userId)],
);

/** Compartilhamento granular: o dono decide exatamente o que o cuidador enxerga. */
export const caregiverAccess = pgTable(
  "caregiver_access",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    caregiverEmail: text("caregiver_email").notNull(),
    caregiverId: uuid("caregiver_id").references(() => users.id, { onDelete: "set null" }),
    caregiverName: text("caregiver_name").notNull(),
    /** "active" | "revoked" */
    status: text("status").notNull().default("active"),
    permissions: jsonb("permissions")
      .$type<Record<string, boolean>>()
      .notNull()
      .default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("caregiver_owner_idx").on(table.ownerId),
    index("caregiver_email_idx").on(table.caregiverEmail),
    index("caregiver_id_idx").on(table.caregiverId),
  ],
);

export const medications = pgTable(
  "medications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    /** dose informativa digitada pelo próprio usuário — o sistema nunca sugere */
    dose: text("dose").notNull().default(""),
    frequency: text("frequency").notNull().default("daily"),
    notes: text("notes").notNull().default(""),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("medications_user_idx").on(table.userId)],
);

export const medicationSchedules = pgTable(
  "medication_schedules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    medicationId: uuid("medication_id")
      .notNull()
      .references(() => medications.id, { onDelete: "cascade" }),
    /** "HH:MM" */
    timeOfDay: text("time_of_day").notNull(),
  },
  (table) => [index("medication_schedules_med_idx").on(table.medicationId)],
);

export const careTasks = pgTable(
  "care_tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    /** medication | measurement | hydration | activity | other */
    kind: text("kind").notNull().default("other"),
    timeOfDay: text("time_of_day").notNull(),
    medicationId: uuid("medication_id").references(() => medications.id, { onDelete: "cascade" }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("care_tasks_user_idx").on(table.userId),
    index("care_tasks_user_active_idx").on(table.userId, table.archivedAt, table.timeOfDay),
  ],
);

export const taskCompletions = pgTable(
  "task_completions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => careTasks.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** dia de referência "YYYY-MM-DD" */
    referenceDate: date("reference_date").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("task_completion_unique").on(table.taskId, table.referenceDate),
    index("task_completion_user_date_idx").on(table.userId, table.referenceDate),
  ],
);

export const dailyCheckins = pgTable(
  "daily_checkins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    referenceDate: date("reference_date").notNull(),
    /** good | ok | soso | bad */
    mood: text("mood").notNull(),
    hasPain: boolean("has_pain").notNull().default(false),
    painNote: text("pain_note").notNull().default(""),
    didCare: boolean("did_care").notNull().default(true),
    note: text("note").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("checkin_user_date_unique").on(table.userId, table.referenceDate)],
);

export const symptoms = pgTable(
  "symptoms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    /** 1 = leve | 2 = moderado | 3 = forte (escala simples, sem valor diagnóstico) */
    intensity: integer("intensity").notNull().default(1),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    durationMinutes: integer("duration_minutes"),
    notes: text("notes").notNull().default(""),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("symptoms_user_date_idx").on(table.userId, table.occurredAt)],
);

export const measurements = pgTable(
  "measurements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** blood_pressure | glucose | hydration */
    kind: text("kind").notNull(),
    systolic: integer("systolic"),
    diastolic: integer("diastolic"),
    value: numeric("value", { precision: 8, scale: 2 }),
    unit: text("unit").notNull().default(""),
    context: text("context").notNull().default(""),
    notes: text("notes").notNull().default(""),
    measuredAt: timestamp("measured_at", { withTimezone: true }).notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("measurements_user_kind_idx").on(table.userId, table.kind, table.measuredAt)],
);

export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    specialty: text("specialty").notNull(),
    professional: text("professional").notNull().default(""),
    location: text("location").notNull().default(""),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    notes: text("notes").notNull().default(""),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("appointments_user_date_idx").on(table.userId, table.scheduledAt)],
);

export const appointmentQuestions = pgTable(
  "appointment_questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    appointmentId: uuid("appointment_id").references(() => appointments.id, {
      onDelete: "cascade",
    }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    answered: boolean("answered").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("appointment_questions_user_idx").on(table.userId)],
);

/**
 * Orientações previamente cadastradas pelo usuário ou por profissional autorizado.
 * O Semáforo do Cuidado SÓ pode usar estas regras — o sistema nunca cria regra médica.
 */
export const careGuidelines = pgTable(
  "care_guidelines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** attention (amarelo) | urgent (vermelho) */
    level: text("level").notNull().default("attention"),
    title: text("title").notNull(),
    /** o que fazer — texto vindo do profissional/usuário */
    instruction: text("instruction").notNull(),
    /** systolic | diastolic | glucose | hydration_percent | missed_tasks | mood_bad_days | symptom_intensity */
    metric: text("metric").notNull(),
    /** gt | lt | gte | lte */
    comparator: text("comparator").notNull(),
    threshold: numeric("threshold", { precision: 8, scale: 2 }).notNull(),
    /** quem cadastrou a orientação (ex.: "Dra. Fictícia — Cardiologia") */
    source: text("source").notNull().default(""),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("care_guidelines_user_idx").on(table.userId)],
);

/** Histórico unificado — alimentado pelos serviços a cada registro. */
export const timelineEvents = pgTable(
  "timeline_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** medication | task | symptom | checkin | measurement | appointment | note */
    category: text("category").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    referenceId: uuid("reference_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("timeline_user_date_idx").on(table.userId, table.occurredAt),
    index("timeline_category_idx").on(table.userId, table.category),
  ],
);

export type User = typeof users.$inferSelect;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type CaregiverAccess = typeof caregiverAccess.$inferSelect;
export type Medication = typeof medications.$inferSelect;
export type MedicationSchedule = typeof medicationSchedules.$inferSelect;
export type CareTask = typeof careTasks.$inferSelect;
export type TaskCompletion = typeof taskCompletions.$inferSelect;
export type DailyCheckin = typeof dailyCheckins.$inferSelect;
export type Symptom = typeof symptoms.$inferSelect;
export type Measurement = typeof measurements.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type AppointmentQuestion = typeof appointmentQuestions.$inferSelect;
export type CareGuideline = typeof careGuidelines.$inferSelect;
export type TimelineEvent = typeof timelineEvents.$inferSelect;
