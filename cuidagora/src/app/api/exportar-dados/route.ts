import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { db, ensureDbReady } from "@/db";
import {
  users,
  userPreferences,
  medications,
  careTasks,
  taskCompletions,
  measurements,
  symptoms,
  dailyCheckins,
  appointments,
  careGuidelines,
  caregiverAccess,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  await ensureDbReady();

  const [
    userRow,
    userPrefs,
    userMeds,
    userTasks,
    userCompletions,
    userMeasurements,
    userSymptoms,
    userCheckins,
    userAppointments,
    userGuidelines,
    userCaregivers,
  ] = await Promise.all([
    db.select({ id: users.id, name: users.name, email: users.email, accountType: users.accountType, createdAt: users.createdAt }).from(users).where(eq(users.id, user.id)).limit(1),
    db.select().from(userPreferences).where(eq(userPreferences.userId, user.id)),
    db.select().from(medications).where(eq(medications.userId, user.id)),
    db.select().from(careTasks).where(eq(careTasks.userId, user.id)),
    db.select().from(taskCompletions).where(eq(taskCompletions.userId, user.id)),
    db.select().from(measurements).where(eq(measurements.userId, user.id)),
    db.select().from(symptoms).where(eq(symptoms.userId, user.id)),
    db.select().from(dailyCheckins).where(eq(dailyCheckins.userId, user.id)),
    db.select().from(appointments).where(eq(appointments.userId, user.id)),
    db.select().from(careGuidelines).where(eq(careGuidelines.userId, user.id)),
    db.select().from(caregiverAccess).where(eq(caregiverAccess.ownerId, user.id)),
  ]);

  const exportData = {
    versaoExportacao: "1.1",
    dataExportacao: new Date().toISOString(),
    titular: userRow[0] ?? {
      id: user.id,
      nome: user.name,
      email: user.email,
      tipoConta: user.accountType,
    },
    preferencias: userPrefs[0] ?? null,
    medicamentos: userMeds,
    cuidadosRotina: userTasks,
    historicoConclusoesAdesao: userCompletions,
    medicoesSinaisVitais: userMeasurements,
    sintomasRegistrados: userSymptoms,
    checkinsDiarios: userCheckins,
    consultasMedicas: userAppointments,
    orientacoesClinicasSemaforo: userGuidelines,
    cuidadoresAutorizados: userCaregivers,
    avisoLegalLGPD:
      "Cópia de portabilidade de dados pessoais emitida conforme Lei Geral de Proteção de Dados (Lei 13.709/2018).",
  };

  const safeName = (user.name || "usuario")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_");

  const filename = `cuidagora-dados-${safeName}-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
