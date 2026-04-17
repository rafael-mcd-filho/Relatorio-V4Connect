"use client";

import type { DashboardAnalytics } from "@/lib/dashboard-analytics";
import {
  formatCurrency,
  formatNumber,
} from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function RecurrenceInsightsCard({
  analytics,
}: {
  analytics: DashboardAnalytics;
}) {
  const rows = [
    {
      label: "Contatos com mais de 1 atendimento",
      value: formatNumber(analytics.recurrence.repeatContacts),
      hint: "Mesma pessoa reapareceu no período",
    },
    {
      label: "Média de atendimentos por contato",
      value: analytics.recurrence.averageSessionsPerContact.toFixed(2).replace(".", ","),
      hint: "Total de sessões / contatos únicos",
    },
    {
      label: "Contatos de anúncio",
      value: formatNumber(analytics.recurrence.adTagContacts),
      hint: `Faturamento ${formatCurrency(analytics.recurrence.adTagRevenue)}`,
    },
    {
      label: "Contatos orgânicos",
      value: formatNumber(analytics.recurrence.organicContacts),
      hint: `Faturamento ${formatCurrency(analytics.recurrence.organicRevenue)}`,
    },
    {
      label: "Contatos que ganharam e perderam",
      value: formatNumber(analytics.recurrence.contactsWonAndLost),
      hint: "Aparecem com WON e LOST no mesmo período",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recorrência</CardTitle>
        <CardDescription>
          Retorno de contatos, comparativo anúncio x orgânico e mistura de
          resultados no período.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="rounded-xl border border-border bg-muted/20 p-3"
          >
            <div className="text-sm font-semibold text-foreground">
              {row.label}
            </div>
            <div className="mt-2 font-tabular text-lg font-semibold text-foreground">
              {row.value}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{row.hint}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
