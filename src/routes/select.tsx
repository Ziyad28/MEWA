import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FolderKanban, Building2, ArrowLeft, LogOut, CheckCircle2, AlertTriangle, TrendingUp, FileCheck2 } from "lucide-react";
import logo from "@/assets/mewa-logo-primary.png.asset.json";
import { getUser, logout, roleHome, type User } from "@/lib/auth";
import { PROJECTS, COMPANIES } from "@/lib/mock-data";

export const Route = createFileRoute("/select")({
  component: SelectUnit,
  head: () => ({
    meta: [
      { title: "اختر الوحدة — منصة إدارة وحوكمة المشاريع التقنية" },
      { name: "description", content: "بوابة الدخول لاختيار وحدة العمل: مشاريع الوزارة أو الشركات المتعاونة." },
    ],
  }),
});

function SelectUnit() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) { navigate({ to: "/" }); return; }
    setUser(u);
  }, [navigate]);

  if (!user) return null;

  const totalProjects = PROJECTS.length;
  const activeProjects = PROJECTS.filter((p) => p.status === "قيد التنفيذ").length;
  const delayedProjects = PROJECTS.filter((p) => p.status === "متأخرة").length;
  const overallCompletion = Math.round(PROJECTS.reduce((a, p) => a + p.progress, 0) / PROJECTS.length);

  const totalCompanies = COMPANIES.length;
  const activeCompanies = COMPANIES.filter((c) => c.status === "نشط").length;
  const avgPerformance = Math.round(COMPANIES.reduce((a, c) => a + c.performance, 0) / COMPANIES.length);
  const activeContracts = COMPANIES.filter((c) => c.status !== "منتهي").length;

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <img src={logo.url} alt="" className="h-12 w-auto" />
          <div className="text-sm leading-tight border-r border-border pr-3 mr-1">
            <div className="font-semibold text-primary-deep">منصة إدارة وحوكمة المشاريع التقنية</div>
            <div className="text-[11px] text-muted-foreground">Project Management &amp; Governance Platform</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-right leading-tight">
            <div className="font-semibold">{user.name}</div>
            <div className="text-xs text-muted-foreground">{user.roleLabel}</div>
          </div>
          <button
            onClick={() => { logout(); navigate({ to: "/" }); }}
            className="h-9 px-3 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-14">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            مرحبًا، {user.name}
          </div>
          <h1 className="mt-4 text-3xl font-bold text-foreground">اختر الوحدة</h1>
          <p className="mt-2 text-sm text-muted-foreground">حدد الوحدة التي ترغب في الدخول إليها لبدء العمل</p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 — Projects */}
          <button
            onClick={() => navigate({ to: roleHome(user.role) })}
            className="group text-right bg-card border border-border rounded-2xl p-8 shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:shadow-lg hover:border-primary/50 hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <FolderKanban className="h-8 w-8" />
              </div>
              <div className="text-[11px] text-muted-foreground">وحدة رئيسية</div>
            </div>
            <h2 className="mt-6 text-xl font-bold text-foreground">مشاريع الوزارة</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              إدارة ومتابعة المشاريع التقنية التابعة للوزارة.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <StatMini icon={<FolderKanban className="h-3.5 w-3.5" />} label="إجمالي المشاريع" value={totalProjects} tone="primary" />
              <StatMini icon={<TrendingUp className="h-3.5 w-3.5" />} label="نشطة" value={activeProjects} tone="info" />
              <StatMini icon={<AlertTriangle className="h-3.5 w-3.5" />} label="متأخرة" value={delayedProjects} tone="danger" />
              <StatMini icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="نسبة الإنجاز" value={`${overallCompletion}%`} tone="success" />
            </div>

            <div className="mt-6 inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-primary-deep text-white text-sm font-semibold group-hover:bg-primary transition-colors">
              الدخول إلى المشاريع
              <ArrowLeft className="h-4 w-4" />
            </div>
          </button>

          {/* Card 2 — Companies */}
          <button
            onClick={() => navigate({ to: "/companies" })}
            className="group text-right bg-card border border-border rounded-2xl p-8 shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:shadow-lg hover:border-primary/50 hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Building2 className="h-8 w-8" />
              </div>
              <div className="text-[11px] text-muted-foreground">وحدة رئيسية</div>
            </div>
            <h2 className="mt-6 text-xl font-bold text-foreground">الشركات المتعاونة</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              استعراض الشركات المرتبطة بمشاريع الوزارة.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <StatMini icon={<Building2 className="h-3.5 w-3.5" />} label="إجمالي الشركات" value={totalCompanies} tone="primary" />
              <StatMini icon={<FileCheck2 className="h-3.5 w-3.5" />} label="عقود سارية" value={activeContracts} tone="info" />
              <StatMini icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="شركات نشطة" value={activeCompanies} tone="success" />
              <StatMini icon={<TrendingUp className="h-3.5 w-3.5" />} label="متوسط الأداء" value={`${avgPerformance}%`} tone="success" />
            </div>

            <div className="mt-6 inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-primary-deep text-white text-sm font-semibold group-hover:bg-primary transition-colors">
              الدخول إلى الشركات
              <ArrowLeft className="h-4 w-4" />
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}

function StatMini({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string | number; tone: "primary" | "info" | "success" | "danger" }) {
  const toneMap: Record<string, string> = {
    primary: "text-primary bg-primary/10",
    info: "text-blue-600 bg-blue-50",
    success: "text-green-600 bg-green-50",
    danger: "text-red-600 bg-red-50",
  };
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border bg-background px-3 py-2.5">
      <div className={`h-7 w-7 rounded-md flex items-center justify-center ${toneMap[tone]}`}>{icon}</div>
      <div className="min-w-0">
        <div className="text-[10px] text-muted-foreground leading-none">{label}</div>
        <div className="text-sm font-bold text-foreground mt-1">{value}</div>
      </div>
    </div>
  );
}
