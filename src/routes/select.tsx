import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FolderKanban, Building2, ArrowLeft, LogOut } from "lucide-react";
import logo from "@/assets/mewa-logo.png.asset.json";
import { getUser, logout, roleHome, type User } from "@/lib/auth";

export const Route = createFileRoute("/select")({
  component: SelectUnit,
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

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <img src={logo.url} alt="" className="h-10 w-auto" />
          <div className="text-sm leading-tight">
            <div className="font-semibold text-primary-deep">وزارة البيئة والمياه والزراعة</div>
            <div className="text-[11px] text-muted-foreground">منصة إدارة وحوكمة المشاريع التقنية</div>
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

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">
            مرحبًا بك في منصة إدارة وحوكمة المشاريع التقنية
          </h1>
          <p className="mt-3 text-muted-foreground">اختر الوحدة التي ترغب في الدخول إليها</p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate({ to: roleHome(user.role) })}
            className="group text-right bg-card border border-border rounded-xl p-8 shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:shadow-md hover:border-primary/40 transition-all"
          >
            <div className="h-14 w-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FolderKanban className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-xl font-bold text-foreground">المشاريع الوزارية</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              إدارة ومتابعة وحوكمة المشاريع التقنية التابعة للوزارة.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-primary-deep text-white text-sm font-semibold group-hover:bg-primary">
              الدخول إلى المشاريع
              <ArrowLeft className="h-4 w-4" />
            </div>
          </button>

          <button
            onClick={() => navigate({ to: "/companies" })}
            className="group text-right bg-card border border-border rounded-xl p-8 shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:shadow-md hover:border-primary/40 transition-all"
          >
            <div className="h-14 w-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Building2 className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-xl font-bold text-foreground">الشركات المتعاونة</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              استعراض وإدارة بيانات الشركات المرتبطة بمشاريع الوزارة.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-primary-deep text-white text-sm font-semibold group-hover:bg-primary">
              الدخول إلى الشركات
              <ArrowLeft className="h-4 w-4" />
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
