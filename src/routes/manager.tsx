import { createFileRoute } from "@tanstack/react-router";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { AppShell, useRequireAuth } from "@/components/app-shell";
import { Card, CardHeader, Badge, ProgressBar } from "@/components/ui-bits";
import { KPIS_MANAGER, PROJECTS } from "@/lib/mock-data";

export const Route = createFileRoute("/manager")({
  component: ManagerDashboard,
});

const barData = PROJECTS.slice(0, 4).map((p, i) => ({
  name: `مشروع ${i + 1}`,
  value: p.progress,
}));

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
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">نسبة التقدم العامة</div>
          <div className="mt-2 text-3xl font-bold text-primary">{KPIS_MANAGER.overall}%</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">مكتملة</div>
          <div className="mt-2 text-3xl font-bold text-foreground">{KPIS_MANAGER.completed}</div>
          <div className="text-xs text-muted-foreground mt-1">مشروع</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">قيد التنفيذ</div>
          <div className="mt-2 text-3xl font-bold text-foreground">{KPIS_MANAGER.inProgress}</div>
          <div className="text-xs text-muted-foreground mt-1">مشروع</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">إجمالي المشاريع</div>
          <div className="mt-2 text-3xl font-bold text-foreground">{KPIS_MANAGER.total}</div>
          <div className="text-xs text-muted-foreground mt-1">مشروع</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="نسبة تقدم المشاريع" />
          <div className="px-5 pb-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f0" />
                <XAxis dataKey="name" reversed tick={{ fontSize: 12, fill: "#667085" }} />
                <YAxis tick={{ fontSize: 12, fill: "#667085" }} unit="%" />
                <Tooltip />
                <Bar dataKey="value" fill="#005D45" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="أحدث المشاريع" action={<a href="#" className="text-xs text-primary hover:underline">عرض</a>} />
          <div className="px-2 pb-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th className="text-right px-3 py-2 font-medium">المشروع</th>
                  <th className="text-right px-3 py-2 font-medium">نسبة التقدم</th>
                  <th className="text-right px-3 py-2 font-medium">الحالة</th>
                  <th className="text-right px-3 py-2 font-medium">تاريخ التحديث</th>
                </tr>
              </thead>
              <tbody>
                {PROJECTS.slice(0, 4).map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-3 py-3">{p.name}</td>
                    <td className="px-3 py-3 w-32">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={p.progress} />
                        <span className="text-xs text-muted-foreground w-9">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={p.status === "مكتملة" ? "success" : p.status === "متأخرة" ? "danger" : "warning"}>{p.status}</Badge>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{p.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="التقارير" action={<a href="#" className="text-xs text-primary hover:underline">عرض جميع التقارير</a>} />
        <div className="px-5 pb-5">
          <button className="w-full sm:w-auto flex items-center justify-between gap-8 px-4 py-2.5 rounded-lg border border-border text-sm text-right hover:bg-accent">
            <span>تقرير الأداء الشهري</span>
            <span className="text-muted-foreground text-xs">↓</span>
          </button>
        </div>
      </Card>
    </AppShell>
  );
}
