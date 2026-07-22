import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileDown, FileSpreadsheet, FileBarChart2 } from "lucide-react";
import { AppShell, useRequireAnyPermission } from "@/components/app-shell";
import { Card, EmptyState } from "@/components/ui-bits";
import { downloadExcel, printPdf, usePortalData } from "@/lib/portal-store";
import { scopeProjects, canAccessCompany } from "@/lib/access-control";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
  head: () => ({ meta: [{ title: "التقارير — المنصة الذكية لإدارة الشركات والمشاريع" }] }),
});

function ReportsPage() {
  const user = useRequireAnyPermission(["reports.viewPortfolio", "reports.viewAssigned"]);
  const { projects, companies } = usePortalData();
  const [projectFilter, setProjectFilter] = useState("all");

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
      const pStart = new Date(p.start);
      if (projectFilter === "last_month") {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return pStart >= lastMonth && pStart < thisMonth;
      }
      if (projectFilter === "next_month") {
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const monthAfterNext = new Date(now.getFullYear(), now.getMonth() + 2, 1);
        return pStart >= nextMonth && pStart < monthAfterNext;
      }
      if (projectFilter === "active") {
        return p.status === "قيد التنفيذ";
      }
      return true;
    });
  }, [scopedProjects, projectFilter]);

  if (!user) return null;

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

          <div className="mb-6 space-y-2">
            <label className="text-xs font-medium text-foreground">تصفية المشاريع</label>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm"
            >
              <option value="all">الكل ({scopedProjects.length})</option>
              <option value="active">قيد التنفيذ فقط</option>
              <option value="last_month">بدأت الشهر الماضي</option>
              <option value="next_month">تبدأ الشهر القادم</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                downloadExcel(`مشاريع_${projectFilter}.xls`, [
                  [
                    "اسم المشروع",
                    "القطاع",
                    "مدير المشروع",
                    "الحالة",
                    "الأولوية",
                    "الإنجاز",
                    "الصحة",
                    "البداية",
                    "النهاية",
                  ],
                  ...filteredProjects.map((p) => [
                    p.name,
                    p.sector,
                    p.manager,
                    p.status,
                    p.priority,
                    `${p.progress}%`,
                    `${p.health}%`,
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
                  ["المشروع", "القطاع", "المدير", "الحالة", "الإنجاز"],
                  ...filteredProjects.map((p) => [p.name, p.sector, p.manager, p.status, `${p.progress}%`]),
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
                    "القطاع",
                    "حالة الشركة",
                    "الأداء",
                    "بداية العقد",
                    "نهاية العقد",
                    "البريد الإلكتروني",
                  ],
                  ...scopedCompanies.map((c) => [
                    c.name,
                    c.sector,
                    c.status,
                    `${c.performance}%`,
                    c.contractStart,
                    c.contractEnd,
                    c.email,
                  ]),
                ])
              }
              className="flex-1 h-10 rounded-lg bg-green-600/10 text-green-700 hover:bg-green-600 hover:text-white transition-colors font-semibold inline-flex items-center justify-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" /> تصدير Excel
            </button>
            <button
              onClick={() =>
                printPdf("تقرير الشركات التقنية", [
                  ["الشركة", "القطاع", "الحالة", "الأداء", "نهاية العقد"],
                  ...scopedCompanies.map((c) => [c.name, c.sector, c.status, `${c.performance}%`, c.contractEnd]),
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
