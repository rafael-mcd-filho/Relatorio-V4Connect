"use client";

import type { DashboardAnalytics } from "@/lib/dashboard-analytics";
import { cn, formatNumber, formatPercent } from "@/lib/utils";
import { MetricLabel } from "@/components/metric-tooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CohortConversionCardProps {
  analytics: DashboardAnalytics;
}

export function CohortConversionCard({
  analytics,
}: CohortConversionCardProps) {
  const cohorts = [
    {
      key: "new",
      label: "Contatos novos",
      totalContacts: analytics.panels.new.totalContacts,
      wonContacts: analytics.panels.new.contactsWon,
      lostContacts: analytics.panels.new.contactsLost,
      unclassifiedContacts: analytics.panels.new.contactsUnclassified,
      finalConversionRate: analytics.panels.new.conversionRate,
      color: "hsl(var(--chart-4))",
      surface: "bg-[hsl(var(--chart-4)/0.08)]",
      border: "border-[hsl(var(--chart-4)/0.18)]",
    },
    {
      key: "existing",
      label: "Contatos antigos",
      totalContacts: analytics.panels.existing.totalContacts,
      wonContacts: analytics.panels.existing.contactsWon,
      lostContacts: analytics.panels.existing.contactsLost,
      unclassifiedContacts: analytics.panels.existing.contactsUnclassified,
      finalConversionRate: analytics.panels.existing.conversionRate,
      color: "hsl(var(--chart-1))",
      surface: "bg-[hsl(var(--chart-1)/0.08)]",
      border: "border-[hsl(var(--chart-1)/0.18)]",
    },
  ].map((cohort) => ({
    ...cohort,
    wonRateOnBase:
      cohort.totalContacts > 0
        ? (cohort.wonContacts / cohort.totalContacts) * 100
        : 0,
    classifiedContacts: cohort.wonContacts + cohort.lostContacts,
  }));

  const baseRateGap = cohorts[0].wonRateOnBase - cohorts[1].wonRateOnBase;
  const gapDisplay = `${formatNumber(Math.abs(baseRateGap), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} p.p.`;
  const gapText =
    Math.abs(baseRateGap) < 0.05
      ? "Novos e antigos estão praticamente empatados na taxa de ganho sobre a base total."
      : baseRateGap > 0
        ? `Contatos novos estão ${gapDisplay} acima dos antigos na taxa de ganho sobre a base total.`
        : `Contatos antigos estão ${gapDisplay} acima dos novos na taxa de ganho sobre a base total.`;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          <MetricLabel
            label="Conversão de novos vs. antigos"
            explanation="Compara como os contatos novos e antigos performam no período, olhando tanto a taxa de ganho sobre a base total quanto a conversão final entre os classificados."
          />
        </CardTitle>
        <CardDescription>
          Ajuda a comparar aquisição e retenção sem misturar os dois grupos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {cohorts.map((cohort) => {
          const barWidth =
            cohort.wonRateOnBase > 0 ? Math.max(cohort.wonRateOnBase, 6) : 0;

          return (
            <div
              key={cohort.key}
              className={cn("rounded-xl border p-4", cohort.surface, cohort.border)}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {cohort.label}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {formatNumber(cohort.wonContacts)} ganhos de{" "}
                    {formatNumber(cohort.totalContacts)} contatos
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-2xl font-semibold font-tabular text-foreground">
                    {formatPercent(cohort.wonRateOnBase)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    ganho sobre a base
                  </div>
                </div>
              </div>

              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-background/80">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: cohort.color,
                  }}
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>
                  Conversão final {formatPercent(cohort.finalConversionRate)}
                </span>
                <span>
                  {formatNumber(cohort.classifiedContacts)} classificados
                </span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {formatNumber(cohort.unclassifiedContacts)} sem classificação no
                grupo.
              </div>
            </div>
          );
        })}

        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
          {gapText}
        </div>
      </CardContent>
    </Card>
  );
}
