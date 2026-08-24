/**
 * Dados de DEMONSTRAÇÃO do CuidAgora — todos fictícios.
 * Execução: node scripts/seed.mjs
 */
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import pg from "pg";

const scrypt = promisify(scryptCallback);
const connectionString =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

async function hashPassword(plain) {
  const salt = randomBytes(16);
  const derived = await scrypt(plain.normalize("NFKC"), salt, 64);
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

const OFFSET = "-03:00";
function todayIso(shiftDays = 0) {
  const now = new Date();
  now.setUTCDate(now.getUTCDate() + shiftDays);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
function at(dateIso, time) {
  return new Date(`${dateIso}T${time}:00${OFFSET}`);
}

const isLocal =
  connectionString.includes("127.0.0.1") ||
  connectionString.includes("localhost");

const client = new pg.Client({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

async function main() {
  await client.connect();

  const demoEmails = ["maria@exemplo.com", "joao@exemplo.com"];
  await client.query("delete from users where email = any($1)", [demoEmails]);

  const password = await hashPassword("cuidagora123");

  const owner = (
    await client.query(
      "insert into users (name, email, password_hash, account_type) values ($1,$2,$3,$4) returning id",
      ["Maria Aparecida (demonstração)", "maria@exemplo.com", password, "person"],
    )
  ).rows[0];

  const caregiver = (
    await client.query(
      "insert into users (name, email, password_hash, account_type) values ($1,$2,$3,$4) returning id",
      ["João Fictício (cuidador)", "joao@exemplo.com", password, "caregiver"],
    )
  ).rows[0];

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
    { name: "Losartana (exemplo fictício)", dose: "1 comprimido de 50 mg", times: ["08:00"], notes: "Tomar pela manhã, conforme receita." },
    { name: "Metformina (exemplo fictício)", dose: "1 comprimido de 500 mg", times: ["12:00", "18:00"], notes: "Tomar após as refeições." },
  ];

  const tasks = [];
  for (const medication of medications) {
    const row = (
      await client.query(
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
        await client.query(
          `insert into care_tasks (user_id, title, description, kind, time_of_day, medication_id)
           values ($1,$2,$3,'medication',$4,$5) returning id`,
          [owner.id, `Tomar ${medication.name.split(" (")[0]}`, `Dose registrada por você: ${medication.dose}`, time, row.id],
        )
      ).rows[0];
      tasks.push({ id: task.id, time });
    }
  }

  const extraTasks = [
    { title: "Medir a pressão", description: "Em repouso, sentada", kind: "measurement", time: "10:00" },
    { title: "Beber um copo de água", description: "Meta do dia: 2000 ml", kind: "hydration", time: "12:00" },
    { title: "Caminhar 20 minutos", description: "No quarteirão de casa", kind: "activity", time: "16:00" },
  ];
  for (const task of extraTasks) {
    const row = (
      await client.query(
        `insert into care_tasks (user_id, title, description, kind, time_of_day)
         values ($1,$2,$3,$4,$5) returning id`,
        [owner.id, task.title, task.description, task.kind, task.time],
      )
    ).rows[0];
    tasks.push({ id: row.id, time: task.time });
  }

  const timeline = [];

  // Conclusões dos últimos 5 dias + hoje (parcial)
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
      timeline.push(["task", "Cuidado concluído", `Registrado às ${task.time}`, completedAt]);
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
        moods[index] === "soso" ? "Dor leve no joelho ao caminhar." : "",
        index === 0 ? "Dormi bem e me senti disposta." : "",
      ],
    );
    timeline.push(["checkin", "Check-in do dia registrado", "", at(dateIso, "09:00")]);
  }

  // Medições
  const pressures = [
    [128, 82, 1],
    [134, 86, 3],
    [126, 80, 5],
    [122, 78, 0],
  ];
  for (const [systolic, diastolic, shift] of pressures) {
    const measuredAt = at(todayIso(-shift), "10:05");
    await client.query(
      `insert into measurements (user_id, kind, systolic, diastolic, unit, measured_at)
       values ($1,'blood_pressure',$2,$3,'mmHg',$4)`,
      [owner.id, systolic, diastolic, measuredAt],
    );
    timeline.push(["measurement", `Pressão arterial: ${systolic} por ${diastolic} mmHg`, "", measuredAt]);
  }

  const glucoses = [
    [98, "Em jejum", 1],
    [112, "Depois da refeição", 2],
    [94, "Em jejum", 0],
  ];
  for (const [value, context, shift] of glucoses) {
    const measuredAt = at(todayIso(-shift), "07:30");
    await client.query(
      `insert into measurements (user_id, kind, value, unit, context, measured_at)
       values ($1,'glucose',$2,'mg/dL',$3,$4)`,
      [owner.id, value, context, measuredAt],
    );
    timeline.push(["measurement", `Glicemia: ${value} mg/dL`, context, measuredAt]);
  }

  for (const amount of [300, 200, 250]) {
    const measuredAt = at(todayIso(0), amount === 300 ? "08:30" : amount === 200 ? "11:00" : "14:00");
    await client.query(
      `insert into measurements (user_id, kind, value, unit, measured_at)
       values ($1,'hydration',$2,'ml',$3)`,
      [owner.id, amount, measuredAt],
    );
    timeline.push(["measurement", `Água: ${amount} ml`, "", measuredAt]);
  }

  // Sintomas
  const symptomList = [
    ["Dor de cabeça leve", 1, 2, "Passou depois de descansar."],
    ["Dor no joelho", 2, 4, "Ao subir escada."],
  ];
  for (const [name, intensity, shift, notes] of symptomList) {
    const occurredAt = at(todayIso(-shift), "15:00");
    await client.query(
      `insert into symptoms (user_id, name, intensity, occurred_at, duration_minutes, notes)
       values ($1,$2,$3,$4,30,$5)`,
      [owner.id, name, intensity, occurredAt, notes],
    );
    timeline.push(["symptom", `Sintoma: ${name}`, notes, occurredAt]);
  }

  // Consulta + perguntas
  const appointment = (
    await client.query(
      `insert into appointments (user_id, specialty, professional, location, scheduled_at, notes)
       values ($1,'Cardiologia','Dra. Ana Fictícia','Clínica Exemplo — sala 3',$2,'Levar os exames recentes.')
       returning id`,
      [owner.id, at(todayIso(5), "14:30")],
    )
  ).rows[0];
  timeline.push(["appointment", "Consulta marcada: Cardiologia", "Dra. Ana Fictícia", at(todayIso(-6), "10:00")]);

  for (const question of [
    "Posso continuar caminhando todos os dias?",
    "A dor no joelho tem relação com o remédio novo?",
    "Preciso repetir algum exame?",
  ]) {
    await client.query(
      "insert into appointment_questions (appointment_id, user_id, question) values ($1,$2,$3)",
      [appointment.id, owner.id, question],
    );
  }

  // Orientações previamente cadastradas (base do Semáforo do Cuidado)
  const guidelines = [
    ["attention", "Pressão acima do combinado", "Repetir a medição após 15 minutos em repouso e anotar o resultado. Se continuar alta, ligar para a clínica.", "systolic", "gte", 150, "Dra. Ana Fictícia — Cardiologia"],
    ["urgent", "Pressão muito alta", "Procurar atendimento imediatamente, conforme orientação da consulta.", "systolic", "gte", 180, "Dra. Ana Fictícia — Cardiologia"],
    ["attention", "Cuidados não realizados", "Se sobrarem 3 ou mais cuidados no fim do dia, avisar o cuidador responsável.", "missed_tasks", "gte", 3, "Combinado em família"],
  ];
  for (const [level, title, instruction, metric, comparator, threshold, source] of guidelines) {
    await client.query(
      `insert into care_guidelines (user_id, level, title, instruction, metric, comparator, threshold, source)
       values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [owner.id, level, title, instruction, metric, comparator, threshold, source],
    );
  }

  for (const [category, title, description, occurredAt] of timeline) {
    await client.query(
      `insert into timeline_events (user_id, category, title, description, occurred_at)
       values ($1,$2,$3,$4,$5)`,
      [owner.id, category, title, description ?? "", occurredAt],
    );
  }

  console.log("Dados de demonstração criados: maria@exemplo.com / joao@exemplo.com (senha: cuidagora123)");
  await client.end();
}

main().catch(async (error) => {
  console.error("Falha ao criar dados de demonstração:", error.message);
  await client.end().catch(() => {});
  process.exit(1);
});
