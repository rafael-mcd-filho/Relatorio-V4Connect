"use client";

import * as React from "react";
import { format, subDays, startOfDay, endOfDay, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, RefreshCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PresetKey =
  | "today"
  | "yesterday"
  | "7d"
  | "14d"
  | "30d"
  | "90d"
  | "custom";

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: "today", label: "Hoje" },
  { key: "yesterday", label: "Ontem" },
  { key: "7d", label: "Últimos 7 dias" },
  { key: "14d", label: "Últimos 14 dias" },
  { key: "30d", label: "Últimos 30 dias" },
  { key: "90d", label: "Últimos 90 dias" },
  { key: "custom", label: "Personalizado" },
];

function rangeFromPreset(key: PresetKey): { from: Date; to: Date } | null {
  const now = new Date();
  switch (key) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "yesterday": {
      const d = subDays(now, 1);
      return { from: startOfDay(d), to: endOfDay(d) };
    }
    case "7d":
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
    case "14d":
      return { from: startOfDay(subDays(now, 13)), to: endOfDay(now) };
    case "30d":
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) };
    case "90d":
      return { from: startOfDay(subDays(now, 89)), to: endOfDay(now) };
    default:
      return null;
  }
}

function detectPreset(from?: Date, to?: Date): PresetKey {
  if (!from || !to) return "custom";
  for (const p of PRESETS) {
    if (p.key === "custom") continue;
    const r = rangeFromPreset(p.key);
    if (!r) continue;
    if (isSameDay(r.from, from) && isSameDay(r.to, to)) return p.key;
  }
  return "custom";
}

interface PeriodControlsProps {
  from?: Date;
  to?: Date;
  onChange: (from?: Date, to?: Date) => void;
  loading: boolean;
  onFetch: () => void;
}

export function PeriodControls({
  from,
  to,
  onChange,
  loading,
  onFetch,
}: PeriodControlsProps) {
  const preset = detectPreset(from, to);

  const applyPreset = (key: string) => {
    if (key === "custom") return;
    const r = rangeFromPreset(key as PresetKey);
    if (r) onChange(r.from, r.to);
  };

  const setFrom = (d?: Date) => {
    if (!d) return onChange(undefined, to);
    const newFrom = startOfDay(d);
    const newTo = to && newFrom > to ? endOfDay(d) : to;
    onChange(newFrom, newTo);
  };

  const setTo = (d?: Date) => {
    if (!d) return onChange(from, undefined);
    const newTo = endOfDay(d);
    const newFrom = from && newTo < from ? startOfDay(d) : from;
    onChange(newFrom, newTo);
  };

  const clear = () => onChange(undefined, undefined);

  const canFetch = !!from && !!to && !loading;

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card">
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
        <Field label="Período" className="min-w-[180px] flex-1 md:max-w-[260px]">
          <Select value={preset} onValueChange={applyPreset}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRESETS.map((p) => (
                <SelectItem key={p.key} value={p.key}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field
          label="Data inicial"
          className="min-w-[160px] flex-1 md:max-w-[200px]"
        >
          <DateField value={from} onChange={setFrom} maxDate={to} />
        </Field>

        <Field
          label="Data final"
          className="min-w-[160px] flex-1 md:max-w-[200px]"
        >
          <DateField value={to} onChange={setTo} minDate={from} />
        </Field>

        <div className="flex items-end gap-2 md:ml-auto">
          <Button
            variant="outline"
            onClick={clear}
            disabled={loading || (!from && !to)}
          >
            Limpar
          </Button>
          <Button
            variant="default"
            onClick={onFetch}
            disabled={!canFetch}
            className="min-w-[140px] gap-2"
          >
            {loading ? (
              <>
                <RefreshCcw className="h-4 w-4 animate-spin" />
                Carregando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Buscar dados
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function DateField({
  value,
  onChange,
  minDate,
  maxDate,
}: {
  value?: Date;
  onChange: (d?: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 w-full justify-between gap-2 font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <span className="font-tabular">
            {value ? format(value, "dd/MM/yyyy", { locale: ptBR }) : "dd/mm/aaaa"}
          </span>
          <CalendarIcon className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d) => {
            onChange(d);
            setOpen(false);
          }}
          defaultMonth={value}
          disabled={[
            ...(minDate ? [{ before: minDate }] : []),
            ...(maxDate ? [{ after: maxDate }] : []),
          ]}
        />
      </PopoverContent>
    </Popover>
  );
}
