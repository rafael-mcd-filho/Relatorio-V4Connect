"use client";

import type { ReactNode } from "react";
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  DollarSign,
  MessageSquare,
  MinusCircle,
  Target,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { groupByDay } from "@/lib/analytics";
import type { DashboardAnalytics } from "@/lib/dashboard-analytics";
import type { Session } from "@/lib/types";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  toLocalDateKey,
} from "@/lib/utils";
import { KpiCard } from "@/components/kpi-card";

interface KpiGridProps {
  sessions: Session[];
  analytics: DashboardAnalytics;
}

export function KpiGrid({ sessions, analytics }: KpiGridProps) {
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

  return (
    <div className="space-y-5">
      <KpiSection
        title="Volume"
        description="Tamanho da base e movimentação geral no período."
        columnsClassName="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <KpiCard
          label="Total de atendimentos"
          explanation="Conta todos os atendimentos do período e dos filtros escolhidos, mesmo quando o mesmo contato apareceu mais de uma vez."
          value={formatNumber(kpis.totalSessions)}
          hint={`${formatNumber(kpis.hiddenSessions)} ocultos`}
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
    <section className="space-y-3">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {title}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">{description}</div>
      </div>
      <div className={columnsClassName}>{children}</div>
    </section>
  );
}
