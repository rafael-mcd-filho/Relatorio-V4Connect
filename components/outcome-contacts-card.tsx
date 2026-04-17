"use client";

import * as React from "react";
import {
  ExternalLink,
  Eye,
  TrendingUp,
  TriangleAlert,
  X,
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
import { Button } from "@/components/ui/button";
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
  onSelect,
}: {
  rows: ContactOutcomeRow[];
  emptyText: string;
  onSelect: (row: ContactOutcomeRow) => void;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="max-h-[560px] space-y-3 overflow-auto pr-1">
      {rows.map((row) => {
        const content = (
          <>
            <div className="flex min-w-0 items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="truncate text-sm font-semibold text-foreground">
                    {row.contactName}
                  </div>
                  {row.isNew ? <Badge variant="accent">Novo</Badge> : null}
                  <Badge
                    variant={row.leadSource === "Anúncio" ? "warning" : "muted"}
                  >
                    {row.leadSource}
                  </Badge>
                  {!row.previewAvailable ? (
                    <Badge variant="outline">Sem preview</Badge>
                  ) : null}
                </div>

                <div className="mt-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Motivo:</span>{" "}
                  {row.reason}
                </div>

                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{formatNumber(row.totalSessions)} atendimentos</span>
                  {row.previewAgentName ? <span>Agente: {row.previewAgentName}</span> : null}
                  <span>{formatPreviewDate(row.previewSessionAt)}</span>
                </div>

                {row.leadSourceDetail ? (
                  <div className="mt-1 truncate text-xs text-muted-foreground">
                    Origem: {row.leadSourceDetail}
                  </div>
                ) : null}
              </div>

              <div className="shrink-0 text-right">
                <div
                  className={cn(
                    "font-tabular text-sm font-semibold",
                    row.outcome === "won" ? "text-success" : "text-foreground",
                  )}
                >
                  {row.outcome === "won"
                    ? formatCurrency(row.revenue)
                    : formatNumber(row.totalSessions)}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {row.outcome === "won"
                    ? "faturamento do contato"
                    : "sessões no período"}
                </div>
                <div className="mt-2 inline-flex items-center gap-1 text-xs text-primary">
                  <Eye className="h-3.5 w-3.5" />
                  {row.previewAvailable
                    ? "Clique para abrir preview"
                    : "Preview indisponível"}
                </div>
              </div>
            </div>
          </>
        );

        if (!row.previewAvailable) {
          return (
            <div
              key={row.contactId}
              className="rounded-xl border border-border bg-muted/20 p-4"
            >
              {content}
            </div>
          );
        }

        return (
          <button
            key={row.contactId}
            type="button"
            onClick={() => onSelect(row)}
            className="w-full rounded-xl border border-border bg-muted/20 p-4 text-left transition-colors hover:bg-muted/35"
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}

function SessionPreviewModal({
  row,
  onClose,
}: {
  row: ContactOutcomeRow | null;
  onClose: () => void;
}) {
  React.useEffect(() => {
    if (!row) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [row, onClose]);

  if (!row) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Fechar preview"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <div className="relative flex h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <div className="text-base font-semibold text-foreground">
              {row.contactName}
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>{row.outcome === "won" ? "Contato ganho" : "Contato perdido"}</span>
              <span>{row.reason}</span>
              <span>{formatPreviewDate(row.previewSessionAt)}</span>
              {row.previewSessionId ? <span>Sessão {row.previewSessionId}</span> : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {row.previewUrl ? (
              <Button variant="outline" size="sm" asChild>
                <a href={row.previewUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Abrir em nova aba
                </a>
              </Button>
            ) : null}

            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 p-5">
          {row.previewUrl ? (
            <>
              <div className="mb-3 text-xs text-muted-foreground">
                Se o preview não carregar abaixo, use{" "}
                <span className="font-medium text-foreground">
                  Abrir em nova aba
                </span>
                .
              </div>
              <iframe
                title={`Preview da sessão de ${row.contactName}`}
                src={row.previewUrl}
                className="h-full min-h-[520px] w-full rounded-xl border border-border bg-muted"
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
              Essa sessão não trouxe preview na resposta da API.
            </div>
          )}
        </div>
      </div>
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
  const [selectedRow, setSelectedRow] = React.useState<ContactOutcomeRow | null>(
    null,
  );
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
              abre o preview da sessão mais representativa daquele resultado.
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
                onSelect={setSelectedRow}
              />
            </TabsContent>
            <TabsContent value="lost">
              <OutcomeRows
                rows={rows.lost}
                emptyText="Nenhum contato perdido apareceu com os filtros atuais."
                onSelect={setSelectedRow}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <SessionPreviewModal row={selectedRow} onClose={() => setSelectedRow(null)} />
    </>
  );
}
