import type { Contact, Session } from "./types";
import { toLocalDateKey } from "./utils";

export interface Kpis {
  totalSessions: number;
  finishedSessions: number;
  resolutionRate: number;
  avgFirstResponse: number;
  avgDuration: number;
  activeAgents: number;
  uniqueContacts: number;
  newContacts: number;
  classifiedAmount: number;
}

function buildUniqueContactsMap(sessions: Session[]) {
  const uniqueContacts = new Map<string, Contact>();

  for (const session of sessions) {
    if (!session.contact?.id) continue;
    uniqueContacts.set(session.contact.id, session.contact);
  }

  return uniqueContacts;
}

function isDateInRange(
  value: string | undefined,
  from: Date,
  to: Date,
) {
  if (!value) return false;

  const timestamp = new Date(value).getTime();
  return timestamp >= from.getTime() && timestamp <= to.getTime();
}

export function computeKpis(
  sessions: Session[],
  range?: { from: Date; to: Date },
): Kpis {
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      finishedSessions: 0,
      resolutionRate: 0,
      avgFirstResponse: 0,
      avgDuration: 0,
      activeAgents: 0,
      uniqueContacts: 0,
      newContacts: 0,
      classifiedAmount: 0,
    };
  }

  const visibleSessions = sessions.filter((session) => session.status !== "Hidden");
  const finishedSessions = visibleSessions.filter(
    (session) => session.status === "Finished",
  );
  const sessionsWithWaitTime = sessions.filter(
    (session) => (session.firstResponseSeconds ?? -1) > 0,
  );
  const sessionsWithDuration = finishedSessions.filter(
    (session) => (session.durationSeconds ?? -1) > 0,
  );
  const uniqueContacts = buildUniqueContactsMap(sessions);
  const newContacts = range
    ? Array.from(uniqueContacts.values()).filter((contact) =>
        isDateInRange(contact.createdAt, range.from, range.to),
      ).length
    : 0;

  const avgFirstResponse =
    sessionsWithWaitTime.reduce(
      (sum, session) => sum + (session.firstResponseSeconds ?? 0),
      0,
    ) / (sessionsWithWaitTime.length || 1);

  const avgDuration =
    sessionsWithDuration.reduce(
      (sum, session) => sum + (session.durationSeconds ?? 0),
      0,
    ) / (sessionsWithDuration.length || 1);

  const classifiedAmount = sessions.reduce(
    (sum, session) => sum + (session.classification?.amount ?? 0),
    0,
  );

  const uniqueAgents = new Set(
    sessions.map((session) => session.agent?.id).filter(Boolean),
  );

  return {
    totalSessions: sessions.length,
    finishedSessions: finishedSessions.length,
    resolutionRate:
      (finishedSessions.length / (visibleSessions.length || 1)) * 100,
    avgFirstResponse,
    avgDuration,
    activeAgents: uniqueAgents.size,
    uniqueContacts: uniqueContacts.size,
    newContacts,
    classifiedAmount,
  };
}

export function groupByDay(sessions: Session[]) {
  const map = new Map<
    string,
    { date: string; total: number; finished: number; other: number }
  >();

  for (const session of sessions) {
    const key = toLocalDateKey(session.createdAt);
    if (!key) continue;

    if (!map.has(key)) {
      map.set(key, { date: key, total: 0, finished: 0, other: 0 });
    }

    const bucket = map.get(key)!;
    bucket.total += 1;

    if (session.status === "Finished") {
      bucket.finished += 1;
    } else {
      bucket.other += 1;
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

export function groupByChannel(sessions: Session[]) {
  const map = new Map<string, number>();
  for (const session of sessions) {
    map.set(session.channelType, (map.get(session.channelType) ?? 0) + 1);
  }
  return Array.from(map, ([name, value]) => ({ name, value })).sort(
    (a, b) => b.value - a.value,
  );
}

export function groupByHour(sessions: Session[]) {
  const buckets = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: `${hour.toString().padStart(2, "0")}h`,
    total: 0,
  }));

  for (const session of sessions) {
    const hour = new Date(session.createdAt).getHours();
    buckets[hour].total += 1;
  }

  return buckets;
}

export function groupByDepartment(sessions: Session[]) {
  const map = new Map<string, number>();
  for (const session of sessions) {
    const name = session.department?.name ?? "Sem departamento";
    map.set(name, (map.get(name) ?? 0) + 1);
  }
  return Array.from(map, ([name, value]) => ({ name, value })).sort(
    (a, b) => b.value - a.value,
  );
}

export function groupByAgent(sessions: Session[], limit = 8) {
  const map = new Map<
    string,
    {
      name: string;
      total: number;
      finished: number;
      avgFirst: number;
      firstResponseCount: number;
    }
  >();

  for (const session of sessions) {
    const name = session.agent?.name ?? "Sem agente";
    if (!map.has(name)) {
      map.set(name, {
        name,
        total: 0,
        finished: 0,
        avgFirst: 0,
        firstResponseCount: 0,
      });
    }

    const bucket = map.get(name)!;
    bucket.total += 1;

    if (session.status === "Finished") {
      bucket.finished += 1;
    }

    if ((session.firstResponseSeconds ?? -1) > 0) {
      bucket.firstResponseCount += 1;
      bucket.avgFirst =
        (
          bucket.avgFirst * (bucket.firstResponseCount - 1) +
          (session.firstResponseSeconds ?? 0)
        ) / bucket.firstResponseCount;
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export function groupByStatus(sessions: Session[]) {
  const map = new Map<string, number>();
  for (const session of sessions) {
    map.set(session.status, (map.get(session.status) ?? 0) + 1);
  }
  return Array.from(map, ([name, value]) => ({ name, value }));
}

export function groupByClassification(sessions: Session[]) {
  const map = new Map<string, number>();
  for (const session of sessions) {
    const name = session.classification?.name ?? "Sem classificação";
    map.set(name, (map.get(name) ?? 0) + 1);
  }
  return Array.from(map, ([name, value]) => ({ name, value })).sort(
    (a, b) => b.value - a.value,
  );
}
