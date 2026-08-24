import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";

import { db } from "@/db";
import { timelineEvents } from "@/db/schema";
import { endOfDay, startOfDay } from "@/lib/date";

export type TimelineInput = {
  userId: string;
  category: string;
  title: string;
  description?: string;
  occurredAt: Date;
  referenceId?: string | null;
};

/** Registra o evento no histórico unificado (usado por todos os serviços de escrita). */
export async function addTimelineEvent(input: TimelineInput): Promise<void> {
  await db.insert(timelineEvents).values({
    userId: input.userId,
    category: input.category,
    title: input.title,
    description: input.description ?? "",
    occurredAt: input.occurredAt,
    referenceId: input.referenceId ?? null,
  });
}

export async function listTimeline(options: {
  userId: string;
  fromIso: string;
  toIso: string;
  categories?: string[];
  limit?: number;
}) {
  const conditions = [
    eq(timelineEvents.userId, options.userId),
    gte(timelineEvents.occurredAt, startOfDay(options.fromIso)),
    lte(timelineEvents.occurredAt, endOfDay(options.toIso)),
  ];
  if (options.categories && options.categories.length > 0) {
    conditions.push(inArray(timelineEvents.category, options.categories));
  }

  return db
    .select()
    .from(timelineEvents)
    .where(and(...conditions))
    .orderBy(desc(timelineEvents.occurredAt))
    .limit(options.limit ?? 200);
}
