import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { caregiverAccess } from "@/db/schema";
import { normalizePermissions } from "@/lib/permissions";

export async function listMyCaregivers(ownerId: string) {
  const rows = await db
    .select()
    .from(caregiverAccess)
    .where(and(eq(caregiverAccess.ownerId, ownerId), eq(caregiverAccess.status, "active")))
    .orderBy(desc(caregiverAccess.createdAt));

  return rows.map((row) => ({
    id: row.id,
    caregiverName: row.caregiverName,
    caregiverEmail: row.caregiverEmail,
    createdAt: row.createdAt,
    permissions: normalizePermissions(row.permissions),
  }));
}
