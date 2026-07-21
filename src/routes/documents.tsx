import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  Search,
  Download,
  FileText,
  Upload,
  X,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  ShieldOff,
  History,
} from "lucide-react";
import { AppShell, useRequirePermission } from "@/components/app-shell";
import { Card, Badge, EmptyState } from "@/components/ui-bits";
import { PageSkeleton } from "@/components/page-skeleton";
import {
  addNotification,
  downloadDocument,
  fileToStoredDocument,
  getDocuments,
  recordAudit,
  saveDocuments,
  usePortalData,
} from "@/lib/portal-store";
import { can, canAccessDocument, canDeleteDocument, scopeProjects } from "@/lib/access-control";

export const Route = createFileRoute("/documents")({
  component: DocumentsPage,
  head: () => ({ meta: [{ title: "الوثائق — المنصة الذكية لإدارة الشركات والمشاريع" }] }),
});

function DocumentsPage() {
  const user = useRequirePermission("documents.view");
  const { documents: allDocuments, projects } = usePortalData();
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [approvalView, setApprovalView] = useState<"all" | "pending" | "approved" | "history">(
    "all",
  );
  const [projectId, setProjectId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const documents = useMemo(
    () =>
      user ? allDocuments.filter((document) => canAccessDocument(user, document, projects)) : [],
    [allDocuments, projects, user],
  );
  const availableProjects = useMemo(() => scopeProjects(user, projects), [projects, user]);
  const types = useMemo(() => Array.from(new Set(documents.map((d) => d.type))), [documents]);

  const filtered = useMemo(
    () =>
      documents.filter((d) => {
        if (q && !d.name.includes(q)) return false;
        if (type !== "all" && d.type !== type) return false;
        if (approvalView === "approved" && d.approval !== "معتمد") return false;
        if (approvalView === "pending" && d.approval === "معتمد") return false;
        return true;
      }),
    [documents, q, type, approvalView],
  );

  const approvalHistory = useMemo(
    () =>
      documents
        .flatMap((document) =>
          (document.approvalHistory ?? []).map((event) => ({
            ...event,
            documentId: document.id,
            documentName: document.name,
          })),
        )
        .sort((a, b) => b.id - a.id),
    [documents],
  );

  async function upload(file?: File) {
    if (!file || !user) return;
    if (!can(user.role, "documents.upload")) return;
    if (user.role === "pm" && !projectId) {
      setNotice("اختر أحد مشاريعك قبل رفع الوثيقة.");
      return;
    }
    setUploading(true);
    setNotice("");
    try {
      const item = await fileToStoredDocument(
        file,
        projectId ? Number(projectId) : undefined,
        user.name,
      );
      const existing = getDocuments().find(
        (document) => document.name === file.name && document.projectId === item.projectId,
      );
      const version = (existing?.version ?? 0) + 1;
      const versioned = {
        ...item,
        version,
        versions: [
          ...(existing?.versions ?? []),
          { version, date: item.date, uploadedBy: user.name },
        ],
      };
      saveDocuments([
        versioned,
        ...getDocuments().filter((document) => document.id !== existing?.id),
      ]);
      recordAudit("رفع وثيقة", "وثيقة", `${file.name} — الإصدار ${version}.`, versioned.id);
      addNotification(
        "تم رفع وثيقة",
        `${file.name} — الإصدار ${version} بانتظار الاعتماد.`,
        "/documents",
      );
      setNotice(`تم رفع ${file.name} كإصدار ${version} بنجاح.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "تعذر رفع الملف.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function toggleApproval(document: (typeof documents)[number]) {
    if (!user || !can(user.role, "documents.approve")) return;
    const isApproved = document.approval === "معتمد";
    if (isApproved && !window.confirm(`إلغاء اعتماد ${document.name}؟`)) return;
    const approval = isApproved ? "بانتظار الاعتماد" : "معتمد";
    const actorName = user?.name ?? "مستخدم النظام";
    const actorRole = user?.roleLabel ?? "حساب غير معروف";
    const timestamp = new Date().toLocaleString("ar-SA", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    saveDocuments(
      getDocuments().map((item) =>
        item.id === document.id
          ? {
              ...item,
              approval,
              approvedBy: isApproved ? undefined : actorName,
              approvedByRole: isApproved ? undefined : actorRole,
              approvedAt: isApproved ? undefined : timestamp,
              approvalHistory: [
                {
                  id: Date.now(),
                  action: isApproved ? "إلغاء اعتماد" : "اعتماد",
                  actorName,
                  actorRole,
                  date: timestamp,
                },
                ...(item.approvalHistory ?? []),
              ],
            }
          : item,
      ),
    );
    recordAudit(
      isApproved ? "إلغاء اعتماد وثيقة" : "اعتماد وثيقة",
      "وثيقة",
      document.name,
      document.id,
    );
    const message = isApproved
      ? `تم إلغاء اعتماد ${document.name}.`
      : `تم اعتماد ${document.name}.`;
    setNotice(message);
    addNotification(isApproved ? "إلغاء اعتماد وثيقة" : "اعتماد وثيقة", message, "/documents");
  }

  if (!user) return <PageSkeleton />;
  const canUpload = can(user.role, "documents.upload");

  return (
    <AppShell
      role={user.role}
      userName={user.name}
      roleLabel={user.roleLabel}
      pageTitle="الوثائق"
      pageSubtitle="مكتبة الوثائق الرسمية للمشاريع التقنية"
    >
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث في الوثائق"
              className="w-full h-11 pr-10 pl-3 rounded-lg border border-border bg-background text-sm"
            />
          </div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-11 px-3 rounded-lg border border-border bg-background text-sm"
          >
            <option value="all">كل الأنواع</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {canUpload && (
            <div className="flex gap-2">
              <select
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
                className="min-w-0 h-11 px-2 rounded-lg border border-border bg-background text-xs"
              >
                <option value="">{user.role === "pm" ? "اختر مشروعًا" : "وثيقة عامة"}</option>
                {availableProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <input
                ref={fileInput}
                type="file"
                accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.txt"
                className="hidden"
                onChange={(event) => upload(event.target.files?.[0])}
              />
              <button
                disabled={uploading}
                onClick={() => fileInput.current?.click()}
                className="h-11 px-4 rounded-lg bg-primary-deep text-white text-sm inline-flex items-center justify-center gap-2 hover:bg-primary disabled:opacity-60"
              >
                <Upload className="h-4 w-4" /> {uploading ? "جارٍ الرفع" : "رفع وثيقة"}
              </button>
            </div>
          )}
        </div>
        {notice && (
          <div className="mt-3 flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2 text-xs text-primary">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {notice}
            </span>
            <button onClick={() => setNotice("")}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <span className="text-xs text-muted-foreground ml-1">سجل الاعتمادات:</span>
          <button
            onClick={() => setApprovalView("all")}
            className={`h-9 px-4 rounded-lg text-xs font-semibold ${approvalView === "all" ? "bg-primary text-white" : "bg-background border border-border"}`}
          >
            كل الوثائق ({documents.length})
          </button>
          <button
            onClick={() => setApprovalView("pending")}
            className={`h-9 px-4 rounded-lg text-xs font-semibold ${approvalView === "pending" ? "bg-amber-500 text-white" : "bg-background border border-border"}`}
          >
            بانتظار الاعتماد ({documents.filter((item) => item.approval !== "معتمد").length})
          </button>
          <button
            onClick={() => setApprovalView("approved")}
            className={`h-9 px-4 rounded-lg text-xs font-semibold ${approvalView === "approved" ? "bg-green-600 text-white" : "bg-background border border-border"}`}
          >
            المعتمدة ({documents.filter((item) => item.approval === "معتمد").length})
          </button>
          <button
            onClick={() => setApprovalView("history")}
            className={`h-9 px-4 rounded-lg text-xs font-semibold ${approvalView === "history" ? "bg-primary text-white" : "bg-background border border-border"}`}
          >
            سجل الاعتمادات ({approvalHistory.length})
          </button>
        </div>
      </Card>

      <Card>
        {approvalView === "history" ? (
          approvalHistory.length === 0 ? (
            <EmptyState
              icon={<History className="h-6 w-6" />}
              title="لا توجد عمليات اعتماد مسجلة بعد"
              description="ستظهر هنا عمليات الاعتماد وإلغاء الاعتماد مع اسم المنفذ وتاريخ العملية."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="text-xs text-muted-foreground">
                    <th className="text-right px-4 py-3 font-medium">الوثيقة</th>
                    <th className="text-right px-4 py-3 font-medium">الإجراء</th>
                    <th className="text-right px-4 py-3 font-medium">نفّذه</th>
                    <th className="text-right px-4 py-3 font-medium">الصفة</th>
                    <th className="text-right px-4 py-3 font-medium">التاريخ والوقت</th>
                  </tr>
                </thead>
                <tbody>
                  {approvalHistory.map((event) => (
                    <tr key={`${event.documentId}-${event.id}`} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{event.documentName}</td>
                      <td className="px-4 py-3">
                        <Badge tone={event.action === "اعتماد" ? "success" : "warning"}>
                          {event.action}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-medium">{event.actorName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{event.actorRole}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {event.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : filtered.length === 0 ? (
          <EmptyState icon={<FileText className="h-6 w-6" />} title="لا توجد وثائق مطابقة" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th className="text-right px-4 py-3 font-medium">اسم الوثيقة</th>
                  <th className="text-right px-4 py-3 font-medium">النوع</th>
                  <th className="text-right px-4 py-3 font-medium">المشروع</th>
                  <th className="text-right px-4 py-3 font-medium">أضيفت بواسطة</th>
                  <th className="text-right px-4 py-3 font-medium">التاريخ</th>
                  <th className="text-right px-4 py-3 font-medium">الحجم</th>
                  <th className="text-right px-4 py-3 font-medium">الإصدار</th>
                  <th className="text-right px-4 py-3 font-medium">الاعتماد</th>
                  <th className="text-right px-4 py-3 font-medium">اعتمدها</th>
                  <th className="text-right px-4 py-3 font-medium">تاريخ الاعتماد</th>
                  <th className="text-right px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => {
                  const p = projects.find((x) => x.id === d.projectId);
                  return (
                    <tr key={d.id} className="border-t border-border hover:bg-accent/40">
                      <td className="px-4 py-3 font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        {d.name}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone="muted">{d.type}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p?.name ?? "-"}</td>
                      <td className="px-4 py-3">{d.uploadedBy}</td>
                      <td className="px-4 py-3 text-muted-foreground">{d.date}</td>
                      <td className="px-4 py-3 text-muted-foreground">{d.size}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs">
                          <History className="h-3.5 w-3.5 text-primary" />v{d.version ?? 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          tone={
                            d.approval === "معتمد"
                              ? "success"
                              : d.approval === "مرفوض"
                                ? "danger"
                                : "warning"
                          }
                        >
                          {d.approval ?? "بانتظار الاعتماد"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {d.approval === "معتمد" ? (
                          <>
                            <div className="font-medium">{d.approvedBy ?? "غير مسجل"}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {d.approvedByRole ?? "بيانات اعتماد سابقة"}
                            </div>
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {d.approval === "معتمد" ? (d.approvedAt ?? "—") : "—"}
                      </td>
                      <td className="px-4 py-3 text-left">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title={`تنزيل ${d.name}`}
                            onClick={() => downloadDocument(d)}
                            className="h-8 w-8 rounded-md hover:bg-accent inline-flex items-center justify-center text-muted-foreground"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          {can(user.role, "documents.approve") && (
                            <button
                              title={
                                d.approval === "معتمد" ? "إلغاء اعتماد الوثيقة" : "اعتماد الوثيقة"
                              }
                              aria-label={
                                d.approval === "معتمد"
                                  ? `إلغاء اعتماد ${d.name}`
                                  : `اعتماد ${d.name}`
                              }
                              onClick={() => toggleApproval(d)}
                              className={`h-8 w-8 rounded-md inline-flex items-center justify-center ${d.approval === "معتمد" ? "hover:bg-amber-50 text-amber-600" : "hover:bg-green-50 text-green-600"}`}
                            >
                              {d.approval === "معتمد" ? (
                                <ShieldOff className="h-4 w-4" />
                              ) : (
                                <ShieldCheck className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          {canDeleteDocument(user, d, projects) && (
                            <button
                              title="حذف الوثيقة"
                              onClick={() => {
                                if (window.confirm(`حذف ${d.name}؟`)) {
                                  saveDocuments(
                                    getDocuments().filter((document) => document.id !== d.id),
                                  );
                                  recordAudit("حذف وثيقة", "وثيقة", d.name, d.id);
                                }
                              }}
                              className="h-8 w-8 rounded-md hover:bg-red-50 text-red-600 inline-flex items-center justify-center"
                            >
                              <Trash2 className="h-4 w-4" />
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
        )}
      </Card>
    </AppShell>
  );
}
