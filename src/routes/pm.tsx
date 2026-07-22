import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderKanban, CheckCircle2, AlertCircle, Clock, FileText, ChevronLeft } from "lucide-react";
import { AppShell, useRequireAuth } from "@/components/app-shell";
import { Card, CardHeader, StatCard, Badge, ProgressBar } from "@/components/ui-bits";
import { usePortalData } from "@/lib/portal-store";

export const Route = createFileRoute("/pm")({
  component: PmDashboard,
});

function PmDashboard() {
  const user = useRequireAuth("pm");
  const { projects, documents } = usePortalData();
  if (!user) return null;

  // PM sees only their assigned projects
  const myProjects = projects.filter((p) => p.manager === user.name);
  
  const inProgress = myProjects.filter(p => p.status === "قيد التنفيذ").length;
  const completed = myProjects.filter(p => p.status === "مكتملة").length;
  const delayed = myProjects.filter(p => p.status === "متأخرة").length;
  
  // Get latest documents related to my projects
  const myProjectIds = myProjects.map(p => p.id);
  const myDocs = documents
    .filter(d => d.projectId && myProjectIds.includes(d.projectId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <AppShell
      role="pm"
      userName={user.name}
      roleLabel={user.roleLabel}
      pageTitle="لوحة المتابعة الشاملة"
      pageSubtitle="نظرة عامة على مشاريعك ونسب الإنجاز"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="إجمالي المشاريع" value={myProjects.length} icon={<FolderKanban className="h-4 w-4" />} tone="primary" />
        <StatCard label="قيد التنفيذ" value={inProgress} icon={<Clock className="h-4 w-4" />} tone="warning" />
        <StatCard label="مكتملة" value={completed} icon={<CheckCircle2 className="h-4 w-4" />} tone="success" />
        <StatCard label="متأخرة" value={delayed} icon={<AlertCircle className="h-4 w-4" />} tone="danger" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-5">
        <Card className="xl:col-span-2">
          <CardHeader title="مشاريعي" subtitle="متابعة النسبة الفعلية مقارنة بالمخططة" />
          <div className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-muted/30 text-muted-foreground border-y border-border">
                  <tr>
                    <th className="px-5 py-3 font-medium">المشروع</th>
                    <th className="px-5 py-3 font-medium w-48">نسبة الإنجاز</th>
                    <th className="px-5 py-3 font-medium w-32">الحالة</th>
                    <th className="px-5 py-3 font-medium w-32">الانتهاء المتوقع</th>
                    <th className="px-5 py-3 font-medium w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {myProjects.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">لا توجد مشاريع مسندة لك حالياً</td>
                    </tr>
                  ) : (
                    myProjects.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-5 py-4 font-medium text-foreground">{p.name}</td>
                        <td className="px-5 py-4">
                          <div className="space-y-1.5 pr-2">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-muted-foreground">الفعلي</span>
                              <span className="font-semibold text-foreground">{p.progress}%</span>
                            </div>
                            <ProgressBar value={p.progress} tone={p.status === "متأخرة" ? "danger" : "primary"} />
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                              <span>المخطط</span>
                              <span>{p.plannedProgress ?? p.progress}%</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <Badge tone={p.status === "قيد التنفيذ" ? "warning" : p.status === "مكتملة" ? "success" : p.status === "متأخرة" ? "danger" : "muted"}>
                            {p.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">{p.end}</td>
                        <td className="px-5 py-4 text-left">
                          <Link to="/projects/$id" params={{ id: String(p.id) }} className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted text-primary">
                            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="أحدث الوثائق" action={<Link to="/documents" className="text-xs text-primary hover:underline">عرض الكل</Link>} />
          <div className="px-5 pb-5 space-y-3">
            {myDocs.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">لا توجد وثائق مرفوعة</div>
            ) : (
              myDocs.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-card/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate text-foreground">{d.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{d.date}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
