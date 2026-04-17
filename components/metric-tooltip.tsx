"use client";

import { CircleHelp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function MetricLabel({
  label,
  explanation,
  className,
}: {
  label: string;
  explanation?: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span>{label}</span>
      {explanation ? <MetricTooltip explanation={explanation} /> : null}
    </span>
  );
}

export function MetricInline({
  value,
  label,
  explanation,
  className,
}: {
  value: string;
  label: string;
  explanation?: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="font-tabular">{value}</span>
      <MetricLabel label={label} explanation={explanation} />
    </span>
  );
}

function MetricTooltip({
  explanation,
}: {
  explanation: string;
}) {
  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border-0 bg-transparent p-0 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Explicacao da metrica"
          >
            <CircleHelp className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>{explanation}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
