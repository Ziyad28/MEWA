import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Calendar,
  Building2,
  User,
  Flag,
  TrendingUp,
  AlertTriangle,
  FileText,
  Download,
  Sparkles,
  CheckCircle2,
  Activity,
  Clock,
  Minus,
  Plus,
} from "lucide-react";
import { AppShell, useRequireAnyPermission } from "@/components/app-shell";
import { ProgressAreaChart } from "@/components/dashboard-charts";
import { ProjectPrototypeWorkspace } from "@/components/project-prototype-workspace";
import {
  Card,
  CardHeader,
  Badge,
  ProgressBar,
  StatusBadge,
  HealthRing,
  Tabs,
  EmptyState,
} from "@/components/ui-bits";
import { PROJECTS, COMPANIES, RISKS, UPDATES, ACTIVITY, PROGRESS_SERIES } from "@/lib/mock-data";
import {
  addNotification,
  downloadDocument,
  getProjects,
  recordAudit,
  saveProjects,
  usePortalData,
  type StoredDocument,
} from "@/lib/portal-store";
import { canAccessProject, canManageProject } from "@/lib/access-control";

export const Route = createFileRoute("/projects/$id")({
  component: ProjectDetail,
  notFoundComponent: () => (
    <div dir="rtl" className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold">المشروع غير موجود</h2>
        <Link to="/projects" className="text-primary text-sm mt-2 inline-block">
          العودة إلى قائمة المشاريع
        </Link>
      </div>
    </div>
  ),
});

const TABS = [
  { id: "overview", label: "نظرة عامة" },
  { id: "updates", label: "التحديثات" },
  { id: "documents", label: "الوثائق" },
  { id: "risks", label: "المخاطر" },
  { id: "ai", label: "تحليل الذكاء الاصطناعي" },
  { id: "activity", label: "سجل النشاط" },
  { id: "workspace", label: "إدارة المشروع" },
];

function ProjectDetail() {
  const user = useRequireAnyPermission(["projects.viewAll", "projects.viewAssigned"]);
  const { id } = Route.useParams();
  const [tab, setTab] = useState("overview");
  const [showProgressEditor, setShowProgressEditor] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const { documents, projects, auditEvents } = usePortalData();
  const project = projects.find((p) => String(p.id) === id);
  if (!project) throw notFound();
  if (!user) return null;
  if (!canAccessProject(user, project)) throw notFound();
  const currentProject = project;

  const company = COMPANIES.find((c) => c.id === project.companyId);
  const docs = documents.filter((d) => d.projectId === project.id);
  const risks = RISKS.filter((r) => r.projectId === project.id);
  const updates = UPDATES.filter((u) => u.projectId === project.id);
  const recordedActivity = auditEvents
    .filter((event) => event.entity === "مشروع" && event.entityId === project.id)
    .map((event) => ({
      id: event.id,
      projectId: project.id,
      actor: event.actorName,
      action: event.action,
      target: event.details,
      date: event.timestamp,
    }));
  const activity = recordedActivity.length
    ? recordedActivity
    : ACTIVITY.filter((a) => a.projectId === project.id);
  const canUpdateProgress = canManageProject(user, project);

  function openProgressEditor() {
    if (!canUpdateProgress) return;
    setProgressValue(currentProject.progress);
    setShowProgressEditor(true);
  }

  function saveProgress() {
    if (!canUpdateProgress) return;
    const nextProgress = Math.min(100, Math.max(0, Math.round(progressValue)));
    const updated = new Date().toLocaleDateString("en-CA");
    saveProjects(
      getProjects().map((item) =>
        item.id === currentProject.id
          ? {
              ...item,
              progress: nextProgress,
              updated,
              spark: [...item.spark.slice(-5), nextProgress],
            }
          : item,
      ),
    );
    recordAudit(
      "تحديث نسبة إنجاز المشروع",
      "مشروع",
      `${currentProject.name}: من ${currentProject.progress}% إلى ${nextProgress}%`,
      currentProject.id,
    );
    addNotification(
      "تحديث نسبة الإنجاز",
      `تم تحديث نسبة إنجاز ${currentProject.name} إلى ${nextProgress}%.`,
      `/projects/${currentProject.id}`,
    );
    setShowProgressEditor(false);
  }

  return (
    <AppShell
      role={user.role}
      userName={user.name}
      roleLabel={user.roleLabel}
      pageTitle={project.name}
      pageSubtitle={project.description}
    >
      <div className="flex items-center gap-2 text-sm">
        <Link
          to="/projects"
          className="text-primary hover:underline inline-flex items-center gap-1"
        >
          <ArrowRight className="h-4 w-4" /> المشاريع
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground">{project.name}</span>
      </div>

      {/* Hero */}
      <Card className="p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <HealthRing value={project.progress} size={84} label="نسبة الإنجاز" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge tone="primary">{project.sector}</Badge>
                <StatusBadge status={project.status} />
                <Badge
                  tone={
                    project.priority === "عالية"
                      ? "danger"
                      : project.priority === "متوسطة"
                        ? "warning"
                        : "muted"
                  }
                >
                  أولوية {project.priority}
                </Badge>
              </div>
              <h2 className="mt-2 text-lg font-bold">{project.name}</h2>
              <div className="text-xs text-muted-foreground mt-1">آخر تحديث: {project.updated}</div>
            </div>
          </div>
          <div className="space-y-3 lg:min-w-[430px]">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <MiniStat
                icon={<TrendingUp className="h-4 w-4" />}
                label="صحة المشروع"
                value={`${project.health}%`}
              />
              <MiniStat
                icon={<AlertTriangle className="h-4 w-4" />}
                label="مخاطر التأخر"
                value={`${project.delayRisk}%`}
                tone={project.delayRisk >= 50 ? "danger" : "primary"}
              />
              <MiniStat
                icon={<Calendar className="h-4 w-4" />}
                label="الانتهاء المخطط"
                value={project.end}
              />
            </div>
            {canUpdateProgress && (
              <button
                type="button"
                onClick={openProgressEditor}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                <TrendingUp className="h-4 w-4" />
                تحديث نسبة الإنجاز
              </button>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <Tabs
          tabs={[
            ...TABS.slice(0, 2),
            { ...TABS[2]!, count: docs.length },
            { ...TABS[3]!, count: risks.length },
            ...TABS.slice(4),
          ]}
          active={tab}
          onChange={setTab}
        />

        <div className="p-5">
          {tab === "overview" && <Overview project={project} company={company} />}
          {tab === "updates" && <UpdatesTab updates={updates} />}
          {tab === "documents" && <DocsTab docs={docs} />}
          {tab === "risks" && <RisksTab risks={risks} />}
          {tab === "ai" && <AITab project={project} />}
          {tab === "activity" && <ActivityTab activity={activity} />}
          {tab === "workspace" && <ProjectPrototypeWorkspace projectId={project.id} user={user} />}
        </div>
      </Card>

      {showProgressEditor && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h2 className="text-lg font-bold">تحديث نسبة إنجاز المشروع</h2>
            <p className="mt-1 text-sm text-muted-foreground">{project.name}</p>
            <div className="mt-6 flex items-center justify-center gap-3" dir="ltr">
              <button
                type="button"
                aria-label="خفض نسبة الإنجاز 5 بالمئة"
                onClick={() => setProgressValue((value) => Math.max(0, value - 5))}
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border text-primary hover:bg-accent"
              >
                <Minus className="h-5 w-5" />
              </button>
              <label className="relative w-36">
                <span className="sr-only">نسبة الإنجاز الجديدة</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={progressValue}
                  onChange={(event) => setProgressValue(Number(event.target.value))}
                  className="h-16 w-full rounded-xl border border-border bg-background px-4 text-center text-2xl font-bold outline-none focus:border-primary"
                />
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">
                  %
                </span>
              </label>
              <button
                type="button"
                aria-label="زيادة نسبة الإنجاز 5 بالمئة"
                onClick={() => setProgressValue((value) => Math.min(100, value + 5))}
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border text-primary hover:bg-accent"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowProgressEditor(false)}
                className="h-10 rounded-lg border border-border px-4 text-sm"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={saveProgress}
                className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-white"
              >
                حفظ نسبة الإنجاز
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function MiniStat({
  icon,
  label,
  value,
  tone = "primary",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "primary" | "danger";
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span className={tone === "danger" ? "text-red-600" : "text-primary"}>{icon}</span>
        {label}
      </div>
      <div
        className={`mt-1 text-lg font-bold ${tone === "danger" ? "text-red-600" : "text-foreground"}`}
      >
        {value}
      </div>
    </div>
  );
}

function Overview({
  project,
  company,
}: {
  project: (typeof PROJECTS)[number];
  company?: (typeof COMPANIES)[number];
}) {
  const progressData = PROGRESS_SERIES.map((point) => ({
    ...point,
    value: Math.round((point.value / PROGRESS_SERIES.at(-1)!.value) * project.progress),
  }));
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2 overflow-hidden">
        <CardHeader
          title="نسبة تقدم المشروع"
          subtitle="التقدم التراكمي خلال آخر 6 أشهر"
          action={
            <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
              محدث اليوم
            </span>
          }
        />
        <div className="px-4 pb-5 h-[300px]">
          <ProgressAreaChart data={progressData} />
        </div>
      </Card>

      <Card>
        <CardHeader title="معلومات المشروع" />
        <div className="px-5 pb-5 space-y-2.5 text-sm">
          <InfoRow
            icon={<Building2 className="h-3.5 w-3.5" />}
            label="الشركة المنفّذة"
            value={company?.name ?? "-"}
          />
          <InfoRow
            icon={<User className="h-3.5 w-3.5" />}
            label="مدير المشروع"
            value={project.manager}
          />
          <InfoRow icon={<Flag className="h-3.5 w-3.5" />} label="القطاع" value={project.sector} />
          <InfoRow
            icon={<Calendar className="h-3.5 w-3.5" />}
            label="تاريخ البداية"
            value={project.start}
          />
          <InfoRow
            icon={<Calendar className="h-3.5 w-3.5" />}
            label="الانتهاء المخطط"
            value={project.end}
          />
        </div>
      </Card>

      <Card className="lg:col-span-3 border-primary/20 bg-primary/[0.02]">
        <CardHeader
          title="ملخص الذكاء الاصطناعي"
          action={
            <span className="inline-flex items-center gap-1 text-[11px] text-primary font-semibold">
              <Sparkles className="h-3 w-3" /> مُولّد آليًا
            </span>
          }
        />
        <div className="px-5 pb-5 text-sm leading-7 text-foreground">
          يسير المشروع بوتيرة {project.progress >= 60 ? "جيدة" : "متوسطة"} مع نسبة إنجاز{" "}
          {project.progress}% ومؤشر صحة {project.health}%.
          {project.delayRisk >= 50
            ? " ترتفع مؤشرات مخاطر التأخّر بشكل يتطلب مراجعة عاجلة للخطة الزمنية وتعزيز الموارد التقنية."
            : " تظل مؤشرات المخاطر ضمن الحدود المقبولة مع الحاجة للمتابعة الدورية."}{" "}
          يُوصى بمواصلة اجتماعات المتابعة الأسبوعية وتحديث سجل المخاطر شهريًا.
        </div>
      </Card>

      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        <DetailTile
          title="المدة الزمنية"
          value={`${Math.max(1, Math.round((new Date(project.end).getTime() - new Date(project.start).getTime()) / 86400000 / 30))} شهر`}
          note={`${project.start} — ${project.end}`}
        />
        <DetailTile
          title="المخرج القادم"
          value={project.progress >= 75 ? "التسليم التشغيلي" : "اعتماد المرحلة التالية"}
          note="وفق الخطة التنفيذية"
        />
        <DetailTile
          title="حوكمة المتابعة"
          value={project.delayRisk >= 50 ? "متابعة أسبوعية" : "متابعة شهرية"}
          note={`مخاطر التأخير ${project.delayRisk}%`}
        />
      </div>

      <Card className="lg:col-span-2">
        <CardHeader title="النطاق والمخرجات الرئيسية" />
        <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            "تحليل واعتماد المتطلبات",
            "تطوير الحل التقني",
            "الاختبارات وضمان الجودة",
            "التدريب والتسليم التشغيلي",
          ].map((item, index) => (
            <div key={item} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <span
                className={`h-7 w-7 rounded-full inline-flex items-center justify-center text-xs font-bold ${project.progress >= (index + 1) * 25 ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}
              >
                {index + 1}
              </span>
              <span className="text-sm font-medium">{item}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="أصحاب المصلحة" />
        <div className="px-5 pb-5 space-y-3 text-sm">
          <InfoRow
            icon={<User className="h-3.5 w-3.5" />}
            label="مالك العمل"
            value="الوكالة المساعدة للتحول الرقمي"
          />
          <InfoRow
            icon={<User className="h-3.5 w-3.5" />}
            label="مدير المشروع"
            value={project.manager}
          />
          <InfoRow
            icon={<Building2 className="h-3.5 w-3.5" />}
            label="الشريك المنفذ"
            value={company?.name ?? "-"}
          />
        </div>
      </Card>
    </div>
  );
}

function DetailTile({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <Card className="p-4">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="mt-2 text-xl font-bold text-foreground">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{note}</div>
    </Card>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-border/40 last:border-0">
      <span className="text-muted-foreground text-xs inline-flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className="font-medium text-foreground text-xs">{value}</span>
    </div>
  );
}

function UpdatesTab({ updates }: { updates: typeof UPDATES }) {
  if (updates.length === 0)
    return (
      <EmptyState
        icon={<Clock className="h-6 w-6" />}
        title="لا توجد تحديثات بعد"
        description="سيظهر هنا سجل التحديثات الزمنية للمشروع."
      />
    );
  return (
    <div className="relative pr-4">
      <div className="absolute right-2 top-2 bottom-2 w-px bg-border" />
      <div className="space-y-4">
        {updates.map((u) => (
          <div key={u.id} className="relative pr-6">
            <span className="absolute right-0 top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-primary/10" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{u.date}</span>
              <span>·</span>
              <span>{u.author}</span>
            </div>
            <div className="mt-1 font-semibold text-foreground">{u.title}</div>
            <div className="text-sm text-muted-foreground mt-1 leading-6">{u.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocsTab({ docs }: { docs: StoredDocument[] }) {
  if (docs.length === 0)
    return (
      <EmptyState
        icon={<FileText className="h-6 w-6" />}
        title="لا توجد وثائق"
        description="لم تُرفع أي وثيقة لهذا المشروع بعد."
      />
    );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[720px]">
        <thead>
          <tr className="text-xs text-muted-foreground">
            <th className="text-right px-3 py-2 font-medium">اسم الوثيقة</th>
            <th className="text-right px-3 py-2 font-medium">النوع</th>
            <th className="text-right px-3 py-2 font-medium">أضيفت بواسطة</th>
            <th className="text-right px-3 py-2 font-medium">التاريخ</th>
            <th className="text-right px-3 py-2 font-medium">الحجم</th>
            <th className="text-right px-3 py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {docs.map((d) => (
            <tr key={d.id} className="border-t border-border hover:bg-accent/40">
              <td className="px-3 py-3 font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                {d.name}
              </td>
              <td className="px-3 py-3">
                <Badge tone="muted">{d.type}</Badge>
              </td>
              <td className="px-3 py-3 text-muted-foreground">{d.uploadedBy}</td>
              <td className="px-3 py-3 text-muted-foreground">{d.date}</td>
              <td className="px-3 py-3 text-muted-foreground">{d.size}</td>
              <td className="px-3 py-3 text-left">
                <button
                  title={`تنزيل ${d.name}`}
                  onClick={() => downloadDocument(d)}
                  className="h-8 w-8 rounded-md hover:bg-accent inline-flex items-center justify-center text-muted-foreground"
                >
                  <Download className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RisksTab({ risks }: { risks: typeof RISKS }) {
  if (risks.length === 0)
    return (
      <EmptyState
        icon={<AlertTriangle className="h-6 w-6" />}
        title="لا توجد مخاطر مسجّلة"
        description="لم يتم تسجيل أي مخاطر لهذا المشروع بعد."
      />
    );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[820px]">
        <thead>
          <tr className="text-xs text-muted-foreground">
            <th className="text-right px-3 py-2 font-medium">المخاطرة</th>
            <th className="text-right px-3 py-2 font-medium">الأثر</th>
            <th className="text-right px-3 py-2 font-medium">الاحتمالية</th>
            <th className="text-right px-3 py-2 font-medium">المسؤول</th>
            <th className="text-right px-3 py-2 font-medium">إجراء التخفيف</th>
            <th className="text-right px-3 py-2 font-medium">الحالة</th>
            <th className="text-right px-3 py-2 font-medium">درجة المخاطرة</th>
          </tr>
        </thead>
        <tbody>
          {risks.map((r) => (
            <tr key={r.id} className="border-t border-border">
              <td className="px-3 py-3 font-medium">{r.risk}</td>
              <td className="px-3 py-3">
                <Badge
                  tone={r.impact === "عالي" ? "danger" : r.impact === "متوسط" ? "warning" : "muted"}
                >
                  {r.impact}
                </Badge>
              </td>
              <td className="px-3 py-3">
                <Badge
                  tone={
                    r.probability === "عالي"
                      ? "danger"
                      : r.probability === "متوسط"
                        ? "warning"
                        : "muted"
                  }
                >
                  {r.probability}
                </Badge>
              </td>
              <td className="px-3 py-3">{r.owner}</td>
              <td className="px-3 py-3 text-muted-foreground max-w-xs">{r.mitigation}</td>
              <td className="px-3 py-3">
                <Badge
                  tone={
                    r.status === "مغلق"
                      ? "success"
                      : r.status === "قيد المعالجة"
                        ? "warning"
                        : "danger"
                  }
                >
                  {r.status}
                </Badge>
              </td>
              <td className="px-3 py-3 w-40">
                <div className="flex items-center gap-2">
                  <ProgressBar
                    value={r.score}
                    tone={r.score >= 70 ? "danger" : r.score >= 40 ? "warning" : "success"}
                  />
                  <span className="text-xs text-muted-foreground w-9">{r.score}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AITab({ project }: { project: (typeof PROJECTS)[number] }) {
  const expectedCompletion =
    project.delayRisk >= 50
      ? "متأخّر عن الخطة بحوالي 45 يومًا"
      : project.progress >= 70
        ? "قبل الموعد المخطط بأيام قليلة"
        : "مطابق للخطة الزمنية";
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2 border-primary/20 bg-primary/[0.02]">
        <CardHeader
          title="الملخص التنفيذي"
          action={
            <span className="inline-flex items-center gap-1 text-[11px] text-primary font-semibold">
              <Sparkles className="h-3 w-3" /> AI
            </span>
          }
        />
        <div className="px-5 pb-5 space-y-3 text-sm leading-7">
          <p>
            يعرض المشروع نسبة إنجاز {project.progress}% مع مؤشر صحة {project.health}%. تشير
            التحليلات إلى أن المشروع {expectedCompletion}.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <MetricCard
              label="مؤشر الصحة"
              value={`${project.health}%`}
              tone={project.health >= 75 ? "success" : project.health >= 50 ? "warning" : "danger"}
            />
            <MetricCard
              label="مؤشر مخاطر التأخر"
              value={`${project.delayRisk}%`}
              tone={
                project.delayRisk >= 50 ? "danger" : project.delayRisk >= 25 ? "warning" : "success"
              }
            />
            <MetricCard
              label="نسبة الإنجاز الحالية"
              value={`${project.progress}%`}
              tone="primary"
            />
            <MetricCard
              label="الأولوية المقترحة"
              value={project.priority}
              tone={project.priority === "عالية" ? "danger" : "primary"}
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="التوصيات" />
        <div className="px-5 pb-5 space-y-3">
          {[
            "مراجعة الخطة الزمنية للربع القادم",
            "تعزيز الموارد التقنية بمهارات محددة",
            "توثيق المخاطر الجديدة ومراجعتها أسبوعيًا",
            "تفعيل قنوات تواصل مباشرة مع الشركة المنفّذة",
          ].map((t) => (
            <div key={t} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader title="خارطة المخاطر التنبؤية" />
        <div className="px-5 pb-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "مخاطر الجدول الزمني", v: project.delayRisk },
            { label: "مخاطر الموارد", v: Math.max(10, 100 - project.health) },
            { label: "مخاطر النطاق", v: 30 },
            { label: "مخاطر الجودة", v: 22 },
          ].map((r) => (
            <div key={r.label} className="rounded-lg border border-border p-3">
              <div className="text-xs text-muted-foreground">{r.label}</div>
              <div className="mt-2 flex items-center gap-2">
                <ProgressBar
                  value={r.v}
                  tone={r.v >= 60 ? "danger" : r.v >= 35 ? "warning" : "success"}
                />
                <span className="text-xs w-8 text-muted-foreground">{r.v}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "primary" | "success" | "warning" | "danger";
}) {
  const map = {
    primary: "text-primary",
    success: "text-green-600",
    warning: "text-amber-600",
    danger: "text-red-600",
  };
  return (
    <div className="rounded-lg border border-border p-3 bg-card">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 text-xl font-bold ${map[tone]}`}>{value}</div>
    </div>
  );
}

function ActivityTab({ activity }: { activity: typeof ACTIVITY }) {
  if (activity.length === 0)
    return <EmptyState icon={<Activity className="h-6 w-6" />} title="لا يوجد نشاط بعد" />;
  return (
    <div className="divide-y divide-border">
      {activity.map((a) => (
        <div key={a.id} className="py-3 flex items-start gap-3 text-sm">
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Activity className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm">
              <span className="font-semibold">{a.actor}</span>{" "}
              <span className="text-muted-foreground">{a.action}</span>{" "}
              <span className="text-foreground">{a.target}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{a.date}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
