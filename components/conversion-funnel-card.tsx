"use client";

import {
  AlertCircle,
  ArrowDown,
  CheckCircle2,
  MinusCircle,
  Users,
} from "lucide-react";
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

interface ConversionFunnelCardProps {
  analytics: DashboardAnalytics;
}

export function ConversionFunnelCard({
  analytics,
}: ConversionFunnelCardProps) {
  const totalContacts = analytics.kpis.uniqueContacts || 0;
  const stages = [
    {
      key: "total",
      label: "Total de contatos",
      value: totalContacts,
      helper: "Todas as pessoas únicas que tiveram atendimento no período.",
      explanation:
        "Conta cada pessoa uma única vez no período, mesmo quando ela teve mais de um atendimento.",
      color: "hsl(var(--chart-1))",
      surfaceColor: "hsl(var(--chart-1) / 0.08)",
      borderColor: "hsl(var(--chart-1) / 0.2)",
      iconSurfaceColor: "hsl(var(--chart-1) / 0.12)",
      icon: Users,
      widthClass: "w-full",
    },
    {
      key: "won",
      label: "Ganhos",
      value: analytics.kpis.contactsWon,
      helper: "Contatos com pelo menos um resultado marcado como ganho.",
      explanation:
        "Mostra quantos contatos tiveram algum atendimento classificado como ganho no período.",
      color: "hsl(var(--chart-3))",
      surfaceColor: "hsl(var(--chart-3) / 0.08)",
      borderColor: "hsl(var(--chart-3) / 0.2)",
      iconSurfaceColor: "hsl(var(--chart-3) / 0.12)",
      icon: CheckCircle2,
      widthClass: "w-full md:w-[86%]",
    },
    {
      key: "lost",
      label: "Perdidos",
      value: analytics.kpis.contactsLost,
      helper: "Contatos sem ganho, mas com pelo menos um perdido no período.",
      explanation:
        "Mostra quantos contatos não tiveram ganho e ficaram com resultado perdido no período.",
      color: "hsl(var(--chart-2))",
      surfaceColor: "hsl(var(--chart-2) / 0.08)",
      borderColor: "hsl(var(--chart-2) / 0.2)",
      iconSurfaceColor: "hsl(var(--chart-2) / 0.12)",
      icon: AlertCircle,
      widthClass: "w-full md:w-[72%]",
    },
    {
      key: "unclassified",
      label: "Sem classificação",
      value: analytics.kpis.contactsUnclassified,
      helper: "Contatos que terminaram o período sem ganho e sem perdido.",
      explanation:
        "Mostra quantos contatos não tiveram resultado final marcado como ganho ou perdido no período.",
      color: "hsl(var(--chart-5))",
      surfaceColor: "hsl(var(--chart-5) / 0.08)",
      borderColor: "hsl(var(--chart-5) / 0.2)",
      iconSurfaceColor: "hsl(var(--chart-5) / 0.12)",
      icon: MinusCircle,
      widthClass: "w-full md:w-[58%]",
    },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          <MetricLabel
            label="Funil de conversão"
            explanation="Parte do total de contatos do período e mostra como essa base se distribui entre ganhos, perdidos e sem classificação."
          />
        </CardTitle>
        <CardDescription>
          Leitura do total de contatos até o resultado final de cada pessoa no
          período.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const percentage =
            totalContacts > 0 ? (stage.value / totalContacts) * 100 : 0;
          const progressWidth =
            stage.key === "total"
              ? 100
              : stage.value > 0
                ? Math.max(percentage, 10)
                : 0;

          return (
            <div key={stage.key}>
              <div className={cn("mx-auto", stage.widthClass)}>
                <div
                  className="rounded-2xl border p-4"
                  style={{
                    backgroundColor: stage.surfaceColor,
                    borderColor: stage.borderColor,
                  }}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                        style={{
                          backgroundColor: stage.iconSurfaceColor,
                          color: stage.color,
                        }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground">
                          <MetricLabel
                            label={stage.label}
                            explanation={stage.explanation}
                          />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {stage.helper}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-left md:text-right">
                      <div className="font-display text-3xl font-semibold font-tabular text-foreground">
                        {formatNumber(stage.value)}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {stage.key === "total"
                          ? "Base de 100% dos contatos"
                          : `${formatPercent(percentage)} da base`}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="h-2.5 overflow-hidden rounded-full bg-background/80">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${progressWidth}%`,
                          backgroundColor: stage.color,
                        }}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>
                        {stage.key === "total"
                          ? "Referência para comparar os resultados finais."
                          : "Participação dessa etapa dentro da base total."}
                      </span>
                      <span className="font-tabular">
                        {formatNumber(stage.value)} contatos
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {index < stages.length - 1 ? (
                <div className="flex justify-center py-2 text-muted-foreground">
                  <ArrowDown className="h-4 w-4" />
                </div>
              ) : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
