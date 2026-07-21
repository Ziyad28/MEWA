import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Building2, Mail, Phone, ArrowLeft, TrendingUp, FolderKanban } from "lucide-react";
import { PROJECTS } from "@/lib/mock-data";
import { AppShell, useRequireAuth } from "@/components/app-shell";
import { Card, Badge } from "@/components/ui-bits";
import { CompanyLogo } from "@/components/company-logo";
import { COMPANIES, SECTORS } from "@/lib/mock-data";


export const Route = createFileRoute("/companies")({
  component: CompaniesList,
});

function CompaniesList() {
  const user = useRequireAuth();
  const [q, setQ] = useState("");
  const [sector, setSector] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const scoped = useMemo(() => {
    if (user?.role === "pm") {
      const myCompanyIds = new Set(PROJECTS.filter((p) => p.manager === user.name).map((p) => p.companyId));
      return COMPANIES.filter((c) => myCompanyIds.has(c.id));
    }
    return COMPANIES;
  }, [user]);

  const filtered = useMemo(() => {
    return scoped.filter((c) => {
      if (q && !c.name.includes(q)) return false;
      if (sector !== "all" && c.sector !== sector) return false;
      if (status !== "all" && c.status !== status) return false;
      return true;
    });
  }, [q, sector, status, scoped]);

  if (!user) return null;

  return (
    <AppShell
      role="company"
      userName={user.name}
      roleLabel={user.roleLabel}
      pageTitle="الشركات المتعاونة"
      pageSubtitle="الشركات المرتبطة بالمشاريع التقنية التابعة للوكالة"
    >
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث باسم الشركة"
              className="w-full h-11 pr-10 pl-3 rounded-lg border border-border bg-background text-sm"
            />
          </div>
          <select value={sector} onChange={(e) => setSector(e.target.value)} className="h-11 px-3 rounded-lg border border-border bg-background text-sm">
            <option value="all">كل القطاعات</option>
            {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 px-3 rounded-lg border border-border bg-background text-sm">
            <option value="all">كل الحالات</option>
            <option value="نشط">نشط</option>
            <option value="قيد المراجعة">قيد المراجعة</option>
            <option value="منتهي">منتهي</option>
          </select>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          عدد الشركات المسجلة: <span className="font-semibold text-foreground">{filtered.length}</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const active = PROJECTS.filter((p) => p.companyId === c.id && p.status !== "مكتملة").length;
          const total = PROJECTS.filter((p) => p.companyId === c.id).length;
          return (
            <article
              key={c.id}
              className="bg-card border border-border rounded-xl p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:shadow-md hover:border-primary/40 transition-all flex flex-col"
            >
              <div className="flex items-start gap-3">
                <div className="h-16 w-24 rounded-xl bg-white border border-border flex items-center justify-center shrink-0 overflow-hidden p-2">
                  <CompanyLogo domain={c.domain} name={c.name} className="h-11 w-20" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{c.name}</h3>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{c.nameEn}</div>
                  <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                    <Badge tone="primary">{c.sector}</Badge>
                    <Badge tone={c.status === "نشط" ? "success" : c.status === "قيد المراجعة" ? "warning" : "muted"}>{c.status}</Badge>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs text-muted-foreground leading-relaxed line-clamp-2">{c.description}</p>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center pt-4 border-t border-border">
                <div>
                  <div className="text-[10px] text-muted-foreground">مشاريع نشطة</div>
                  <div className="text-sm font-bold text-foreground flex items-center justify-center gap-1"><FolderKanban className="h-3 w-3 text-primary" />{active}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">مشاريع مع الوكالة</div>
                  <div className="text-sm font-bold text-foreground">{total}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">الأداء</div>
                  <div className={`text-sm font-bold flex items-center justify-center gap-1 ${c.performance >= 80 ? "text-green-600" : c.performance >= 65 ? "text-amber-600" : "text-red-600"}`}>
                    <TrendingUp className="h-3 w-3" />{c.performance}%
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Mail className="h-3 w-3" />{c.email}</span>
                <a href={`/companies/${c.id}`} className="h-9 px-3 rounded-lg bg-primary/10 hover:bg-primary hover:text-white text-primary font-semibold inline-flex items-center gap-1.5 transition-colors">عرض التفاصيل <ArrowLeft className="h-3.5 w-3.5" /></a>
              </div>
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}

// Suppress unused warnings for icons kept for future use
void Building2; void Phone;
