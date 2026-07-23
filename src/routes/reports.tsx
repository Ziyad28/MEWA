import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileDown, FileSpreadsheet, FileBarChart2 } from "lucide-react";
import { AppShell, useRequireAnyPermission } from "@/components/app-shell";
import { Card, EmptyState } from "@/components/ui-bits";
import { downloadExcel, printPdf, usePortalData } from "@/lib/portal-store";
import { scopeProjects, canAccessCompany } from "@/lib/access-control";
import { ORG_STRUCTURE } from "@/lib/mock-data";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
  head: () => ({ meta: [{ title: "التقارير — المنصة الذكية لإدارة الشركات والمشاريع" }] }),
});

function ReportsPage() {
  const user = useRequireAnyPermission(["reports.viewPortfolio", "reports.viewAssigned"]);
  const { projects, companies } = usePortalData();
  const [projectFilter, setProjectFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");

  const scopedProjects = useMemo(() => {
    if (!user) return [];
    return scopeProjects(user, projects);
  }, [projects, user]);

  const scopedCompanies = useMemo(() => {
    if (!user) return [];
    if (user.role === "pm") {
      return companies.filter((company) => canAccessCompany(user, company.id, projects));
    }
    return companies.filter((company) => !company.archived);
  }, [companies, projects, user]);

  const filteredProjects = useMemo(() => {
    const now = new Date();
    return scopedProjects.filter((p) => {
      // Department Filter
      if (deptFilter !== "all") {
        if (deptFilter === "direct" && p.subDepartmentId) return false;
        if (deptFilter !== "direct" && p.subDepartmentId !== deptFilter) return false;
      }

      // Status/Date Filter
      const pStart = new Date(p.start);
      if (projectFilter === "last_month") {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        if (pStart < lastMonth || pStart >= thisMonth) return false;
      }
      if (projectFilter === "next_month") {
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const monthAfterNext = new Date(now.getFullYear(), now.getMonth() + 2, 1);
        if (pStart < nextMonth || pStart >= monthAfterNext) return false;
      }
      if (projectFilter === "active") {
        if (p.status !== "قيد التنفيذ") return false;
      }
      return true;
    });
  }, [scopedProjects, projectFilter, deptFilter]);

  if (!user) return null;

  const org = user.departmentId
    ? ORG_STRUCTURE[user.departmentId as keyof typeof ORG_STRUCTURE]
    : null;

  return (
    <AppShell
      role={user.role}
      userName={user.name}
      roleLabel={user.roleLabel}
      pageTitle="التقارير والإحصائيات"
      pageSubtitle="تصدير تقارير المشاريع والشركات بصيغ متعددة"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Projects Report Card */}
        <Card className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileBarChart2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">تقرير مشاريع الوكالة</h3>
              <p className="text-sm text-muted-foreground mt-1">
                تصدير بيانات جميع المشاريع وحالتها ونسبة إنجازها.
              </p>
            </div>
          </div>

          <div className="mb-6 space-y-3">
            {user.isGeneralManager && org && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">تصفية حسب الإدارة</label>
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm"
                >
                  <option value="all">جميع مشاريع الإدارة العامة</option>
                  <option value="direct">{org.name} (مباشر)</option>
                  {org.subDepartments.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">تصفية حسب الحالة</label>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm"
              >
                <option value="all">الكل ({filteredProjects.length})</option>
                <option value="active">قيد التنفيذ فقط</option>
                <option value="last_month">بدأت الشهر الماضي</option>
                <option value="next_month">تبدأ الشهر القادم</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                downloadExcel(`مشاريع_${projectFilter}.xls`, [
                  [
                    "اسم المشروع",
                    "مدير المشروع",
                    "الحالة",
                    "الأولوية",
                    "الإنجاز",
                    "البداية",
                    "النهاية",
                  ],
                  ...filteredProjects.map((p) => [
                    p.name,
                    p.manager,
                    p.status,
                    p.priority,
                    `${p.progress}%`,
                    p.start,
                    p.end,
                  ]),
                ])
              }
              className="flex-1 h-10 rounded-lg bg-green-600/10 text-green-700 hover:bg-green-600 hover:text-white transition-colors font-semibold inline-flex items-center justify-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" /> تصدير Excel
            </button>
            <button
              onClick={() =>
                printPdf("تقرير مشاريع الوكالة", [
                  ["المشروع", "المدير", "الحالة", "الإنجاز"],
                  ...filteredProjects.map((p) => [p.name, p.manager, p.status, `${p.progress}%`]),
                ])
              }
              className="flex-1 h-10 rounded-lg bg-red-600/10 text-red-700 hover:bg-red-600 hover:text-white transition-colors font-semibold inline-flex items-center justify-center gap-2"
            >
              <FileDown className="h-4 w-4" /> تصدير PDF
            </button>
          </div>
        </Card>

        {/* Companies Report Card */}
        <Card className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileBarChart2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">تقرير الشركات التقنية</h3>
              <p className="text-sm text-muted-foreground mt-1">
                تصدير بيانات جميع الشركات المتعاونة مع تفاصيل التعاقد.
              </p>
            </div>
          </div>

          <div className="mb-6 space-y-2">
            <label className="text-xs font-medium text-foreground">إجمالي الشركات</label>
            <div className="w-full h-11 px-3 rounded-lg border border-border bg-accent text-sm flex items-center text-muted-foreground">
              سيتم تصدير {scopedCompanies.length} شركة
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                downloadExcel("الشركات_التقنية.xls", [
                  [
                    "اسم الشركة",
                    "حالة الشركة",
                    "متوسط الإنجاز",
                    "بداية العقد",
                    "نهاية العقد",
                    "البريد الإلكتروني",
                  ],
                  ...scopedCompanies.map((c) => {
                    const companyProjects = projects.filter((p) => p.companyId === c.id);
                    const avgProgress =
                      companyProjects.length > 0
                        ? Math.round(
                            companyProjects.reduce((acc, p) => acc + p.progress, 0) /
                              companyProjects.length,
                          )
                        : 0;
                    return [
                      c.name,
                      c.status,
                      `${avgProgress}%`,
                      c.contractStart,
                      c.contractEnd,
                      c.email,
                    ];
                  }),
                ])
              }
              className="flex-1 h-10 rounded-lg bg-green-600/10 text-green-700 hover:bg-green-600 hover:text-white transition-colors font-semibold inline-flex items-center justify-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" /> تصدير Excel
            </button>
            <button
              onClick={() =>
                printPdf("تقرير الشركات التقنية", [
                  ["الشركة", "الحالة", "متوسط الإنجاز", "نهاية العقد"],
                  ...scopedCompanies.map((c) => {
                    const companyProjects = projects.filter((p) => p.companyId === c.id);
                    const avgProgress =
                      companyProjects.length > 0
                        ? Math.round(
                            companyProjects.reduce((acc, p) => acc + p.progress, 0) /
                              companyProjects.length,
                          )
                        : 0;
                    return [c.name, c.status, `${avgProgress}%`, c.contractEnd];
                  }),
                ])
              }
              className="flex-1 h-10 rounded-lg bg-red-600/10 text-red-700 hover:bg-red-600 hover:text-white transition-colors font-semibold inline-flex items-center justify-center gap-2"
            >
              <FileDown className="h-4 w-4" /> تصدير PDF
            </button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
