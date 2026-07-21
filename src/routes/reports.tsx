import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Download, FileBarChart2 } from "lucide-react";
import { AppShell, useRequireAnyPermission } from "@/components/app-shell";
import { Card, Badge, EmptyState } from "@/components/ui-bits";
import { REPORTS } from "@/lib/mock-data";
import { downloadDocument, usePortalData } from "@/lib/portal-store";
import { can, scopeProjects } from "@/lib/access-control";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
  head: () => ({ meta: [{ title: "التقارير — المنصة الذكية لإدارة الشركات والمشاريع" }] }),
});

function ReportsPage() {
  const user = useRequireAnyPermission(["reports.viewPortfolio", "reports.viewAssigned"]);
  const { projects } = usePortalData();
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const visibleReports = useMemo(() => {
    if (!user) return [];
    if (can(user.role, "reports.viewPortfolio")) return REPORTS;
    if (!can(user.role, "reports.viewAssigned")) return [];
    return scopeProjects(user, projects).map((project) => ({
      id: 10000 + project.id,
      name: `تقرير مشروع ${project.name}`,
      type: "تقرير مشروع",
      period: "أحدث حالة",
      date: project.updated,
      size: "—",
    }));
  }, [projects, user]);
  const types = useMemo(
    () => Array.from(new Set(visibleReports.map((r) => r.type))),
    [visibleReports],
  );

  const filtered = useMemo(
    () =>
      visibleReports.filter((r) => {
        if (q && !r.name.includes(q)) return false;
        if (type !== "all" && r.type !== type) return false;
        return true;
      }),
    [q, type, visibleReports],
  );

  if (!user) return null;

  return (
    <AppShell
      role={user.role}
      userName={user.name}
      roleLabel={user.roleLabel}
      pageTitle="التقارير"
      pageSubtitle="التقارير الدورية والاستراتيجية للمشاريع التقنية"
    >
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث في التقارير"
              className="w-full h-11 pr-10 pl-3 rounded-lg border border-border bg-background text-sm"
            />
          </div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-11 px-3 rounded-lg border border-border bg-background text-sm"
          >
            <option value="all">كل الأنواع</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={<FileBarChart2 className="h-6 w-6" />} title="لا توجد تقارير مطابقة" />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <Card key={r.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileBarChart2 className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge tone="primary">{r.type}</Badge>
                  </div>
                  <h3 className="font-semibold text-foreground">{r.name}</h3>
                  <div className="mt-1 text-xs text-muted-foreground">الفترة: {r.period}</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {r.date} · {r.size}
                </span>
                <button
                  onClick={() =>
                    downloadDocument({
                      id: r.id,
                      name: r.name,
                      type: r.type,
                      uploadedBy: "مكتب إدارة المشاريع",
                      date: r.date,
                      size: r.size,
                    })
                  }
                  className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline"
                >
                  <Download className="h-3.5 w-3.5" /> تنزيل
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
