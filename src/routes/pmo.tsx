import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, CheckCircle2, Hourglass, AlertCircle, Download } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import { AppShell, useRequireAuth } from "@/components/app-shell";
import { Card, CardHeader, StatCard, ProgressBar, StatusBadge } from "@/components/ui-bits";
import {
  KPIS_PMO, PROGRESS_SERIES, STATUS_PIE, PROJECTS,
  SPARK_PMO_TOTAL, SPARK_PMO_COMPLETED, SPARK_PMO_PROGRESS, SPARK_PMO_DELAYED,
} from "@/lib/mock-data";
import { downloadDocument } from "@/lib/portal-store";

export const Route = createFileRoute("/pmo")({
  component: PmoDashboard,
});

function PmoDashboard() {
  const user = useRequireAuth("pmo");
  if (!user) return null;
  const statusTotal = STATUS_PIE.reduce((sum, item) => sum + item.value, 0);

  return (
    <AppShell
      role="pmo"
      userName={user.name}
      roleLabel={user.roleLabel}
      pageTitle="ط¶ط¨ط· ط§ظ„ط¬ظˆط¯ط© ظˆط§ظ„ط­ظˆظƒظ…ط©"
      pageSubtitle="ظ†ط¸ط±ط© ط¹ط§ظ…ط© ط¹ظ„ظ‰ ط§ظ„ظ…ط´ط§ط±ظٹط¹ ط§ظ„طھظ‚ظ†ظٹط©"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظ…ط´ط§ط±ظٹط¹" value={KPIS_PMO.total} unit="ظ…ط´ط±ظˆط¹" delta="12%" icon={<Briefcase className="h-4 w-4" />} tone="primary" spark={SPARK_PMO_TOTAL} updated="ط§ظ„ظٹظˆظ… 09:20" />
        <StatCard label="ط§ظ„ظ…ط´ط§ط±ظٹط¹ ط§ظ„ظ…ظƒطھظ…ظ„ط©" value={KPIS_PMO.completed} unit="ظ…ط´ط±ظˆط¹" delta="8%" icon={<CheckCircle2 className="h-4 w-4" />} tone="success" spark={SPARK_PMO_COMPLETED} updated="ط§ظ„ظٹظˆظ… 09:20" />
        <StatCard label="ظ‚ظٹط¯ ط§ظ„طھظ†ظپظٹط°" value={KPIS_PMO.inProgress} unit="ظ…ط´ط±ظˆط¹" delta="15%" icon={<Hourglass className="h-4 w-4" />} tone="warning" spark={SPARK_PMO_PROGRESS} updated="ط§ظ„ظٹظˆظ… 09:20" />
        <StatCard label="ط§ظ„ظ…طھط£ط®ط±ط©" value={KPIS_PMO.delayed} unit="ظ…ط´ط±ظˆط¹" delta="5%" deltaType="down" icon={<AlertCircle className="h-4 w-4" />} tone="danger" spark={SPARK_PMO_DELAYED} updated="ط§ظ„ظٹظˆظ… 09:20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="overflow-hidden">
          <CardHeader
            title="ظ†ط³ط¨ط© طھظ‚ط¯ظ… ط§ظ„ظ…ط´ط§ط±ظٹط¹"
            subtitle="ظ…طھظˆط³ط· ط§ظ„طھظ‚ط¯ظ… ط§ظ„طھط±ط§ظƒظ…ظٹ ظ„ظ„ظ…ط­ظپط¸ط©"
            action={<span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">ط¢ط®ط± 6 ط£ط´ظ‡ط±</span>}
          />
          <div className="px-4 pb-5 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PROGRESS_SERIES} margin={{ top: 12, right: 14, left: 0, bottom: 8 }}>
                <defs>
                  <linearGradient id="progGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#006C51" stopOpacity={0.28} />
                    <stop offset="55%" stopColor="#006C51" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#00573F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="4 5" stroke="#E7ECE9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#667085" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#667085" }} tickFormatter={(value) => `${value}%`} domain={[0, 100]} width={42} />
                <Tooltip
                  cursor={{ stroke: "#006C51", strokeWidth: 1, strokeDasharray: "4 4", strokeOpacity: 0.35 }}
                  contentStyle={{ border: "1px solid #E2E8E5", borderRadius: 12, boxShadow: "0 10px 30px rgba(16,24,40,0.10)", fontSize: 12 }}
                  labelStyle={{ color: "#344054", fontWeight: 600, marginBottom: 4 }}
                  formatter={(value) => [`${value}%`, "ظ†ط³ط¨ط© ط§ظ„طھظ‚ط¯ظ…"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#006C51"
                  strokeWidth={3.5}
                  fill="url(#progGrad)"
                  dot={{ r: 4.5, fill: "#FFFFFF", strokeWidth: 3, stroke: "#006C51" }}
                  activeDot={{ r: 7, fill: "#006C51", stroke: "#FFFFFF", strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader
            title="ط­ط§ظ„ط© ط§ظ„ظ…ط´ط§ط±ظٹط¹"
            subtitle="طھظˆط²ظٹط¹ ط§ظ„ظ…ط´ط§ط±ظٹط¹ ط­ط³ط¨ ط§ظ„ط­ط§ظ„ط© ط§ظ„ط­ط§ظ„ظٹط©"
            action={<span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground">ط§ظ„ط¥ط¬ظ…ط§ظ„ظٹ {statusTotal}</span>}
          />
          <div className="grid h-[300px] grid-cols-[minmax(0,1fr)_180px] items-center gap-3 px-5 pb-5">
            <div className="relative h-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={STATUS_PIE}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={103}
                    paddingAngle={3}
                    cornerRadius={7}
                    stroke="#FFFFFF"
                    strokeWidth={4}
                  >
                    {STATUS_PIE.map((status) => <Cell key={status.name} fill={status.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ border: "1px solid #E2E8E5", borderRadius: 12, boxShadow: "0 10px 30px rgba(16,24,40,0.10)", fontSize: 12 }}
                    formatter={(value, name) => [`${value} ظ…ط´ط±ظˆط¹`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold tracking-tight text-foreground">{statusTotal}</span>
                <span className="mt-1 text-xs text-muted-foreground">ظ…ط´ط±ظˆط¹</span>
              </div>
            </div>
            <div className="space-y-3">
              {STATUS_PIE.map((status) => {
                const percentage = Math.round((status.value / statusTotal) * 100);
                return (
                  <div key={status.name} className="rounded-xl border border-border/70 bg-muted/25 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: status.color }} />
                        {status.name}
                      </div>
                      <span className="text-sm font-bold text-foreground">{status.value}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border/70">
                        <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: status.color }} />
                      </div>
                      <span className="w-8 text-left text-[11px] font-semibold text-muted-foreground">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
