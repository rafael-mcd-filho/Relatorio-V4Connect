"use client";

import * as React from "react";
import {
  ExternalLink,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import type {
  DashboardAnalytics,
  DashboardClassificationMetric,
} from "@/lib/dashboard-analytics";
import type { Session } from "@/lib/types";
import {
  cn,
  formatCurrency,
  formatDate,
  formatNumber,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type OutcomeTab = "won" | "lost";

interface ContactOutcomeRow {
  contactId: string;
  contactName: string;
  outcome: OutcomeTab;
  reason: string;
  revenue: number;
  totalSessions: number;
  leadSource: string;
  leadSourceDetail?: string | null;
  isNew: boolean;
  previewUrl?: string;
  previewSessionId?: string;
  previewAgentName?: string;
  previewSessionAt?: string;
  previewAvailable: boolean;
}

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function getClassificationDescription(
  classification: DashboardClassificationMetric | Session["classification"],
) {
  if (!classification) return undefined;

  if ("name" in classification) {
    return classification.description ?? classification.name;
  }

  return classification.description;
}

function isGainClassification(
  classification: DashboardClassificationMetric | Session["classification"],
) {
  const category = normalizeText(classification?.category);
  const categoryName = normalizeText(classification?.categoryName);
  const description = normalizeText(getClassificationDescription(classification));

  return (
    category === "won" ||
    categoryName.includes("ganho") ||
    description.includes("ganho")
  );
}

function isLostClassification(
  classification: DashboardClassificationMetric | Session["classification"],
) {
  const category = normalizeText(classification?.category);
  const categoryName = normalizeText(classification?.categoryName);
  const description = normalizeText(getClassificationDescription(classification));

  return (
    category === "lost" ||
    categoryName.includes("perd") ||
    description.includes("perd")
  );
}

function classificationReason(
  classification: DashboardClassificationMetric | undefined,
) {
  return (
    classification?.description ??
    classification?.categoryName ??
    classification?.category ??
    "Sem motivo"
  );
}

function getSessionSortTimestamp(session: Session) {
  const values = [
    session.closedAt,
    session.updatedAt,
    session.startedAt,
    session.createdAt,
  ];

  for (const value of values) {
    const timestamp = value ? new Date(value).getTime() : Number.NaN;
    if (Number.isFinite(timestamp)) {
      return timestamp;
    }
  }

  return 0;
}

function formatPreviewDate(value: string | undefined) {
  if (!value) return "Data não informada";

  return formatDate(value, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildOutcomeRows(
  analytics: DashboardAnalytics,
  sessions: Session[],
) {
  const sessionsByContact = new Map<string, Session[]>();

  for (const session of sessions) {
    const contactId = session.contact?.id;
    if (!contactId) continue;

    if (!sessionsByContact.has(contactId)) {
      sessionsByContact.set(contactId, []);
    }

    sessionsByContact.get(contactId)!.push(session);
  }

  for (const contactSessions of sessionsByContact.values()) {
    contactSessions.sort(
      (left, right) => getSessionSortTimestamp(right) - getSessionSortTimestamp(left),
    );
  }

  const rows = analytics.items
    .filter((item) => item.outcome === "won" || item.outcome === "lost")
    .map<ContactOutcomeRow>((item) => {
      const outcome: OutcomeTab = item.outcome === "won" ? "won" : "lost";
      const contactSessions = sessionsByContact.get(item.contactId) ?? [];
      const relevantSessions = contactSessions.filter((session) => {
        if (!session.classification) return false;

        return outcome === "won"
          ? isGainClassification(session.classification)
          : isLostClassification(session.classification);
      });
      const previewSession =
        relevantSessions.find((session) => !!session.previewUrl) ??
        contactSessions.find((session) => !!session.previewUrl) ??
        relevantSessions[0] ??
        contactSessions[0];
      const relevantClassifications = item.classifications.filter((classification) =>
        outcome === "won"
          ? isGainClassification(classification)
          : isLostClassification(classification),
      );
      const mainClassification = relevantClassifications.sort((left, right) => {
        if (right.count !== left.count) return right.count - left.count;
        return right.amount - left.amount;
      })[0];

        return {
          contactId: item.contactId,
          contactName: item.contactName,
          outcome,
          reason: classificationReason(mainClassification),
          revenue: item.revenue,
        totalSessions: item.totalSessions,
        leadSource: item.leadSource,
        leadSourceDetail: item.leadSourceDetail,
        isNew: item.isNew,
        previewUrl: previewSession?.previewUrl,
        previewSessionId: previewSession?.id,
        previewAgentName: previewSession?.agent?.name,
        previewSessionAt:
          previewSession?.closedAt ??
          previewSession?.updatedAt ??
          previewSession?.createdAt,
        previewAvailable: !!previewSession?.previewUrl,
      };
    });

  return {
    won: rows
      .filter((row) => row.outcome === "won")
      .sort((left, right) => {
        if (right.revenue !== left.revenue) return right.revenue - left.revenue;

        const rightTime = right.previewSessionAt
          ? new Date(right.previewSessionAt).getTime()
          : 0;
        const leftTime = left.previewSessionAt
          ? new Date(left.previewSessionAt).getTime()
          : 0;

        if (rightTime !== leftTime) return rightTime - leftTime;

        return right.totalSessions - left.totalSessions;
      }),
    lost: rows
      .filter((row) => row.outcome === "lost")
      .sort((left, right) => {
        const rightTime = right.previewSessionAt
          ? new Date(right.previewSessionAt).getTime()
          : 0;
        const leftTime = left.previewSessionAt
          ? new Date(left.previewSessionAt).getTime()
          : 0;

        if (rightTime !== leftTime) return rightTime - leftTime;
        if (right.totalSessions !== left.totalSessions) {
          return right.totalSessions - left.totalSessions;
        }

        return left.contactName.localeCompare(right.contactName);
      }),
  };
}

function OutcomeRows({
  rows,
  emptyText,
}: {
  rows: ContactOutcomeRow[];
  emptyText: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="max-h-[480px] space-y-2 overflow-auto pr-1">
      {rows.map((row) => {
        const content = (
          <>
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <div className="truncate text-xs font-semibold text-foreground">
                    {row.contactName}
                  </div>
                  {row.isNew ? <Badge variant="accent" className="text-[10px] px-2 py-0.5">Novo</Badge> : null}
                  <Badge
                    variant={row.leadSource === "Anúncio" ? "warning" : "muted"}
                    className="text-[10px] px-2 py-0.5"
                  >
                    {row.leadSource}
                  </Badge>
                  {!row.previewAvailable ? (
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5">Sem preview</Badge>
                  ) : null}
                </div>

                <div className="mt-1 text-[11px] text-muted-foreground/90">
                  <span className="font-medium text-foreground/80">Motivo:</span>{" "}
                  <span className="text-muted-foreground">{row.reason}</span>
                </div>

                <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground/80">
                  <span>{formatNumber(row.totalSessions)} atendimentos</span>
                  {row.previewAgentName ? <span>Agente: {row.previewAgentName}</span> : null}
                  <span>{formatPreviewDate(row.previewSessionAt)}</span>
                </div>

                {row.leadSourceDetail ? (
                  <div className="mt-0.5 truncate text-[10px] text-muted-foreground/80">
                    Origem: {row.leadSourceDetail}
                  </div>
                ) : null}
              </div>

              <div className="shrink-0 text-right">
                <div
                  className={cn(
                    "font-tabular text-xs font-semibold",
                    row.outcome === "won" ? "text-success" : "text-foreground",
                  )}
                >
                  {row.outcome === "won"
                    ? formatCurrency(row.revenue)
                    : formatNumber(row.totalSessions)}
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground/80">
                  {row.outcome === "won"
                    ? "faturamento"
                    : "sessões"}
                </div>
                <div className="mt-1 inline-flex items-center gap-0.5 text-[10px] text-primary">
                  <ExternalLink className="h-3 w-3" />
                  {row.previewAvailable
                    ? "Abrir"
                    : "Indisponível"}
                </div>
              </div>
            </div>
          </>
        );

        if (!row.previewUrl) {
          return (
            <div
              key={row.contactId}
              className="rounded-lg border border-border bg-muted/15 p-2.5 transition-all duration-200 hover:bg-muted/25 hover:shadow-sm"
            >
              {content}
            </div>
          );
        }

        return (
          <a
            key={row.contactId}
            href={row.previewUrl}
            target="_blank"
            rel="noreferrer"
            className="block rounded-lg border border-border bg-muted/15 p-2.5 text-left transition-all duration-200 hover:bg-muted/25 hover:shadow-sm hover:border-border/80"
          >
            {content}
          </a>
        );
      })}
    </div>
  );
}

export function OutcomeContactsCard({
  analytics,
  sessions,
}: {
  analytics: DashboardAnalytics;
  sessions: Session[];
}) {
  const [tab, setTab] = React.useState<OutcomeTab>("won");
  const rows = React.useMemo(
    () => buildOutcomeRows(analytics, sessions),
    [analytics, sessions],
  );

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>Contatos ganhos e perdidos</CardTitle>
            <CardDescription>
              Lista consolidada por contato. Ao clicar em uma linha, o dashboard
              abre em nova aba a sessão mais representativa daquele resultado.
            </CardDescription>
          </div>

          <Tabs value={tab} onValueChange={(value) => setTab(value as OutcomeTab)}>
            <TabsList>
              <TabsTrigger value="won">
                <TrendingUp className="h-3.5 w-3.5" />
                Ganhos ({formatNumber(rows.won.length)})
              </TabsTrigger>
              <TabsTrigger value="lost">
                <TriangleAlert className="h-3.5 w-3.5" />
                Perdidos ({formatNumber(rows.lost.length)})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          <Tabs value={tab} onValueChange={(value) => setTab(value as OutcomeTab)}>
            <TabsContent value="won">
              <OutcomeRows
                rows={rows.won}
                emptyText="Nenhum contato ganho apareceu com os filtros atuais."
              />
            </TabsContent>
            <TabsContent value="lost">
              <OutcomeRows
                rows={rows.lost}
                emptyText="Nenhum contato perdido apareceu com os filtros atuais."
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}
