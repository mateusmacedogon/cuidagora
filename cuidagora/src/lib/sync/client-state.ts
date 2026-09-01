import { cookies } from "next/headers";
import { todayIso } from "@/lib/date";

export const SYNC_COOKIE = "cuidagora_sync_v1";

export type ClientSyncState = {
  date: string;
  completions: Record<string, string>; // taskId -> completedAt ISO string
  uncompleted: string[]; // taskIds explicitly uncompleted today
  hydrationTotal: number;
  deletedTaskIds: string[];
  deletedMeasurementIds: string[];
  deletedSymptomIds: string[];
};

export async function getSyncState(): Promise<ClientSyncState> {
  const today = todayIso();
  try {
    const store = await cookies();
    const raw = store.get(SYNC_COOKIE)?.value;

    if (raw) {
      const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf-8")) as ClientSyncState;
      if (parsed && parsed.date === today) {
        return {
          date: today,
          completions: parsed.completions || {},
          uncompleted: parsed.uncompleted || [],
          hydrationTotal: typeof parsed.hydrationTotal === "number" ? parsed.hydrationTotal : 850,
          deletedTaskIds: parsed.deletedTaskIds || [],
          deletedMeasurementIds: parsed.deletedMeasurementIds || [],
          deletedSymptomIds: parsed.deletedSymptomIds || [],
        };
      }
    }
  } catch {
    // ignore parse error
  }

  return {
    date: today,
    completions: {},
    uncompleted: [],
    hydrationTotal: 850,
    deletedTaskIds: [],
    deletedMeasurementIds: [],
    deletedSymptomIds: [],
  };
}

export async function saveSyncState(state: ClientSyncState): Promise<void> {
  try {
    const store = await cookies();
    const raw = Buffer.from(JSON.stringify(state)).toString("base64url");
    const isSecure =
      process.env.NODE_ENV === "production" &&
      (process.env.VERCEL === "1" || process.env.COOKIE_SECURE === "true");

    store.set(SYNC_COOKIE, raw, {
      httpOnly: true,
      sameSite: "lax",
      secure: isSecure,
      path: "/",
      maxAge: 86400 * 7,
    });
  } catch (err) {
    console.warn("Aviso ao salvar sync state em cookie:", err);
  }
}
