import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, CheckCircle2, Hourglass, TrendingUp } from "lucide-react";
import { AppShell, useRequireAuth } from "@/components/app-shell";
import { PerformanceBarChart } from "@/components/dashboard-charts";
import { Card, CardHeader, StatCard, ProgressBar, StatusBadge } from "@/components/ui-bits";
import { KPIS_MANAGER, PROJECTS } from "@/lib/mock-data";
import { downloadDocument } from "@/lib/portal-store";

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
      pageTitle="متابعة معايير الإنجاز"
      pageSubtitle="نظرة عامة على مشاريع الإدارة"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="نسبة التقدم العامة" value={`${KPIS_MANAGER.overall}%`} delta="4%" icon={<TrendingUp className="h-4 w-4" />} tone="primary" spark={[52,58,62,66,70,72]} updated="اليوم 09:20" />
        <StatCard label="إجمالي المشاريع" value={KPIS_MANAGER.total} unit="مشروع" delta="2 مشاريع" icon={<Briefcase className="h-4 w-4" />} tone="primary" spark={[9,10,11,12,13,14]} updated="اليوم 09:20" />
        <StatCard label="قيد التنفيذ" value={KPIS_MANAGER.inProgress} unit="مشروع" delta="1 مشروع" icon={<Hourglass className="h-4 w-4" />} tone="warning" spark={[6,7,8,9,10,10]} updated="اليوم 09:20" />
        <StatCard label="مكتملة" value={KPIS_MANAGER.completed} unit="مشروع" delta="1 مشروع" icon={<CheckCircle2 className="h-4 w-4" />} tone="success" spark={[1,1,2,2,3,3]} updated="اليوم 09:20" />
      </div>

      <div className="grid grid-cols-1 gap-5">
        <Card className="overflow-hidden">
          <CardHeader title="نسبة تقدم المشاريع" subtitle="مقارنة مستوى الإنجاز لأبرز مشاريع الإدارة" action={<span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">6 مشاريع</span>} />
          <div className="px-4 pb-5 h-[350px]">
            <PerformanceBarChart layout="vertical" data={barData} label="نسبة التقدم" />
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
