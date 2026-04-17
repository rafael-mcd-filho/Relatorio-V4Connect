"use client";

import * as React from "react";
import type {
  DashboardAnalytics,
  DashboardDimensionMetric,
} from "@/lib/dashboard-analytics";
import {
  formatCurrency,
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

function DimensionRows({
  items,
}: {
  items: DashboardDimensionMetric[];
}) {
  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          Sem dados suficientes nesse agrupamento.
        </div>
      ) : (
        items.slice(0, 8).map((item) => (
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
                    explanation="Soma todos os atendimentos ligados a essa origem ou campanha no período."
                  />
                  <MetricInline
                    value={formatNumber(item.uniqueContacts)}
                    label="contatos"
                    explanation="Conta quantas pessoas diferentes chegaram por essa origem ou campanha no período."
                  />
                  <MetricInline
                    value={formatNumber(item.newContacts)}
                    label="contatos novos"
                    explanation="Conta quantos desses contatos foram criados pela primeira vez dentro do período."
                  />
                </div>
              </div>
              <div className="text-right">
                <div className="font-tabular text-sm font-semibold text-foreground">
                  {formatCurrency(item.totalRevenue)}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  <MetricLabel
                    label="faturamento dos ganhos"
                    explanation="Soma o faturamento dos contatos dessa origem ou campanha que terminaram como ganho no período."
                  />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  <MetricLabel
                    label={`taxa de ganho ${formatPercent(item.conversionRate)}`}
                    explanation="Mostra a parcela dos contatos dessa origem ou campanha que terminaram como ganho entre os que tiveram resultado final de ganho ou perda."
                  />
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export function CommercialInsightsCard({
  analytics,
}: {
  analytics: DashboardAnalytics;
}) {
  const [tab, setTab] = React.useState("origem");

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Comercial</CardTitle>
          <CardDescription>
            Origem e campanha dos contatos consolidadas no período.
          </CardDescription>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="origem">Origem</TabsTrigger>
            <TabsTrigger value="campanha">Campanha</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsContent value="origem">
            <DimensionRows items={analytics.byLeadSource} />
          </TabsContent>
          <TabsContent value="campanha">
            <DimensionRows items={analytics.byCampaign} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
