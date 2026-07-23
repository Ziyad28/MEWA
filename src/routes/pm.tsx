import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderKanban, CheckCircle2, AlertCircle, Clock, BellRing, ArrowLeft } from "lucide-react";
import { AppShell, useRequireAuth } from "@/components/app-shell";
import { Card, CardHeader, StatCard, Badge } from "@/components/ui-bits";
import { PerformanceBarChart } from "@/components/dashboard-charts";
import { usePortalData } from "@/lib/portal-store";

export const Route = createFileRoute("/pm")({
  component: PmDashboard,
});

function PmDashboard() {
  const user = useRequireAuth("pm");
  const { projects } = usePortalData();
  if (!user) return null;

  // PM sees only their assigned projects
  const myProjects = projects.filter((p) => p.manager === user.name);

  const inProgress = myProjects.filter((p) => p.status === "قيد التنفيذ").length;
  const completed = myProjects.filter((p) => p.status === "مكتملة").length;
  const delayedProjects = myProjects.filter((p) => p.status === "متأخرة");
  const delayed = delayedProjects.length;

  const barData = myProjects.map((p) => ({ name: p.name, value: p.progress }));

  return (
    <AppShell
      role="pm"
      userName={user.name}
      roleLabel={user.roleLabel}
      pageTitle="لوحة القيادة"
      pageSubtitle="نظرة عامة على حالة المشاريع والتنبيهات"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="إجمالي المشاريع"
          value={myProjects.length}
          icon={<FolderKanban className="h-4 w-4" />}
          tone="primary"
        />
        <StatCard
          label="قيد التنفيذ"
          value={inProgress}
          icon={<Clock className="h-4 w-4" />}
          tone="warning"
        />
        <StatCard
          label="مكتملة"
          value={completed}
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="success"
        />
        <StatCard
          label="متأخرة"
          value={delayed}
          icon={<AlertCircle className="h-4 w-4" />}
          tone="danger"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 mt-5">
        <Card className="overflow-hidden">
          <CardHeader
            title="مستوى إنجاز المشاريع"
            subtitle="مقارنة بصرية لنسبة الإنجاز الفعلية لمشاريعك"
          />
          <div className="px-4 pb-5 h-[350px]">
            {barData.length > 0 ? (
              <PerformanceBarChart layout="vertical" data={barData} label="نسبة الإنجاز" />
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                لا توجد مشاريع مضافة
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
