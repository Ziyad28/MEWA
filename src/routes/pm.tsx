import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingUp, Hourglass, CheckCircle2, AlertCircle, Building2, User, Calendar, Flag, FileText } from "lucide-react";
import { AppShell, useRequireAuth } from "@/components/app-shell";
import { ProgressAreaChart } from "@/components/dashboard-charts";
import { Card, CardHeader, StatCard, Badge, HealthRing } from "@/components/ui-bits";
import { KPIS_PM, PROGRESS_SERIES, PROJECTS, COMPANIES } from "@/lib/mock-data";

export const Route = createFileRoute("/pm")({
  component: PmDashboard,
});

function PmDashboard() {
  const user = useRequireAuth("pm");
  if (!user) return null;

  // PM sees only their assigned projects
  const myProjects = PROJECTS.filter((p) => p.manager === user.name);
  const project = myProjects[0] ?? PROJECTS[1]!;
  const company = COMPANIES.find((c) => c.id === project.companyId);

  return (
    <AppShell
      role="pm"
      userName={user.name}
      roleLabel={user.roleLabel}
      pageTitle="إدارة خطة التنفيذ"
      pageSubtitle="نظرة عامة على مشاريعك"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="نسبة تقدم المشروع" value={`${KPIS_PM.progress}%`} delta="6%" icon={<TrendingUp className="h-4 w-4" />} tone="primary" spark={[45,52,58,62,66,68]} updated="اليوم 08:15" />
        <StatCard label="قيد التنفيذ" value={KPIS_PM.inProgress} unit="مهام" icon={<Hourglass className="h-4 w-4" />} tone="warning" spark={[6,8,9,10,11,12]} updated="اليوم 08:15" />
        <StatCard label="مكتملة" value={KPIS_PM.completed} unit="مهام" delta="2 مهام" icon={<CheckCircle2 className="h-4 w-4" />} tone="success" spark={[2,3,4,6,7,8]} updated="اليوم 08:15" />
        <StatCard label="متأخرة" value={KPIS_PM.overdue} unit="مهام" delta="1 مهمة" deltaType="down" icon={<AlertCircle className="h-4 w-4" />} tone="danger" spark={[6,5,5,4,4,4]} updated="اليوم 08:15" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader title="نسبة تقدم المشروع" subtitle={project.name} action={<span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">آخر 6 أشهر</span>} />
          <div className="px-4 pb-5 h-[300px]">
            <ProgressAreaChart data={PROGRESS_SERIES} />
          </div>
        </Card>

        <Card>
          <CardHeader title="معلومات المشروع" action={<Link to="/projects/$id" params={{ id: String(project.id) }} className="text-xs text-primary hover:underline">فتح المشروع</Link>} />
          <div className="px-5 pb-5 space-y-2.5 text-sm">
            <div className="flex items-center justify-center pb-2">
              <HealthRing value={project.health} size={72} />
            </div>
            <Row icon={<Flag className="h-3.5 w-3.5" />} label="اسم المشروع" value={project.name} />
            <Row icon={<Building2 className="h-3.5 w-3.5" />} label="الشركة المنفذة" value={company?.name ?? "-"} />
            <Row icon={<Flag className="h-3.5 w-3.5" />} label="القطاع" value={project.sector} />
            <Row icon={<Calendar className="h-3.5 w-3.5" />} label="البداية" value={project.start} />
            <Row icon={<Calendar className="h-3.5 w-3.5" />} label="الانتهاء" value={project.end} />
            <Row icon={<User className="h-3.5 w-3.5" />} label="مدير المشروع" value={user.name} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="أحدث الوثائق" action={<Link to="/documents" className="text-xs text-primary hover:underline">عرض الكل</Link>} />
          <div className="px-5 pb-4 space-y-2">
            {[
              { n: "خطة المشروع v2.0", t: "خطة", d: "2025/06/15" },
              { n: "تقرير الأداء الشهري", t: "تقرير", d: "2025/06/14" },
              { n: "متطلبات المشروع", t: "متطلبات", d: "2025/06/12" },
            ].map((d) => (
              <div key={d.n} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border text-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium truncate">{d.n}</div>
                    <div className="text-[11px] text-muted-foreground">{d.t} · {d.d}</div>
                  </div>
                </div>
                <Badge tone="muted">{d.t}</Badge>
              </div>
            ))}
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

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-border/50 last:border-0">
      <div className="text-muted-foreground text-xs inline-flex items-center gap-1.5">{icon}{label}</div>
      <div className="font-medium text-foreground text-xs text-left">{value}</div>
    </div>
  );
}
