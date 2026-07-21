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
} from "lucide-react";
import ministryLogoOnDark from "@/assets/mewa-logo-on-dark.svg";
import { getUser, logout, type Role } from "@/lib/auth";
import { getMessages, getNotifications, saveMessages, saveNotifications, usePortalData } from "@/lib/portal-store";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
}

const NAV: Record<Role, NavItem[]> = {
  pmo: [
    { to: "/pmo", label: "الرئيسية", icon: Home },
    { to: "/projects", label: "مشاريع الوكالة", icon: FolderKanban },
    { to: "/documents", label: "الوثائق", icon: FileText },
    { to: "/reports", label: "التقارير", icon: BarChart3 },
    { to: "/ai-insights", label: "القرارات الذكية", icon: Sparkles },
  ],
  manager: [
    { to: "/manager", label: "الرئيسية", icon: Home },
    { to: "/projects", label: "مشاريع الوكالة", icon: FolderKanban },
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
  const { notifications, messages } = usePortalData();
  const [panel, setPanel] = useState<"notifications" | "messages" | "calendar" | null>(null);
  const [reply, setReply] = useState("");
  const [search, setSearch] = useState("");
  const unreadNotifications = notifications.filter((item) => !item.read).length;
  const unreadMessages = messages.filter((item) => !item.read).length;

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
        <div className="px-5 py-5 border-b border-white/10 flex items-center justify-center">
          <img
            src={ministryLogoOnDark}
            alt="وزارة البيئة والمياه والزراعة"
            className="h-auto w-full max-w-[210px] drop-shadow-sm"
          />
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
        <header className="relative h-16 bg-card border-b border-border flex items-center justify-between px-6">
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
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && search.trim()) navigate({ to: "/projects" });
                  }}
                  placeholder="ابحث ثم اضغط Enter"
                  className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <button title="التاريخ" onClick={() => setPanel(panel === "calendar" ? null : "calendar")} className="relative h-9 w-9 rounded-lg border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-primary">
              <Calendar className="h-4 w-4" />
            </button>
            <button title="الرسائل" onClick={() => setPanel(panel === "messages" ? null : "messages")} className="relative h-9 w-9 rounded-lg border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-primary">
              <Mail className="h-4 w-4" />
              {unreadMessages > 0 && <span className="absolute -top-1 -left-1 h-4 min-w-4 px-1 rounded-full bg-primary text-[10px] text-white flex items-center justify-center">{unreadMessages}</span>}
            </button>
            <button title="الإشعارات" onClick={() => setPanel(panel === "notifications" ? null : "notifications")} className="relative h-9 w-9 rounded-lg border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-primary">
              <Bell className="h-4 w-4" />
              {unreadNotifications > 0 && <span className="absolute -top-1 -left-1 h-4 min-w-4 px-1 rounded-full bg-primary text-[10px] text-white flex items-center justify-center">{unreadNotifications}</span>}
            </button>
          </div>
          {panel && (
            <div className="absolute z-50 top-14 left-6 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="font-bold">{panel === "notifications" ? "الإشعارات" : panel === "messages" ? "الرسائل" : "التاريخ"}</div>
                <button onClick={() => setPanel(null)} className="h-8 w-8 rounded-lg hover:bg-accent inline-flex items-center justify-center"><X className="h-4 w-4" /></button>
              </div>
              {panel === "notifications" && (
                <div>
                  <div className="max-h-[380px] overflow-y-auto divide-y divide-border">
                    {notifications.map((item) => (
                      <button key={item.id} onClick={() => { saveNotifications(getNotifications().map((n) => n.id === item.id ? { ...n, read: true } : n)); if (item.href) navigate({ to: item.href as never }); setPanel(null); }} className={`w-full p-4 text-right hover:bg-accent/60 ${item.read ? "bg-card" : "bg-primary/[0.04]"}`}>
                        <div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${item.read ? "bg-border" : "bg-primary"}`} /><span className="font-semibold text-sm">{item.title}</span></div>
                        <p className="mt-1 text-xs text-muted-foreground leading-5">{item.body}</p>
                        <div className="mt-1 text-[10px] text-muted-foreground">{item.time}</div>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => saveNotifications(getNotifications().map((item) => ({ ...item, read: true })))} className="w-full py-3 text-xs font-semibold text-primary border-t border-border">تحديد الكل كمقروء</button>
                </div>
              )}
              {panel === "messages" && (
                <div>
                  <div className="max-h-[300px] overflow-y-auto divide-y divide-border">
                    {messages.map((item) => (
                      <button key={item.id} onClick={() => saveMessages(getMessages().map((m) => m.id === item.id ? { ...m, read: true } : m))} className={`w-full p-4 text-right hover:bg-accent/60 ${item.read ? "" : "bg-primary/[0.04]"}`}>
                        <div className="flex justify-between gap-3"><span className="font-semibold text-sm">{item.sender}</span><span className="text-[10px] text-muted-foreground">{item.time}</span></div>
                        <div className="text-xs font-medium mt-1">{item.subject}</div><p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.body}</p>
                      </button>
                    ))}
                  </div>
                  <form onSubmit={(event) => { event.preventDefault(); if (!reply.trim()) return; saveMessages([{ id: Date.now(), sender: userName, subject: "رسالة جديدة", body: reply.trim(), time: "الآن", read: true, outgoing: true }, ...getMessages()]); setReply(""); }} className="p-3 border-t border-border flex gap-2">
                    <input value={reply} onChange={(event) => setReply(event.target.value)} placeholder="اكتب رسالة جديدة..." className="h-10 flex-1 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary" />
                    <button className="h-10 w-10 rounded-lg bg-primary text-white inline-flex items-center justify-center"><Send className="h-4 w-4" /></button>
                  </form>
                </div>
              )}
              {panel === "calendar" && <div className="p-6 text-center"><div className="text-4xl font-bold text-primary">{new Date().toLocaleDateString("ar-SA", { day: "numeric" })}</div><div className="mt-2 font-semibold">{new Date().toLocaleDateString("ar-SA", { weekday: "long", month: "long", year: "numeric" })}</div><div className="mt-4 text-xs text-muted-foreground">جميع مواعيد الوكالة محدثة حسب التقويم المحلي.</div></div>}
            </div>
          )}
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
