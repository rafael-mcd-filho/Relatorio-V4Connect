import "server-only";

import type {
  Agent,
  Channel,
  ChannelType,
  Classification,
  Contact,
  Department,
  FetchSessionsResult,
  Session,
  SessionStatus,
  SessionsDebugPayload,
  UTM,
} from "./types";
import { generateMockSessions } from "./mock-data";

const API_BASE =
  process.env.ANALYTICS_API_BASE ??
  process.env.HELENA_API_BASE ??
  process.env.NEXT_PUBLIC_ANALYTICS_API_BASE ??
  process.env.NEXT_PUBLIC_HELENA_API_BASE ??
  "https://api.helena.run";
const SESSION_PAGE_SIZE = 100;
const SESSION_PAGE_CONCURRENCY = 4;
const CONTACT_FETCH_CONCURRENCY = 8;

const CONTACT_CACHE = new Map<string, HelenaContact | null>();

export interface FetchSessionsParams {
  from: Date;
  to: Date;
  token?: string;
  signal?: AbortSignal;
}

interface HelenaSessionPage {
  items: HelenaSessionRecord[];
  totalItems?: number;
  totalPages?: number;
  hasMorePages?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

interface HelenaSessionRecord {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  startAt?: string;
  endAt?: string | null;
  status?: string;
  contactId?: string;
  channelId?: string;
  departmentId?: string;
  userId?: string | null;
  previewUrl?: string | null;
  origin?: string | null;
  channelType?: string | null;
  timeService?: string | null;
  timeWait?: string | null;
  firstResponseAt?: string | null;
  unreadCount?: number | null;
  lastInteractionDate?: string | null;
  utm?: HelenaUtm | null;
  contactDetails?: HelenaSessionContactDetails | null;
  agentDetails?: HelenaAgentDetails | null;
  channelDetails?: HelenaChannelDetails | null;
  departmentDetails?: HelenaDepartmentDetails | null;
  classification?: HelenaClassification | null;
}

interface HelenaSessionContactDetails {
  id?: string;
  name?: string | null;
  phonenumber?: string | null;
  phonenumberFormatted?: string | null;
  status?: string | null;
  tagsId?: unknown;
  tagsName?: unknown;
}

interface HelenaAgentDetails {
  id?: string;
  userId?: string | null;
  name?: string | null;
  shortName?: string | null;
}

interface HelenaChannelDetails {
  humanId?: string | null;
  platform?: string | null;
  displayName?: string | null;
}

interface HelenaDepartmentDetails {
  id?: string;
  name?: string | null;
}

interface HelenaClassification {
  id?: string;
  category?: string | null;
  categoryDescription?: string | null;
  categoryName?: string | null;
  amount?: number | null;
}

interface HelenaContact {
  id?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  name?: string | null;
  phoneNumber?: string | null;
  phoneNumberFormatted?: string | null;
  status?: string | null;
  origin?: string | null;
  tagIds?: unknown;
  tagNames?: unknown;
  utm?: HelenaUtm | null;
}

interface HelenaUtm {
  sourceId?: string | null;
  source?: string | null;
  clid?: string | null;
  medium?: string | null;
  campaign?: string | null;
  content?: string | null;
  headline?: string | null;
  term?: string | null;
  referralUrl?: string | null;
}

interface SessionRecordsResult {
  records: HelenaSessionRecord[];
  firstPageRaw: unknown;
  totalItemsReported: number;
  totalPagesReported: number;
  pageSize: number;
  pagesFetched: number;
}

interface ContactsMapResult {
  contactsById: Map<string, HelenaContact | null>;
  uniqueContactIds: string[];
  contactsFetched: number;
  sampleContacts: unknown[];
}

const CLASSIFICATION_LABELS: Record<string, string> = {
  WON: "Ganho",
  LOST: "Perdido",
  INFO: "Duvida",
  OTHER: "Outros",
};

function toApiTimestamp(date: Date) {
  return date.toISOString();
}

function isTimestampWithinRange(
  value: string | undefined,
  from: Date,
  to: Date,
) {
  if (!value) return false;

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return false;

  return timestamp >= from.getTime() && timestamp <= to.getTime();
}

function isAbortError(error: unknown) {
  return (
    error instanceof DOMException && error.name === "AbortError"
  );
}

function toStringOrUndefined(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function toNumberOrZero(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function toArrayOfStrings(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => toStringOrUndefined(item))
      .filter((item): item is string => !!item);
  }

  const singleValue = toStringOrUndefined(value);
  return singleValue ? [singleValue] : [];
}

function parseDurationToSeconds(value: string | null | undefined) {
  const normalized = toStringOrUndefined(value);
  if (!normalized) return null;

  const match = normalized.match(/^(\d+):(\d{2}):(\d{2})$/);
  if (!match) return null;

  const [, hours, minutes, seconds] = match;
  return (
    Number(hours) * 3600 +
    Number(minutes) * 60 +
    Number(seconds)
  );
}

function normalizeStatus(value: unknown): SessionStatus {
  switch (toStringOrUndefined(value)?.toUpperCase()) {
    case "ACTIVE":
    case "STARTED":
    case "IN_PROGRESS":
      return "Active";
    case "WAITING":
    case "PENDING":
      return "Waiting";
    case "COMPLETED":
      return "Finished";
    case "ABANDONED":
      return "Abandoned";
    case "TRANSFERRED":
      return "Transferred";
    case "HIDDEN":
      return "Hidden";
    case "UNDEFINED":
    default:
      return "Other";
  }
}

function normalizeChannelType(value: unknown): ChannelType {
  const raw = toStringOrUndefined(value)?.toUpperCase();

  if (!raw) return "WhatsApp";
  if (raw.includes("WHATSAPP")) return "WhatsApp";
  if (raw.includes("WEBCHAT") || raw === "WEB") return "Webchat";
  if (raw.includes("INSTAGRAM")) return "Instagram";
  if (raw.includes("MESSENGER")) return "Messenger";
  if (raw.includes("EMAIL")) return "Email";
  if (raw.includes("TELEGRAM")) return "Telegram";

  return "WhatsApp";
}

function normalizeUtm(utm: HelenaUtm | null | undefined): UTM | null {
  if (!utm) return null;

  return {
    sourceId: utm.sourceId ?? null,
    source: utm.source ?? null,
    clid: utm.clid ?? null,
    medium: utm.medium ?? null,
    campaign: utm.campaign ?? null,
    content: utm.content ?? null,
    headline: utm.headline ?? null,
    term: utm.term ?? null,
    referralUrl: utm.referralUrl ?? null,
  };
}

function normalizeClassification(
  classification: HelenaClassification | null | undefined,
): Classification | undefined {
  if (!classification) return undefined;

  const category =
    toStringOrUndefined(classification.category)?.toUpperCase();
  if (!category || category === "UNDEFINED") {
    return undefined;
  }

  const name =
    toStringOrUndefined(classification.categoryDescription) ??
    toStringOrUndefined(classification.categoryName) ??
    CLASSIFICATION_LABELS[category] ??
    category;

  if (!name) return undefined;

  return {
    id: toStringOrUndefined(classification.id) ?? crypto.randomUUID(),
    name,
    category,
    categoryName:
      toStringOrUndefined(classification.categoryName) ??
      CLASSIFICATION_LABELS[category],
    description: toStringOrUndefined(classification.categoryDescription),
    amount: Number.isFinite(Number(classification.amount))
      ? Number(classification.amount)
      : 0,
  };
}

function normalizeAgent(
  agent: HelenaAgentDetails | null | undefined,
): Agent | undefined {
  if (!agent) return undefined;

  const name =
    toStringOrUndefined(agent.shortName) ??
    toStringOrUndefined(agent.name);
  const id =
    toStringOrUndefined(agent.id) ??
    toStringOrUndefined(agent.userId);

  if (!name || !id) return undefined;

  return { id, name };
}

function normalizeDepartment(
  department: HelenaDepartmentDetails | null | undefined,
  fallbackId?: string,
): Department | undefined {
  const name = toStringOrUndefined(department?.name);
  const id =
    toStringOrUndefined(department?.id) ??
    toStringOrUndefined(fallbackId);

  if (!name || !id) return undefined;

  return { id, name };
}

function normalizeChannel(
  channelDetails: HelenaChannelDetails | null | undefined,
  fallbackChannelId?: string,
  fallbackChannelType?: string | null,
): Channel | undefined {
  const type = normalizeChannelType(
    channelDetails?.platform ?? fallbackChannelType,
  );
  const id =
    toStringOrUndefined(fallbackChannelId) ??
    toStringOrUndefined(channelDetails?.humanId) ??
    type;

  return {
    id,
    name:
      toStringOrUndefined(channelDetails?.displayName) ??
      toStringOrUndefined(channelDetails?.platform) ??
      type,
    humanId: toStringOrUndefined(channelDetails?.humanId),
    type,
  };
}

function normalizeContact(
  fallbackId: string | undefined,
  sessionContact: HelenaSessionContactDetails | null | undefined,
  fullContact: HelenaContact | null | undefined,
  fallbackUtm: HelenaUtm | null | undefined,
): Contact | undefined {
  const id =
    toStringOrUndefined(fullContact?.id) ??
    toStringOrUndefined(sessionContact?.id) ??
    toStringOrUndefined(fallbackId);

  if (!id) return undefined;

  return {
    id,
    name:
      toStringOrUndefined(fullContact?.name) ??
      toStringOrUndefined(sessionContact?.name) ??
      "Sem contato",
    identifier:
      toStringOrUndefined(fullContact?.phoneNumberFormatted) ??
      toStringOrUndefined(sessionContact?.phonenumberFormatted) ??
      toStringOrUndefined(fullContact?.phoneNumber) ??
      toStringOrUndefined(sessionContact?.phonenumber),
    createdAt: toStringOrUndefined(fullContact?.createdAt),
    updatedAt: toStringOrUndefined(fullContact?.updatedAt),
    status:
      toStringOrUndefined(fullContact?.status) ??
      toStringOrUndefined(sessionContact?.status),
    origin: toStringOrUndefined(fullContact?.origin),
    tagIds: toArrayOfStrings(fullContact?.tagIds ?? sessionContact?.tagsId),
    tagNames: toArrayOfStrings(fullContact?.tagNames ?? sessionContact?.tagsName),
    utm: normalizeUtm(fullContact?.utm ?? fallbackUtm),
  };
}

function normalizeSessionRecord(
  record: HelenaSessionRecord,
  fullContact: HelenaContact | null | undefined,
): Session {
  const rawStatus = toStringOrUndefined(record.status);
  const createdAt =
    toStringOrUndefined(record.createdAt) ??
    toStringOrUndefined(record.startAt) ??
    new Date().toISOString();
  const contact = normalizeContact(
    record.contactId,
    record.contactDetails,
    fullContact,
    record.utm,
  );

  return {
    id: toStringOrUndefined(record.id) ?? crypto.randomUUID(),
    status: normalizeStatus(rawStatus),
    rawStatus,
    createdAt,
    updatedAt: toStringOrUndefined(record.updatedAt),
    startedAt: toStringOrUndefined(record.startAt) ?? createdAt,
    closedAt: toStringOrUndefined(record.endAt) ?? undefined,
    durationSeconds: parseDurationToSeconds(record.timeService),
    firstResponseSeconds: parseDurationToSeconds(record.timeWait),
    firstResponseAt: toStringOrUndefined(record.firstResponseAt),
    agent: normalizeAgent(record.agentDetails),
    department: normalizeDepartment(record.departmentDetails, record.departmentId),
    channel: normalizeChannel(
      record.channelDetails,
      record.channelId,
      record.channelType,
    ),
    channelType: normalizeChannelType(
      record.channelDetails?.platform ?? record.channelType,
    ),
    classification: normalizeClassification(record.classification),
    contact,
    utm: normalizeUtm(record.utm),
    messageCount: 0,
    unreadCount: toNumberOrZero(record.unreadCount),
    previewUrl: toStringOrUndefined(record.previewUrl),
    origin: toStringOrUndefined(record.origin),
    lastInteractionAt: toStringOrUndefined(record.lastInteractionDate),
  };
}

function normalizeSessionPage(raw: unknown): HelenaSessionPage {
  if (Array.isArray(raw)) {
    if (raw.length === 0) return { items: [], totalPages: 1, pageNumber: 1 };

    const first = raw[0] as HelenaSessionPage;
    if (first && Array.isArray(first.items)) {
      return {
        items: first.items,
        totalItems: Number(first.totalItems ?? first.items.length),
        totalPages: Number(first.totalPages ?? 1),
        hasMorePages: Boolean(first.hasMorePages),
        pageNumber: Number(first.pageNumber ?? 1),
        pageSize: Number(first.pageSize ?? first.items.length),
      };
    }

    return {
      items: raw as HelenaSessionRecord[],
      totalItems: raw.length,
      totalPages: 1,
      hasMorePages: false,
      pageNumber: 1,
      pageSize: raw.length,
    };
  }

  const page = raw as HelenaSessionPage;
  if (page && Array.isArray(page.items)) {
    return {
      items: page.items,
      totalItems: Number(page.totalItems ?? page.items.length),
      totalPages: Number(page.totalPages ?? 1),
      hasMorePages: Boolean(page.hasMorePages),
      pageNumber: Number(page.pageNumber ?? 1),
      pageSize: Number(page.pageSize ?? page.items.length),
    };
  }

  return { items: [], totalItems: 0, totalPages: 1, pageNumber: 1 };
}

function buildSessionsUrl(
  from: Date,
  to: Date,
  pageNumber: number,
) {
  const url = new URL(`${API_BASE}/chat/v2/session`);

  [
    "Undefined",
    "AgentDetails",
    "DepartmentsDetails",
    "ContactDetails",
    "ChannelTypeDetails",
    "ClassificationDetails",
    "ChannelDetails",
  ].forEach((detail) =>
    url.searchParams.append("IncludeDetails", detail),
  );

  url.searchParams.set("CreatedAt.After", toApiTimestamp(from));
  url.searchParams.set("CreatedAt.Before", toApiTimestamp(to));
  url.searchParams.set("PageSize", String(SESSION_PAGE_SIZE));
  url.searchParams.set("PageNumber", String(pageNumber));

  return url;
}

async function fetchHelenaJson<T>(
  url: URL,
  authToken: string,
  signal?: AbortSignal,
): Promise<T> {
  const res = await fetch(url.toString(), {
    headers: {
      Authorization: authToken,
      accept: "application/json",
    },
    cache: "no-store",
    signal,
  });

  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;

    try {
      const body = await res.json();
      const message =
        toStringOrUndefined(body?.text) ??
        toStringOrUndefined(body?.message);

      if (message) {
        detail = `${detail} - ${message}`;
      }
    } catch {
      // Ignore invalid JSON bodies from upstream.
    }

    throw new Error(`Erro ao consultar dados: ${detail}`);
  }

  return res.json() as Promise<T>;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>,
) {
  const results = new Array<R>(items.length);
  let cursor = 0;

  async function runWorker() {
    while (cursor < items.length) {
      const currentIndex = cursor;
      cursor += 1;
      results[currentIndex] = await worker(items[currentIndex]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () =>
      runWorker(),
    ),
  );

  return results;
}

async function fetchAllSessionRecords(
  from: Date,
  to: Date,
  authToken: string,
  signal?: AbortSignal,
) : Promise<SessionRecordsResult> {
  const firstPageRaw = await fetchHelenaJson<HelenaSessionPage>(
    buildSessionsUrl(from, to, 1),
    authToken,
    signal,
  );
  const firstPage = normalizeSessionPage(firstPageRaw);

  const totalPages = Math.max(firstPage.totalPages ?? 1, 1);
  if (totalPages === 1) {
    return {
      records: firstPage.items,
      firstPageRaw,
      totalItemsReported: firstPage.totalItems ?? firstPage.items.length,
      totalPagesReported: totalPages,
      pageSize: firstPage.pageSize ?? firstPage.items.length,
      pagesFetched: 1,
    };
  }

  const remainingPageNumbers = Array.from(
    { length: totalPages - 1 },
    (_, index) => index + 2,
  );

  const remainingPages = await mapWithConcurrency(
    remainingPageNumbers,
    SESSION_PAGE_CONCURRENCY,
    async (pageNumber) =>
      normalizeSessionPage(
        await fetchHelenaJson<HelenaSessionPage>(
          buildSessionsUrl(from, to, pageNumber),
          authToken,
          signal,
        ),
      ),
  );

  const records = [firstPage, ...remainingPages]
    .sort((a, b) => (a.pageNumber ?? 1) - (b.pageNumber ?? 1))
    .flatMap((page) => page.items);

  return {
    records,
    firstPageRaw,
    totalItemsReported: firstPage.totalItems ?? records.length,
    totalPagesReported: totalPages,
    pageSize: firstPage.pageSize ?? SESSION_PAGE_SIZE,
    pagesFetched: totalPages,
  };
}

async function fetchContactById(
  id: string,
  authToken: string,
  signal?: AbortSignal,
) {
  const cached = CONTACT_CACHE.get(id);
  if (cached !== undefined) return cached;

  try {
    const contact = await fetchHelenaJson<HelenaContact>(
      new URL(`${API_BASE}/core/v1/contact/${id}`),
      authToken,
      signal,
    );
    CONTACT_CACHE.set(id, contact);
    return contact;
  } catch (error) {
    if (isAbortError(error)) throw error;
    CONTACT_CACHE.set(id, null);
    return null;
  }
}

async function fetchContactsMap(
  records: HelenaSessionRecord[],
  authToken: string,
  signal?: AbortSignal,
) : Promise<ContactsMapResult> {
  const contactIds = Array.from(
    new Set(
      records
        .map(
          (record) =>
            toStringOrUndefined(record.contactId) ??
            toStringOrUndefined(record.contactDetails?.id),
        )
        .filter((id): id is string => !!id),
    ),
  );

  if (contactIds.length === 0) {
    return {
      contactsById: new Map<string, HelenaContact | null>(),
      uniqueContactIds: [],
      contactsFetched: 0,
      sampleContacts: [],
    };
  }

  await mapWithConcurrency(
    contactIds,
    CONTACT_FETCH_CONCURRENCY,
    async (contactId) =>
      fetchContactById(contactId, authToken, signal),
  );

  const contactsById = new Map(
    contactIds.map((contactId) => [
      contactId,
      CONTACT_CACHE.get(contactId) ?? null,
    ]),
  );

  return {
    contactsById,
    uniqueContactIds: contactIds,
    contactsFetched: contactIds.length,
    sampleContacts: contactIds.slice(0, 3).map((contactId) => ({
      id: contactId,
      payload: contactsById.get(contactId),
    })),
  };
}

/**
 * Fetch sessions from the external API. Falls back to mock data when
 * no token is configured (local development / preview mode).
 */
export async function fetchSessions({
  from,
  to,
  token,
  signal,
}: FetchSessionsParams): Promise<FetchSessionsResult> {
  const authToken =
    token ??
    process.env.ANALYTICS_API_TOKEN ??
    process.env.HELENA_TOKEN ??
    process.env.NEXT_PUBLIC_ANALYTICS_API_TOKEN ??
    process.env.NEXT_PUBLIC_HELENA_TOKEN;
  const requestedRange = {
    from: toApiTimestamp(from),
    to: toApiTimestamp(to),
  };

  if (!authToken) {
    await new Promise((r) => setTimeout(r, 600));
    const sessions = generateMockSessions(from, to, 520);
    return {
      sessions,
      debug: {
        source: "mock",
        requestedRange,
        normalizedSessions: sessions.length,
      },
    };
  }

  const recordsResult = await fetchAllSessionRecords(
    from,
    to,
    authToken,
    signal,
  );
  const contactsResult = await fetchContactsMap(
    recordsResult.records,
    authToken,
    signal,
  );

  const normalizedSessions = recordsResult.records.map((record) =>
    normalizeSessionRecord(
      record,
      contactsResult.contactsById.get(
        toStringOrUndefined(record.contactId) ??
          toStringOrUndefined(record.contactDetails?.id) ??
          "",
      ) ?? null,
    ),
  );
  const sessions = normalizedSessions.filter((session) =>
    isTimestampWithinRange(session.createdAt, from, to),
  );

  const debug: SessionsDebugPayload = {
    source: "api",
    requestedRange,
    totalItemsReported: recordsResult.totalItemsReported,
    totalPagesReported: recordsResult.totalPagesReported,
    pagesFetched: recordsResult.pagesFetched,
    pageSize: recordsResult.pageSize,
    normalizedSessions: sessions.length,
    uniqueContacts: contactsResult.uniqueContactIds.length,
    contactsFetched: contactsResult.contactsFetched,
    firstPageRaw: recordsResult.firstPageRaw,
    sampleContacts: contactsResult.sampleContacts,
  };

  return { sessions, debug };
}
