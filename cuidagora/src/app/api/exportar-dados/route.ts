import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { db, ensureDbReady } from "@/db";
import {
  users,
  userPreferences,
  medications,
  careTasks,
  measurements,
  symptoms,
  dailyCheckins,
  appointments,
  careGuidelines,
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
    userMeasurements,
    userSymptoms,
    userCheckins,
    userAppointments,
    userGuidelines,
  ] = await Promise.all([
    db.select({ id: users.id, name: users.name, email: users.email, accountType: users.accountType, createdAt: users.createdAt }).from(users).where(eq(users.id, user.id)).limit(1),
    db.select().from(userPreferences).where(eq(userPreferences.userId, user.id)),
    db.select().from(medications).where(eq(medications.userId, user.id)),
    db.select().from(careTasks).where(eq(careTasks.userId, user.id)),
    db.select().from(measurements).where(eq(measurements.userId, user.id)),
    db.select().from(symptoms).where(eq(symptoms.userId, user.id)),
    db.select().from(dailyCheckins).where(eq(dailyCheckins.userId, user.id)),
    db.select().from(appointments).where(eq(appointments.userId, user.id)),
    db.select().from(careGuidelines).where(eq(careGuidelines.userId, user.id)),
  ]);

  const exportData = {
    versaoExportacao: "1.0",
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
    medicoesSinaisVitais: userMeasurements,
    sintomasRegistrados: userSymptoms,
    checkinsDiarios: userCheckins,
    consultasMedicas: userAppointments,
    orientacoesClinicasSemaforo: userGuidelines,
    avisoLegalLGPD:
      "Cópia de portabilidade de dados pessoais emitida conforme Lei Geral de Proteção de Dados (Lei 13.709/2018).",
  };

  const filename = `cuidagora-dados-${user.name.toLowerCase().replace(/\s+/g, "_")}-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
