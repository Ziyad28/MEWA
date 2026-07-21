import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Plus, Download, LayoutGrid, List, ArrowLeft, Sparkles } from "lucide-react";
import { AppShell, useRequireAuth } from "@/components/app-shell";
import { Card, Badge, ProgressBar, StatusBadge, HealthRing, EmptyState } from "@/components/ui-bits";
import { PROJECTS, SECTORS, COMPANIES } from "@/lib/mock-data";
import { downloadCsv } from "@/lib/portal-store";

export const Route = createFileRoute("/projects")({
  component: ProjectsPage,
  head: () => ({
    meta: [
      { title: "المشاريع — منصة إدارة المشاريع | وزارة البيئة والمياه والزراعة" },
      { name: "description", content: "قائمة المشاريع التقنية التابعة للوكالة مع بحث وفلاتر متقدمة." },
    ],
  }),
});

function ProjectsPage() {
  const user = useRequireAuth();
  const [q, setQ] = useState("");
  const [sector, setSector] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [priority, setPriority] = useState<string>("all");
  const [company, setCompany] = useState<string>("all");
  const [view, setView] = useState<"table" | "card">("table");

  const scoped = useMemo(
    () => (user?.role === "pm" ? PROJECTS.filter((p) => p.manager === user.name) : PROJECTS),
    [user]
  );

  const filtered = useMemo(() => {
    return scoped.filter((p) => {
      if (q && !p.name.includes(q) && !p.manager.includes(q)) return false;
      if (sector !== "all" && p.sector !== sector) return false;
      if (status !== "all" && p.status !== status) return false;
      if (priority !== "all" && p.priority !== priority) return false;
      if (company !== "all" && String(p.companyId) !== company) return false;
      return true;
    });
  }, [scoped, q, sector, status, priority, company]);

  if (!user) return null;
  const canAdd = user.role === "pmo";
  const isPm = user.role === "pm";

  return (
    <AppShell
      role={user.role}
      userName={user.name}
      roleLabel={user.roleLabel}
      pageTitle={isPm ? "مشاريعي" : "مشاريع الوكالة"}
      pageSubtitle={isPm ? "المشاريع التي أنت مكلّف بإدارتها" : "إدارة ومتابعة جميع المشاريع التقنية التابعة للوكالة"}
    >
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث باسم المشروع أو مدير المشروع"
              className="w-full h-11 pr-10 pl-3 rounded-lg border border-border bg-background text-sm"
            />
          </div>
          <select value={sector} onChange={(e) => setSector(e.target.value)} className="h-11 px-3 rounded-lg border border-border bg-background text-sm">
            <option value="all">كل القطاعات</option>
            {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 px-3 rounded-lg border border-border bg-background text-sm">
            <option value="all">كل الحالات</option>
            <option>قيد التنفيذ</option>
            <option>مكتملة</option>
            <option>متأخرة</option>
            <option>مخططة</option>
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="h-11 px-3 rounded-lg border border-border bg-background text-sm">
            <option value="all">كل الأولويات</option>
            <option>عالية</option>
            <option>متوسطة</option>
            <option>منخفضة</option>
          </select>
          <select value={company} onChange={(e) => setCompany(e.target.value)} className="h-11 px-3 rounded-lg border border-border bg-background text-sm">
            <option value="all">كل الشركات</option>
            {COMPANIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            عدد المشاريع: <span className="font-semibold text-foreground">{filtered.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-border p-0.5 bg-background">
              <button onClick={() => setView("table")} className={`h-8 px-3 rounded-md text-xs inline-flex items-center gap-1.5 ${view === "table" ? "bg-primary text-white" : "text-muted-foreground"}`}>
                <List className="h-3.5 w-3.5" /> جدول
              </button>
              <button onClick={() => setView("card")} className={`h-8 px-3 rounded-md text-xs inline-flex items-center gap-1.5 ${view === "card" ? "bg-primary text-white" : "text-muted-foreground"}`}>
                <LayoutGrid className="h-3.5 w-3.5" /> بطاقات
              </button>
            </div>
            <button onClick={() => downloadCsv("agency-projects.csv", [["اسم المشروع", "القطاع", "مدير المشروع", "الحالة", "الأولوية", "الإنجاز", "الصحة", "البداية", "النهاية"], ...filtered.map((p) => [p.name, p.sector, p.manager, p.status, p.priority, `${p.progress}%`, `${p.health}%`, p.start, p.end])])} className="h-9 px-3 rounded-lg border border-border bg-background text-sm inline-flex items-center gap-2 text-muted-foreground hover:bg-accent">
              <Download className="h-4 w-4" /> تصدير
            </button>
            {canAdd && (
              <button className="h-9 px-3 rounded-lg bg-primary-deep text-white text-sm inline-flex items-center gap-2 hover:bg-primary">
                <Plus className="h-4 w-4" /> إضافة مشروع
              </button>
            )}
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={<Search className="h-6 w-6" />} title="لا توجد نتائج مطابقة" description="جرّب تعديل معايير البحث أو الفلاتر." /></Card>
      ) : view === "table" ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="sticky top-0 bg-card">
                <tr className="text-xs text-muted-foreground">
                  <th className="text-right px-4 py-3 font-medium">اسم المشروع</th>
                  <th className="text-right px-4 py-3 font-medium">القطاع</th>
                  <th className="text-right px-4 py-3 font-medium">الشركة</th>
                  <th className="text-right px-4 py-3 font-medium">مدير المشروع</th>
                  <th className="text-right px-4 py-3 font-medium">الحالة</th>
                  <th className="text-right px-4 py-3 font-medium">الأولوية</th>
                  <th className="text-right px-4 py-3 font-medium">نسبة الإنجاز</th>
                  <th className="text-right px-4 py-3 font-medium">صحة المشروع</th>
                  <th className="text-right px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const c = COMPANIES.find((x) => x.id === p.companyId);
                  return (
                    <tr key={p.id} className="border-t border-border hover:bg-accent/40 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        <a href={`/projects/${p.id}`} className="hover:text-primary">
                          {p.name}
                        </a>
                      </td>
                      <td className="px-4 py-3">{p.sector}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c?.name}</td>
                      <td className="px-4 py-3">{p.manager}</td>
                      <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-3">
                        <Badge tone={p.priority === "عالية" ? "danger" : p.priority === "متوسطة" ? "warning" : "muted"}>{p.priority}</Badge>
                      </td>
                      <td className="px-4 py-3 w-40">
                        <div className="flex items-center gap-2">
                          <ProgressBar value={p.progress} tone={p.status === "متأخرة" ? "danger" : p.status === "مكتملة" ? "success" : "primary"} />
                          <span className="text-xs text-muted-foreground w-10">{p.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-semibold ${p.health >= 75 ? "text-green-600" : p.health >= 50 ? "text-amber-600" : "text-red-600"}`}>{p.health}%</span>
                      </td>
                      <td className="px-4 py-3 text-left">
                        <a href={`/projects/${p.id}`} className="text-primary text-xs font-semibold inline-flex items-center gap-1 hover:underline">
                          التفاصيل <ArrowLeft className="h-3.5 w-3.5" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const c = COMPANIES.find((x) => x.id === p.companyId);
            return (
              <a
                href={`/projects/${p.id}`} key={p.id}
                className="bg-card border border-border rounded-xl p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:shadow-md hover:border-primary/40 transition-all block"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge tone="primary">{p.sector}</Badge>
                      <StatusBadge status={p.status} />
                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-primary/5 text-primary font-semibold">
                        <Sparkles className="h-3 w-3" /> AI
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground truncate">{p.name}</h3>
                    <div className="text-xs text-muted-foreground mt-1">{c?.name}</div>
                  </div>
                  <HealthRing value={p.health} size={56} label="" />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <ProgressBar value={p.progress} tone={p.status === "متأخرة" ? "danger" : p.status === "مكتملة" ? "success" : "primary"} />
                    <span className="text-xs text-muted-foreground w-10">{p.progress}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-2 border-t border-border">
                    <div>مدير المشروع: <span className="text-foreground">{p.manager}</span></div>
                    <div>الأولوية: <span className="text-foreground">{p.priority}</span></div>
                    <div>البداية: <span className="text-foreground">{p.start}</span></div>
                    <div>الانتهاء: <span className="text-foreground">{p.end}</span></div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">مخاطر التأخّر: <span className={p.delayRisk >= 50 ? "text-red-600 font-semibold" : "text-foreground"}>{p.delayRisk}%</span></span>
                  <span className="text-primary text-xs font-semibold inline-flex items-center gap-1">التفاصيل <ArrowLeft className="h-3.5 w-3.5" /></span>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
