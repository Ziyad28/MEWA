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
      className={`bg-card border border-border rounded-xl shadow-[0_1px_3px_rgba(16,24,40,0.08)] ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, action, subtitle }: { title: string; action?: ReactNode; subtitle?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-4">
      <div>
        <h3 className="text-base font-bold tracking-tight text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/** Inline SVG sparkline — no dependency */
export function Sparkline({
  data,
  color = "#1B8354",
  width = 88,
  height = 28,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(1, max - min);
  const step = width / Math.max(1, data.length - 1);
  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const areaPath = `M0,${height} L${points.join(" L")} L${width},${height} Z`;
  const linePath = `M${points.join(" L")}`;
  const gid = `spark-${color.replace("#", "")}`;
  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.18} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gid})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
  spark,
  updated,
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  deltaType?: "up" | "down";
  icon?: ReactNode;
  tone?: "primary" | "warning" | "danger" | "success";
  spark?: number[];
  updated?: string;
}) {
  const toneMap = {
    primary: { bg: "bg-[#ecfdf3]", fg: "text-[#166a45]", border: "border-[#abefc6]", bar: "bg-primary", spark: "#1B8354" },
    warning: { bg: "bg-amber-50", fg: "text-amber-600", border: "border-amber-100", bar: "bg-amber-500", spark: "#F59E0B" },
    danger: { bg: "bg-red-50", fg: "text-red-600", border: "border-red-100", bar: "bg-red-500", spark: "#DC2626" },
    success: { bg: "bg-green-50", fg: "text-green-600", border: "border-green-100", bar: "bg-green-600", spark: "#16A34A" },
  } as const;
  const t = toneMap[tone];
  return (
    <div className="relative overflow-hidden bg-card border border-border rounded-xl p-5 shadow-[0_1px_3px_rgba(16,24,40,0.08)] transition-shadow duration-200 hover:shadow-[0_4px_10px_rgba(16,24,40,0.10)]">
      <div className={`absolute inset-x-0 top-0 h-1 ${t.bar}`} />
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <div className="text-[34px] font-extrabold tracking-tight text-foreground leading-none">{value}</div>
            {unit && <div className="text-xs text-muted-foreground">{unit}</div>}
          </div>
        </div>
        {icon && (
          <div className={`h-11 w-11 rounded-xl border flex items-center justify-center ${t.bg} ${t.fg} ${t.border} shrink-0`}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          {delta && (
            <div
              className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ${
                deltaType === "up" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              {deltaType === "up" ? "▲" : "▼"} {delta} عن الشهر الماضي
            </div>
          )}
          {updated && <div className="text-[11px] text-muted-foreground mt-1">آخر تحديث: {updated}</div>}
        </div>
        {spark && spark.length > 0 && <Sparkline data={spark} color={t.spark} width={96} height={32} />}
      </div>
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
    primary: "border border-[#abefc6] bg-[#ecfdf3] text-[#166a45]",
    success: "border border-[#abefc6] bg-[#ecfdf3] text-[#067647]",
    warning: "border border-[#fedf89] bg-[#fffaeb] text-[#b54708]",
    danger: "border border-[#fecdca] bg-[#fef3f2] text-[#b42318]",
    muted: "border border-border bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[tone]}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone: "success" | "warning" | "danger" | "muted" | "primary" =
    status === "مكتملة" ? "success" :
    status === "متأخرة" ? "danger" :
    status === "قيد التنفيذ" ? "warning" :
    status === "مخططة" ? "primary" : "muted";
  return <Badge tone={tone}>{status}</Badge>;
}

export function ProgressBar({ value, tone = "primary" }: { value: number; tone?: "primary" | "warning" | "danger" | "success" }) {
  const colorMap = {
    primary: "bg-primary",
    warning: "bg-amber-500",
    danger: "bg-red-500",
    success: "bg-green-600",
  };
  return (
    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
      <div
        className={`h-full rounded-full ${colorMap[tone]}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/** Circular health-score ring */
export function HealthRing({ value, size = 72, label = "الصحة" }: { value: number; size?: number; label?: string }) {
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = (value / 100) * circ;
  const color = value >= 75 ? "#16A34A" : value >= 50 ? "#F59E0B" : "#DC2626";
  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#eef2f0" strokeWidth={stroke} />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
          {value}%
        </div>
      </div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="border-b border-border">
      <div role="tablist" className="flex items-center gap-1 overflow-x-auto">
        {tabs.map((t) => {
          const isActive = t.id === active;
          return (
            <button
              type="button"
              role="tab"
              aria-selected={isActive}
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`relative px-4 py-3 text-sm whitespace-nowrap transition-colors ${
                isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
              {typeof t.count === "number" && (
                <span className={`inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-[11px] mr-1.5 ${isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{t.count}</span>
              )}
              {isActive && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary rounded-full" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#ecfdf3] text-primary">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-semibold text-foreground">{children}</h2>
      {action}
    </div>
  );
}
