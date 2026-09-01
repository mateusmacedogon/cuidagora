import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import * as schema from "./schema";
import { SCHEMA_SQL } from "./schema-sql";

const scrypt = promisify(scryptCallback);

async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scrypt(plain.normalize("NFKC"), salt, 64)) as Buffer;
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

const OFFSET = "-03:00";
function todayIso(shiftDays = 0): string {
  const now = new Date();
  now.setUTCDate(now.getUTCDate() + shiftDays);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function at(dateIso: string, time: string): Date {
  return new Date(`${dateIso}T${time}:00${OFFSET}`);
}

const globalForMem = globalThis as typeof globalThis & {
  __pgliteInstance?: PGlite;
  __pgliteDb?: any;
  __pgliteInitPromise?: Promise<void>;
};

function getPGliteInstance(): PGlite {
  if (!globalForMem.__pgliteInstance) {
    globalForMem.__pgliteInstance = new PGlite();
  }
  return globalForMem.__pgliteInstance;
}

function getPGliteDbInstance() {
  if (!globalForMem.__pgliteDb) {
    const inst = getPGliteInstance();
    globalForMem.__pgliteDb = drizzle(inst, { schema });
  }
  return globalForMem.__pgliteDb;
}

export const pglite = new Proxy({} as PGlite, {
  get(_target, prop) {
    const inst = getPGliteInstance();
    const val = (inst as any)[prop];
    return typeof val === "function" ? val.bind(inst) : val;
  },
});

export const pgliteDb = new Proxy({} as any, {
  get(_target, prop) {
    const inst = getPGliteDbInstance();
    const val = (inst as any)[prop];
    return typeof val === "function" ? val.bind(inst) : val;
  },
});

export async function ensurePGliteReady(): Promise<void> {
  if (globalForMem.__pgliteInitPromise) {
    return globalForMem.__pgliteInitPromise;
  }

  globalForMem.__pgliteInitPromise = (async () => {
    try {
      const inst = getPGliteInstance();
      const sql = SCHEMA_SQL.replace(/CREATE EXTENSION[^\;]+\;/gi, "");
      await inst.exec(sql);
      await seedPGlite(inst);
    } catch (err) {
      console.warn("Aviso ao inicializar fallback em memória:", err);
    }
  })();

  return globalForMem.__pgliteInitPromise;
}

async function seedPGlite(client: PGlite) {
  const password = await hashPassword("cuidagora123");

  const ownerRes = await client.query<{ id: string }>(
    "insert into users (name, email, password_hash, account_type) values ($1,$2,$3,$4) returning id",
    ["Maria Aparecida (demonstração)", "maria@exemplo.com", password, "person"],
  );
  const owner = ownerRes.rows[0];

  const caregiverRes = await client.query<{ id: string }>(
    "insert into users (name, email, password_hash, account_type) values ($1,$2,$3,$4) returning id",
    ["João Fictício (cuidador)", "joao@exemplo.com", password, "caregiver"],
  );
  const caregiver = caregiverRes.rows[0];

  for (const id of [owner.id, caregiver.id]) {
    await client.query(
      "insert into user_preferences (user_id, hydration_goal_ml) values ($1, 2000) on conflict do nothing",
      [id],
    );
  }

  await client.query(
    `insert into caregiver_access (owner_id, caregiver_email, caregiver_id, caregiver_name, status, permissions)
     values ($1,$2,$3,$4,'active',$5)`,
    [
      owner.id,
      "joao@exemplo.com",
      caregiver.id,
      "João Fictício (cuidador)",
      JSON.stringify({
        tasks: true,
        medications: true,
        measurements: true,
        symptoms: false,
        appointments: true,
        timeline: true,
      }),
    ],
  );

  const start = todayIso(-30);

  const medications = [
    {
      name: "Losartana 50mg",
      dose: "1 comprimido de 50 mg",
      times: ["08:00"],
      notes: "Tomar pela manhã com água em jejum ou após o café.",
    },
    {
      name: "Metformina 500mg",
      dose: "1 comprimido de 500 mg",
      times: ["12:00", "18:00"],
      notes: "Tomar logo após as principais refeições.",
    },
  ];

  const tasks: { id: string; time: string }[] = [];
  for (const medication of medications) {
    const row = (
      await client.query<{ id: string }>(
        `insert into medications (user_id, name, dose, frequency, notes, start_date)
         values ($1,$2,$3,'daily',$4,$5) returning id`,
        [owner.id, medication.name, medication.dose, medication.notes, start],
      )
    ).rows[0];

    for (const time of medication.times) {
      await client.query(
        "insert into medication_schedules (medication_id, time_of_day) values ($1,$2)",
        [row.id, time],
      );
      const task = (
        await client.query<{ id: string }>(
          `insert into care_tasks (user_id, title, description, kind, time_of_day, medication_id)
           values ($1,$2,$3,'medication',$4,$5) returning id`,
          [
            owner.id,
            `Tomar ${medication.name.split(" ")[0]}`,
            `Dose prescrita: ${medication.dose}`,
            time,
            row.id,
          ],
        )
      ).rows[0];
      tasks.push({ id: task.id, time });
    }
  }

  const extraTasks = [
    { title: "Medir pressão arterial", description: "Em repouso sentada (10 min)", kind: "measurement", time: "10:00" },
    { title: "Beber água (300ml)", description: "Meta diária: 2000 ml", kind: "hydration", time: "12:00" },
    { title: "Caminhada leve (20 min)", description: "No quarteirão ou praça", kind: "activity", time: "16:00" },
  ];

  for (const task of extraTasks) {
    const row = (
      await client.query<{ id: string }>(
        `insert into care_tasks (user_id, title, description, kind, time_of_day)
         values ($1,$2,$3,$4,$5) returning id`,
        [owner.id, task.title, task.description, task.kind, task.time],
      )
    ).rows[0];
    tasks.push({ id: row.id, time: task.time });
  }

  // Conclusões recentes
  for (let dayShift = 5; dayShift >= 0; dayShift -= 1) {
    const dateIso = todayIso(-dayShift);
    const limit = dayShift === 0 ? 2 : tasks.length;
    for (const task of tasks.slice(0, limit)) {
      const completedAt = at(dateIso, task.time);
      await client.query(
        `insert into task_completions (task_id, user_id, reference_date, completed_at)
         values ($1,$2,$3,$4) on conflict do nothing`,
        [task.id, owner.id, dateIso, completedAt],
      );
    }
  }

  // Check-ins
  const moods = ["good", "ok", "good", "soso", "ok"];
  for (let index = 0; index < moods.length; index += 1) {
    const dateIso = todayIso(-(index + 1));
    await client.query(
      `insert into daily_checkins (user_id, reference_date, mood, has_pain, pain_note, did_care, note)
       values ($1,$2,$3,$4,$5,true,$6) on conflict do nothing`,
      [
        owner.id,
        dateIso,
        moods[index],
        moods[index] === "soso",
        moods[index] === "soso" ? "Dor leve no joelho ao subir escadas." : "",
        index === 0 ? "Noite de sono restauradora, acordei bem disposta." : "",
      ],
    );
  }

  // Medições de pressão arterial
  const pressures = [
    [128, 82, 1],
    [134, 86, 3],
    [126, 80, 5],
    [120, 80, 0],
  ];
  for (const [systolic, diastolic, shift] of pressures) {
    const measuredAt = at(todayIso(-shift), "10:05");
    await client.query(
      `insert into measurements (user_id, kind, systolic, diastolic, unit, measured_at)
       values ($1,'blood_pressure',$2,$3,'mmHg',$4)`,
      [owner.id, systolic, diastolic, measuredAt],
    );
  }

  // Medições de glicemia
  const glucoses = [
    [98, "Em jejum", 1],
    [112, "2h após almoço", 2],
    [94, "Em jejum", 0],
  ];
  for (const [value, context, shift] of glucoses) {
    const measuredAt = at(todayIso(-shift), "07:30");
    await client.query(
      `insert into measurements (user_id, kind, value, unit, context, measured_at)
       values ($1,'glucose',$2,'mg/dL',$3,$4)`,
      [owner.id, value, context, measuredAt],
    );
  }

  // Hidratação hoje
  for (const amount of [300, 250, 300]) {
    const measuredAt = at(todayIso(0), amount === 300 ? "08:30" : amount === 250 ? "11:00" : "14:00");
    await client.query(
      `insert into measurements (user_id, kind, value, unit, measured_at)
       values ($1,'hydration',$2,'ml',$3)`,
      [owner.id, amount, measuredAt],
    );
  }

  // Sintomas
  const symptomList = [
    ["Dor de cabeça tensional", 1, 2, "Passou após repouso de 30 minutos."],
    ["Desconforto no joelho", 2, 4, "Após subida de ladeira."],
  ];
  for (const [name, intensity, shift, notes] of symptomList) {
    const occurredAt = at(todayIso(-shift), "15:00");
    await client.query(
      `insert into symptoms (user_id, name, intensity, occurred_at, duration_minutes, notes)
       values ($1,$2,$3,$4,30,$5)`,
      [owner.id, name, intensity, occurredAt, notes],
    );
  }

  // Consulta agendada
  const appointmentRes = await client.query<{ id: string }>(
    `insert into appointments (user_id, specialty, professional, location, scheduled_at, notes)
     values ($1,'Cardiologia Clínica','Dra. Ana Fictícia','Centro Médico Saúde — Sala 402',$2,'Levar histórico recente de pressão e exames de sangue.')
     returning id`,
    [owner.id, at(todayIso(5), "14:30")],
  );
  const appointment = appointmentRes.rows[0];

  for (const question of [
    "Posso manter o ritmo de caminhadas diárias de 20 minutos?",
    "A sensação leve de cansaço tem relação com o ajuste de dose?",
    "Quais exames de rotina precisarei repetir no próximo semestre?",
  ]) {
    await client.query(
      "insert into appointment_questions (appointment_id, user_id, question) values ($1,$2,$3)",
      [appointment.id, owner.id, question],
    );
  }

  // Orientações Clínicas (Semáforo do Cuidado)
  const guidelines = [
    ["attention", "Pressão arterial elevada", "Repousar 15 minutos em ambiente calmo e repetir a medição. Se persistir acima de 150 mmHg, contatar o consultório.", "systolic", "gte", 150, "Dra. Ana Fictícia — Cardiologia"],
    ["urgent", "Pressão arterial crítica", "Procurar atendimento médico imediato em pronto-atendimento conforme plano terapêutico.", "systolic", "gte", 180, "Dra. Ana Fictícia — Cardiologia"],
    ["attention", "Adesão aos cuidados do dia", "Se restarem 3 ou mais medicamentos/cuidados pendentes ao final da tarde, alertar cuidador.", "missed_tasks", "gte", 3, "Plano de Cuidado Familiar"],
  ];
  for (const [level, title, instruction, metric, comparator, threshold, source] of guidelines) {
    await client.query(
      `insert into care_guidelines (user_id, level, title, instruction, metric, comparator, threshold, source)
       values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [owner.id, level, title, instruction, metric, comparator, threshold, source],
    );
  }
}
