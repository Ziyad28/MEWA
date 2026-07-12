import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, CheckCircle2, Hourglass, AlertCircle } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { AppShell, useRequireAuth } from "@/components/app-shell";
import { Card, CardHeader, StatCard, Badge, ProgressBar } from "@/components/ui-bits";
import { KPIS_PMO, PROGRESS_SERIES, STATUS_PIE, PROJECTS } from "@/lib/mock-data";

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
        <StatCard label="إجمالي المشاريع" value={KPIS_PMO.total} unit="مشروع" delta="12%" icon={<Briefcase className="h-4 w-4" />} tone="primary" />
        <StatCard label="المشاريع المكتملة" value={KPIS_PMO.completed} unit="مشروع" delta="8%" icon={<CheckCircle2 className="h-4 w-4" />} tone="success" />
        <StatCard label="قيد التنفيذ" value={KPIS_PMO.inProgress} unit="مشروع" delta="15%" icon={<Hourglass className="h-4 w-4" />} tone="warning" />
        <StatCard label="المتأخرة" value={KPIS_PMO.delayed} unit="مشروع" delta="5%" deltaType="down" icon={<AlertCircle className="h-4 w-4" />} tone="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="نسبة تقدم المشاريع" />
          <div className="px-5 pb-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PROGRESS_SERIES}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f0" />
                <XAxis dataKey="month" reversed tick={{ fontSize: 12, fill: "#667085" }} />
                <YAxis tick={{ fontSize: 12, fill: "#667085" }} unit="%" />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#005D45" strokeWidth={2.5} dot={{ r: 4, fill: "#005D45" }} />
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
          <CardHeader title="أحدث المشاريع" action={<a href="#" className="text-xs text-primary hover:underline">عرض جميع المشاريع</a>} />
          <div className="px-2 pb-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th className="text-right px-3 py-2 font-medium">القطاع</th>
                  <th className="text-right px-3 py-2 font-medium">نسبة التقدم</th>
                  <th className="text-right px-3 py-2 font-medium">الحالة</th>
                  <th className="text-right px-3 py-2 font-medium">تاريخ التحديث</th>
                </tr>
              </thead>
              <tbody>
                {PROJECTS.slice(0, 4).map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-3 py-3">{p.name}</td>
                    <td className="px-3 py-3 w-40">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={p.progress} />
                        <span className="text-xs text-muted-foreground w-10">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={p.status === "مكتملة" ? "success" : p.status === "متأخرة" ? "danger" : "warning"}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{p.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="التقارير" action={<a href="#" className="text-xs text-primary hover:underline">عرض جميع التقارير</a>} />
          <div className="px-5 pb-5 space-y-2">
            {["التقرير الشهري للمشاريع", "تقرير حالة المشاريع", "تقرير الأداء حسب القطاع"].map((r) => (
              <button key={r} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-border text-sm text-right hover:bg-accent">
                <span>{r}</span>
                <span className="text-muted-foreground text-xs">↓</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
