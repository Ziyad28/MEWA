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
  X,
  Send,
  Menu,
  ClipboardList,
  Users,
  Settings,
} from "lucide-react";
import ministryLogoOnDark from "@/assets/mewa-logo-on-dark.svg";
import { getUser, logout, roleHome, type Role } from "@/lib/auth";
import { can, canAccessDocument, canAccessProject, type Permission } from "@/lib/access-control";
import {
  getMessages,
  getNotifications,
  saveMessages,
  saveNotifications,
  usePortalData,
} from "@/lib/portal-store";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
}

const NAV: Record<Role, NavItem[]> = {
  admin: [
    { to: "/users", label: "المستخدمون والأدوار", icon: Users },
    { to: "/audit-log", label: "سجل العمليات", icon: ClipboardList },
    { to: "/settings", label: "إعدادات الحسابات والأمان", icon: Settings },
  ],
  pmo: [
    { to: "/pmo", label: "الرئيسية", icon: Home },
    { to: "/projects", label: "مشاريع الوكالة", icon: FolderKanban },
    { to: "/documents", label: "الوثائق", icon: FileText },
    { to: "/reports", label: "التقارير", icon: BarChart3 },
  ],
  manager: [
    { to: "/manager", label: "الرئيسية", icon: Home },
    { to: "/projects", label: "مشاريع الوكالة", icon: FolderKanban },
    { to: "/documents", label: "الوثائق", icon: FileText },
    { to: "/reports", label: "التقارير", icon: BarChart3 },
  ],
  pm: [
    { to: "/pm", label: "الرئيسية", icon: Home },
    { to: "/projects", label: "مشاريعي", icon: FolderKanban },
    { to: "/documents", label: "الوثائق", icon: FileText },
    { to: "/reports", label: "تقارير مشاريعي", icon: BarChart3 },
  ],
  team: [
    { to: "/projects", label: "مشاريعي", icon: FolderKanban },
    { to: "/documents", label: "الوثائق", icon: FileText },
  ],
  capacity: [{ to: "/capacity-building", label: "إدارة ورش العمل", icon: Layers }],
  employee: [{ to: "/workshop-invitations", label: "دعوات ورش العمل", icon: Mail }],
};

export function AppShell({
  children,
  role,
  navigationScope = "main",
  pageTitle,
  pageSubtitle,
  roleLabel,
  userName,
}: {
  children: ReactNode;
  role: Role;
  navigationScope?: "main" | "companies";
  pageTitle: string;
  pageSubtitle?: string;
  roleLabel: string;
  userName: string;
}) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { notifications, messages, projects, companies, documents } = usePortalData();
  const [panel, setPanel] = useState<"notifications" | "messages" | "calendar" | null>(null);
  const [reply, setReply] = useState("");
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const signedInUser = getUser();
  const visibleNotifications = notifications.filter((item) => {
    if (item.recipientEmail) {
      return item.recipientEmail.toLowerCase() === signedInUser?.email.toLowerCase();
    }
    if (item.targetRoles && signedInUser) {
      return item.targetRoles.includes(signedInUser.role);
    }
    return signedInUser?.role !== "employee";
  });
  const visibleMessages = signedInUser?.role === "employee" ? [] : messages;
  const unreadNotifications = visibleNotifications.filter((item) => !item.read).length;
  const unreadMessages = visibleMessages.filter((item) => !item.read).length;
  const visibleProjects = signedInUser
    ? projects.filter((item) => canAccessProject(signedInUser, item))
    : [];
  const visibleCompanyIds = new Set(visibleProjects.map((item) => item.companyId));
  const visibleCompanies =
    !signedInUser || !can(signedInUser.role, "companies.view")
      ? []
      : signedInUser.role === "pm"
        ? companies.filter((item) => visibleCompanyIds.has(item.id))
        : companies;
  const visibleDocuments = signedInUser
    ? documents.filter((item) => canAccessDocument(signedInUser, item, projects))
    : [];
  const searchResults =
    search.trim().length < 2
      ? []
      : navigationScope === "companies"
        ? visibleCompanies
            .filter((item) => item.name.includes(search))
            .slice(0, 6)
            .map((item) => ({ label: item.name, type: "شركة", href: `/companies/${item.id}` }))
        : [
            ...visibleProjects
              .filter((item) => item.name.includes(search) || item.manager.includes(search))
              .slice(0, 3)
              .map((item) => ({ label: item.name, type: "مشروع", href: `/projects/${item.id}` })),
            ...visibleCompanies
              .filter((item) => item.name.includes(search))
              .slice(0, 3)
              .map((item) => ({ label: item.name, type: "شركة", href: `/companies/${item.id}` })),
            ...visibleDocuments
              .filter((item) => item.name.includes(search))
              .slice(0, 3)
              .map((item) => ({ label: item.name, type: "وثيقة", href: "/documents" })),
          ];

  const navItems: NavItem[] =
    navigationScope === "companies"
      ? [{ to: "/companies", label: "الشركات", icon: Building2 }]
      : NAV[role];

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground flex">
      <a href="#main-content" className="dga-skip-link">
        تجاوز إلى المحتوى الرئيسي
      </a>
      {/* Sidebar */}
      {mobileOpen && (
        <button
          aria-label="إغلاق القائمة"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}
      <aside
        className={`print:hidden ${collapsed ? "md:w-[72px]" : "md:w-[260px]"} w-[260px] fixed md:sticky top-0 right-0 z-50 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col h-screen transition-all duration-300 ${mobileOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}
      >
        <div
          className={`${collapsed ? "px-3 py-4" : "px-4 py-5"} border-b border-white/10 flex items-center justify-center`}
        >
          {collapsed ? (
            <div
              className="relative h-11 w-11 overflow-hidden"
              title="وزارة البيئة والمياه والزراعة"
            >
              <img
                src={ministryLogoOnDark}
                alt="شعار وزارة البيئة والمياه والزراعة"
                className="absolute right-0 top-0 h-11 w-auto max-w-none drop-shadow-sm"
              />
            </div>
          ) : (
            <img
              src={ministryLogoOnDark}
              alt="وزارة البيئة والمياه والزراعة"
              className="h-auto w-full max-w-[210px] drop-shadow-sm"
            />
          )}
        </div>

        <nav aria-label="التنقل الرئيسي" className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const base = item.to.split("?")[0] as string;
            const active = base === pathname || (base !== "/" && pathname.startsWith(base + "/"));
            const Icon = item.icon;
            return (
              <Link
                key={item.to + item.label}
                to={base}
                title={collapsed ? item.label : undefined}
                aria-current={active ? "page" : undefined}
                className={`flex items-center rounded-lg text-sm transition-colors ${collapsed ? "h-11 justify-center px-0" : "gap-3 px-3 py-2.5"} ${
                  active
                    ? "bg-white text-primary-deep font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                    : "text-white/85 hover:bg-white/10"
                }`}
              >
                <Icon className="h-4 w-4" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4 space-y-1">
          <Link
            to="/select"
            title={collapsed ? "العودة إلى القائمة الرئيسية" : undefined}
            className={`flex items-center rounded-lg text-sm text-white/85 hover:bg-white/10 ${collapsed ? "h-11 justify-center px-0" : "gap-3 px-3 py-2.5"}`}
          >
            <ArrowRightLeft className="h-4 w-4" />
            {!collapsed && <span>العودة إلى القائمة الرئيسية</span>}
          </Link>
          <button
            onClick={() => {
              logout();
              navigate({ to: "/" });
            }}
            title={collapsed ? "تسجيل الخروج" : undefined}
            className={`w-full flex items-center rounded-lg text-sm text-white/85 hover:bg-white/10 ${collapsed ? "h-11 justify-center px-0" : "gap-3 px-3 py-2.5"}`}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Topbar */}
        <header className="print:hidden relative h-16 bg-card border-b border-border flex items-center justify-between px-3 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden h-9 w-9 rounded-lg border border-border inline-flex items-center justify-center"
            >
              <Menu className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCollapsed((value) => !value)}
              title={collapsed ? "فتح القائمة الجانبية" : "طي القائمة الجانبية"}
              aria-label={collapsed ? "فتح القائمة الجانبية" : "طي القائمة الجانبية"}
              className={`hidden md:inline-flex h-10 w-10 rounded-xl border items-center justify-center transition-colors ${collapsed ? "border-primary/30 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-accent"}`}
            >
              <Menu className="h-5 w-5" />
            </button>
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
              <div className="w-40 sm:w-56 lg:w-72 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                <Search className="h-4 w-4" />
                <input
                  aria-label="البحث الشامل"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.preventDefault();
                  }}
                  placeholder="ابحث داخل المنصة"
                  className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="absolute top-11 left-0 right-0 z-50 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
                  {searchResults.map((result) => (
                    <a
                      key={result.type + result.label}
                      href={result.href}
                      className="flex items-center justify-between px-3 py-2.5 text-xs hover:bg-accent"
                    >
                      <span className="font-medium truncate">{result.label}</span>
                      <BadgeLabel>{result.type}</BadgeLabel>
                    </a>
                  ))}
                </div>
              )}
            </div>
            <button
              aria-label="التنبيهات"
              onClick={() => setPanel(panel === "notifications" ? null : "notifications")}
              className="relative h-9 w-9 rounded-lg border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-primary"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 border-2 border-background" />
              )}
            </button>
          </div>
          {panel && (
            <div className="absolute z-50 top-14 left-6 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="font-bold">الإشعارات</div>
                <button
                  onClick={() => setPanel(null)}
                  className="h-8 w-8 rounded-lg hover:bg-accent inline-flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="max-h-[300px] overflow-y-auto divide-y divide-border">
                {visibleNotifications.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      /* handle read */
                    }}
                    className={`w-full p-4 text-right hover:bg-accent/60 ${item.read ? "" : "bg-primary/[0.04]"}`}
                  >
                    <div className="text-sm font-semibold">{item.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {item.body}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 p-3 md:p-6 space-y-6 focus:outline-none"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">{pageTitle}</h1>
              {pageSubtitle && <p className="text-sm text-muted-foreground mt-1">{pageSubtitle}</p>}
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

function BadgeLabel({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
      {children}
    </span>
  );
}

export function useRequireAuth(expectedRole?: Role) {
  const navigate = useNavigate();
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
  useEffect(() => {
    const u = getUser();
    if (!u) {
      navigate({ to: "/", replace: true });
      return;
    }
    if (expectedRole && u.role !== expectedRole) {
      navigate({ to: roleHome(u.role), replace: true });
      return;
    }
    setUser(u);
  }, [navigate, expectedRole]);
  return user;
}

export function useRequirePermission(permission: Permission) {
  const navigate = useNavigate();
  const user = useRequireAuth();
  useEffect(() => {
    if (user && !can(user.role, permission)) {
      navigate({ to: roleHome(user.role), replace: true });
    }
  }, [navigate, permission, user]);
  return user && can(user.role, permission) ? user : null;
}

export function useRequireAnyPermission(permissions: Permission[]) {
  const navigate = useNavigate();
  const user = useRequireAuth();
  const allowed = Boolean(user && permissions.some((permission) => can(user.role, permission)));
  useEffect(() => {
    if (user && !allowed) navigate({ to: roleHome(user.role), replace: true });
  }, [allowed, navigate, user]);
  return allowed ? user : null;
}
