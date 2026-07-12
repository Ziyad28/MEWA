import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-card border border-border rounded-xl shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 pt-4 pb-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  unit,
  delta,
  deltaType = "up",
  icon,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  deltaType?: "up" | "down";
  icon?: ReactNode;
  tone?: "primary" | "warning" | "danger" | "success";
}) {
  const toneMap = {
    primary: "bg-primary/10 text-primary",
    warning: "bg-amber-50 text-amber-600",
    danger: "bg-red-50 text-red-600",
    success: "bg-green-50 text-green-600",
  };
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-3xl font-bold text-foreground">{value}</div>
            {unit && <div className="text-xs text-muted-foreground">{unit}</div>}
          </div>
        </div>
        {icon && (
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${toneMap[tone]}`}>
            {icon}
          </div>
        )}
      </div>
      {delta && (
        <div
          className={`mt-3 text-xs font-medium ${
            deltaType === "up" ? "text-green-600" : "text-red-600"
          }`}
        >
          {deltaType === "up" ? "▲" : "▼"} {delta} عن الشهر الماضي
        </div>
      )}
    </div>
  );
}

export function Badge({
  children,
  tone = "primary",
}: {
  children: ReactNode;
  tone?: "primary" | "success" | "warning" | "danger" | "muted";
}) {
  const map = {
    primary: "bg-primary/10 text-primary",
    success: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${map[tone]}`}
    >
      {children}
    </span>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
      <div
        className="h-full bg-primary rounded-full"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
