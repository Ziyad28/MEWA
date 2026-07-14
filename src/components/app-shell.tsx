import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Home,
  FolderKanban,
  Search,
  FileText,
  Building2,
  Layers,
  BarChart3,
  Sparkles,
  LogOut,
  ArrowRightLeft,
  Bell,
  Mail,
  Calendar,
  ChevronDown,
} from "lucide-react";
import logoWhite from "@/assets/mewa-logo-secondary.png.asset.json";
import { getUser, logout, type Role } from "@/lib/auth";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
}

const NAV: Record<Role, NavItem[]> = {
  pmo: [
    { to: "/pmo", label: "الرئيسية", icon: Home },
    { to: "/projects", label: "مشاريع الوزارة", icon: FolderKanban },
    { to: "/documents", label: "الوثائق", icon: FileText },
    { to: "/companies", label: "الشركات المتعاونة", icon: Building2 },
    { to: "/reports", label: "التقارير", icon: BarChart3 },
    { to: "/ai-insights", label: "القرارات الذكية", icon: Sparkles },
  ],
  manager: [
    { to: "/manager", label: "الرئيسية", icon: Home },
    { to: "/projects", label: "مشاريع الوزارة", icon: FolderKanban },
    { to: "/reports", label: "التقارير", icon: BarChart3 },
    { to: "/ai-insights", label: "القرارات الذكية", icon: Sparkles },
  ],
  pm: [
    { to: "/pm", label: "الرئيسية", icon: Home },
    { to: "/projects", label: "مشاريعي", icon: FolderKanban },
    { to: "/documents", label: "الوثائق", icon: FileText },
    { to: "/ai-insights", label: "القرارات الذكية", icon: Sparkles },
  ],
};

export function AppShell({
  children,
  role,
  pageTitle,
  pageSubtitle,
  roleLabel,
  userName,
}: {
  children: ReactNode;
  role: Role | "company";
  pageTitle: string;
  pageSubtitle?: string;
  roleLabel: string;
  userName: string;
}) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const navItems: NavItem[] =
    role === "company"
      ? [
          { to: "/companies", label: "الشركات المتعاونة", icon: Building2 },
        ]
      : NAV[role];

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-[260px] shrink-0 bg-sidebar text-sidebar-foreground flex flex-col min-h-screen">
        <div className="px-4 pt-5 pb-4 border-b border-white/10 flex items-center gap-3">
          <div className="h-11 w-11 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
            <img src={logoWhite.url} alt="وزارة البيئة والمياه والزراعة" className="h-8 w-auto" />
          </div>
          <div className="leading-tight min-w-0">
            <div className="text-[12px] font-semibold text-white truncate">وزارة البيئة والمياه والزراعة</div>
            <div className="text-[9.5px] text-white/65 mt-0.5 truncate">Ministry of Environment Water &amp; Agriculture</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const base = item.to.split("?")[0] as string;
            const active =
              base === pathname ||
              (base !== "/" && pathname.startsWith(base + "/"));
            const Icon = item.icon;
            return (
              <Link
                key={item.to + item.label}
                to={base}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-white text-primary-deep font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                    : "text-white/85 hover:bg-white/10"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4 space-y-1">
          <Link
            to="/select"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/85 hover:bg-white/10"
          >
            <ArrowRightLeft className="h-4 w-4" />
            <span>العودة إلى اختيار الوحدة</span>
          </Link>
          <button
            onClick={() => {
              logout();
              navigate({ to: "/" });
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/85 hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                {userName.charAt(0)}
              </div>
              <div className="leading-tight">
                <div className="font-semibold text-foreground">{userName}</div>
                <div className="text-xs text-muted-foreground">{roleLabel}</div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-64 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                <Search className="h-4 w-4" />
                <span>البحث والتصفية</span>
              </div>
            </div>
            <button className="relative h-9 w-9 rounded-lg border border-border bg-background flex items-center justify-center text-muted-foreground">
              <Calendar className="h-4 w-4" />
            </button>
            <button className="relative h-9 w-9 rounded-lg border border-border bg-background flex items-center justify-center text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="absolute -top-1 -left-1 h-4 w-4 rounded-full bg-primary text-[10px] text-white flex items-center justify-center">2</span>
            </button>
            <button className="relative h-9 w-9 rounded-lg border border-border bg-background flex items-center justify-center text-muted-foreground">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -left-1 h-4 w-4 rounded-full bg-primary text-[10px] text-white flex items-center justify-center">3</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">{pageTitle}</h1>
              {pageSubtitle && (
                <p className="text-sm text-muted-foreground mt-1">{pageSubtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>آخر 30 يوم</span>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export function useRequireAuth(expectedRole?: Role) {
  const navigate = useNavigate();
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
  useEffect(() => {
    const u = getUser();
    if (!u) {
      navigate({ to: "/" });
      return;
    }
    if (expectedRole && u.role !== expectedRole) {
      navigate({ to: "/select" });
      return;
    }
    setUser(u);
  }, [navigate, expectedRole]);
  return user;
}
