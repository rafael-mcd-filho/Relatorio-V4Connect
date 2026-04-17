"use client";

import * as React from "react";
import type {
  DashboardAnalytics,
  DashboardDimensionMetric,
  DashboardReasonMetric,
} from "@/lib/dashboard-analytics";
import {
  formatCurrency,
  formatDuration,
  formatNumber,
  formatPercent,
} from "@/lib/utils";
import {
  MetricInline,
  MetricLabel,
} from "@/components/metric-tooltip";
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

function EntityRows({
  items,
  lossReasonByKey,
}: {
  items: DashboardDimensionMetric[];
  lossReasonByKey?: Map<string, DashboardReasonMetric | undefined>;
}) {
  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          Sem dados suficientes nesse agrupamento.
        </div>
      ) : (
        items.slice(0, 8).map((item) => {
          const unclassifiedRate =
            item.uniqueContacts > 0
              ? (item.unclassifiedContacts / item.uniqueContacts) * 100
              : 0;
          const topLostReason = lossReasonByKey?.get(item.key);

          return (
            <div
              key={item.key}
              className="rounded-xl border border-border bg-muted/20 p-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground">
                    {item.label}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <MetricInline
                      value={formatNumber(item.totalSessions)}
                      label="atendimentos"
                      explanation="Soma todos os atendimentos que ficaram com esse agente ou departamento no período."
                    />
                    <MetricInline
                      value={formatNumber(item.uniqueContacts)}
                      label="contatos"
                      explanation="Conta quantas pessoas diferentes falaram com esse agente ou departamento no período."
                    />
                    <MetricInline
                      value={formatNumber(item.unclassifiedContacts)}
                      label="sem classificação"
                      explanation="Conta quantos contatos desse agente ou departamento terminaram o período sem ganho e sem perdido."
                    />
                    <MetricInline
                      value={formatPercent(unclassifiedRate)}
                      label="taxa sem classificação"
                      explanation="Mostra a parcela dos contatos desse agente ou departamento que ainda terminou o período sem resultado final marcado."
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <MetricInline
                      value={formatDuration(item.avgWaitSeconds)}
                      label="espera média"
                      explanation="Mostra, em média, quanto tempo o cliente aguardou até a primeira resposta."
                    />
                    <MetricInline
                      value={formatDuration(item.avgServiceSeconds)}
                      label="tempo médio de atendimento"
                      explanation="Mostra, em média, quanto tempo o atendimento ficou aberto até ser encerrado."
                    />
                  </div>
                  {lossReasonByKey && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <MetricLabel
                        label="Principal motivo de perda"
                        explanation="Mostra o motivo de perda que mais apareceu nos atendimentos desse agente no período."
                      />{" "}
                      <span className="text-foreground">
                        {topLostReason
                          ? `${topLostReason.reason} (${formatNumber(
                              topLostReason.count,
                            )})`
                          : "Sem perdas classificadas"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-tabular text-sm font-semibold text-foreground">
                    {formatCurrency(item.totalRevenue)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    <MetricLabel
                      label="faturamento dos ganhos"
                      explanation="Soma o faturamento dos contatos desse agente ou departamento que terminaram como ganho no período."
                    />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    <MetricLabel
                      label={`taxa de ganho ${formatPercent(item.conversionRate)}`}
                      explanation="Mostra a parcela dos contatos desse agente ou departamento que terminaram como ganho entre os que tiveram resultado final de ganho ou perda."
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export function OperationsInsightsCard({
  analytics,
}: {
  analytics: DashboardAnalytics;
}) {
  const [tab, setTab] = React.useState("agentes");
  const agentLossReasonByKey = React.useMemo(
    () =>
      new Map(
        analytics.reasonByAgent.map((entry) => [entry.key, entry.topLostReasons[0]]),
      ),
    [analytics.reasonByAgent],
  );

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Operação</CardTitle>
          <CardDescription>
            Comparativo de volume, resultado e faturamento por agente e
            departamento.
          </CardDescription>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="agentes">Agentes</TabsTrigger>
            <TabsTrigger value="departamentos">Departamentos</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsContent value="agentes">
            <EntityRows
              items={analytics.byAgent}
              lossReasonByKey={agentLossReasonByKey}
            />
          </TabsContent>
          <TabsContent value="departamentos">
            <EntityRows items={analytics.byDepartment} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
