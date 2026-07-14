import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, CheckCircle2, Hourglass, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { AppShell, useRequireAuth } from "@/components/app-shell";
import { Card, CardHeader, StatCard, ProgressBar, StatusBadge } from "@/components/ui-bits";
import { KPIS_MANAGER, PROJECTS } from "@/lib/mock-data";

export const Route = createFileRoute("/manager")({
  component: ManagerDashboard,
});

const barData = PROJECTS.slice(0, 6).map((p) => ({ name: p.name.slice(0, 10), value: p.progress }));

function ManagerDashboard() {
  const user = useRequireAuth("manager");
  if (!user) return null;

  return (
    <AppShell
      role="manager"
      userName={user.name}
      roleLabel={user.roleLabel}
      pageTitle="لوحة تحكم مدير الإدارة"
      pageSubtitle="نظرة عامة على مشاريع الإدارة"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="نسبة التقدم العامة" value={`${KPIS_MANAGER.overall}%`} delta="4%" icon={<TrendingUp className="h-4 w-4" />} tone="primary" spark={[52,58,62,66,70,72]} updated="اليوم 09:20" />
        <StatCard label="إجمالي المشاريع" value={KPIS_MANAGER.total} unit="مشروع" delta="2 مشاريع" icon={<Briefcase className="h-4 w-4" />} tone="primary" spark={[9,10,11,12,13,14]} updated="اليوم 09:20" />
        <StatCard label="قيد التنفيذ" value={KPIS_MANAGER.inProgress} unit="مشروع" delta="1 مشروع" icon={<Hourglass className="h-4 w-4" />} tone="warning" spark={[6,7,8,9,10,10]} updated="اليوم 09:20" />
        <StatCard label="مكتملة" value={KPIS_MANAGER.completed} unit="مشروع" delta="1 مشروع" icon={<CheckCircle2 className="h-4 w-4" />} tone="success" spark={[1,1,2,2,3,3]} updated="اليوم 09:20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="نسبة تقدم المشاريع" />
          <div className="px-5 pb-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#667085" }} />
                <YAxis tick={{ fontSize: 12, fill: "#667085" }} unit="%" domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="value" fill="#00573F" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="أحدث المشاريع" action={<Link to="/projects" className="text-xs text-primary hover:underline">عرض الكل</Link>} />
          <div className="px-2 pb-3 overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th className="text-right px-3 py-2 font-medium">المشروع</th>
                  <th className="text-right px-3 py-2 font-medium">نسبة التقدم</th>
                  <th className="text-right px-3 py-2 font-medium">الحالة</th>
                  <th className="text-right px-3 py-2 font-medium">التحديث</th>
                </tr>
              </thead>
              <tbody>
                {PROJECTS.slice(0, 5).map((p) => (
                  <tr key={p.id} className="border-t border-border hover:bg-accent/40">
                    <td className="px-3 py-3 font-medium">
                      <Link to="/projects/$id" params={{ id: String(p.id) }} className="hover:text-primary">{p.name}</Link>
                    </td>
                    <td className="px-3 py-3 w-32">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={p.progress} tone={p.status === "متأخرة" ? "danger" : p.status === "مكتملة" ? "success" : "primary"} />
                        <span className="text-xs text-muted-foreground w-9">{p.progress}%</span>
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
      </div>

      <Card>
        <CardHeader title="التقارير" action={<Link to="/reports" className="text-xs text-primary hover:underline">عرض جميع التقارير</Link>} />
        <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {["تقرير الأداء الشهري", "تقرير المخاطر الاستراتيجية", "تقرير أداء الشركات"].map((r) => (
            <button key={r} className="text-right flex items-center justify-between px-4 py-3 rounded-lg border border-border text-sm hover:bg-accent">
              <span>{r}</span>
              <span className="text-muted-foreground text-xs">تنزيل</span>
            </button>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
