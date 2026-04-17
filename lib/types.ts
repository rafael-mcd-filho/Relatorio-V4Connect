export type SessionStatus =
  | "Active"
  | "Waiting"
  | "Finished"
  | "Abandoned"
  | "Transferred"
  | "Hidden"
  | "Other";

export interface Agent {
  id: string;
  name: string;
  avatarColor?: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface Channel {
  id: string;
  name: string;
  humanId?: string;
  type: ChannelType;
}

export type ChannelType =
  | "WhatsApp"
  | "Webchat"
  | "Instagram"
  | "Messenger"
  | "Email"
  | "Telegram";

export interface Classification {
  id: string;
  name: string;
  category?: string;
  categoryName?: string;
  description?: string;
  amount?: number;
}

export interface UTM {
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

export interface Contact {
  id: string;
  name: string;
  identifier?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  origin?: string;
  tagIds?: string[];
  tagNames?: string[];
  utm?: UTM | null;
}

export interface Session {
  id: string;
  status: SessionStatus;
  rawStatus?: string;
  createdAt: string;
  updatedAt?: string;
  startedAt?: string;
  closedAt?: string;
  durationSeconds: number | null;
  firstResponseSeconds: number | null;
  firstResponseAt?: string;
  agent?: Agent;
  department?: Department;
  channel?: Channel;
  channelType: ChannelType;
  classification?: Classification;
  contact?: Contact;
  utm?: UTM | null;
  messageCount: number;
  unreadCount?: number;
  previewUrl?: string;
  origin?: string;
  lastInteractionAt?: string;
  rating?: number;
}

export interface SessionsDebugPayload {
  source: "api" | "mock";
  requestedRange: {
    from: string;
    to: string;
  };
  totalItemsReported?: number;
  totalPagesReported?: number;
  pagesFetched?: number;
  pageSize?: number;
  normalizedSessions?: number;
  uniqueContacts?: number;
  contactsFetched?: number;
  firstPageRaw?: unknown;
  sampleContacts?: unknown[];
}

export interface SelectedAuthContext {
  source: "query" | "env" | "mock";
  companyId?: string;
  companyName?: string;
  token?: string;
}

export interface FetchSessionsResult {
  sessions: Session[];
  debug?: SessionsDebugPayload;
  selectedAuth?: SelectedAuthContext;
}

export interface DashboardFilters {
  dateFrom: Date;
  dateTo: Date;
  status?: SessionStatus | "all";
  channelType?: ChannelType | "all";
  departmentId?: string | "all";
}
