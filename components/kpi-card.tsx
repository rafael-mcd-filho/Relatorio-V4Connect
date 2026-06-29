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
  onClick?: () => void;
  actionLabel?: string;
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
  onClick,
  actionLabel,
}: KpiCardProps) {
  const hasDelta = typeof delta === "number";
  const deltaPositive = hasDelta ? delta > 0 : false;
  const good = deltaInverted ? !deltaPositive : deltaPositive;
  const neutral = hasDelta && Math.abs(delta!) < 0.1;
  const clickable = Boolean(onClick);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick || event.target !== event.currentTarget) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden p-5 transition-all duration-200 hover:scale-[1.02]",
        clickable &&
          "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={clickable ? actionLabel ?? label : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            <MetricLabel label={label} explanation={explanation} />
          </div>
          <div className="font-display text-3xl font-semibold tracking-tight font-tabular text-foreground">
            {value}
          </div>
          {hint && (
            <div className="font-tabular text-xs text-muted-foreground/80">
              {hint}
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl shrink-0 transition-transform duration-200",
              accentStyles[accent],
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        {hasDelta ? (
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-medium transition-colors duration-200",
              neutral && "bg-muted/50 text-muted-foreground",
              !neutral && good && "bg-success/15 text-success",
              !neutral && !good && "bg-destructive/15 text-destructive",
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
            <span className="text-muted-foreground/70">vs. período</span>
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
