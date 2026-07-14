import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, CheckCircle2, Hourglass, AlertCircle, Download } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { AppShell, useRequireAuth } from "@/components/app-shell";
import { Card, CardHeader, StatCard, ProgressBar, StatusBadge } from "@/components/ui-bits";
import {
  KPIS_PMO, PROGRESS_SERIES, STATUS_PIE, PROJECTS,
  SPARK_PMO_TOTAL, SPARK_PMO_COMPLETED, SPARK_PMO_PROGRESS, SPARK_PMO_DELAYED,
} from "@/lib/mock-data";

export const Route = createFileRoute("/pmo")({
  component: PmoDashboard,
});

function PmoDashboard() {
  const user = useRequireAuth("pmo");
  if (!user) return null;

  return (
    <AppShell
      role="pmo"
      userName={user.name}
      roleLabel={user.roleLabel}
      pageTitle="لوحة تحكم مكتب إدارة المشاريع (PMO)"
      pageSubtitle="نظرة عامة على المشاريع التقنية"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="إجمالي المشاريع" value={KPIS_PMO.total} unit="مشروع" delta="12%" icon={<Briefcase className="h-4 w-4" />} tone="primary" spark={SPARK_PMO_TOTAL} updated="اليوم 09:20" />
        <StatCard label="المشاريع المكتملة" value={KPIS_PMO.completed} unit="مشروع" delta="8%" icon={<CheckCircle2 className="h-4 w-4" />} tone="success" spark={SPARK_PMO_COMPLETED} updated="اليوم 09:20" />
        <StatCard label="قيد التنفيذ" value={KPIS_PMO.inProgress} unit="مشروع" delta="15%" icon={<Hourglass className="h-4 w-4" />} tone="warning" spark={SPARK_PMO_PROGRESS} updated="اليوم 09:20" />
        <StatCard label="المتأخرة" value={KPIS_PMO.delayed} unit="مشروع" delta="5%" deltaType="down" icon={<AlertCircle className="h-4 w-4" />} tone="danger" spark={SPARK_PMO_DELAYED} updated="اليوم 09:20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="نسبة تقدم المشاريع" />
          <div className="px-5 pb-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PROGRESS_SERIES} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="progGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00573F" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#00573F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#667085" }} />
                <YAxis tick={{ fontSize: 12, fill: "#667085" }} unit="%" domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#00573F" strokeWidth={3} dot={{ r: 4, fill: "#00573F", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} fill="url(#progGrad)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="حالة المشاريع" />
          <div className="px-5 pb-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={STATUS_PIE} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {STATUS_PIE.map((s) => <Cell key={s.name} fill={s.color} />)}
                </Pie>
                <Legend verticalAlign="middle" align="left" layout="vertical" iconType="circle"
                  formatter={(v, e) => {
                    const item = STATUS_PIE.find(x => x.name === v);
                    return <span style={{ color: "#111827", fontSize: 12 }}>{item ? `${item.value} (${Math.round(item.value / (45+67+16) * 100)}%) ${v}` : v}</span>;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="أحدث المشاريع" action={<Link to="/projects" className="text-xs text-primary hover:underline">عرض جميع المشاريع</Link>} />
          <div className="px-2 pb-3 overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th className="text-right px-3 py-2 font-medium">المشروع</th>
                  <th className="text-right px-3 py-2 font-medium">القطاع</th>
                  <th className="text-right px-3 py-2 font-medium">نسبة التقدم</th>
                  <th className="text-right px-3 py-2 font-medium">الحالة</th>
                  <th className="text-right px-3 py-2 font-medium">تاريخ التحديث</th>
                </tr>
              </thead>
              <tbody>
                {PROJECTS.slice(0, 5).map((p) => (
                  <tr key={p.id} className="border-t border-border hover:bg-accent/40">
                    <td className="px-3 py-3 font-medium">
                      <Link to="/projects/$id" params={{ id: String(p.id) }} className="hover:text-primary">{p.name}</Link>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{p.sector}</td>
                    <td className="px-3 py-3 w-40">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={p.progress} tone={p.status === "متأخرة" ? "danger" : p.status === "مكتملة" ? "success" : "primary"} />
                        <span className="text-xs text-muted-foreground w-10">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-3 py-3 text-muted-foreground">{p.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="التقارير" action={<Link to="/reports" className="text-xs text-primary hover:underline">عرض الكل</Link>} />
          <div className="px-5 pb-5 space-y-2">
            {["التقرير الشهري للمشاريع", "تقرير حالة المشاريع", "تقرير الأداء حسب القطاع"].map((r) => (
              <button key={r} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-border text-sm text-right hover:bg-accent">
                <span>{r}</span>
                <Download className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
