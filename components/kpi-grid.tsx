"use client";

import * as React from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  DollarSign,
  ExternalLink,
  MessageSquare,
  MinusCircle,
  Target,
  TrendingUp,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { groupByDay } from "@/lib/analytics";
import type { DashboardAnalytics } from "@/lib/dashboard-analytics";
import type { Session } from "@/lib/types";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
  toLocalDateKey,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/kpi-card";

interface KpiGridProps {
  sessions: Session[];
  analytics: DashboardAnalytics;
}

type DashboardContactItem = DashboardAnalytics["items"][number];

interface UnclassifiedContactRow {
  item: DashboardContactItem;
  sessions: Session[];
  lastSessionAt?: string;
}

export function KpiGrid({ sessions, analytics }: KpiGridProps) {
  const [unclassifiedOpen, setUnclassifiedOpen] = React.useState(false);
  const daily = groupByDay(sessions);
  const sparkTotal = daily.map((bucket) => bucket.total);
  const sparkFinished = daily.map((bucket) => bucket.finished);
  const sparkOther = daily.map((bucket) => bucket.other);
  const sparkRevenue = analytics.byDay.map((bucket) => bucket.revenue);
  const sparkNewContacts = analytics.byDay.map((bucket) => bucket.newContacts);
  const sparkConversion = analytics.byDay.map((bucket) => {
    const classified = bucket.wonSessions + bucket.lostSessions;
    return classified > 0 ? (bucket.wonSessions / classified) * 100 : 0;
  });
  const uniqueContactsByDay = new Map<string, Set<string>>();

  for (const session of sessions) {
    const dayKey = toLocalDateKey(session.createdAt);
    if (!dayKey) continue;

    const contactId = session.contact?.id;
    if (!contactId) continue;

    if (!uniqueContactsByDay.has(dayKey)) {
      uniqueContactsByDay.set(dayKey, new Set<string>());
    }

    uniqueContactsByDay.get(dayKey)!.add(contactId);
  }

  const sparkContacts = daily.map(
    (bucket) => uniqueContactsByDay.get(bucket.date)?.size ?? 0,
  );
  const sparkUnclassified = analytics.byDay.map((bucket) =>
    Math.max(
      bucket.totalSessions - bucket.wonSessions - bucket.lostSessions,
      0,
    ),
  );
  const kpis = analytics.kpis;
  const uniqueContactsBase = kpis.uniqueContacts || 1;
  const lostPercent = (kpis.contactsLost / uniqueContactsBase) * 100;
  const unclassifiedPercent =
    (kpis.contactsUnclassified / uniqueContactsBase) * 100;
  const classifiedContacts = kpis.contactsWon + kpis.contactsLost;
  const contactsWonWithValue = Math.max(
    kpis.contactsWon - kpis.contactsWonWithoutValue,
    0,
  );
  const averageRevenuePerWin =
    kpis.contactsWon > 0 ? kpis.totalRevenue / kpis.contactsWon : 0;
  const valueAtRisk = kpis.contactsUnclassified * kpis.averageTicket;
  const unclassifiedContacts = React.useMemo(
    () => buildUnclassifiedContactRows(analytics.items, sessions),
    [analytics.items, sessions],
  );

  return (
    <div className="space-y-8">
      <UnclassifiedSessionsModal
        open={unclassifiedOpen}
        onClose={() => setUnclassifiedOpen(false)}
        contacts={unclassifiedContacts}
        contactCount={kpis.contactsUnclassified}
      />

      <KpiSection
        title="Volume"
        description="Tamanho da base e movimentação geral no período."
        columnsClassName="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
      >
        <KpiCard
          label="Total de atendimentos"
          explanation="Conta todos os atendimentos do período e dos filtros escolhidos, mesmo quando o mesmo contato apareceu mais de uma vez."
          value={formatNumber(kpis.totalSessions)}
          icon={<MessageSquare className="h-4 w-4" />}
          accent="primary"
          sparkline={sparkTotal}
        />
        <KpiCard
          label="Total de contatos"
          explanation="Conta quantas pessoas diferentes falaram com a equipe no período. Se a mesma pessoa teve mais de um atendimento, ela entra uma vez só."
          value={formatNumber(kpis.uniqueContacts)}
          hint={`${formatNumber(kpis.existingContacts)} antigos`}
          icon={<Users className="h-4 w-4" />}
          accent="chart-5"
          sparkline={sparkContacts}
        />
        <KpiCard
          label="Contatos novos"
          explanation="Conta quantos contatos tiveram o cadastro criado dentro do período escolhido."
          value={formatNumber(kpis.newContacts)}
          hint={`${formatPercent(kpis.percentNewContacts)} da base única`}
          icon={<UserPlus className="h-4 w-4" />}
          accent="warning"
          sparkline={sparkNewContacts}
        />
      </KpiSection>

      <KpiSection
        title="Resultado"
        description="Leitura dos resultados finais e da conversão da operação."
      >
        <KpiCard
          label="Ganhos"
          explanation="Conta quantos contatos tiveram pelo menos um resultado marcado como ganho no período."
          value={formatNumber(kpis.contactsWon)}
          hint={`${formatNumber(kpis.contactsWonWithoutValue)} ganhos sem faturamento`}
          icon={<CheckCircle2 className="h-4 w-4" />}
          accent="success"
          sparkline={sparkFinished}
        />
        <KpiCard
          label="Perdidos"
          explanation="Conta quantos contatos tiveram pelo menos um resultado marcado como perdido no período."
          value={formatNumber(kpis.contactsLost)}
          hint={`${formatPercent(lostPercent)} da base única`}
          icon={<AlertCircle className="h-4 w-4" />}
          accent="warning"
          sparkline={sparkOther}
        />
        <KpiCard
          label="Sem classificação"
          explanation="Conta quantos contatos passaram pelo período sem nenhum resultado final marcado como ganho ou perdido."
          value={formatNumber(kpis.contactsUnclassified)}
          hint={`${formatPercent(unclassifiedPercent)} da base única`}
          icon={<MinusCircle className="h-4 w-4" />}
          accent="chart-5"
          sparkline={sparkUnclassified}
          onClick={() => setUnclassifiedOpen(true)}
          actionLabel="Abrir lista de atendimentos sem classificacao"
          actionText="Ver lista"
        />
        <KpiCard
          label="Taxa de conversão"
          explanation="Mostra a parcela dos contatos que viraram ganho entre os que já tiveram resultado final de ganho ou perda."
          value={formatPercent(kpis.conversionRate)}
          hint={`${formatNumber(classifiedContacts)} contatos classificados`}
          icon={<Target className="h-4 w-4" />}
          accent="chart-4"
          sparkline={sparkConversion}
        />
      </KpiSection>

      <KpiSection
        title="Financeiro"
        description="Receita realizada e potencial financeiro ainda em aberto."
      >
        <KpiCard
          label="Faturamento"
          explanation="Soma o faturamento registrado nos atendimentos marcados como ganho dentro do período."
          value={formatCurrency(kpis.totalRevenue)}
          hint={`${formatNumber(kpis.contactsWon)} ganhos alimentam esse total`}
          icon={<DollarSign className="h-4 w-4" />}
          accent="primary"
          sparkline={sparkRevenue}
        />
        <KpiCard
          label="Ticket médio"
          explanation="Divide o faturamento total pelos ganhos que têm valor lançado. É a referência usada para estimar o valor em risco."
          value={formatCurrency(kpis.averageTicket)}
          hint={`${formatNumber(contactsWonWithValue)} ganhos com valor`}
          icon={<TrendingUp className="h-4 w-4" />}
          accent="chart-4"
        />
        <KpiCard
          label="Faturamento médio por ganho"
          explanation="Divide o faturamento total por todos os contatos ganhos, inclusive os ganhos sem valor lançado."
          value={formatCurrency(averageRevenuePerWin)}
          hint={`${formatNumber(kpis.contactsWon)} ganhos considerados`}
          icon={<BarChart3 className="h-4 w-4" />}
          accent="success"
        />
        <KpiCard
          label="Valor em risco"
          explanation="Estimativa do potencial ainda não convertido, multiplicando os contatos sem classificação pelo ticket médio atual."
          value={formatCurrency(valueAtRisk)}
          hint={`${formatNumber(kpis.contactsUnclassified)} sem classificação x ${formatCurrency(kpis.averageTicket)}`}
          icon={<AlertTriangle className="h-4 w-4" />}
          accent="warning"
        />
      </KpiSection>
    </div>
  );
}

function UnclassifiedSessionsModal({
  open,
  onClose,
  contacts,
  contactCount,
}: {
  open: boolean;
  onClose: () => void;
  contacts: UnclassifiedContactRow[];
  contactCount: number;
}) {
  React.useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open || typeof document === "undefined") return null;

  const sessionCount = contacts.reduce(
    (sum, contact) => sum + contact.sessions.length,
    0,
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="unclassified-sessions-title"
        className="relative z-[101] flex max-h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border/70 p-5">
          <div>
            <div
              id="unclassified-sessions-title"
              className="text-base font-semibold text-foreground"
            >
              Atendimentos sem classificação
            </div>
            <div className="mt-1 max-w-3xl text-sm text-muted-foreground">
              O card conta contatos únicos sem resultado final de ganho ou
              perda. A lista mostra os atendimentos desses contatos ainda sem
              resultado final no período filtrado.
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Fechar"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-3 border-b border-border/70 bg-muted/30 p-4 sm:grid-cols-2">
          <SummaryPill
            label="Contatos sem classificação"
            value={formatNumber(contactCount)}
          />
          <SummaryPill
            label="Atendimentos listados"
            value={formatNumber(sessionCount)}
          />
        </div>

        <div className="overflow-y-auto p-4">
          {contacts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Nenhum atendimento sem classificação nos filtros atuais.
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <UnclassifiedContactBlock
                  key={contact.item.contactId}
                  row={contact}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function SummaryPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-background px-4 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
        {label}
      </div>
      <div className="mt-1 font-display text-2xl font-semibold text-foreground">
        {value}
      </div>
    </div>
  );
}

function UnclassifiedContactBlock({
  row,
}: {
  row: UnclassifiedContactRow;
}) {
  const contact = row.item;
  const identifier =
    row.sessions.find((session) => session.contact?.identifier)?.contact
      ?.identifier ?? "Sem identificador";

  return (
    <div className="rounded-xl border border-border/70 bg-card">
      <div className="flex flex-col gap-3 border-b border-border/60 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-foreground">
            {contact.contactName}
          </div>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>{identifier}</span>
            <span>{formatNumber(row.sessions.length)} atendimentos</span>
            {contact.contactCreatedAtDisplay ? (
              <span>Contato criado em {contact.contactCreatedAtDisplay}</span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
            {contact.leadSource}
          </span>
          {contact.utmCampaign ? (
            <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
              {contact.utmCampaign}
            </span>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-xs">
          <thead className="bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Data</th>
              <th className="px-4 py-3 font-semibold">Atendimento</th>
              <th className="px-4 py-3 font-semibold">Canal</th>
              <th className="px-4 py-3 font-semibold">Departamento</th>
              <th className="px-4 py-3 font-semibold">Agente</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Resultado</th>
              <th className="px-4 py-3 font-semibold">Abrir</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {row.sessions.map((session) => (
              <tr key={session.id} className="align-top">
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {formatDateTime(session.createdAt)}
                </td>
                <td className="max-w-[180px] px-4 py-3">
                  <span className="block truncate font-mono text-[11px] text-foreground">
                    {session.id}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatChannel(session)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {session.department?.name ?? "Sem departamento"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {session.agent?.name ?? "Sem agente"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {STATUS_LABELS[session.status]}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatClassification(session)}
                </td>
                <td className="px-4 py-3">
                  {session.previewUrl ? (
                    <a
                      href={session.previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary transition-colors hover:text-primary/80"
                    >
                      Abrir
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function buildUnclassifiedContactRows(
  items: DashboardContactItem[],
  sessions: Session[],
): UnclassifiedContactRow[] {
  const itemByContactId = new Map(
    items
      .filter((item) => item.outcome === "unclassified")
      .map((item) => [item.contactId, item]),
  );
  const sessionsByContactId = new Map<string, Session[]>();

  for (const session of sessions) {
    const contactId = session.contact?.id;
    if (!contactId || !itemByContactId.has(contactId)) continue;
    if (hasFinalOutcome(session)) continue;

    if (!sessionsByContactId.has(contactId)) {
      sessionsByContactId.set(contactId, []);
    }

    sessionsByContactId.get(contactId)!.push(session);
  }

  return Array.from(itemByContactId.values())
    .map((item) => {
      const contactSessions = (sessionsByContactId.get(item.contactId) ?? [])
        .slice()
        .sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));

      return {
        item,
        sessions: contactSessions,
        lastSessionAt: contactSessions[0]?.createdAt,
      };
    })
    .sort((a, b) => getTime(b.lastSessionAt) - getTime(a.lastSessionAt));
}

function hasFinalOutcome(session: Session) {
  return (
    isGainClassification(session.classification) ||
    isLostClassification(session.classification)
  );
}

function isGainClassification(classification: Session["classification"]) {
  if (!classification) return false;

  const category = normalizeSearchText(classification.category);
  const categoryName = normalizeSearchText(classification.categoryName);
  const description = normalizeSearchText(
    classification.description ?? classification.name,
  );

  return (
    category === "won" ||
    categoryName.includes("ganho") ||
    description.includes("ganho")
  );
}

function isLostClassification(classification: Session["classification"]) {
  if (!classification) return false;

  const category = normalizeSearchText(classification.category);
  const categoryName = normalizeSearchText(classification.categoryName);
  const description = normalizeSearchText(
    classification.description ?? classification.name,
  );

  return (
    category === "lost" ||
    categoryName.includes("perd") ||
    description.includes("perd")
  );
}

function normalizeSearchText(value?: string) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getTime(value?: string) {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function formatDateTime(value?: string) {
  if (!value) return "Sem data";

  const formatted = formatDate(value, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return formatted || "Sem data";
}

function formatChannel(session: Session) {
  if (!session.channel) return session.channelType;

  return session.channel.humanId
    ? `${session.channel.humanId} - ${session.channel.name}`
    : session.channel.name;
}

function formatClassification(session: Session) {
  const classification = session.classification;
  if (!classification) return "Sem classificação";

  return (
    classification.description ??
    classification.categoryName ??
    classification.name ??
    "Sem resultado final"
  );
}

const STATUS_LABELS: Record<Session["status"], string> = {
  Active: "Ativo",
  Waiting: "Aguardando",
  Finished: "Finalizado",
  Abandoned: "Abandonado",
  Transferred: "Transferido",
  Hidden: "Oculto",
  Other: "Outro",
};

function KpiSection({
  title,
  description,
  columnsClassName = "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4",
  children,
}: {
  title: string;
  description: string;
  columnsClassName?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
          {title}
        </div>
        <div className="mt-1.5 text-sm text-muted-foreground/70">{description}</div>
      </div>
      <div className={columnsClassName}>{children}</div>
    </section>
  );
}
