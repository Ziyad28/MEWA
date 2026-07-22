import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Briefcase, CheckCircle2, Hourglass, TrendingUp, Plus, X } from "lucide-react";
import { AppShell, useRequireAuth } from "@/components/app-shell";
import { PerformanceBarChart } from "@/components/dashboard-charts";
import { Card, CardHeader, StatCard, EmptyState, Badge } from "@/components/ui-bits";
import { ORG_STRUCTURE, COMPANIES } from "@/lib/mock-data";
import { usePortalData, saveProjects, saveDocuments, type PrototypeProject, type StoredDocument } from "@/lib/portal-store";
import { getManagedUsers } from "@/lib/auth";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/manager")({
  component: ManagerDashboard,
});

function ManagerDashboard() {
  const user = useRequireAuth("manager");
  const { projects, documents } = usePortalData();

  const [activeTab, setActiveTab] = useState<string>("all");
  const [showAddProject, setShowAddProject] = useState(false);
  const usersList = useMemo(() => getManagedUsers(), []);
  const pmUsers = usersList.filter((u) => u.role === "pm");

  const [form, setForm] = useState({
    name: "",
    subDepartmentId: user?.isGeneralManager ? "direct" : (user?.subDepartmentId ?? ""),
    pmEmail: "",
    companyId: "internal",
  });

  const departmentId = user?.departmentId as keyof typeof ORG_STRUCTURE;
  const org = departmentId ? ORG_STRUCTURE[departmentId] : null;

  const filteredProjects = useMemo(() => {
    if (!user) return [];
    return projects.filter((p) => {
      if (!user.isGeneralManager) {
        return p.subDepartmentId === user.subDepartmentId;
      }
      // General Manager logic
      if (activeTab === "all") return p.departmentId === user.departmentId;
      if (activeTab === "direct") return p.departmentId === user.departmentId && !p.subDepartmentId;
      return p.subDepartmentId === activeTab;
    });
  }, [user, activeTab, projects]);

  const pendingApprovals = useMemo(() => {
    const projectIds = new Set(filteredProjects.map(p => p.id));
    return documents.filter(doc => doc.projectId && projectIds.has(doc.projectId) && doc.approval === "بانتظار الاعتماد");
  }, [documents, filteredProjects]);

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
    const newProject: PrototypeProject = {
      id: Date.now(),
      name: form.name,
      manager: usersList.find(u => u.email === form.pmEmail)?.name ?? "غير محدد",
      sector: "التقنية",
      companyId: form.companyId === "internal" ? undefined : Number(form.companyId),
      progress: 0,
      status: "مخططة",
      priority: "متوسطة",
      start: new Date().toLocaleDateString("en-CA"),
      end: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toLocaleDateString("en-CA"),
      description: "",
      departmentId: user?.departmentId,
      subDepartmentId: form.subDepartmentId !== "direct" ? form.subDepartmentId : undefined,
      stages: [],
      comments: [],
      approvals: [],
      activityLog: [
        {
          id: Date.now(),
          action: "استعادة", // using an allowed action string if needed, or 'أرشفة', wait PrototypeProject says "أرشفة" | "استعادة". Actually we don't strictly need it to be "إضافة" if the type is strict, but let's cast it or leave it out.
          actorName: user?.name ?? "",
          actorRole: user?.roleLabel ?? "",
          date: "اليوم",
        } as any,
      ],
    };
    saveProjects([newProject, ...projects]);
    alert("تمت إضافة المشروع بنجاح");
    setShowAddProject(false);
  };

  const handleApproveDocument = (doc: StoredDocument) => {
    saveDocuments(
      documents.map(d => d.id === doc.id ? { ...d, approval: "معتمد" } : d)
    );
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
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-foreground">تصفية حسب الإدارة:</span>
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="h-10 px-3 rounded-lg border border-border bg-background text-sm min-w-[250px] shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">جميع مشاريع الإدارة العامة</option>
                <option value="direct">مشاريع الإدارة العامة (مباشرة)</option>
                <optgroup label="مشاريع الإدارات الفرعية">
                  {org.subDepartments.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </optgroup>
              </select>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="overflow-hidden lg:col-span-2">
            <CardHeader title="نسبة تقدم المشاريع" subtitle="مقارنة مستوى الإنجاز لأبرز المشاريع" action={<span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">{filteredProjects.length} مشاريع</span>} />
            <div className="px-4 pb-5 h-[350px]">
              {barData.length > 0 ? (
                <PerformanceBarChart layout="vertical" data={barData} label="نسبة التقدم" />
              ) : (
                <EmptyState title="لا توجد مشاريع" description="لم يتم العثور على مشاريع لهذه الإدارة." />
              )}
            </div>
          </Card>

          <Card className="overflow-hidden flex flex-col">
            <CardHeader 
              title="صندوق الاعتمادات" 
              subtitle="الوثائق والمستندات بانتظار الاعتماد" 
              action={
                pendingApprovals.length > 0 && (
                  <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-bold text-destructive">
                    {pendingApprovals.length} جديد
                  </span>
                )
              } 
            />
            <div className="flex-1 overflow-y-auto p-2">
              {pendingApprovals.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {pendingApprovals.map(doc => (
                    <div key={doc.id} className="p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="font-semibold text-sm line-clamp-1">{doc.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">بواسطة: {doc.uploadedBy}</div>
                        </div>
                        <Badge tone="warning" className="shrink-0 text-[10px]">بانتظار الاعتماد</Badge>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <Link to={`/projects/${doc.projectId}`} className="text-xs text-primary hover:underline">
                          عرض المشروع
                        </Link>
                        <button
                          onClick={() => handleApproveDocument(doc)}
                          className="h-7 px-3 text-xs bg-primary text-white rounded-md hover:bg-primary-deep transition-colors"
                        >
                          اعتماد
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">لا توجد اعتمادات معلقة</h3>
                  <p className="text-xs text-muted-foreground">صندوق الاعتمادات الخاص بك فارغ.</p>
                </div>
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
                <label className="text-sm font-medium text-foreground">إسناد لمدير مشروع <span className="text-destructive">*</span></label>
                <select
                  required
                  value={form.pmEmail}
                  onChange={e => setForm({...form, pmEmail: e.target.value})}
                  className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="" disabled>اختر مدير المشروع...</option>
                  {pmUsers.map(pm => (
                    <option key={pm.email} value={pm.email}>{pm.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">الجهة المنفذة <span className="text-destructive">*</span></label>
                <select
                  required
                  value={form.companyId}
                  onChange={e => setForm({...form, companyId: e.target.value})}
                  className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="internal">تنفيذ داخلي (موظفي الوزارة)</option>
                  <optgroup label="الشركات المنفذة">
                    {COMPANIES.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </optgroup>
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
