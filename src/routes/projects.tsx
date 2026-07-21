import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  ArrowLeft,
  Sparkles,
  Pencil,
  Archive,
  X,
  FileSpreadsheet,
  FileDown,
} from "lucide-react";
import { AppShell, useRequireAnyPermission } from "@/components/app-shell";
import {
  Card,
  Badge,
  ProgressBar,
  StatusBadge,
  HealthRing,
  EmptyState,
} from "@/components/ui-bits";
import { PortfolioIntelligence } from "@/components/portfolio-intelligence";
import { PageSkeleton } from "@/components/page-skeleton";
import { PROJECTS, SECTORS, COMPANIES } from "@/lib/mock-data";
import {
  addNotification,
  downloadExcel,
  getProjects,
  printPdf,
  recordAudit,
  saveProjects,
  usePortalData,
  type PrototypeProject,
} from "@/lib/portal-store";
import { can, scopeProjects } from "@/lib/access-control";

export const Route = createFileRoute("/projects")({
  component: ProjectsPage,
  head: () => ({
    meta: [
      {
        title: "المشاريع — المنصة الذكية لإدارة الشركات والمشاريع | وزارة البيئة والمياه والزراعة",
      },
      {
        name: "description",
        content: "قائمة المشاريع التقنية التابعة للوكالة مع بحث وفلاتر متقدمة.",
      },
    ],
  }),
});

const GENERAL_ADMINISTRATIONS = [
  "الإدارة العامة للتحول الرقمي",
  "الإدارة العامة للحلول التطبيقية",
  "الإدارة العامة للبنية التحتية وخدمات المستفيدين",
] as const;

const PROJECT_GENERAL_ADMINISTRATION: Record<number, (typeof GENERAL_ADMINISTRATIONS)[number]> = {
  1: "الإدارة العامة للتحول الرقمي",
  2: "الإدارة العامة للبنية التحتية وخدمات المستفيدين",
  3: "الإدارة العامة للبنية التحتية وخدمات المستفيدين",
  4: "الإدارة العامة للحلول التطبيقية",
  5: "الإدارة العامة للبنية التحتية وخدمات المستفيدين",
  6: "الإدارة العامة للتحول الرقمي",
  7: "الإدارة العامة للحلول التطبيقية",
  8: "الإدارة العامة للتحول الرقمي",
  9: "الإدارة العامة للتحول الرقمي",
  10: "الإدارة العامة للبنية التحتية وخدمات المستفيدين",
};

function projectGeneralAdministration(project: PrototypeProject) {
  return PROJECT_GENERAL_ADMINISTRATION[project.id] ?? "الإدارة العامة للتحول الرقمي";
}

const SUB_DEPARTMENTS: Record<string, string[]> = {
  "الإدارة العامة للتحول الرقمي": [
    "إدارة التقنيات الناشئة",
    "إدارة البنية المؤسسية",
    "إدارة التخطيط والتميز المؤسسي",
    "إدارة الخدمات الإلكترونية",
  ],
  "الإدارة العامة للحلول التطبيقية": [
    "إدارة الحلول المؤسسية",
    "إدارة ذكاء الأعمال",
    "إدارة المنتجات الرقمية",
  ],
  "الإدارة العامة للبنية التحتية وخدمات المستفيدين": [
    "إدارة قواعد البيانات",
    "إدارة الشبكات والاتصالات",
    "إدارة تشغيل أنظمة البنية التحتية",
    "إدارة خدمات المستفيدين",
  ],
};

const PROJECT_SUB_DEPARTMENT: Record<number, string> = {
  1: "إدارة الخدمات الإلكترونية",
  2: "إدارة البنية التحتية",
  3: "إدارة الشبكات",
  4: "إدارة النظم المالية والإدارية",
  5: "إدارة مراكز البيانات",
  6: "إدارة التقنيات الناشئة",
  7: "إدارة ذكاء الأعمال",
  8: "إدارة البنية المؤسسية",
  9: "إدارة التخطيط والتميز المؤسسي",
  10: "إدارة الأمن السيبراني",
};

function projectSubDepartment(project: PrototypeProject) {
  return PROJECT_SUB_DEPARTMENT[project.id] ?? "إدارة غير محددة";
}

function ProjectsPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const user = useRequireAnyPermission(["projects.viewAll", "projects.viewAssigned"]);
  const { projects } = usePortalData();
  const [q, setQ] = useState("");
  const [sector, setSector] = useState<string>("all");
  const [generalAdministration, setGeneralAdministration] = useState<string>("all");
  const [subDepartment, setSubDepartment] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [priority, setPriority] = useState<string>("all");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [view, setView] = useState<"table" | "card">("card");
  const [archiveView, setArchiveView] = useState<"active" | "archived" | "history">("active");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PrototypeProject | null>(null);
  const [form, setForm] = useState({
    name: "",
    sector: "المياه",
    manager: "فهد المطيري",
    companyId: "1",
    start: "2026-01-01",
    end: "2026-12-31",
    description: "",
  });

  const isProjectDetail = /^\/projects\/[^/]+$/.test(pathname);

  const scoped = useMemo(() => scopeProjects(user, projects), [user, projects]);

  const filtered = useMemo(() => {
    return scoped.filter((p) => {
      if (q && !p.name.includes(q) && !p.manager.includes(q)) return false;
      if (sector !== "all" && p.sector !== sector) return false;
      if (
        generalAdministration !== "all" &&
        projectGeneralAdministration(p) !== generalAdministration
      )
        return false;
      if (
        generalAdministration !== "all" &&
        subDepartment !== "all" &&
        projectSubDepartment(p) !== subDepartment
      )
        return false;
      if (status !== "all" && status !== "مؤرشف" && p.status !== status) return false;
      if (priority !== "all" && p.priority !== priority) return false;

      if (from && p.start < from) return false;
      if (to && p.end > to) return false;
      if (archiveView === "active" && p.archived) return false;
      if (archiveView === "archived" && !p.archived) return false;
      return true;
    });
  }, [
    scoped,
    q,
    sector,
    generalAdministration,
    subDepartment,
    status,
    priority,
    from,
    to,
    archiveView,
  ]);

  const archiveHistory = useMemo(
    () =>
      scoped
        .flatMap((project) =>
          (project.activityLog ?? []).map((event) => ({
            ...event,
            projectId: project.id,
            projectName: project.name,
          })),
        )
        .sort((a, b) => b.id - a.id),
    [scoped],
  );

  if (isProjectDetail) return <Outlet />;
  if (!user) return <PageSkeleton />;
  const canAdd = can(user.role, "projects.create");
  const canManage = can(user.role, "projects.editCore");
  const canArchive = can(user.role, "projects.archive");
  const isPm = user.role === "pm";

  function openForm(project?: PrototypeProject) {
    if (!user) return;
    if (project && !can(user.role, "projects.editCore")) return;
    if (!project && !can(user.role, "projects.create")) return;
    setEditing(project ?? null);
    setForm(
      project
        ? {
            name: project.name,
            sector: project.sector,
            manager: project.manager,
            companyId: String(project.companyId),
            start: project.start,
            end: project.end,
            description: project.description,
          }
        : {
            name: "",
            sector: "المياه",
            manager: user?.name ?? "فهد المطيري",
            companyId: "1",
            start: "2026-01-01",
            end: "2026-12-31",
            description: "",
          },
    );
    setShowForm(true);
  }

  function submitProject(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;
    if (!form.name.trim()) return;
    const list = getProjects();
    if (editing) {
      if (!can(user.role, "projects.editCore")) return;
      saveProjects(
        list.map((project) =>
          project.id === editing.id
            ? {
                ...project,
                ...form,
                manager: can(user.role, "projects.assignManager") ? form.manager : project.manager,
                sector: form.sector as PrototypeProject["sector"],
                companyId: Number(form.companyId),
                updated: new Date().toLocaleDateString("en-CA"),
              }
            : project,
        ),
      );
      recordAudit("تعديل بيانات مشروع", "مشروع", form.name, editing.id);
      addNotification(
        "تم تحديث المشروع",
        `تم حفظ تعديلات ${form.name}.`,
        `/projects/${editing.id}`,
      );
    } else {
      if (!can(user.role, "projects.create")) return;
      const id = Math.max(...list.map((project) => project.id), 0) + 1;
      const project: PrototypeProject = {
        id,
        name: form.name,
        sector: form.sector as PrototypeProject["sector"],
        manager: form.manager,
        status: "قيد التنفيذ",
        priority: "متوسطة",
        progress: 0,
        updated: new Date().toLocaleDateString("en-CA"),
        start: form.start,
        end: form.end,
        companyId: Number(form.companyId),
        health: 75,
        delayRisk: 10,
        budget: "—",
        description: form.description || "مشروع جديد ضمن محفظة الوكالة.",
        spark: [0, 0, 0, 0, 0, 0],
        stages: [
          { id: Date.now(), title: "التخطيط والتحليل", progress: 0, status: "جارية", tasks: [] },
        ],
        comments: [],
        approvals: [
          {
            id: Date.now(),
            title: "اعتماد ميثاق المشروع",
            status: "بانتظار الاعتماد",
            owner: "مدير الإدارة",
          },
        ],
        chat: [],
      };
      saveProjects([project, ...list]);
      recordAudit("إنشاء مشروع", "مشروع", project.name, project.id);
      addNotification(
        "تم إنشاء مشروع جديد",
        `أضيف ${project.name} إلى محفظة الوكالة.`,
        `/projects/${id}`,
      );
    }
    setShowForm(false);
  }

  function archiveProject(project: PrototypeProject) {
    if (!user) return;
    if (!can(user.role, "projects.archive")) return;
    if (!window.confirm(`هل تريد ${project.archived ? "استعادة" : "أرشفة"} مشروع ${project.name}؟`))
      return;
    const restoring = Boolean(project.archived);
    const action = restoring ? "استعادة" : "أرشفة";
    const timestamp = new Date().toLocaleString("ar-SA", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const actorName = user?.name ?? "مستخدم النظام";
    const actorRole = user?.roleLabel ?? "حساب غير معروف";
    saveProjects(
      getProjects().map((item) =>
        item.id === project.id
          ? {
              ...item,
              archived: !item.archived,
              archivedBy: restoring ? undefined : actorName,
              archivedByRole: restoring ? undefined : actorRole,
              archivedAt: restoring ? undefined : timestamp,
              activityLog: [
                {
                  id: Date.now(),
                  action: restoring ? "استعادة" : "أرشفة",
                  actorName,
                  actorRole,
                  date: timestamp,
                },
                ...(item.activityLog ?? []),
              ],
              comments: [
                {
                  id: Date.now(),
                  author: `${actorName} — ${actorRole}`,
                  text: `${restoring ? "استعاد" : "أرشف"} المشروع «${project.name}».`,
                  date: timestamp,
                },
                ...item.comments,
              ],
            }
          : item,
      ),
    );
    recordAudit(`${action} مشروع`, "مشروع", project.name, project.id);
    addNotification(
      `${action} مشروع`,
      `تمت ${action} مشروع «${project.name}».`,
      `/projects/${project.id}`,
    );
    setArchiveView(project.archived ? "active" : "archived");
  }

  return (
    <AppShell
      role={user.role}
      userName={user.name}
      roleLabel={user.roleLabel}
      pageTitle={isPm ? "مشاريعي" : "مشاريع الوكالة"}
      pageSubtitle={
        isPm
          ? "المشاريع التي أنت مكلّف بإدارتها"
          : "إدارة ومتابعة جميع المشاريع التقنية التابعة للوكالة"
      }
    >
      <Card className="p-4">
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-5 gap-3">
            <div className="relative md:col-span-2">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ابحث باسم المشروع أو مدير المشروع"
                className="w-full h-11 pr-10 pl-3 rounded-lg border border-border bg-background text-sm"
              />
            </div>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="h-11 px-3 rounded-lg border border-border bg-background text-sm"
            >
              <option value="all">القطاعات</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={generalAdministration}
              onChange={(e) => {
                setGeneralAdministration(e.target.value);
                setSubDepartment("all");
              }}
              aria-label="الإدارة العامة"
              className="h-11 px-3 rounded-lg border border-border bg-background text-sm"
            >
              <option value="all">الإدارات العامة</option>
              {GENERAL_ADMINISTRATIONS.map((administration) => (
                <option key={administration} value={administration}>
                  {administration}
                </option>
              ))}
            </select>
            {generalAdministration !== "all" && SUB_DEPARTMENTS[generalAdministration] && (
              <select
                value={subDepartment}
                onChange={(e) => setSubDepartment(e.target.value)}
                aria-label="الإدارات الفرعية"
                className="h-11 px-3 rounded-lg border border-border bg-background text-sm"
              >
                <option value="all">الإدارات الفرعية</option>
                {SUB_DEPARTMENTS[generalAdministration].map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-11 px-3 rounded-lg border border-border bg-background text-sm"
            >
              <option value="all">الحالات</option>
              <option>قيد التنفيذ</option>
              <option>مكتملة</option>
              <option>متأخرة</option>
              <option>مخططة</option>
            </select>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="h-11 px-3 rounded-lg border border-border bg-background text-sm"
            >
              <option value="all">الأولويات</option>
              <option>عالية</option>
              <option>متوسطة</option>
              <option>منخفضة</option>
            </select>
            <input
              type="date"
              title="من تاريخ"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-11 px-2 rounded-lg border border-border bg-background text-xs"
            />
            <input
              type="date"
              title="إلى تاريخ"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-11 px-2 rounded-lg border border-border bg-background text-xs"
            />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-lg border border-border p-0.5">
              <button
                onClick={() => setArchiveView("active")}
                className={`h-8 px-3 rounded-md text-xs ${archiveView === "active" ? "bg-primary text-white" : "text-muted-foreground"}`}
              >
                المشاريع الحالية ({scoped.filter((item) => !item.archived).length})
              </button>
              {canArchive && (
                <>
                  <button
                    onClick={() => setArchiveView("archived")}
                    className={`h-8 px-3 rounded-md text-xs ${archiveView === "archived" ? "bg-primary text-white" : "text-muted-foreground"}`}
                  >
                    المؤرشفة ({scoped.filter((item) => item.archived).length})
                  </button>
                  <button
                    onClick={() => setArchiveView("history")}
                    className={`h-8 px-3 rounded-md text-xs ${archiveView === "history" ? "bg-primary text-white" : "text-muted-foreground"}`}
                  >
                    سجل الأرشفة ({archiveHistory.length})
                  </button>
                </>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              النتائج:{" "}
              <span className="font-semibold text-foreground">
                {archiveView === "history" ? archiveHistory.length : filtered.length}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-border p-0.5 bg-background">
              <button
                onClick={() => setView("table")}
                className={`h-8 px-3 rounded-md text-xs inline-flex items-center gap-1.5 ${view === "table" ? "bg-primary text-white" : "text-muted-foreground"}`}
              >
                <List className="h-3.5 w-3.5" /> جدول
              </button>
              <button
                onClick={() => setView("card")}
                className={`h-8 px-3 rounded-md text-xs inline-flex items-center gap-1.5 ${view === "card" ? "bg-primary text-white" : "text-muted-foreground"}`}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> بطاقات
              </button>
            </div>
            <button
              onClick={() =>
                downloadExcel("agency-projects.xls", [
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
                  ...filtered.map((p) => [
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
              className="h-9 px-3 rounded-lg border border-border bg-background text-sm inline-flex items-center gap-2 text-muted-foreground hover:bg-accent"
            >
              <FileSpreadsheet className="h-4 w-4" /> Excel
            </button>
            <button
              onClick={() =>
                printPdf("تقرير مشاريع الوكالة", [
                  ["المشروع", "القطاع", "المدير", "الحالة", "الإنجاز"],
                  ...filtered.map((p) => [p.name, p.sector, p.manager, p.status, `${p.progress}%`]),
                ])
              }
              className="h-9 px-3 rounded-lg border border-border bg-background text-sm inline-flex items-center gap-2 text-muted-foreground hover:bg-accent"
            >
              <FileDown className="h-4 w-4" /> PDF
            </button>
            {canAdd && (
              <button
                onClick={() => openForm()}
                className="h-9 px-3 rounded-lg bg-primary-deep text-white text-sm inline-flex items-center gap-2 hover:bg-primary"
              >
                <Plus className="h-4 w-4" /> إضافة مشروع
              </button>
            )}
          </div>
        </div>
      </Card>

      <PortfolioIntelligence projects={scoped} />

      {archiveView === "history" ? (
        <Card>
          {archiveHistory.length === 0 ? (
            <EmptyState
              icon={<Archive className="h-6 w-6" />}
              title="لا توجد عمليات أرشفة مسجلة بعد"
              description="ستظهر هنا عمليات الأرشفة والاستعادة مع اسم المنفذ وتاريخ العملية."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[760px]">
                <thead>
                  <tr className="text-xs text-muted-foreground">
                    <th className="text-right px-4 py-3 font-medium">المشروع</th>
                    <th className="text-right px-4 py-3 font-medium">الإجراء</th>
                    <th className="text-right px-4 py-3 font-medium">نفّذه</th>
                    <th className="text-right px-4 py-3 font-medium">الصفة</th>
                    <th className="text-right px-4 py-3 font-medium">التاريخ والوقت</th>
                    <th className="text-right px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {archiveHistory.map((event) => (
                    <tr key={`${event.projectId}-${event.id}`} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{event.projectName}</td>
                      <td className="px-4 py-3">
                        <Badge tone={event.action === "أرشفة" ? "warning" : "success"}>
                          {event.action}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-medium">{event.actorName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{event.actorRole}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {event.date}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => window.location.assign(`/projects/${event.projectId}`)}
                          className="text-primary text-xs font-semibold hover:underline"
                        >
                          عرض المشروع
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Search className="h-6 w-6" />}
            title="لا توجد نتائج مطابقة"
            description="جرّب تعديل معايير البحث أو الفلاتر."
          />
        </Card>
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
                  {archiveView === "archived" && (
                    <th className="text-right px-4 py-3 font-medium">أرشف بواسطة</th>
                  )}
                  {archiveView === "archived" && (
                    <th className="text-right px-4 py-3 font-medium">تاريخ الأرشفة</th>
                  )}
                  <th className="text-right px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const c = COMPANIES.find((x) => x.id === p.companyId);
                  return (
                    <tr
                      key={p.id}
                      className="border-t border-border hover:bg-accent/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">
                        <button
                          type="button"
                          onClick={() => window.location.assign(`/projects/${p.id}`)}
                          className="hover:text-primary text-right"
                        >
                          {p.name}
                        </button>
                      </td>
                      <td className="px-4 py-3">{p.sector}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c?.name}</td>
                      <td className="px-4 py-3">{p.manager}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          tone={
                            p.priority === "عالية"
                              ? "danger"
                              : p.priority === "متوسطة"
                                ? "warning"
                                : "muted"
                          }
                        >
                          {p.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 w-40">
                        <div className="flex items-center gap-2">
                          <ProgressBar
                            value={p.progress}
                            tone={
                              p.status === "متأخرة"
                                ? "danger"
                                : p.status === "مكتملة"
                                  ? "success"
                                  : "primary"
                            }
                          />
                          <span className="text-xs text-muted-foreground w-10">{p.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-sm font-semibold ${p.health >= 75 ? "text-green-600" : p.health >= 50 ? "text-amber-600" : "text-red-600"}`}
                        >
                          {p.health}%
                        </span>
                      </td>
                      {archiveView === "archived" && (
                        <td className="px-4 py-3">
                          <div className="font-medium">{p.archivedBy ?? "غير مسجل"}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {p.archivedByRole ?? "بيانات أرشفة سابقة"}
                          </div>
                        </td>
                      )}
                      {archiveView === "archived" && (
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {p.archivedAt ?? "—"}
                        </td>
                      )}
                      <td className="px-4 py-3 text-left">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => window.location.assign(`/projects/${p.id}`)}
                            className="text-primary text-xs font-semibold inline-flex items-center gap-1 hover:underline"
                          >
                            التفاصيل <ArrowLeft className="h-3.5 w-3.5" />
                          </button>
                          {canManage && (
                            <button
                              title="تعديل"
                              onClick={() => openForm(p)}
                              className="h-7 w-7 rounded-md hover:bg-accent inline-flex items-center justify-center"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {canArchive && (
                            <button
                              title={p.archived ? "استعادة" : "أرشفة"}
                              onClick={() => archiveProject(p)}
                              className="h-7 w-7 rounded-md hover:bg-red-50 text-red-600 inline-flex items-center justify-center"
                            >
                              <Archive className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
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
              <article
                onClick={() => window.location.assign(`/projects/${p.id}`)}
                key={p.id}
                className="bg-card border border-border rounded-xl p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:shadow-md hover:border-primary/40 transition-all block cursor-pointer"
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
                    <ProgressBar
                      value={p.progress}
                      tone={
                        p.status === "متأخرة"
                          ? "danger"
                          : p.status === "مكتملة"
                            ? "success"
                            : "primary"
                      }
                    />
                    <span className="text-xs text-muted-foreground w-10">{p.progress}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-2 border-t border-border">
                    <div>
                      مدير المشروع: <span className="text-foreground">{p.manager}</span>
                    </div>
                    <div>
                      الأولوية: <span className="text-foreground">{p.priority}</span>
                    </div>
                    <div>
                      البداية: <span className="text-foreground">{p.start}</span>
                    </div>
                    <div>
                      الانتهاء: <span className="text-foreground">{p.end}</span>
                    </div>
                  </div>
                  {archiveView === "archived" && (
                    <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">أرشف بواسطة: </span>
                        <span className="font-semibold">{p.archivedBy ?? "غير مسجل"}</span>
                      </div>
                      <div className="mt-1 text-muted-foreground">
                        {p.archivedAt ?? "لا يوجد تاريخ مسجل"}
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    مخاطر التأخّر:{" "}
                    <span
                      className={
                        p.delayRisk >= 50 ? "text-red-600 font-semibold" : "text-foreground"
                      }
                    >
                      {p.delayRisk}%
                    </span>
                  </span>
                  <span className="text-primary text-xs font-semibold inline-flex items-center gap-1">
                    التفاصيل <ArrowLeft className="h-3.5 w-3.5" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 z-[80] bg-black/45 flex items-center justify-center p-4">
          <form
            onSubmit={submitProject}
            className="w-full max-w-2xl rounded-2xl bg-card border border-border shadow-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  {editing ? "تعديل المشروع" : "إضافة مشروع جديد"}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  تُحفظ البيانات داخل البروتوتايب وتظهر فورًا.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="h-9 w-9 rounded-lg hover:bg-accent inline-flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field
                label="اسم المشروع"
                value={form.name}
                onChange={(value) => setForm({ ...form, name: value })}
              />
              {can(user.role, "projects.assignManager") && (
                <Field
                  label="مدير المشروع"
                  value={form.manager}
                  onChange={(value) => setForm({ ...form, manager: value })}
                />
              )}
              <SelectField
                label="القطاع"
                value={form.sector}
                onChange={(value) => setForm({ ...form, sector: value })}
                options={[...SECTORS]}
              />
              <SelectField
                label="الشركة"
                value={form.companyId}
                onChange={(value) => setForm({ ...form, companyId: value })}
                options={COMPANIES.map((c) => ({ value: String(c.id), label: c.name }))}
              />
              <Field
                label="تاريخ البداية"
                type="date"
                value={form.start}
                onChange={(value) => setForm({ ...form, start: value })}
              />
              <Field
                label="تاريخ النهاية"
                type="date"
                value={form.end}
                onChange={(value) => setForm({ ...form, end: value })}
              />
              <Field
                label="وصف المشروع"
                value={form.description}
                onChange={(value) => setForm({ ...form, description: value })}
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="h-10 px-4 rounded-lg border border-border"
              >
                إلغاء
              </button>
              <button className="h-10 px-5 rounded-lg bg-primary text-white font-semibold">
                حفظ المشروع
              </button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="space-y-1.5 text-xs font-medium">
      <span>{label}</span>
      <input
        required={label === "اسم المشروع"}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-lg border border-border px-3 bg-background"
      />
    </label>
  );
}
function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<string | { value: string; label: string }>;
}) {
  return (
    <label className="space-y-1.5 text-xs font-medium">
      <span>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-lg border border-border px-3 bg-background"
      >
        {options.map((option) =>
          typeof option === "string" ? (
            <option key={option}>{option}</option>
          ) : (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ),
        )}
      </select>
    </label>
  );
}
