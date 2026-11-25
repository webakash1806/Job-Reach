"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type TimingValue = {
  intervalMode: "fixed" | "random";
  intervalSec: number;
  minSec: number;
  maxSec: number;
  dailyCap: number;
  windowStart: string;
  windowEnd: string;
};

export const defaultTiming: TimingValue = {
  intervalMode: "random",
  intervalSec: 90,
  minSec: 60,
  maxSec: 180,
  dailyCap: 80,
  windowStart: "09:30",
  windowEnd: "18:30",
};

export function timingPayload(t: TimingValue) {
  return { ...t, tzOffset: new Date().getTimezoneOffset() };
}

function Num({ id, label, value, onChange, min = 10, suffix }: { id: string; label: string; value: number; onChange: (n: number) => void; min?: number; suffix?: string }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input id={id} type="number" min={min} value={value} onChange={(e) => onChange(Number(e.target.value))} className={suffix ? "pr-12" : ""} />
        {suffix && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

export function TimingFields({ value, onChange }: { value: TimingValue; onChange: (v: TimingValue) => void }) {
  const set = <K extends keyof TimingValue>(k: K, v: TimingValue[K]) => onChange({ ...value, [k]: v });
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Gap between emails</Label>
        <Tabs value={value.intervalMode} onValueChange={(v) => set("intervalMode", v as TimingValue["intervalMode"])}>
          <TabsList>
            <TabsTrigger value="random">Random</TabsTrigger>
            <TabsTrigger value="fixed">Fixed</TabsTrigger>
          </TabsList>
        </Tabs>
        <p className="text-xs text-muted-foreground">
          Random gaps look more natural to spam filters. Minimum gap is 10 seconds.
        </p>
      </div>
      {value.intervalMode === "fixed" ? (
        <Num id="intervalSec" label="Every" value={value.intervalSec} onChange={(n) => set("intervalSec", n)} suffix="sec" />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Num id="minSec" label="Shortest gap" value={value.minSec} onChange={(n) => set("minSec", n)} suffix="sec" />
          <Num id="maxSec" label="Longest gap" value={value.maxSec} onChange={(n) => set("maxSec", n)} suffix="sec" />
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Num id="dailyCap" label="Max per day" min={1} value={value.dailyCap} onChange={(n) => set("dailyCap", n)} />
        <div className="grid gap-2">
          <Label htmlFor="ws">Send from</Label>
          <Input id="ws" type="time" value={value.windowStart} onChange={(e) => set("windowStart", e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="we">Send until</Label>
          <Input id="we" type="time" value={value.windowEnd} onChange={(e) => set("windowEnd", e.target.value)} />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Clear both times to send at any hour. Times use your current timezone.</p>
    </div>
  );
}
