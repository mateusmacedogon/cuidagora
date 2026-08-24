import { and, eq, isNull, or } from "drizzle-orm";

import { db } from "@/db";
import { caregiverAccess, users } from "@/db/schema";
import {
  ALL_PERMISSIONS,
  normalizePermissions,
  type PermissionKey,
  type PermissionSet,
} from "@/lib/domain";
import { getSessionUser, type SessionUser } from "@/lib/auth/session";

export { normalizePermissions };

export type AccessContext = {
  viewer: SessionUser;
  ownerId: string;
  ownerName: string;
  isOwner: boolean;
  permissions: PermissionSet;
};

export class AccessDeniedError extends Error {
  constructor(message = "Você não tem permissão para acessar estas informações.") {
    super(message);
    this.name = "AccessDeniedError";
  }
}

/**
 * Princípio do menor privilégio: o cuidador só enxerga o que o dono liberou.
 * Retorna null quando não existe vínculo ativo.
 */
export async function resolveAccess(ownerId: string): Promise<AccessContext | null> {
  const viewer = await getSessionUser();
  if (!viewer) return null;

  if (viewer.id === ownerId) {
    return {
      viewer,
      ownerId,
      ownerName: viewer.name,
      isOwner: true,
      permissions: { ...ALL_PERMISSIONS },
    };
  }

  const rows = await db
    .select({
      permissions: caregiverAccess.permissions,
      ownerName: users.name,
    })
    .from(caregiverAccess)
    .innerJoin(users, eq(users.id, caregiverAccess.ownerId))
    .where(
      and(
        eq(caregiverAccess.ownerId, ownerId),
        eq(caregiverAccess.status, "active"),
        isNull(users.deletedAt),
        or(
          eq(caregiverAccess.caregiverId, viewer.id),
          eq(caregiverAccess.caregiverEmail, viewer.email),
        ),
      ),
    )
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return {
    viewer,
    ownerId,
    ownerName: row.ownerName,
    isOwner: false,
    permissions: normalizePermissions(row.permissions),
  };
}

export async function requireAccess(ownerId: string, permission?: PermissionKey) {
  const access = await resolveAccess(ownerId);
  if (!access) throw new AccessDeniedError();
  if (permission && !access.permissions[permission]) throw new AccessDeniedError();
  return access;
}

/** Somente o dono dos dados pode gravar. Cuidadores têm acesso de leitura. */
export async function requireOwner(ownerId: string) {
  const access = await resolveAccess(ownerId);
  if (!access?.isOwner) throw new AccessDeniedError("Somente a própria pessoa pode alterar estes dados.");
  return access;
}

/** Pessoas que compartilharam dados com o usuário atual. */
export async function listSharedWithMe(viewer: SessionUser) {
  const rows = await db
    .select({
      id: caregiverAccess.id,
      ownerId: caregiverAccess.ownerId,
      ownerName: users.name,
      permissions: caregiverAccess.permissions,
      createdAt: caregiverAccess.createdAt,
    })
    .from(caregiverAccess)
    .innerJoin(users, eq(users.id, caregiverAccess.ownerId))
    .where(
      and(
        eq(caregiverAccess.status, "active"),
        isNull(users.deletedAt),
        or(
          eq(caregiverAccess.caregiverId, viewer.id),
          eq(caregiverAccess.caregiverEmail, viewer.email),
        ),
      ),
    );

  return rows.map((row) => ({ ...row, permissions: normalizePermissions(row.permissions) }));
}
