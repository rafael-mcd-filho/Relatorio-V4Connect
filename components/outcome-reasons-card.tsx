"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  DashboardAnalytics,
  DashboardReasonMetric,
} from "@/lib/dashboard-analytics";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartTooltipContent } from "@/components/charts/chart-tooltip";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
];

function ReasonChart({
  title,
  items,
}: {
  title: string;
  items: DashboardReasonMetric[];
}) {
  const data = items.slice(0, 6).map((item) => ({
    ...item,
    name: item.reason,
    quantity: item.count,
  }));
  const isGainChart = title === "Ganhos";

  return (
    <div>
      <div className="mb-3 text-sm font-semibold text-foreground">{title}</div>
      {data.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          Nenhum motivo disponível ainda.
        </div>
      ) : (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 16, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={200}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => `${formatNumber(Number(value))} contatos`}
                    extraRows={(payload) => {
                      if (!isGainChart) return [];

                      const revenue = Number(payload[0]?.payload?.totalRevenue ?? 0);
                      return [
                        {
                          label: "Faturamento",
                          value: formatCurrency(revenue),
                          color: "hsl(var(--chart-3))",
                        },
                      ];
                    }}
                  />
                }
              />
              <Bar dataKey="quantity" name="Quantidade" radius={[0, 6, 6, 0]}>
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export function OutcomeReasonsCard({
  analytics,
}: {
  analytics: DashboardAnalytics;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Motivos principais</CardTitle>
        <CardDescription>
          Principais motivos por categoria no período. Nos ganhos, o tooltip
          mostra também o faturamento.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <ReasonChart title="Ganhos" items={analytics.topGainReasons} />
        <ReasonChart title="Perdas" items={analytics.topLostReasons} />
        <ReasonChart title="Dúvidas" items={analytics.topInfoReasons} />
        <ReasonChart title="Outros" items={analytics.topOtherReasons} />
      </CardContent>
    </Card>
  );
}
