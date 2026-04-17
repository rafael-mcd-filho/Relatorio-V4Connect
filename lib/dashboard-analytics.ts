import type { Classification, Contact, Session } from "./types";
import { parseDateKey, toLocalDateKey } from "./utils";

export interface DashboardRange {
  from: Date;
  to: Date;
}

export interface DashboardKpis {
  totalSessions: number;
  hiddenSessions: number;
  visibleSessions: number;
  uniqueContacts: number;
  newContacts: number;
  existingContacts: number;
  sessionsFromNewContacts: number;
  sessionsFromExistingContacts: number;
  percentNewContacts: number;
  percentSessionsFromNewContacts: number;
  contactsWon: number;
  contactsLost: number;
  contactsUnclassified: number;
  contactsWonWithoutValue: number;
  conversionRate: number;
  totalRevenue: number;
  averageTicket: number;
}

export interface DashboardPanelMetrics {
  totalContacts: number;
  totalSessions: number;
  hiddenSessions: number;
  visibleSessions: number;
  contactsWon: number;
  contactsLost: number;
  contactsUnclassified: number;
  sessionsUnclassified: number;
  conversionRate: number;
  totalRevenue: number;
  averageTicket: number;
  contactsWonWithoutValue: number;
  wonWithoutValueRecords: number;
}

export interface DashboardQualityMetrics {
  hiddenSessions: number;
  sessionsWithoutAgent: number;
  contactsWithoutTags: number;
  sessionsWithoutFirstResponse: number;
  sessionsWithoutWaitMeasurement: number;
  sessionsLongDurationOutliers: number;
}

export interface DashboardClassificationMetric {
  category?: string;
  categoryName?: string;
  description?: string;
  amount: number;
  count: number;
}

export interface DashboardContactItem {
  contactId: string;
  contactName: string;
  contactCreatedAt?: string;
  contactCreatedAtDisplay?: string;
  isNew: boolean;
  leadSource: string;
  leadSourceDetail?: string | null;
  utmSource?: string | null;
  utmCampaign?: string | null;
  tagNames: string[];
  totalSessions: number;
  hiddenSessions: number;
  classifications: DashboardClassificationMetric[];
  outcome: "won" | "lost" | "unclassified";
  revenue: number;
  hasWon: boolean;
  hasLost: boolean;
  hasPositiveRevenueGain: boolean;
}

export interface DashboardTagMetric {
  tag: string;
  totalContacts: number;
  totalSessions: number;
  newContacts: number;
  newSessions: number;
  wonContacts: number;
  lostContacts: number;
  totalRevenue: number;
  conversionRate: number;
}

export interface DashboardReasonMetric {
  reason: string;
  count: number;
  totalRevenue: number;
}

export interface DashboardDailyMetric {
  date: string;
  totalSessions: number;
  wonSessions: number;
  lostSessions: number;
  hiddenSessions: number;
  revenue: number;
  newContacts: number;
}

export interface DashboardWeeklyMetric {
  weekStart: string;
  totalSessions: number;
  wonSessions: number;
  lostSessions: number;
  revenue: number;
  newContacts: number;
}

export interface DashboardDimensionMetric {
  key: string;
  label: string;
  totalSessions: number;
  uniqueContacts: number;
  newContacts: number;
  wonContacts: number;
  lostContacts: number;
  unclassifiedContacts: number;
  unclassifiedSessions: number;
  conversionRate: number;
  totalRevenue: number;
  averageTicket: number;
  avgWaitSeconds: number;
  avgServiceSeconds: number;
}

export interface DashboardSlaMetrics {
  avgWaitSeconds: number;
  avgServiceSeconds: number;
  avgWaitWonSeconds: number;
  avgWaitLostSeconds: number;
  avgServiceWonSeconds: number;
  avgServiceLostSeconds: number;
  sessionsWithoutWaitMeasurement: number;
  sessionsWithoutServiceMeasurement: number;
  sessionsWithoutFirstResponse: number;
}

export interface DashboardRecurrenceMetrics {
  repeatContacts: number;
  averageSessionsPerContact: number;
  adTagContacts: number;
  adTagRevenue: number;
  organicContacts: number;
  organicRevenue: number;
  contactsWonAndLost: number;
}

export interface DashboardPeakHourMetric {
  hour: number;
  label: string;
  totalSessions: number;
  wonSessions: number;
  lostSessions: number;
  revenue: number;
}

export interface DashboardReasonDimensionMetric {
  key: string;
  label: string;
  topGainReasons: DashboardReasonMetric[];
  topLostReasons: DashboardReasonMetric[];
}

export interface DashboardVisualFilters {
  adsOnly: boolean;
  newContactsOnly: boolean;
  channelId: string;
  outcome: "all" | "won" | "lost" | "unclassified";
}

export interface DashboardAnalytics {
  kpis: DashboardKpis;
  panels: {
    total: DashboardPanelMetrics;
    new: DashboardPanelMetrics;
    existing: DashboardPanelMetrics;
  };
  quality: DashboardQualityMetrics;
  items: DashboardContactItem[];
  byTag: DashboardTagMetric[];
  byLeadSource: DashboardDimensionMetric[];
  byCampaign: DashboardDimensionMetric[];
  byAgent: DashboardDimensionMetric[];
  byDepartment: DashboardDimensionMetric[];
  byDay: DashboardDailyMetric[];
  byWeek: DashboardWeeklyMetric[];
  peakHours: DashboardPeakHourMetric[];
  reasonByAgent: DashboardReasonDimensionMetric[];
  reasonByTag: DashboardReasonDimensionMetric[];
  reasonByCampaign: DashboardReasonDimensionMetric[];
  sla: DashboardSlaMetrics;
  recurrence: DashboardRecurrenceMetrics;
  topGainReasons: DashboardReasonMetric[];
  topLostReasons: DashboardReasonMetric[];
  topInfoReasons: DashboardReasonMetric[];
  topOtherReasons: DashboardReasonMetric[];
}

interface ContactAggregate {
  contactId: string;
  contact?: Contact;
  sessionIds: Set<string>;
  hiddenSessions: number;
  classificationsMap: Map<string, DashboardClassificationMetric>;
}

export const DEFAULT_DASHBOARD_VISUAL_FILTERS: DashboardVisualFilters = {
  adsOnly: false,
  newContactsOnly: false,
  channelId: "all",
  outcome: "all",
};

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function formatDateBr(iso: string | undefined) {
  if (!iso) return undefined;

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;

  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function isDateInRange(
  value: string | undefined,
  from: Date,
  to: Date,
) {
  if (!value) return false;

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return false;

  return timestamp >= from.getTime() && timestamp <= to.getTime();
}

function resolveRange(
  sessions: Session[],
  range?: DashboardRange,
): DashboardRange {
  if (range) return range;

  const timestamps = sessions
    .map((session) => new Date(session.createdAt).getTime())
    .filter((timestamp) => Number.isFinite(timestamp))
    .sort((a, b) => a - b);

  if (timestamps.length === 0) {
    const now = new Date();
    return { from: now, to: now };
  }

  return {
    from: new Date(timestamps[0]),
    to: new Date(timestamps[timestamps.length - 1]),
  };
}

function mergeContact(
  current: Contact | undefined,
  incoming: Contact | undefined,
): Contact | undefined {
  if (!incoming) return current;
  if (!current) {
    return {
      ...incoming,
      tagIds: incoming.tagIds ? [...incoming.tagIds] : incoming.tagIds,
      tagNames: incoming.tagNames ? [...incoming.tagNames] : incoming.tagNames,
      utm: incoming.utm ? { ...incoming.utm } : incoming.utm,
    };
  }

  const currentTagIds = current.tagIds ?? [];
  const incomingTagIds = incoming.tagIds ?? [];
  const currentTagNames = current.tagNames ?? [];
  const incomingTagNames = incoming.tagNames ?? [];

  return {
    ...current,
    name:
      current.name && current.name !== "Sem contato"
        ? current.name
        : incoming.name,
    identifier: current.identifier ?? incoming.identifier,
    createdAt: current.createdAt ?? incoming.createdAt,
    updatedAt: incoming.updatedAt ?? current.updatedAt,
    status: current.status ?? incoming.status,
    origin: current.origin ?? incoming.origin,
    tagIds:
      incomingTagIds.length > currentTagIds.length
        ? [...incomingTagIds]
        : [...currentTagIds],
    tagNames:
      incomingTagNames.length > currentTagNames.length
        ? [...incomingTagNames]
        : [...currentTagNames],
    utm: current.utm ?? incoming.utm,
  };
}

function classificationKey(classification: Classification) {
  const amount = Number(classification.amount ?? 0);

  return [
    classification.category ?? "",
    classification.categoryName ?? "",
    classification.description ?? classification.name ?? "",
    String(amount),
  ].join("||");
}

function classificationReason(
  classification: DashboardClassificationMetric,
) {
  return (
    classification.description ??
    classification.categoryName ??
    classification.category ??
    "Sem motivo"
  );
}

function isGainClassification(
  classification: DashboardClassificationMetric,
) {
  const category = normalizeText(classification.category);
  const categoryName = normalizeText(classification.categoryName);
  const description = normalizeText(classification.description);

  return (
    category === "won" ||
    categoryName.includes("ganho") ||
    description.includes("ganho")
  );
}

function isLostClassification(
  classification: DashboardClassificationMetric,
) {
  const category = normalizeText(classification.category);
  const categoryName = normalizeText(classification.categoryName);
  const description = normalizeText(classification.description);

  return (
    category === "lost" ||
    categoryName.includes("perd") ||
    description.includes("perd")
  );
}

function isInfoClassification(
  classification: DashboardClassificationMetric,
) {
  const category = normalizeText(classification.category);
  const categoryName = normalizeText(classification.categoryName);
  const description = normalizeText(classification.description);

  return (
    category === "info" ||
    categoryName.includes("duvida") ||
    description.includes("duvida")
  );
}

function isOtherClassification(
  classification: DashboardClassificationMetric,
) {
  const category = normalizeText(classification.category);
  const categoryName = normalizeText(classification.categoryName);
  const description = normalizeText(classification.description);

  return (
    category === "other" ||
    categoryName.includes("outro") ||
    description.includes("outro")
  );
}

function hasAnnouncementTag(tagNames: string[]) {
  return tagNames.some((tag) => normalizeText(tag) === "anuncio");
}

function isAdLead(contact: Contact | undefined) {
  const tagNames = contact?.tagNames ?? [];
  return hasAnnouncementTag(tagNames);
}

function deriveLeadSource(contact: Contact | undefined) {
  const utm = contact?.utm;

  if (isAdLead(contact)) {
    return {
      source: "Anúncio",
      detail: utm?.campaign ?? "Tag de anúncio",
    };
  }

  return {
    source: "Orgânico",
    detail:
      utm?.campaign ??
      utm?.source ??
      contact?.origin ??
      "Sem origem paga",
  };
}

function buildEmptyPanel(): DashboardPanelMetrics {
  return {
    totalContacts: 0,
    totalSessions: 0,
    hiddenSessions: 0,
    visibleSessions: 0,
    contactsWon: 0,
    contactsLost: 0,
    contactsUnclassified: 0,
    sessionsUnclassified: 0,
    conversionRate: 0,
    totalRevenue: 0,
    averageTicket: 0,
    contactsWonWithoutValue: 0,
    wonWithoutValueRecords: 0,
  };
}

function buildDimensionAccumulator(key: string, label: string) {
  return {
    key,
    label,
    contactIds: new Set<string>(),
    newContactIds: new Set<string>(),
    wonContactIds: new Set<string>(),
    lostContactIds: new Set<string>(),
    revenueContactIds: new Set<string>(),
    totalSessions: 0,
    unclassifiedSessions: 0,
    totalRevenue: 0,
    waitSum: 0,
    waitCount: 0,
    serviceSum: 0,
    serviceCount: 0,
  };
}

function finalizeDimensionMetrics(
  buckets: Map<string, ReturnType<typeof buildDimensionAccumulator>>,
) {
  return Array.from(buckets.values())
    .map<DashboardDimensionMetric>((bucket) => {
      const classifiedContacts = new Set([
        ...bucket.wonContactIds,
        ...bucket.lostContactIds,
      ]);

      return {
        key: bucket.key,
        label: bucket.label,
        totalSessions: bucket.totalSessions,
        uniqueContacts: bucket.contactIds.size,
        newContacts: bucket.newContactIds.size,
        wonContacts: bucket.wonContactIds.size,
        lostContacts: bucket.lostContactIds.size,
        unclassifiedContacts: Math.max(
          bucket.contactIds.size - classifiedContacts.size,
          0,
        ),
        unclassifiedSessions: bucket.unclassifiedSessions,
        conversionRate:
          bucket.wonContactIds.size + bucket.lostContactIds.size > 0
            ? (bucket.wonContactIds.size /
                (bucket.wonContactIds.size + bucket.lostContactIds.size)) *
              100
            : 0,
        totalRevenue: bucket.totalRevenue,
        averageTicket:
          bucket.revenueContactIds.size > 0
            ? bucket.totalRevenue / bucket.revenueContactIds.size
            : 0,
        avgWaitSeconds:
          bucket.waitCount > 0 ? bucket.waitSum / bucket.waitCount : 0,
        avgServiceSeconds:
          bucket.serviceCount > 0 ? bucket.serviceSum / bucket.serviceCount : 0,
      };
    })
    .sort((a, b) => {
      if (b.totalRevenue !== a.totalRevenue) {
        return b.totalRevenue - a.totalRevenue;
      }

      return b.totalSessions - a.totalSessions;
    });
}

function summarizePanel(
  items: DashboardContactItem[],
  sessions: Session[],
): DashboardPanelMetrics {
  if (items.length === 0) return buildEmptyPanel();

  const contactIds = new Set(items.map((item) => item.contactId));
  const filteredSessions = sessions.filter((session) =>
    contactIds.has(session.contact?.id ?? ""),
  );
  const contactsWon = items.filter((item) => item.outcome === "won").length;
  const contactsLost = items.filter((item) => item.outcome === "lost").length;
  const contactsUnclassified = items.length - contactsWon - contactsLost;
  const totalRevenue = items.reduce((sum, item) => sum + item.revenue, 0);
  const contactsWonWithValue = items.filter(
    (item) => item.outcome === "won" && item.hasPositiveRevenueGain,
  ).length;
  const contactsWonWithoutValue = items.filter(
    (item) => item.outcome === "won" && !item.hasPositiveRevenueGain,
  ).length;
  const wonWithoutValueRecords = items.reduce(
    (sum, item) =>
      sum +
      item.classifications.filter(
        (classification) =>
          isGainClassification(classification) &&
          Number(classification.amount) <= 0,
      ).length,
    0,
  );
  const hiddenSessions = filteredSessions.filter(
    (session) => session.status === "Hidden",
  ).length;
  const sessionsUnclassified = filteredSessions.filter(
    (session) => !session.classification,
  ).length;

  return {
    totalContacts: items.length,
    totalSessions: filteredSessions.length,
    hiddenSessions,
    visibleSessions: filteredSessions.length - hiddenSessions,
    contactsWon,
    contactsLost,
    contactsUnclassified,
    sessionsUnclassified,
    conversionRate:
      contactsWon + contactsLost > 0
        ? (contactsWon / (contactsWon + contactsLost)) * 100
        : 0,
    totalRevenue,
    averageTicket:
      contactsWonWithValue > 0 ? totalRevenue / contactsWonWithValue : 0,
    contactsWonWithoutValue,
    wonWithoutValueRecords,
  };
}

function summarizeTagMetrics(items: DashboardContactItem[]) {
  const byTag = new Map<
    string,
    {
      tag: string;
      contactIds: Set<string>;
      totalSessions: number;
      newContactIds: Set<string>;
      newSessions: number;
      wonContacts: number;
      lostContacts: number;
      totalRevenue: number;
    }
  >();

  for (const item of items) {
    const tags = item.tagNames.length > 0 ? item.tagNames : ["(Sem tag)"];

    for (const tag of tags) {
      if (!byTag.has(tag)) {
        byTag.set(tag, {
          tag,
          contactIds: new Set<string>(),
          totalSessions: 0,
          newContactIds: new Set<string>(),
          newSessions: 0,
          wonContacts: 0,
          lostContacts: 0,
          totalRevenue: 0,
        });
      }

      const bucket = byTag.get(tag)!;
      bucket.contactIds.add(item.contactId);
      bucket.totalSessions += item.totalSessions;
      bucket.totalRevenue += item.revenue;

      if (item.isNew) {
        bucket.newContactIds.add(item.contactId);
        bucket.newSessions += item.totalSessions;
      }

      if (item.outcome === "won") bucket.wonContacts += 1;
      if (item.outcome === "lost") bucket.lostContacts += 1;
    }
  }

  return Array.from(byTag.values())
    .map<DashboardTagMetric>((bucket) => ({
      tag: bucket.tag,
      totalContacts: bucket.contactIds.size,
      totalSessions: bucket.totalSessions,
      newContacts: bucket.newContactIds.size,
      newSessions: bucket.newSessions,
      wonContacts: bucket.wonContacts,
      lostContacts: bucket.lostContacts,
      totalRevenue: bucket.totalRevenue,
      conversionRate:
        bucket.wonContacts + bucket.lostContacts > 0
          ? (bucket.wonContacts / (bucket.wonContacts + bucket.lostContacts)) *
            100
          : 0,
    }))
    .sort((a, b) => b.totalSessions - a.totalSessions);
}

function summarizeContactDimension(
  items: DashboardContactItem[],
  getDimensions: (
    item: DashboardContactItem,
  ) => Array<{ key: string; label: string }>,
) {
  const buckets = new Map<
    string,
    ReturnType<typeof buildDimensionAccumulator>
  >();

  for (const item of items) {
    for (const dimension of getDimensions(item)) {
      if (!buckets.has(dimension.key)) {
        buckets.set(
          dimension.key,
          buildDimensionAccumulator(dimension.key, dimension.label),
        );
      }

      const bucket = buckets.get(dimension.key)!;
      bucket.contactIds.add(item.contactId);
      bucket.totalSessions += item.totalSessions;

      if (item.isNew) bucket.newContactIds.add(item.contactId);
      if (item.outcome === "won") bucket.wonContactIds.add(item.contactId);
      if (item.outcome === "lost") bucket.lostContactIds.add(item.contactId);

      bucket.totalRevenue += item.revenue;
      if (item.hasPositiveRevenueGain) {
        bucket.revenueContactIds.add(item.contactId);
      }
    }
  }

  return finalizeDimensionMetrics(buckets);
}

function summarizeSessionDimension(
  sessions: Session[],
  contactById: Map<string, DashboardContactItem>,
  getDimension: (
    session: Session,
  ) => { key: string; label: string },
) {
  const buckets = new Map<
    string,
    ReturnType<typeof buildDimensionAccumulator>
  >();
  const revenueDedup = new Set<string>();

  for (const session of sessions) {
    const dimension = getDimension(session);

    if (!buckets.has(dimension.key)) {
      buckets.set(
        dimension.key,
        buildDimensionAccumulator(dimension.key, dimension.label),
      );
    }

    const bucket = buckets.get(dimension.key)!;
    const contactId = session.contact?.id;
    const contact = contactId ? contactById.get(contactId) : undefined;
    const classification = session.classification
      ? {
          category: session.classification.category,
          categoryName: session.classification.categoryName,
          description:
            session.classification.description ?? session.classification.name,
          amount: Number(session.classification.amount ?? 0),
          count: 1,
        }
      : null;

    bucket.totalSessions += 1;

    if (contactId) {
      bucket.contactIds.add(contactId);
      if (contact?.isNew) bucket.newContactIds.add(contactId);
    }

    if (session.firstResponseSeconds != null) {
      bucket.waitSum += session.firstResponseSeconds;
      bucket.waitCount += 1;
    }

    if (session.durationSeconds != null) {
      bucket.serviceSum += session.durationSeconds;
      bucket.serviceCount += 1;
    }

    if (!classification) {
      if (session.status === "Finished") {
        bucket.unclassifiedSessions += 1;
      }
      continue;
    }

    if (!contactId) continue;

    if (isGainClassification(classification)) {
      bucket.wonContactIds.add(contactId);

      const revenueKey = [
        dimension.key,
        contactId,
        classification.category ?? "",
        classification.categoryName ?? "",
        classification.description ?? "",
        String(classification.amount),
      ].join("||");

      if (
        Number(classification.amount) > 0 &&
        !revenueDedup.has(revenueKey)
      ) {
        revenueDedup.add(revenueKey);
        bucket.totalRevenue += Number(classification.amount);
        bucket.revenueContactIds.add(contactId);
      }
    } else if (isLostClassification(classification)) {
      bucket.lostContactIds.add(contactId);
    } else if (session.status === "Finished") {
      bucket.unclassifiedSessions += 1;
    }
  }

  return finalizeDimensionMetrics(buckets);
}

function summarizeSla(sessions: Session[]): DashboardSlaMetrics {
  const waitValues = sessions
    .map((session) => session.firstResponseSeconds)
    .filter((value): value is number => value != null);
  const serviceValues = sessions
    .map((session) => session.durationSeconds)
    .filter((value): value is number => value != null);
  const wonSessions = sessions.filter((session) =>
    session.classification
      ? isGainClassification({
          category: session.classification.category,
          categoryName: session.classification.categoryName,
          description:
            session.classification.description ?? session.classification.name,
          amount: Number(session.classification.amount ?? 0),
          count: 1,
        })
      : false,
  );
  const lostSessions = sessions.filter((session) =>
    session.classification
      ? isLostClassification({
          category: session.classification.category,
          categoryName: session.classification.categoryName,
          description:
            session.classification.description ?? session.classification.name,
          amount: Number(session.classification.amount ?? 0),
          count: 1,
        })
      : false,
  );
  const avg = (values: Array<number | null | undefined>) => {
    const filtered = values.filter((value): value is number => value != null);
    return filtered.length > 0
      ? filtered.reduce((sum, value) => sum + value, 0) / filtered.length
      : 0;
  };

  return {
    avgWaitSeconds: avg(waitValues),
    avgServiceSeconds: avg(serviceValues),
    avgWaitWonSeconds: avg(
      wonSessions.map((session) => session.firstResponseSeconds),
    ),
    avgWaitLostSeconds: avg(
      lostSessions.map((session) => session.firstResponseSeconds),
    ),
    avgServiceWonSeconds: avg(
      wonSessions.map((session) => session.durationSeconds),
    ),
    avgServiceLostSeconds: avg(
      lostSessions.map((session) => session.durationSeconds),
    ),
    sessionsWithoutWaitMeasurement: sessions.filter(
      (session) => session.firstResponseSeconds == null,
    ).length,
    sessionsWithoutServiceMeasurement: sessions.filter(
      (session) => session.durationSeconds == null,
    ).length,
    sessionsWithoutFirstResponse: sessions.filter(
      (session) => !session.firstResponseAt,
    ).length,
  };
}

function summarizeDaily(
  sessions: Session[],
  contactById: Map<string, DashboardContactItem>,
) {
  const daily = new Map<
    string,
    {
      date: string;
      totalSessions: number;
      wonSessions: number;
      lostSessions: number;
      hiddenSessions: number;
      revenue: number;
      newContactIds: Set<string>;
      revenueKeys: Set<string>;
    }
  >();

  for (const session of sessions) {
    const date = toLocalDateKey(session.createdAt);
    if (!date) continue;

    if (!daily.has(date)) {
      daily.set(date, {
        date,
        totalSessions: 0,
        wonSessions: 0,
        lostSessions: 0,
        hiddenSessions: 0,
        revenue: 0,
        newContactIds: new Set<string>(),
        revenueKeys: new Set<string>(),
      });
    }

    const bucket = daily.get(date)!;
    const contactId = session.contact?.id;
    const contact = contactId ? contactById.get(contactId) : undefined;
    const classification = session.classification
      ? {
          category: session.classification.category,
          categoryName: session.classification.categoryName,
          description:
            session.classification.description ?? session.classification.name,
          amount: Number(session.classification.amount ?? 0),
          count: 1,
        }
      : null;

    bucket.totalSessions += 1;

    if (session.status === "Hidden") {
      bucket.hiddenSessions += 1;
    }

    if (contact?.isNew && contactId) {
      bucket.newContactIds.add(contactId);
    }

    if (!classification) continue;

    if (isGainClassification(classification)) {
      bucket.wonSessions += 1;

      const revenueKey = [
        contactId ?? "",
        classification.category ?? "",
        classification.categoryName ?? "",
        classification.description ?? "",
        String(classification.amount),
      ].join("||");

      if (
        Number(classification.amount) > 0 &&
        !bucket.revenueKeys.has(revenueKey)
      ) {
        bucket.revenueKeys.add(revenueKey);
        bucket.revenue += Number(classification.amount);
      }
    } else if (isLostClassification(classification)) {
      bucket.lostSessions += 1;
    }
  }

  return Array.from(daily.values())
    .map<DashboardDailyMetric>((bucket) => ({
      date: bucket.date,
      totalSessions: bucket.totalSessions,
      wonSessions: bucket.wonSessions,
      lostSessions: bucket.lostSessions,
      hiddenSessions: bucket.hiddenSessions,
      revenue: bucket.revenue,
      newContacts: bucket.newContactIds.size,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getWeekStartKey(isoDate: string) {
  const date = parseDateKey(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;

  const weekDate = new Date(date);
  const day = (weekDate.getDay() + 6) % 7;

  weekDate.setHours(0, 0, 0, 0);
  weekDate.setDate(weekDate.getDate() - day);

  return toLocalDateKey(weekDate) || isoDate;
}

function summarizeWeekly(byDay: DashboardDailyMetric[]) {
  const weekly = new Map<string, DashboardWeeklyMetric>();

  for (const day of byDay) {
    const weekStart = getWeekStartKey(day.date);

    if (!weekly.has(weekStart)) {
      weekly.set(weekStart, {
        weekStart,
        totalSessions: 0,
        wonSessions: 0,
        lostSessions: 0,
        revenue: 0,
        newContacts: 0,
      });
    }

    const bucket = weekly.get(weekStart)!;
    bucket.totalSessions += day.totalSessions;
    bucket.wonSessions += day.wonSessions;
    bucket.lostSessions += day.lostSessions;
    bucket.revenue += day.revenue;
    bucket.newContacts += day.newContacts;
  }

  return Array.from(weekly.values()).sort((a, b) =>
    a.weekStart.localeCompare(b.weekStart),
  );
}

function summarizePeakHours(sessions: Session[]) {
  const buckets = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: `${hour.toString().padStart(2, "0")}h`,
    totalSessions: 0,
    wonSessions: 0,
    lostSessions: 0,
    revenue: 0,
    revenueKeys: new Set<string>(),
  }));

  for (const session of sessions) {
    const hour = new Date(session.createdAt).getHours();
    const bucket = buckets[hour];

    bucket.totalSessions += 1;

    if (!session.classification) continue;

    const classification = {
      category: session.classification.category,
      categoryName: session.classification.categoryName,
      description:
        session.classification.description ?? session.classification.name,
      amount: Number(session.classification.amount ?? 0),
      count: 1,
    };

    if (isGainClassification(classification)) {
      bucket.wonSessions += 1;
      const revenueKey = [
        session.contact?.id ?? "",
        classification.category ?? "",
        classification.categoryName ?? "",
        classification.description ?? "",
        String(classification.amount),
      ].join("||");

      if (
        Number(classification.amount) > 0 &&
        !bucket.revenueKeys.has(revenueKey)
      ) {
        bucket.revenueKeys.add(revenueKey);
        bucket.revenue += Number(classification.amount);
      }
    } else if (isLostClassification(classification)) {
      bucket.lostSessions += 1;
    }
  }

  return buckets
    .map<DashboardPeakHourMetric>((bucket) => ({
      hour: bucket.hour,
      label: bucket.label,
      totalSessions: bucket.totalSessions,
      wonSessions: bucket.wonSessions,
      lostSessions: bucket.lostSessions,
      revenue: bucket.revenue,
    }))
    .sort((a, b) => {
      if (b.totalSessions !== a.totalSessions) {
        return b.totalSessions - a.totalSessions;
      }

      return b.revenue - a.revenue;
    });
}

function summarizeRecurrence(
  items: DashboardContactItem[],
): DashboardRecurrenceMetrics {
  const repeatContacts = items.filter((item) => item.totalSessions > 1).length;
  const adItems = items.filter((item) => item.leadSource === "Anúncio");
  const organicItems = items.filter((item) => item.leadSource === "Orgânico");

  return {
    repeatContacts,
    averageSessionsPerContact:
      items.length > 0
        ? items.reduce((sum, item) => sum + item.totalSessions, 0) / items.length
        : 0,
    adTagContacts: adItems.length,
    adTagRevenue: adItems.reduce((sum, item) => sum + item.revenue, 0),
    organicContacts: organicItems.length,
    organicRevenue: organicItems.reduce((sum, item) => sum + item.revenue, 0),
    contactsWonAndLost: items.filter((item) => item.hasWon && item.hasLost).length,
  };
}

function summarizeReasonDimensionFromContacts(
  items: DashboardContactItem[],
  getDimensions: (
    item: DashboardContactItem,
  ) => Array<{ key: string; label: string }>,
) {
  const buckets = new Map<
    string,
    {
      key: string;
      label: string;
      gainReasons: Map<string, DashboardReasonMetric>;
      lostReasons: Map<string, DashboardReasonMetric>;
    }
  >();

  for (const item of items) {
    const gains = item.classifications.filter(isGainClassification);
    const losses = item.classifications.filter(isLostClassification);

    for (const dimension of getDimensions(item)) {
      if (!buckets.has(dimension.key)) {
        buckets.set(dimension.key, {
          key: dimension.key,
          label: dimension.label,
          gainReasons: new Map<string, DashboardReasonMetric>(),
          lostReasons: new Map<string, DashboardReasonMetric>(),
        });
      }

      const bucket = buckets.get(dimension.key)!;

      for (const gain of gains) {
        const reason = classificationReason(gain);
        const current = bucket.gainReasons.get(reason);

        if (!current) {
          bucket.gainReasons.set(reason, {
            reason,
            count: 1,
            totalRevenue: Math.max(Number(gain.amount), 0),
          });
        } else {
          current.count += 1;
          current.totalRevenue += Math.max(Number(gain.amount), 0);
        }
      }

      for (const loss of losses) {
        const reason = classificationReason(loss);
        const current = bucket.lostReasons.get(reason);

        if (!current) {
          bucket.lostReasons.set(reason, {
            reason,
            count: 1,
            totalRevenue: 0,
          });
        } else {
          current.count += 1;
        }
      }
    }
  }

  return Array.from(buckets.values())
    .map<DashboardReasonDimensionMetric>((bucket) => ({
      key: bucket.key,
      label: bucket.label,
      topGainReasons: Array.from(bucket.gainReasons.values()).sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return b.totalRevenue - a.totalRevenue;
      }),
      topLostReasons: Array.from(bucket.lostReasons.values()).sort(
        (a, b) => b.count - a.count,
      ),
    }))
    .sort((a, b) => {
      const aScore =
        (a.topGainReasons[0]?.count ?? 0) + (a.topLostReasons[0]?.count ?? 0);
      const bScore =
        (b.topGainReasons[0]?.count ?? 0) + (b.topLostReasons[0]?.count ?? 0);

      return bScore - aScore;
    });
}

function summarizeReasonDimensionFromSessions(
  sessions: Session[],
  getDimension: (
    session: Session,
  ) => { key: string; label: string },
) {
  const buckets = new Map<
    string,
    {
      key: string;
      label: string;
      gainReasons: Map<string, DashboardReasonMetric>;
      lostReasons: Map<string, DashboardReasonMetric>;
    }
  >();

  for (const session of sessions) {
    if (!session.classification) continue;

    const dimension = getDimension(session);
    if (!buckets.has(dimension.key)) {
      buckets.set(dimension.key, {
        key: dimension.key,
        label: dimension.label,
        gainReasons: new Map<string, DashboardReasonMetric>(),
        lostReasons: new Map<string, DashboardReasonMetric>(),
      });
    }

    const classification = {
      category: session.classification.category,
      categoryName: session.classification.categoryName,
      description:
        session.classification.description ?? session.classification.name,
      amount: Number(session.classification.amount ?? 0),
      count: 1,
    };
    const reason = classificationReason(classification);
    const bucket = buckets.get(dimension.key)!;

    if (isGainClassification(classification)) {
      const current = bucket.gainReasons.get(reason);

      if (!current) {
        bucket.gainReasons.set(reason, {
          reason,
          count: 1,
          totalRevenue: Math.max(Number(classification.amount), 0),
        });
      } else {
        current.count += 1;
        current.totalRevenue += Math.max(Number(classification.amount), 0);
      }
    } else if (isLostClassification(classification)) {
      const current = bucket.lostReasons.get(reason);

      if (!current) {
        bucket.lostReasons.set(reason, {
          reason,
          count: 1,
          totalRevenue: 0,
        });
      } else {
        current.count += 1;
      }
    }
  }

  return Array.from(buckets.values())
    .map<DashboardReasonDimensionMetric>((bucket) => ({
      key: bucket.key,
      label: bucket.label,
      topGainReasons: Array.from(bucket.gainReasons.values()).sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return b.totalRevenue - a.totalRevenue;
      }),
      topLostReasons: Array.from(bucket.lostReasons.values()).sort(
        (a, b) => b.count - a.count,
      ),
    }))
    .sort((a, b) => {
      const aScore =
        (a.topGainReasons[0]?.count ?? 0) + (a.topLostReasons[0]?.count ?? 0);
      const bScore =
        (b.topGainReasons[0]?.count ?? 0) + (b.topLostReasons[0]?.count ?? 0);

      return bScore - aScore;
    });
}

function summarizeReasons(items: DashboardContactItem[]) {
  const gainReasons = new Map<string, DashboardReasonMetric>();
  const lostReasons = new Map<string, DashboardReasonMetric>();
  const infoReasons = new Map<string, DashboardReasonMetric>();
  const otherReasons = new Map<string, DashboardReasonMetric>();

  for (const item of items) {
    const gains = item.classifications.filter(isGainClassification);
    const losses = item.classifications.filter(isLostClassification);
    const infos = item.classifications.filter(isInfoClassification);
    const others = item.classifications.filter(isOtherClassification);

    for (const gain of gains) {
      const reason = classificationReason(gain);
      const current = gainReasons.get(reason);

      if (!current) {
        gainReasons.set(reason, {
          reason,
          count: 1,
          totalRevenue: Math.max(Number(gain.amount), 0),
        });
      } else {
        current.count += 1;
        current.totalRevenue += Math.max(Number(gain.amount), 0);
      }
    }

    for (const info of infos) {
      const reason = classificationReason(info);
      const current = infoReasons.get(reason);

      if (!current) {
        infoReasons.set(reason, {
          reason,
          count: 1,
          totalRevenue: 0,
        });
      } else {
        current.count += 1;
      }
    }

    for (const other of others) {
      const reason = classificationReason(other);
      const current = otherReasons.get(reason);

      if (!current) {
        otherReasons.set(reason, {
          reason,
          count: 1,
          totalRevenue: 0,
        });
      } else {
        current.count += 1;
      }
    }

    if (item.outcome !== "lost" || losses.length === 0) continue;

    const topLost = losses.reduce((best, current) =>
      current.count > best.count ? current : best,
    );
    const reason = classificationReason(topLost);
    const current = lostReasons.get(reason);

    if (!current) {
      lostReasons.set(reason, {
        reason,
        count: 1,
        totalRevenue: 0,
      });
    } else {
      current.count += 1;
    }
  }

  return {
    topGainReasons: Array.from(gainReasons.values()).sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.totalRevenue - a.totalRevenue;
    }),
    topLostReasons: Array.from(lostReasons.values()).sort(
      (a, b) => b.count - a.count,
    ),
    topInfoReasons: Array.from(infoReasons.values()).sort(
      (a, b) => b.count - a.count,
    ),
    topOtherReasons: Array.from(otherReasons.values()).sort(
      (a, b) => b.count - a.count,
    ),
  };
}

export function computeDashboardAnalytics(
  sessions: Session[],
  range?: DashboardRange,
): DashboardAnalytics {
  const resolvedRange = resolveRange(sessions, range);

  if (sessions.length === 0) {
    return {
      kpis: {
        totalSessions: 0,
        hiddenSessions: 0,
        visibleSessions: 0,
        uniqueContacts: 0,
        newContacts: 0,
        existingContacts: 0,
        sessionsFromNewContacts: 0,
        sessionsFromExistingContacts: 0,
        percentNewContacts: 0,
        percentSessionsFromNewContacts: 0,
        contactsWon: 0,
        contactsLost: 0,
        contactsUnclassified: 0,
        contactsWonWithoutValue: 0,
        conversionRate: 0,
        totalRevenue: 0,
        averageTicket: 0,
      },
      panels: {
        total: buildEmptyPanel(),
        new: buildEmptyPanel(),
        existing: buildEmptyPanel(),
      },
      quality: {
        hiddenSessions: 0,
        sessionsWithoutAgent: 0,
        contactsWithoutTags: 0,
        sessionsWithoutFirstResponse: 0,
        sessionsWithoutWaitMeasurement: 0,
        sessionsLongDurationOutliers: 0,
      },
      items: [],
      byTag: [],
      byLeadSource: [],
      byCampaign: [],
      byAgent: [],
      byDepartment: [],
      byDay: [],
      byWeek: [],
      peakHours: [],
      reasonByAgent: [],
      reasonByTag: [],
      reasonByCampaign: [],
      sla: {
        avgWaitSeconds: 0,
        avgServiceSeconds: 0,
        avgWaitWonSeconds: 0,
        avgWaitLostSeconds: 0,
        avgServiceWonSeconds: 0,
        avgServiceLostSeconds: 0,
        sessionsWithoutWaitMeasurement: 0,
        sessionsWithoutServiceMeasurement: 0,
        sessionsWithoutFirstResponse: 0,
      },
      recurrence: {
        repeatContacts: 0,
        averageSessionsPerContact: 0,
        adTagContacts: 0,
        adTagRevenue: 0,
        organicContacts: 0,
        organicRevenue: 0,
        contactsWonAndLost: 0,
      },
      topGainReasons: [],
      topLostReasons: [],
      topInfoReasons: [],
      topOtherReasons: [],
    };
  }

  const byContact = new Map<string, ContactAggregate>();

  for (const session of sessions) {
    const contactId = session.contact?.id;
    if (!contactId) continue;

    if (!byContact.has(contactId)) {
      byContact.set(contactId, {
        contactId,
        contact: session.contact,
        sessionIds: new Set<string>(),
        hiddenSessions: 0,
        classificationsMap: new Map<string, DashboardClassificationMetric>(),
      });
    }

    const aggregate = byContact.get(contactId)!;
    aggregate.contact = mergeContact(aggregate.contact, session.contact);
    aggregate.sessionIds.add(session.id);

    if (session.status === "Hidden") {
      aggregate.hiddenSessions += 1;
    }

    if (!session.classification) continue;

    const key = classificationKey(session.classification);
    const current = aggregate.classificationsMap.get(key);

    if (!current) {
      aggregate.classificationsMap.set(key, {
        category: session.classification.category,
        categoryName: session.classification.categoryName,
        description:
          session.classification.description ?? session.classification.name,
        amount: Number(session.classification.amount ?? 0),
        count: 1,
      });
    } else {
      current.count += 1;
    }
  }

  const items = Array.from(byContact.values())
    .map<DashboardContactItem>((aggregate) => {
      const contact = aggregate.contact;
      const classifications = Array.from(aggregate.classificationsMap.values())
        .sort((a, b) => {
          if (b.count !== a.count) return b.count - a.count;
          return b.amount - a.amount;
        });
      const gains = classifications.filter(isGainClassification);
      const losses = classifications.filter(isLostClassification);
      const revenue = gains.reduce(
        (sum, classification) =>
          sum + Math.max(Number(classification.amount), 0),
        0,
      );
      const hasPositiveRevenueGain = gains.some(
        (classification) => Number(classification.amount) > 0,
      );
      const leadSource = deriveLeadSource(contact);

      return {
        contactId: aggregate.contactId,
        contactName: contact?.name ?? "Sem contato",
        contactCreatedAt: contact?.createdAt,
        contactCreatedAtDisplay: formatDateBr(contact?.createdAt),
        isNew: isDateInRange(
          contact?.createdAt,
          resolvedRange.from,
          resolvedRange.to,
        ),
        leadSource: leadSource.source,
        leadSourceDetail: leadSource.detail,
        utmSource: contact?.utm?.source ?? null,
        utmCampaign: contact?.utm?.campaign ?? null,
        tagNames: contact?.tagNames ?? [],
        totalSessions: aggregate.sessionIds.size,
        hiddenSessions: aggregate.hiddenSessions,
        classifications,
        outcome:
          gains.length > 0
            ? "won"
            : losses.length > 0
              ? "lost"
              : "unclassified",
        revenue,
        hasWon: gains.length > 0,
        hasLost: losses.length > 0,
        hasPositiveRevenueGain,
      };
    })
    .sort((a, b) => {
      if (b.totalSessions !== a.totalSessions) {
        return b.totalSessions - a.totalSessions;
      }

      return a.contactName.localeCompare(b.contactName);
    });

  const newContactIds = new Set(
    items.filter((item) => item.isNew).map((item) => item.contactId),
  );
  const sessionsFromNewContacts = sessions.filter((session) =>
    newContactIds.has(session.contact?.id ?? ""),
  ).length;
  const sessionsFromExistingContacts = sessions.filter((session) => {
    const contactId = session.contact?.id;
    return !!contactId && !newContactIds.has(contactId);
  }).length;

  const panels = {
    total: summarizePanel(items, sessions),
    new: summarizePanel(items.filter((item) => item.isNew), sessions),
    existing: summarizePanel(items.filter((item) => !item.isNew), sessions),
  };

  const reasons = summarizeReasons(items);
  const byTag = summarizeTagMetrics(items);
  const contactById = new Map(items.map((item) => [item.contactId, item]));
  const byLeadSource = summarizeContactDimension(items, (item) => [
    { key: item.leadSource, label: item.leadSource },
  ]);
  const byCampaign = summarizeContactDimension(items, (item) => [
    {
      key:
        item.utmCampaign ??
        (item.leadSource === "Anúncio"
          ? "Anúncio sem campanha"
          : "Sem campanha"),
      label:
        item.utmCampaign ??
        (item.leadSource === "Anúncio"
          ? "Anúncio sem campanha"
          : "Sem campanha"),
    },
  ]);
  const byAgent = summarizeSessionDimension(
    sessions,
    contactById,
    (session) => ({
      key: session.agent?.id ?? "sem-agente",
      label: session.agent?.name ?? "Sem agente",
    }),
  );
  const byDepartment = summarizeSessionDimension(
    sessions,
    contactById,
    (session) => ({
      key: session.department?.id ?? "sem-departamento",
      label: session.department?.name ?? "Sem departamento",
    }),
  );
  const byDay = summarizeDaily(sessions, contactById);
  const byWeek = summarizeWeekly(byDay);
  const peakHours = summarizePeakHours(sessions);
  const reasonByAgent = summarizeReasonDimensionFromSessions(
    sessions,
    (session) => ({
      key: session.agent?.id ?? "sem-agente",
      label: session.agent?.name ?? "Sem agente",
    }),
  );
  const reasonByTag = summarizeReasonDimensionFromContacts(items, (item) =>
    (item.tagNames.length > 0 ? item.tagNames : ["(Sem tag)"]).map((tag) => ({
      key: tag,
      label: tag,
    })),
  );
  const reasonByCampaign = summarizeReasonDimensionFromContacts(items, (item) => [
    {
      key:
        item.utmCampaign ??
        (item.leadSource === "Anúncio"
          ? "Anúncio sem campanha"
          : "Sem campanha"),
      label:
        item.utmCampaign ??
        (item.leadSource === "Anúncio"
          ? "Anúncio sem campanha"
          : "Sem campanha"),
    },
  ]);
  const sla = summarizeSla(sessions);
  const recurrence = summarizeRecurrence(items);

  return {
    kpis: {
      totalSessions: sessions.length,
      hiddenSessions: panels.total.hiddenSessions,
      visibleSessions: panels.total.visibleSessions,
      uniqueContacts: items.length,
      newContacts: panels.new.totalContacts,
      existingContacts: panels.existing.totalContacts,
      sessionsFromNewContacts,
      sessionsFromExistingContacts,
      percentNewContacts:
        items.length > 0 ? (panels.new.totalContacts / items.length) * 100 : 0,
      percentSessionsFromNewContacts:
        sessions.length > 0
          ? (sessionsFromNewContacts / sessions.length) * 100
          : 0,
      contactsWon: panels.total.contactsWon,
      contactsLost: panels.total.contactsLost,
      contactsUnclassified: panels.total.contactsUnclassified,
      contactsWonWithoutValue: panels.total.contactsWonWithoutValue,
      conversionRate: panels.total.conversionRate,
      totalRevenue: panels.total.totalRevenue,
      averageTicket: panels.total.averageTicket,
    },
    panels,
    quality: {
      hiddenSessions: panels.total.hiddenSessions,
      sessionsWithoutAgent: sessions.filter((session) => !session.agent?.id)
        .length,
      contactsWithoutTags: items.filter((item) => item.tagNames.length === 0)
        .length,
      sessionsWithoutFirstResponse: sla.sessionsWithoutFirstResponse,
      sessionsWithoutWaitMeasurement: sla.sessionsWithoutWaitMeasurement,
      sessionsLongDurationOutliers: sessions.filter(
        (session) => (session.durationSeconds ?? 0) > 240 * 3600,
      ).length,
    },
    items,
    byTag,
    byLeadSource,
    byCampaign,
    byAgent,
    byDepartment,
    byDay,
    byWeek,
    peakHours,
    reasonByAgent,
    reasonByTag,
    reasonByCampaign,
    sla,
    recurrence,
    topGainReasons: reasons.topGainReasons,
    topLostReasons: reasons.topLostReasons,
    topInfoReasons: reasons.topInfoReasons,
    topOtherReasons: reasons.topOtherReasons,
  };
}

function sessionClassificationMetric(session: Session) {
  if (!session.classification) return null;

  return {
    category: session.classification.category,
    categoryName: session.classification.categoryName,
    description:
      session.classification.description ?? session.classification.name,
    amount: Number(session.classification.amount ?? 0),
    count: 1,
  } satisfies DashboardClassificationMetric;
}

export function filterSessionsByVisualFilters(
  sessions: Session[],
  items: DashboardContactItem[],
  filters: DashboardVisualFilters,
) {
  const allowedContacts = new Set(
    items
      .filter((item) => {
        if (filters.adsOnly && item.leadSource !== "Anúncio") {
          return false;
        }

        if (filters.newContactsOnly && !item.isNew) {
          return false;
        }

        return true;
      })
      .map((item) => item.contactId),
  );

  return sessions.filter((session) => {
    const contactId = session.contact?.id;
    if (!contactId || !allowedContacts.has(contactId)) return false;

    if (
      filters.channelId !== "all" &&
      (session.channel?.id ?? "all") !== filters.channelId
    ) {
      return false;
    }

    if (filters.outcome === "all") return true;

    const classification = sessionClassificationMetric(session);
    const isWon = classification ? isGainClassification(classification) : false;
    const isLost = classification ? isLostClassification(classification) : false;
    const isUnclassified = !classification || (!isWon && !isLost);

    if (filters.outcome === "won") return isWon;
    if (filters.outcome === "lost") return isLost;
    return isUnclassified;
  });
}
