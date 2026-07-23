import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bell, Eye, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { AppShell, useRequirePermission } from "@/components/app-shell";
import { Badge, Card, EmptyState } from "@/components/ui-bits";
import { PageSkeleton } from "@/components/page-skeleton";
import { getManagedUsers } from "@/lib/auth";
import { addTargetedNotification, recordAudit } from "@/lib/portal-store";
import {
  getWorkshops,
  noResponseCount,
  saveWorkshops,
  workshopStatus,
  STANDARD_EVALUATION_QUESTIONS,
  type TargetType,
  type Workshop,
  type WorkshopAutomation,
  type EvaluationQuestion,
  type EvaluationQuestionType,
  type WorkshopParticipant,
} from "@/lib/workshops";

export const Route = createFileRoute("/capacity-building")({
  component: CapacityBuildingPage,
  head: () => ({ meta: [{ title: "الشركات وبناء القدرات — منصة إدارة وحوكمة المشاريع" }] }),
});

const GENERAL_ADMINISTRATIONS = [
  "الإدارة العامة للتحول الرقمي",
  "الإدارة العامة للحلول التطبيقية",
  "الإدارة العامة للبنية التحتية وخدمات المستفيدين",
];

const ALL_SUB_DEPARTMENTS = [
  "إدارة التقنيات الناشئة",
  "إدارة البنية المؤسسية",
  "إدارة التخطيط والتميز المؤسسي",
  "إدارة الخدمات الإلكترونية",
  "إدارة الحلول المؤسسية",
  "إدارة ذكاء الأعمال",
  "إدارة المنتجات الرقمية",
  "إدارة قواعد البيانات",
  "إدارة الشبكات والاتصالات",
  "إدارة تشغيل أنظمة البنية التحتية",
  "إدارة خدمات المستفيدين",
];

const EMPTY_AUTOMATION: WorkshopAutomation = {
  invitations: true,
  reminder: true,
  responses: true,
  evaluation: true,
  finalReport: true,
};

function newEvaluationQuestion(): EvaluationQuestion {
  return {
    id: `question-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: "",
    type: "rating",
    required: true,
  };
}

const EMPTY_FORM = {
  title: "",
  company: "",
  presenter: "",
  description: "",
  location: "",
  date: "",
  startTime: "",
  endTime: "",
  organizer: "وكالة الوزارة لتقنية المعلومات والتحول الرقمي",
  notes: "",
  targetType: "all" as TargetType,
  targetLabel: "جميع موظفي الوكالة",
  manualRecipients: "",
  automations: EMPTY_AUTOMATION,
  evaluationQuestions: [newEvaluationQuestion()] as EvaluationQuestion[],
};

function resolveParticipants(form: typeof EMPTY_FORM): WorkshopParticipant[] {
  const users = getManagedUsers().filter((account) => account.active !== false);
  const selected =
    form.targetType === "all"
      ? users.filter((account) => account.role !== "admin" && account.role !== "capacity")
      : form.targetType === "management"
        ? users.filter((account) => account.department?.trim() === form.targetLabel.trim())
        : form.targetType === "section"
          ? users.filter((account) => account.section?.trim() === form.targetLabel.trim())
          : form.manualRecipients
              .split(/[,،\n]/)
              .map((email) => email.trim().toLowerCase())
              .filter(Boolean)
              .map(
                (email) =>
                  users.find((account) => account.email.toLowerCase() === email) ?? {
                    name: email.split("@")[0] ?? email,
                    email,
                    role: "employee" as const,
                    roleLabel: "موظف مدعو للورش",
                  },
              );
  return Array.from(
    new Map(selected.map((account) => [account.email.toLowerCase(), account])).values(),
  ).map((account) => ({
    email: account.email.toLowerCase(),
    name: account.name,
    phone: account.phone,
    response: "بانتظار الرد",
  }));
}

function CapacityBuildingPage() {
  const user = useRequirePermission("workshops.manage");
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [workshops, setWorkshops] = useState<Workshop[]>(() => getWorkshops());
  const [query, setQuery] = useState("");
  const [company, setCompany] = useState("all");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("all");
  const [archiveView, setArchiveView] = useState<"active" | "archived">("active");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Workshop | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const companies = useMemo(
    () => Array.from(new Set(workshops.map((workshop) => workshop.company))).filter(Boolean),
    [workshops],
  );

  const filtered = useMemo(
    () =>
      workshops.filter((workshop) => {
        if (archiveView === "archived" ? !workshop.archived : workshop.archived) return false;
        if (query && !workshop.title.includes(query)) return false;
        if (company !== "all" && workshop.company !== company) return false;
        if (date && workshop.date !== date) return false;
        if (status !== "all" && workshopStatus(workshop) !== status) return false;
        return true;
      }),
    [archiveView, company, date, query, status, workshops],
  );

  const canArchive = user?.role === "admin" || user?.role === "capacity";

  if (!user) return <PageSkeleton />;
  if (/^\/capacity-building\/[^/]+$/.test(pathname)) return <Outlet />;

  const resolvedParticipants = resolveParticipants(form);
  const audienceCount = editing?.participants.length
    ? editing.participants.length
    : resolvedParticipants.length;

  function openForm(workshop?: Workshop) {
    const now = new Date();
    const today = now.toLocaleDateString("en-CA");
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
    nextHour.setMinutes(0, 0, 0);
    const startStr = nextHour.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const endHour = new Date(nextHour.getTime() + 2 * 60 * 60 * 1000);
    const endStr = endHour.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

    setEditing(workshop ?? null);
    setForm(
      workshop
        ? {
            title: workshop.title,
            company: workshop.company,
            presenter: workshop.presenter,
            description: workshop.description,
            location: workshop.location,
            date: workshop.date,
            startTime: workshop.startTime,
            endTime: workshop.endTime,
            organizer: workshop.organizer,
            notes: workshop.notes,
            targetType: workshop.targetType,
            targetLabel: workshop.targetLabel,
            manualRecipients:
              workshop.targetType === "manual"
                ? workshop.participants.map((participant) => participant.email).join(", ")
                : "",
            automations: workshop.automations,
            evaluationQuestions: workshop.evaluationQuestions.length
              ? workshop.evaluationQuestions.map((question) => ({ ...question }))
              : [newEvaluationQuestion()],
          }
        : {
            ...EMPTY_FORM,
            company: "",
            date: today,
            startTime: startStr,
            endTime: endStr,
            automations: { ...EMPTY_AUTOMATION },
            evaluationQuestions: [newEvaluationQuestion()],
          },
    );
    setShowForm(true);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim() || !form.company || !form.date || !form.startTime || !form.endTime)
      return;
    const evaluationQuestions = STANDARD_EVALUATION_QUESTIONS;
    const targetLabel =
      form.targetType === "all" ? "جميع موظفي الوكالة" : form.targetLabel.trim() || "الفئة المحددة";
    const now = new Date().toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" });
    const participants = editing?.participants.length ? editing.participants : resolvedParticipants;
    const shouldSendInvitations =
      form.automations.invitations && (!editing || editing.participants.length === 0);
    const messageChannels = Array.from(
      new Set([
        "المنصة" as const,
        "البريد الإلكتروني" as const,
        ...(participants.some((participant) => participant.phone) ? (["رسالة جوال"] as const) : []),
      ]),
    );
    const base: Workshop = {
      id: editing?.id ?? Date.now(),
      title: form.title.trim(),
      company: form.company,
      presenter: form.presenter.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      organizer: form.organizer.trim(),
      notes: form.notes.trim(),
      targetType: form.targetType,
      targetLabel,
      audienceCount: participants.length,
      confirmed: editing?.confirmed ?? 0,
      declined: editing?.declined ?? 0,
      invitationStatus:
        editing?.invitationStatus ??
        (form.automations.invitations ? "جاري انتظار الردود" : "لم يتم الإرسال"),
      cancelled: editing?.cancelled ?? false,
      automations: form.automations,
      messages:
        editing?.messages ??
        (form.automations.invitations
          ? [
              {
                id: Date.now(),
                type: "دعوة",
                sentAt: now,
                status: "تم الإرسال",
                opened: 0,
                channels: messageChannels,
              },
            ]
          : []),
      evaluationAverage: editing?.evaluationAverage,
      evaluationResponses: editing?.evaluationResponses,
      evaluationComments: editing?.evaluationComments ?? [],
      evaluationQuestions,
      participants,
    };
    const next = editing
      ? workshops.map((item) => (item.id === editing.id ? base : item))
      : [base, ...workshops];
    setWorkshops(next);
    saveWorkshops(next);
    if (shouldSendInvitations) {
      participants.forEach((participant) =>
        addTargetedNotification(
          participant.email,
          `دعوة لحضور ورشة: ${base.title}`,
          `ندعوك لحضور ورشة ${base.title} المقدمة من ${base.company}. يرجى تأكيد الحضور أو الاعتذار من داخل المنصة.`,
          "/workshop-invitations",
        ),
      );
    }
    recordAudit(editing ? "تعديل بيانات ورشة" : "تسجيل ورشة", "ورشة", base.title, base.id);
    setShowForm(false);
  }

  function cancelWorkshop(workshop: Workshop) {
    if (!window.confirm(`هل تريد إلغاء ورشة «${workshop.title}»؟`)) return;
    const next = workshops.map((item) =>
      item.id === workshop.id ? { ...item, cancelled: true } : item,
    );
    setWorkshops(next);
    saveWorkshops(next);
    recordAudit("إلغاء ورشة", "ورشة", workshop.title, workshop.id);
  }

  function toggleArchive(workshop: Workshop) {
    const action = workshop.archived ? "استعادة" : "أرشفة";
    if (!window.confirm(`هل تريد ${action} ورشة «${workshop.title}»؟`)) return;
    const next = workshops.map((item) =>
      item.id === workshop.id ? { ...item, archived: !workshop.archived } : item,
    );
    setWorkshops(next);
    saveWorkshops(next);
    recordAudit(`${action} ورشة`, "ورشة", workshop.title, workshop.id);
  }

  return (
    <AppShell
      role={user.role}
      userName={user.name}
      roleLabel={user.roleLabel}
      pageTitle="الشركات وبناء القدرات"
      pageSubtitle="تسجيل الورش المعتمدة ومتابعة الدعوات والتذكيرات والتقييم والتقرير النهائي"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">إدارة ورش العمل</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            تبدأ الإجراءات هنا بعد اعتماد الورشة مسبقًا من الإدارة.
          </p>
        </div>
        <button
          onClick={() => openForm()}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          تسجيل ورشة
        </button>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="البحث باسم الورشة"
              className="h-11 w-full rounded-lg border border-border bg-background pr-10 pl-3 text-sm"
            />
          </div>
          <select
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            className="h-11 rounded-lg border border-border bg-background px-3 text-sm"
          >
            <option value="all">جميع الشركات</option>
            {companies.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            aria-label="التصفية حسب التاريخ"
            className="h-11 rounded-lg border border-border bg-background px-3 text-sm"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-11 rounded-lg border border-border bg-background px-3 text-sm"
          >
            <option value="all">جميع حالات الورشة</option>
            <option>قادمة</option>
            <option>جارية</option>
            <option>منتهية</option>
            <option>ملغاة</option>
          </select>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="inline-flex rounded-lg border border-border p-0.5">
            <button
              onClick={() => setArchiveView("active")}
              className={`h-8 px-3 rounded-md text-xs ${archiveView === "active" ? "bg-primary text-white" : "text-muted-foreground"}`}
            >
              الورش الحالية ({workshops.filter((item) => !item.archived).length})
            </button>
            {canArchive && (
              <button
                onClick={() => setArchiveView("archived")}
                className={`h-8 px-3 rounded-md text-xs ${archiveView === "archived" ? "bg-primary text-white" : "text-muted-foreground"}`}
              >
                الورش المؤرشفة ({workshops.filter((item) => item.archived).length})
              </button>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            النتائج: <span className="font-semibold text-foreground">{filtered.length}</span>
          </div>
        </div>
      </Card>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Plus className="h-6 w-6" />}
            title="لا توجد ورش مسجلة"
            description="سجّل أول ورشة بعد اعتمادها من الإدارة لبدء الإجراءات التلقائية."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((workshop) => {
              const currentStatus = workshopStatus(workshop);
              return (
                <div
                  key={workshop.id}
                  className="relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-base line-clamp-1" title={workshop.title}>
                          {workshop.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{workshop.company}</span>
                          <span>•</span>
                          <span>{workshop.presenter}</span>
                        </div>
                      </div>
                      <Badge
                        tone={
                          currentStatus === "قادمة"
                            ? "primary"
                            : currentStatus === "جارية"
                              ? "warning"
                              : currentStatus === "منتهية"
                                ? "success"
                                : "muted"
                        }
                      >
                        {currentStatus}
                      </Badge>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">التاريخ والوقت</div>
                        <div className="mt-1 font-medium">
                          {workshop.date}{" "}
                          <span className="text-xs font-normal text-muted-foreground">
                            ({workshop.startTime} - {workshop.endTime})
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">المكان</div>
                        <div className="mt-1 font-medium truncate" title={workshop.location}>
                          {workshop.location}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-lg bg-muted/30 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium">حالة الدعوات</span>
                        <Badge tone="muted">{workshop.invitationStatus}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-green-500"></span>
                          {workshop.confirmed} مؤكد
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-red-500"></span>
                          {workshop.declined} معتذر
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-gray-300"></span>
                          {noResponseCount(workshop)} بلا رد
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      title="عرض التفاصيل"
                      onClick={() =>
                        navigate({
                          to: "/capacity-building/$id",
                          params: { id: String(workshop.id) },
                        })
                      }
                      className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                    >
                      <Eye className="h-4 w-4" />
                      عرض
                    </button>
                    {currentStatus !== "منتهية" && currentStatus !== "ملغاة" && (
                      <>
                        <button
                          title="تعديل"
                          onClick={() => openForm(workshop)}
                          className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                          تعديل
                        </button>
                        <button
                          onClick={() => cancelWorkshop(workshop)}
                          className="h-9 flex-1 rounded-lg border border-border bg-background text-xs hover:bg-accent hover:text-accent-foreground"
                        >
                          إلغاء
                        </button>
                      </>
                    )}
                    {canArchive && (
                      <button
                        onClick={() => toggleArchive(workshop)}
                        className="h-9 flex-1 rounded-lg border border-border bg-background text-xs hover:bg-accent hover:text-accent-foreground"
                      >
                        {workshop.archived ? "استعادة" : "أرشفة"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {showForm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4">
          <form
            onSubmit={submit}
            className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {editing ? "تعديل بيانات الورشة" : "تسجيل ورشة"}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  يتم تسجيل الورشة بعد اعتمادها مسبقًا من الإدارة.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field
                label="عنوان الورشة"
                value={form.title}
                onChange={(value) => setForm({ ...form, title: value })}
                required
              />
              <Field
                label="اسم الشركة"
                value={form.company}
                onChange={(value) => setForm({ ...form, company: value })}
                required
              />
              <Field
                label="مسؤول الورشة"
                value={form.presenter}
                onChange={(value) => setForm({ ...form, presenter: value })}
                required
              />
              <Field
                label="مكان إقامة الورشة"
                value={form.location}
                onChange={(value) => setForm({ ...form, location: value })}
                required
              />
              <Field
                label="تاريخ الورشة"
                type="date"
                value={form.date}
                onChange={(value) => setForm({ ...form, date: value })}
                required
                min={new Date().toLocaleDateString("en-CA")}
              />
              <Field
                label="وقت البداية"
                type="time"
                value={form.startTime}
                onChange={(value) => setForm({ ...form, startTime: value })}
                required
                min={
                  form.date === new Date().toLocaleDateString("en-CA")
                    ? new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
                    : undefined
                }
              />
              <Field
                label="وقت النهاية"
                type="time"
                value={form.endTime}
                onChange={(value) => setForm({ ...form, endTime: value })}
                required
                min={form.startTime || undefined}
              />
              <Field
                label="الجهة المنظمة"
                value={form.organizer}
                onChange={(value) => setForm({ ...form, organizer: value })}
                required
              />
              <Field
                label="وصف الورشة"
                value={form.description}
                onChange={(value) => setForm({ ...form, description: value })}
              />
              <Field
                label="ملاحظات (اختياري)"
                value={form.notes}
                onChange={(value) => setForm({ ...form, notes: value })}
              />
            </div>
            <div className="mt-5 rounded-xl border border-border p-4">
              <h3 className="font-bold">الفئة المستهدفة</h3>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="space-y-1.5 text-xs font-medium">
                  <span>طريقة الاختيار</span>
                  <select
                    value={form.targetType}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        targetType: event.target.value as TargetType,
                        targetLabel: event.target.value === "all" ? "جميع موظفي الوكالة" : "",
                      })
                    }
                    className="h-11 w-full rounded-lg border border-border bg-background px-3"
                  >
                    <option value="all">جميع موظفي وكالة تقنية المعلومات والتحول الرقمي</option>
                    <option value="management">إدارة محددة</option>
                    <option value="section">قسم محدد</option>
                    <option value="manual">اختيار يدوي للموظفين</option>
                  </select>
                </label>
                {form.targetType === "management" && (
                  <label className="space-y-1.5 text-xs font-medium">
                    <span>اسم الإدارة</span>
                    <select
                      value={form.targetLabel}
                      onChange={(e) => setForm({ ...form, targetLabel: e.target.value })}
                      className="h-11 w-full rounded-lg border border-border bg-background px-3"
                      required
                    >
                      <option value="" disabled hidden>اختر الإدارة العامة</option>
                      {GENERAL_ADMINISTRATIONS.map((admin) => (
                        <option key={admin} value={admin}>
                          {admin}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {form.targetType === "section" && (
                  <label className="space-y-1.5 text-xs font-medium">
                    <span>اسم القسم</span>
                    <select
                      value={form.targetLabel}
                      onChange={(e) => setForm({ ...form, targetLabel: e.target.value })}
                      className="h-11 w-full rounded-lg border border-border bg-background px-3"
                      required
                    >
                      <option value="" disabled hidden>اختر القسم</option>
                      {ALL_SUB_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {form.targetType === "manual" && (
                  <Field
                    label="البريد الوزاري للموظفين (افصل بفاصلة)"
                    value={form.manualRecipients}
                    onChange={(value) =>
                      setForm({ ...form, manualRecipients: value, targetLabel: "اختيار يدوي" })
                    }
                    required
                  />
                )}
              </div>
              <div className="mt-3 rounded-lg bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
                سيتم إرسال الدعوات إلى {audienceCount} موظفًا.
              </div>
            </div>
            <div className="mt-5 rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold">نموذج التقييم المعتمد</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    سيتم استخدام «نموذج تقييم التعاون والشركات» المعتمد تلقائياً لتقييم هذه الورشة.
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-primary/5 border border-primary/10 px-4 py-3 text-sm text-primary font-medium">
                يحتوي النموذج الثابت على المحاور التالية:
                <ul className="mt-2 list-disc list-inside space-y-1 text-xs text-foreground/80">
                  <li>تحسين الكفاءة أو جودة الخدمات</li>
                  <li>رفع نضج التحول الرقمي أو إدارة البيانات</li>
                  <li>تمكين القيادات أو بناء القدرات الداخلية</li>
                  <li>تقليل المخاطر التشغيلية أو التقنية</li>
                  <li>دعم تحقيق مستهدفات استراتيجية الوكالة</li>
                  <li>الأسئلة النوعية (مجالات الاستفادة، الأثر المتوقع، المخاوف، وغيرها)</li>
                </ul>
              </div>
            </div>
            <div className="mt-5 rounded-xl border border-border p-4">
              <h3 className="font-bold">إعدادات الإجراءات التلقائية</h3>
              <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                {(
                  [
                    ["invitations", "إرسال الدعوات"],
                    ["reminder", "إرسال تذكير قبل الورشة"],
                    ["responses", "متابعة الردود"],
                    ["evaluation", "إرسال نموذج التقييم قبل نهاية الورشة"],
                    ["finalReport", "إنشاء التقرير النهائي بعد انتهاء الورشة"],
                  ] as Array<[keyof WorkshopAutomation, string]>
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-3 text-sm"
                  >
                    <span>{label}</span>
                    <input
                      type="checkbox"
                      checked={form.automations[key]}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          automations: { ...form.automations, [key]: event.target.checked },
                        })
                      }
                      className="h-5 w-5 accent-primary"
                    />
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="h-11 rounded-lg border border-border px-5 text-sm"
              >
                إلغاء
              </button>
              <button className="h-11 rounded-lg bg-primary px-6 text-sm font-semibold text-white">
                حفظ الورشة
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
  required = false,
  min,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  min?: string;
}) {
  return (
    <label className="space-y-1.5 text-xs font-medium">
      <span>{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-border bg-background px-3"
      />
    </label>
  );
}
