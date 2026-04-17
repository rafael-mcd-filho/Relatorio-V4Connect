"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardAnalytics } from "@/lib/dashboard-analytics";
import {
  formatCurrency,
  formatDateShort,
  formatNumber,
} from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartTooltipContent } from "@/components/charts/chart-tooltip";

export function TemporalInsightsCard({
  analytics,
}: {
  analytics: DashboardAnalytics;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Temporal</CardTitle>
        <CardDescription>
          Por dia, mostra o total de atendimentos, quantos viraram ganho,
          quantos foram perdidos e quanto faturaram.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={analytics.byDay}
              margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => formatDateShort(value)}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <YAxis
                yAxisId="volume"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <YAxis
                yAxisId="revenue"
                orientation="right"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={64}
                tickFormatter={(value) => formatCurrency(Number(value))}
              />
              <Tooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => formatDateShort(value)}
                    formatter={(value, name) => {
                      if (name === "Faturamento") {
                        return formatCurrency(Number(value));
                      }

                      if (name === "Ganhos") {
                        return `${formatNumber(Number(value))} ganhos`;
                      }

                      if (name === "Perdidos") {
                        return `${formatNumber(Number(value))} perdidos`;
                      }

                      return `${formatNumber(Number(value))} atendimentos`;
                    }}
                  />
                }
              />
              <Bar
                yAxisId="volume"
                dataKey="totalSessions"
                name="Atendimentos"
                fill="hsl(var(--chart-1))"
                radius={[6, 6, 0, 0]}
              />
              <Line
                yAxisId="volume"
                type="monotone"
                dataKey="wonSessions"
                name="Ganhos"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 1, fill: "hsl(var(--chart-3))" }}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="volume"
                type="monotone"
                dataKey="lostSessions"
                name="Perdidos"
                stroke="hsl(var(--chart-6))"
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 1, fill: "hsl(var(--chart-6))" }}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                name="Faturamento"
                stroke="hsl(var(--chart-4))"
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 1, fill: "hsl(var(--chart-4))" }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
