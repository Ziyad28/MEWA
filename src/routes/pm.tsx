import { createFileRoute } from "@tanstack/react-router";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { AppShell, useRequireAuth } from "@/components/app-shell";
import { Card, CardHeader, Badge } from "@/components/ui-bits";
import { KPIS_PM, PROGRESS_SERIES, PROJECTS } from "@/lib/mock-data";

export const Route = createFileRoute("/pm")({
  component: PmDashboard,
});

function PmDashboard() {
  const user = useRequireAuth("pm");
  if (!user) return null;

  const project = PROJECTS[0];

  return (
    <AppShell
      role="pm"
      userName={user.name}
      roleLabel={user.roleLabel}
      pageTitle="لوحة تحكم مدير المشروع"
      pageSubtitle="نظرة عامة على المشروع"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">نسبة تقدم المشروع</div>
          <div className="mt-2 text-3xl font-bold text-primary">{KPIS_PM.progress}%</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">قيد التنفيذ</div>
          <div className="mt-2 text-3xl font-bold text-foreground">{KPIS_PM.inProgress}</div>
          <div className="text-xs text-muted-foreground mt-1">مهام</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">مكتملة</div>
          <div className="mt-2 text-3xl font-bold text-foreground">{KPIS_PM.completed}</div>
          <div className="text-xs text-muted-foreground mt-1">مهام</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">متأخرة</div>
          <div className="mt-2 text-3xl font-bold text-red-600">{KPIS_PM.overdue}</div>
          <div className="text-xs text-muted-foreground mt-1">مهام</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="نسبة تقدم المشروع" />
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
          <CardHeader title="معلومات المشروع" />
          <div className="px-5 pb-5 space-y-3 text-sm">
            <Row label="اسم المشروع" value={project.name} />
            <Row label="القطاع" value={project.sector} />
            <Row label="تاريخ البداية" value={project.start} />
            <Row label="تاريخ الانتهاء المخطط" value={project.end} />
            <Row label="مدير المشروع" value={user.name} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="أحدث الوثائق" />
          <div className="px-2 pb-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th className="text-right px-3 py-2 font-medium">اسم الوثيقة</th>
                  <th className="text-right px-3 py-2 font-medium">النوع</th>
                  <th className="text-right px-3 py-2 font-medium">تاريخ التحديث</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { n: "خطة المشروع v2.0", t: "خطة", d: "2025/06/15" },
                  { n: "تقرير الأداء الشهري", t: "تقرير", d: "2025/06/14" },
                  { n: "متطلبات المشروع", t: "متطلبات", d: "2025/06/12" },
                ].map((d) => (
                  <tr key={d.n} className="border-t border-border">
                    <td className="px-3 py-3">{d.n}</td>
                    <td className="px-3 py-3"><Badge tone="muted">{d.t}</Badge></td>
                    <td className="px-3 py-3 text-muted-foreground">{d.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="المهام الأخيرة" />
          <div className="px-5 pb-5 space-y-2">
            {[
              { t: "تحديث الخطة التفصيلية", done: true },
              { t: "مراجعة المتطلبات", done: true },
              { t: "اختبار التكامل", done: false },
              { t: "تدريب المستخدمين", done: false },
            ].map((task) => (
              <label key={task.t} className="flex items-center gap-3 py-2 border-b border-border last:border-0 text-sm">
                <input type="checkbox" defaultChecked={task.done} className="h-4 w-4 rounded border-border accent-primary" />
                <span className={task.done ? "text-muted-foreground line-through" : "text-foreground"}>{task.t}</span>
              </label>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 border-b border-border/50 last:border-0">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-medium text-foreground">{value}</div>
    </div>
  );
}
