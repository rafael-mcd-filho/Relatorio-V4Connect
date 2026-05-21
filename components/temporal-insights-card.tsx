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
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={analytics.byDay}
              margin={{ top: 12, right: 16, bottom: 4, left: -8 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border) / 0.5)"
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
                radius={[8, 8, 0, 0]}
              />
              <Line
                yAxisId="volume"
                type="natural"
                dataKey="wonSessions"
                name="Ganhos"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2.5}
                dot={{ r: 3.5, strokeWidth: 1.5, fill: "hsl(var(--background))" }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
              <Line
                yAxisId="volume"
                type="natural"
                dataKey="lostSessions"
                name="Perdidos"
                stroke="hsl(var(--chart-6))"
                strokeWidth={2.5}
                dot={{ r: 3.5, strokeWidth: 1.5, fill: "hsl(var(--background))" }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
              <Line
                yAxisId="revenue"
                type="natural"
                dataKey="revenue"
                name="Faturamento"
                stroke="hsl(var(--chart-4))"
                strokeWidth={2.5}
                dot={{ r: 3.5, strokeWidth: 1.5, fill: "hsl(var(--background))" }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
