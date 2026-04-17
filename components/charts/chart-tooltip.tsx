"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number | string;
    color?: string;
    dataKey?: string;
    payload?: Record<string, unknown>;
  }>;
  label?: string;
  formatter?: (value: number | string, name?: string) => string;
  labelFormatter?: (label: string) => string;
  hideLabel?: boolean;
  extraRows?: Array<{
    label: string;
    value: string;
    color?: string;
  }> | ((
    payload: Array<{
      name?: string;
      value?: number | string;
      color?: string;
      dataKey?: string;
      payload?: Record<string, unknown>;
    }>,
  ) => Array<{
    label: string;
    value: string;
    color?: string;
  }>);
  className?: string;
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
  hideLabel,
  extraRows,
  className,
}: ChartTooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;

  const resolvedExtraRows =
    typeof extraRows === "function" ? extraRows(payload) : extraRows;

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-popover/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm",
        className,
      )}
    >
      {!hideLabel && label && (
        <div className="mb-1 font-medium text-foreground">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">
                {entry.name ?? entry.dataKey}
              </span>
            </div>
            <span className="font-tabular font-medium text-foreground">
              {formatter && entry.value !== undefined
                ? formatter(entry.value, entry.name)
                : entry.value}
            </span>
          </div>
        ))}
        {resolvedExtraRows?.map((row) => (
          <div
            key={`${row.label}-${row.value}`}
            className="flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: row.color }}
              />
              <span className="text-muted-foreground">{row.label}</span>
            </div>
            <span className="font-tabular font-medium text-foreground">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
