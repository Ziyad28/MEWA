import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Building2, Mail, Phone, ArrowLeft } from "lucide-react";
import { AppShell, useRequireAuth } from "@/components/app-shell";
import { Card, Badge } from "@/components/ui-bits";
import { COMPANIES, SECTORS } from "@/lib/mock-data";
import { getUser } from "@/lib/auth";

export const Route = createFileRoute("/companies")({
  component: CompaniesList,
});

function CompaniesList() {
  const user = useRequireAuth();
  const [q, setQ] = useState("");
  const [sector, setSector] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const filtered = useMemo(() => {
    return COMPANIES.filter((c) => {
      if (q && !c.name.includes(q)) return false;
      if (sector !== "all" && c.sector !== sector) return false;
      if (status !== "all" && c.status !== status) return false;
      return true;
    });
  }, [q, sector, status]);

  if (!user) return null;

  return (
    <AppShell
      role="company"
      userName={user.name}
      roleLabel={user.roleLabel}
      pageTitle="الشركات المتعاونة"
      pageSubtitle="الشركات المرتبطة بالمشاريع التقنية التابعة للوزارة"
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
        {filtered.map((c) => (
          <div key={c.id} className="bg-card border border-border rounded-xl p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:shadow-md transition-shadow flex flex-col">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{c.name}</h3>
                <div className="mt-1 flex items-center gap-2">
                  <Badge tone="primary">{c.sector}</Badge>
                  <Badge tone={c.status === "نشط" ? "success" : c.status === "قيد المراجعة" ? "warning" : "muted"}>{c.status}</Badge>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
              <div>مسؤول التواصل: <span className="text-foreground">{c.contactPerson}</span></div>
              <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {c.email}</div>
              <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {c.phone}</div>
            </div>

            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">متوسط الأداء</div>
                <div className="text-lg font-bold text-primary">{c.performance}%</div>
              </div>
              <Link
                to="/companies/$id"
                params={{ id: String(c.id) }}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-primary-deep text-white text-xs font-semibold hover:bg-primary"
              >
                عرض التفاصيل
                <ArrowLeft className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
