import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { MetricLabel } from "@/components/metric-tooltip";

interface KpiCardProps {
  label: string;
  explanation?: string;
  value: string;
  hint?: string;
  delta?: number;
  deltaInverted?: boolean;
  icon?: React.ReactNode;
  accent?: "primary" | "accent" | "success" | "warning" | "chart-4" | "chart-5";
  sparkline?: number[];
}

const accentStyles: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  primary: "text-primary bg-primary/10",
  accent: "text-accent bg-accent/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  "chart-4": "text-[hsl(var(--chart-4))] bg-[hsl(var(--chart-4)/0.12)]",
  "chart-5": "text-[hsl(var(--chart-5))] bg-[hsl(var(--chart-5)/0.12)]",
};

export function KpiCard({
  label,
  explanation,
  value,
  hint,
  delta,
  deltaInverted,
  icon,
  accent = "primary",
  sparkline,
}: KpiCardProps) {
  const hasDelta = typeof delta === "number";
  const deltaPositive = hasDelta ? delta > 0 : false;
  const good = deltaInverted ? !deltaPositive : deltaPositive;
  const neutral = hasDelta && Math.abs(delta!) < 0.1;

  return (
    <Card className="relative overflow-hidden p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <MetricLabel label={label} explanation={explanation} />
          </div>
          <div className="font-display text-2xl font-semibold tracking-tight font-tabular">
            {value}
          </div>
          {hint && (
            <div className="font-tabular text-[11px] text-muted-foreground">
              {hint}
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              accentStyles[accent],
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        {hasDelta ? (
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
              neutral && "bg-muted text-muted-foreground",
              !neutral && good && "bg-success/10 text-success",
              !neutral && !good && "bg-destructive/10 text-destructive",
            )}
          >
            {neutral ? (
              <Minus className="h-3 w-3" />
            ) : deltaPositive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            <span className="font-tabular">
              {delta! > 0 ? "+" : ""}
              {delta!.toFixed(1).replace(".", ",")}%
            </span>
            <span className="text-muted-foreground">vs. período anterior</span>
          </div>
        ) : (
          <span />
        )}

        {sparkline && sparkline.length > 1 && (
          <Sparkline values={sparkline} accent={accent} />
        )}
      </div>
    </Card>
  );
}

function Sparkline({
  values,
  accent,
}: {
  values: number[];
  accent: NonNullable<KpiCardProps["accent"]>;
}) {
  const w = 84;
  const h = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = w / (values.length - 1);

  const points = values
    .map((v, i) => `${i * step},${h - ((v - min) / range) * h}`)
    .join(" ");

  const color =
    accent === "accent"
      ? "hsl(var(--accent))"
      : accent === "success"
        ? "hsl(var(--success))"
        : accent === "warning"
          ? "hsl(var(--warning))"
          : accent === "chart-4"
            ? "hsl(var(--chart-4))"
            : accent === "chart-5"
              ? "hsl(var(--chart-5))"
              : "hsl(var(--primary))";

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="opacity-80"
      aria-hidden
    >
      <defs>
        <linearGradient id={`spark-${accent}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <polygon
        fill={`url(#spark-${accent})`}
        points={`0,${h} ${points} ${w},${h}`}
      />
    </svg>
  );
}
