import { hashPassword } from "@/lib/auth/password";

export const MARIA_DEMO_ID = "a0000000-0000-4000-8000-000000000001";
export const JOAO_DEMO_ID = "a0000000-0000-4000-8000-000000000002";

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

export const DEMO_PASSWORD_HASH =
  "e4e50740c6e5573d4dc183cc3692e56a:7a9aba11683342339d98579900bb41446d17560093160da3fa7bb6af190ec50b1815aa2ca1d98f9fc5e01ef2272f729ab500435054f99bda75948e63bf38fa73";

export async function seedDemoData(client: {
  query: (text: string, params?: any[]) => Promise<any>;
}): Promise<void> {
  const password = DEMO_PASSWORD_HASH;

  // 1. Maria (Paciente) com UUID determinístico
  const ownerRes = await client.query(
    `INSERT INTO users (id, name, email, password_hash, account_type) 
     VALUES ($1,$2,$3,$4,$5) 
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash 
     RETURNING id`,
    [MARIA_DEMO_ID, "Maria Aparecida (demonstração)", "maria@exemplo.com", password, "person"],
  );
  let ownerId = ownerRes.rows?.[0]?.id || MARIA_DEMO_ID;

  // 2. João (Cuidador) com UUID determinístico
  const caregiverRes = await client.query(
    `INSERT INTO users (id, name, email, password_hash, account_type) 
     VALUES ($1,$2,$3,$4,$5) 
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash 
     RETURNING id`,
    [JOAO_DEMO_ID, "João Fictício (cuidador)", "joao@exemplo.com", password, "caregiver"],
  );
  let caregiverId = caregiverRes.rows?.[0]?.id || JOAO_DEMO_ID;

  for (const id of [ownerId, caregiverId]) {
    await client.query(
      "INSERT INTO user_preferences (user_id, hydration_goal_ml) VALUES ($1, 2000) ON CONFLICT (user_id) DO NOTHING",
      [id],
    );
  }

  await client.query(
    `INSERT INTO caregiver_access (owner_id, caregiver_email, caregiver_id, caregiver_name, status, permissions)
     VALUES ($1,$2,$3,$4,'active',$5) ON CONFLICT DO NOTHING`,
    [
      ownerId,
      "joao@exemplo.com",
      caregiverId,
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
    const medRes = await client.query(
      `INSERT INTO medications (user_id, name, dose, frequency, notes, start_date)
       VALUES ($1,$2,$3,'daily',$4,$5) RETURNING id`,
      [ownerId, medication.name, medication.dose, medication.notes, start],
    );
    const medId = medRes.rows?.[0]?.id;
    if (!medId) continue;

    for (const time of medication.times) {
      await client.query(
        "INSERT INTO medication_schedules (medication_id, time_of_day) VALUES ($1,$2)",
        [medId, time],
      );
      const taskRes = await client.query(
        `INSERT INTO care_tasks (user_id, title, description, kind, time_of_day, medication_id)
         VALUES ($1,$2,$3,'medication',$4,$5) RETURNING id`,
        [
          ownerId,
          `Tomar ${medication.name.split(" ")[0]}`,
          `Dose prescrita: ${medication.dose}`,
          time,
          medId,
        ],
      );
      const taskId = taskRes.rows?.[0]?.id;
      if (taskId) tasks.push({ id: taskId, time });
    }
  }

  const extraTasks = [
    { title: "Medir pressão arterial", description: "Em repouso sentada (10 min)", kind: "measurement", time: "10:00" },
    { title: "Beber água (300ml)", description: "Meta diária: 2000 ml", kind: "hydration", time: "12:00" },
    { title: "Caminhada leve (20 min)", description: "No quarteirão ou praça", kind: "activity", time: "16:00" },
  ];

  for (const task of extraTasks) {
    const row = await client.query(
      `INSERT INTO care_tasks (user_id, title, description, kind, time_of_day)
       VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [ownerId, task.title, task.description, task.kind, task.time],
    );
    const taskId = row.rows?.[0]?.id;
    if (taskId) tasks.push({ id: taskId, time: task.time });
  }

  // Conclusões recentes
  for (let dayShift = 5; dayShift >= 0; dayShift -= 1) {
    const dateIso = todayIso(-dayShift);
    const limit = dayShift === 0 ? 2 : tasks.length;
    for (const task of tasks.slice(0, limit)) {
      const completedAt = at(dateIso, task.time);
      await client.query(
        `INSERT INTO task_completions (task_id, user_id, reference_date, completed_at)
         VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
        [task.id, ownerId, dateIso, completedAt],
      );
    }
  }

  // Check-ins
  const moods = ["good", "ok", "good", "soso", "ok"];
  for (let index = 0; index < moods.length; index += 1) {
    const dateIso = todayIso(-(index + 1));
    await client.query(
      `INSERT INTO daily_checkins (user_id, reference_date, mood, has_pain, pain_note, did_care, note)
       VALUES ($1,$2,$3,$4,$5,true,$6) ON CONFLICT DO NOTHING`,
      [
        ownerId,
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
      `INSERT INTO measurements (user_id, kind, systolic, diastolic, unit, measured_at)
       VALUES ($1,'blood_pressure',$2,$3,'mmHg',$4)`,
      [ownerId, systolic, diastolic, measuredAt],
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
      `INSERT INTO measurements (user_id, kind, value, unit, context, measured_at)
       VALUES ($1,'glucose',$2,'mg/dL',$3,$4)`,
      [ownerId, value, context, measuredAt],
    );
  }

  // Hidratação hoje
  for (const amount of [300, 250, 300]) {
    const measuredAt = at(todayIso(0), amount === 300 ? "08:30" : amount === 250 ? "11:00" : "14:00");
    await client.query(
      `INSERT INTO measurements (user_id, kind, value, unit, measured_at)
       VALUES ($1,'hydration',$2,'ml',$3)`,
      [ownerId, amount, measuredAt],
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
      `INSERT INTO symptoms (user_id, name, intensity, occurred_at, duration_minutes, notes)
       VALUES ($1,$2,$3,$4,30,$5)`,
      [ownerId, name, intensity, occurredAt, notes],
    );
  }

  // Consulta agendada
  const appointmentRes = await client.query(
    `INSERT INTO appointments (user_id, specialty, professional, location, scheduled_at, notes)
     VALUES ($1,'Cardiologia Clínica','Dra. Ana Fictícia','Centro Médico Saúde — Sala 402',$2,'Levar histórico recente de pressão e exames de sangue.')
     RETURNING id`,
    [ownerId, at(todayIso(5), "14:30")],
  );
  const appointmentId = appointmentRes.rows?.[0]?.id;

  if (appointmentId) {
    for (const question of [
      "Posso manter o ritmo de caminhadas diárias de 20 minutos?",
      "A sensação leve de cansaço tem relação com o status do tratamento?",
      "Quais exames de rotina precisarei repetir no próximo semestre?",
    ]) {
      await client.query(
        "INSERT INTO appointment_questions (appointment_id, user_id, question) VALUES ($1,$2,$3)",
        [appointmentId, ownerId, question],
      );
    }
  }

  // Orientações Clínicas
  const guidelines = [
    ["attention", "Pressão arterial elevada", "Repousar 15 minutos em ambiente calmo e repetir a medição. Se persistir acima de 150 mmHg, contatar o consultório.", "systolic", "gte", 150, "Dra. Ana Fictícia — Cardiologia"],
    ["urgent", "Pressão arterial crítica", "Procurar atendimento médico imediato em pronto-atendimento conforme plano terapêutico.", "systolic", "gte", 180, "Dra. Ana Fictícia — Cardiologia"],
    ["attention", "Adesão aos cuidados do dia", "Se restarem 3 ou mais medicamentos/cuidados pendentes ao final da tarde, alertar cuidador.", "missed_tasks", "gte", 3, "Plano de Cuidado Familiar"],
  ];
  for (const [level, title, instruction, metric, comparator, threshold, source] of guidelines) {
    await client.query(
      `INSERT INTO care_guidelines (user_id, level, title, instruction, metric, comparator, threshold, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING`,
      [ownerId, level, title, instruction, metric, comparator, threshold, source],
    );
  }
}
