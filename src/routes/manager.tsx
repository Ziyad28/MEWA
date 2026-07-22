import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Briefcase, CheckCircle2, Hourglass, TrendingUp, Plus, X } from "lucide-react";
import { AppShell, useRequireAuth } from "@/components/app-shell";
import { PerformanceBarChart } from "@/components/dashboard-charts";
import { Card, CardHeader, StatCard, EmptyState } from "@/components/ui-bits";
import { ORG_STRUCTURE, PROJECTS, SECTORS, type Sector } from "@/lib/mock-data";

export const Route = createFileRoute("/manager")({
  component: ManagerDashboard,
});

function ManagerDashboard() {
  const user = useRequireAuth("manager");

  const [activeTab, setActiveTab] = useState<string>("all");
  const [showAddProject, setShowAddProject] = useState(false);
  const [form, setForm] = useState({
    name: "",
    sector: "المياه" as Sector,
    subDepartmentId: user?.isGeneralManager ? "direct" : (user?.subDepartmentId ?? ""),
  });

  const departmentId = user?.departmentId as keyof typeof ORG_STRUCTURE;
  const org = departmentId ? ORG_STRUCTURE[departmentId] : null;

  const filteredProjects = useMemo(() => {
    if (!user) return [];
    return PROJECTS.filter((p) => {
      if (!user.isGeneralManager) {
        return p.subDepartmentId === user.subDepartmentId;
      }
      // General Manager logic
      if (activeTab === "all") return p.departmentId === user.departmentId;
      if (activeTab === "direct") return p.departmentId === user.departmentId && !p.subDepartmentId;
      return p.subDepartmentId === activeTab;
    });
  }, [user, activeTab]);

  const stats = useMemo(() => {
    const total = filteredProjects.length;
    const completed = filteredProjects.filter(p => p.status === "مكتملة").length;
    const inProgress = filteredProjects.filter(p => p.status === "قيد التنفيذ").length;
    const avgProgress = total > 0 ? Math.round(filteredProjects.reduce((acc, p) => acc + p.progress, 0) / total) : 0;
    return { total, completed, inProgress, overall: avgProgress };
  }, [filteredProjects]);

  const barData = useMemo(() => {
    return filteredProjects.slice(0, 6).map((p) => ({ name: p.name, value: p.progress }));
  }, [filteredProjects]);

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate adding project
    alert("تمت إضافة المشروع بنجاح");
    setShowAddProject(false);
  };

  if (!user) return null;

  return (
    <AppShell
      role="manager"
      userName={user.name}
      roleLabel={user.roleLabel}
      pageTitle="متابعة معايير الإنجاز"
      pageSubtitle="نظرة عامة على مشاريع الإدارة"
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {user.isGeneralManager && org ? (
            <div className="flex flex-wrap bg-white rounded-lg border border-border p-1 gap-1">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "all" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setActiveTab("direct")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "direct" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {org.name} (مباشر)
              </button>
              {org.subDepartments.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setActiveTab(sub.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === sub.id ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          ) : (
            <div></div> // empty spacer
          )}

          <button
            onClick={() => setShowAddProject(true)}
            className="h-10 px-4 rounded-lg bg-primary-deep text-white text-sm inline-flex items-center gap-2 hover:bg-primary shadow-sm"
          >
            <Plus className="h-4 w-4" /> إضافة مشروع
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="نسبة التقدم العامة" value={`${stats.overall}%`} icon={<TrendingUp className="h-4 w-4" />} tone="primary" />
          <StatCard label="إجمالي المشاريع" value={stats.total} unit="مشروع" icon={<Briefcase className="h-4 w-4" />} tone="primary" />
          <StatCard label="قيد التنفيذ" value={stats.inProgress} unit="مشروع" icon={<Hourglass className="h-4 w-4" />} tone="warning" />
          <StatCard label="مكتملة" value={stats.completed} unit="مشروع" icon={<CheckCircle2 className="h-4 w-4" />} tone="success" />
        </div>

        <div className="grid grid-cols-1 gap-5">
          <Card className="overflow-hidden">
            <CardHeader title="نسبة تقدم المشاريع" subtitle="مقارنة مستوى الإنجاز لأبرز المشاريع" action={<span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">{filteredProjects.length} مشاريع</span>} />
            <div className="px-4 pb-5 h-[350px]">
              {barData.length > 0 ? (
                <PerformanceBarChart layout="vertical" data={barData} label="نسبة التقدم" />
              ) : (
                <EmptyState title="لا توجد مشاريع" description="لم يتم العثور على مشاريع لهذه الإدارة." />
              )}
            </div>
          </Card>
        </div>
      </div>

      {showAddProject && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg border border-border w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <h2 className="text-lg font-bold text-foreground">إضافة مشروع جديد</h2>
              <button onClick={() => setShowAddProject(false)} className="h-8 w-8 rounded-full hover:bg-muted inline-flex items-center justify-center text-muted-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleAddProject} className="p-5 flex flex-col gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">اسم المشروع <span className="text-destructive">*</span></label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="أدخل اسم المشروع"
                />
              </div>

              {user.isGeneralManager && org ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">الإدارة الفرعية التابع لها المشروع <span className="text-destructive">*</span></label>
                  <select
                    value={form.subDepartmentId}
                    onChange={e => setForm({...form, subDepartmentId: e.target.value})}
                    className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="direct">{org.name} (مباشر)</option>
                    {org.subDepartments.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">اختر "مباشر" إذا كان المشروع يتبع للإدارة العامة ولا يندرج تحت إدارة فرعية.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">الإدارة التابع لها المشروع</label>
                  <input
                    type="text"
                    disabled
                    value={org?.subDepartments.find(s => s.id === user.subDepartmentId)?.name ?? "إدارة غير محددة"}
                    className="w-full h-10 px-3 rounded-md border border-input bg-muted/50 text-muted-foreground text-sm shadow-sm cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">يتم إسناد المشروع إلى إدارتك بشكل تلقائي.</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">القطاع</label>
                <select
                  value={form.sector}
                  onChange={e => setForm({...form, sector: e.target.value as Sector})}
                  className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddProject(false)}
                  className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-white hover:bg-primary-deep shadow-sm transition-colors"
                >
                  حفظ المشروع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
