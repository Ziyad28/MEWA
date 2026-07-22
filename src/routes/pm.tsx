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
  
  const inProgress = myProjects.filter(p => p.status === "قيد التنفيذ").length;
  const completed = myProjects.filter(p => p.status === "مكتملة").length;
  const delayedProjects = myProjects.filter(p => p.status === "متأخرة");
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
        <StatCard label="إجمالي المشاريع" value={myProjects.length} icon={<FolderKanban className="h-4 w-4" />} tone="primary" />
        <StatCard label="قيد التنفيذ" value={inProgress} icon={<Clock className="h-4 w-4" />} tone="warning" />
        <StatCard label="مكتملة" value={completed} icon={<CheckCircle2 className="h-4 w-4" />} tone="success" />
        <StatCard label="متأخرة" value={delayed} icon={<AlertCircle className="h-4 w-4" />} tone="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader title="مستوى إنجاز المشاريع" subtitle="مقارنة بصرية لنسبة الإنجاز الفعلية لمشاريعك" />
          <div className="px-4 pb-5 h-[350px]">
            {barData.length > 0 ? (
              <PerformanceBarChart layout="vertical" data={barData} label="نسبة الإنجاز" />
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">لا توجد مشاريع مضافة</div>
            )}
          </div>
        </Card>

        <Card className="flex flex-col overflow-hidden">
          <CardHeader 
            title="تنبيهات عاجلة" 
            subtitle="مشاريع تتطلب تدخلك" 
            action={
              delayed > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/10 text-[10px] font-bold text-destructive">
                  {delayed}
                </span>
              )
            }
          />
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {delayed > 0 ? (
              delayedProjects.map(p => (
                <div key={p.id} className="p-3 rounded-xl border border-destructive/20 bg-destructive/5 flex flex-col gap-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-1 h-full bg-destructive"></div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <BellRing className="h-4 w-4 text-destructive" />
                      <span className="font-semibold text-sm text-foreground">{p.name}</span>
                    </div>
                    <Badge tone="danger">متأخر</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex justify-between items-center">
                    <span>نسبة الإنجاز: {p.progress}%</span>
                    <Link to="/projects/$id" params={{ id: String(p.id) }} className="text-destructive hover:underline inline-flex items-center gap-1 font-medium">
                      عرض المشروع <ArrowLeft className="h-3 w-3 rtl:rotate-180" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <h3 className="font-semibold text-sm mb-1 text-foreground">الوضع سليم</h3>
                <p className="text-xs text-muted-foreground">لا توجد مشاريع متأخرة حالياً.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
