import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Search, Download, FileText, Upload, X, CheckCircle2 } from "lucide-react";
import { AppShell, useRequireAuth } from "@/components/app-shell";
import { Card, Badge, EmptyState } from "@/components/ui-bits";
import { PROJECTS } from "@/lib/mock-data";
import { downloadDocument, fileToStoredDocument, getDocuments, saveDocuments, usePortalData } from "@/lib/portal-store";

export const Route = createFileRoute("/documents")({
  component: DocumentsPage,
  head: () => ({ meta: [{ title: "الوثائق — منصة إدارة المشاريع" }] }),
});

function DocumentsPage() {
  const user = useRequireAuth();
  const { documents } = usePortalData();
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [projectId, setProjectId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const types = useMemo(() => Array.from(new Set(documents.map(d => d.type))), [documents]);

  const filtered = useMemo(() => documents.filter(d => {
    if (q && !d.name.includes(q)) return false;
    if (type !== "all" && d.type !== type) return false;
    return true;
  }), [documents, q, type]);

  async function upload(file?: File) {
    if (!file || !user) return;
    setUploading(true);
    setNotice("");
    try {
      const item = await fileToStoredDocument(file, projectId ? Number(projectId) : undefined, user.name);
      saveDocuments([item, ...getDocuments()]);
      setNotice(`تم رفع ${file.name} بنجاح.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "تعذر رفع الملف.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  if (!user) return null;
  const canUpload = user.role === "pmo" || user.role === "pm";

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
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث في الوثائق" className="w-full h-11 pr-10 pl-3 rounded-lg border border-border bg-background text-sm" />
          </div>
          <select value={type} onChange={(e) => setType(e.target.value)} className="h-11 px-3 rounded-lg border border-border bg-background text-sm">
            <option value="all">كل الأنواع</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {canUpload && <div className="flex gap-2"><select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="min-w-0 h-11 px-2 rounded-lg border border-border bg-background text-xs"><option value="">وثيقة عامة</option>{PROJECTS.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select><input ref={fileInput} type="file" className="hidden" onChange={(event) => upload(event.target.files?.[0])} /><button disabled={uploading} onClick={() => fileInput.current?.click()} className="h-11 px-4 rounded-lg bg-primary-deep text-white text-sm inline-flex items-center justify-center gap-2 hover:bg-primary disabled:opacity-60"><Upload className="h-4 w-4" /> {uploading ? "جارٍ الرفع" : "رفع وثيقة"}</button></div>}
        </div>
        {notice && <div className="mt-3 flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2 text-xs text-primary"><span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{notice}</span><button onClick={() => setNotice("")}><X className="h-4 w-4" /></button></div>}
      </Card>

      <Card>
        {filtered.length === 0 ? (
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
                  <th className="text-right px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => {
                  const p = PROJECTS.find((x) => x.id === d.projectId);
                  return (
                    <tr key={d.id} className="border-t border-border hover:bg-accent/40">
                      <td className="px-4 py-3 font-medium flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />{d.name}</td>
                      <td className="px-4 py-3"><Badge tone="muted">{d.type}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{p?.name ?? "-"}</td>
                      <td className="px-4 py-3">{d.uploadedBy}</td>
                      <td className="px-4 py-3 text-muted-foreground">{d.date}</td>
                      <td className="px-4 py-3 text-muted-foreground">{d.size}</td>
                      <td className="px-4 py-3 text-left">
                        <button title={`تنزيل ${d.name}`} onClick={() => downloadDocument(d)} className="h-8 w-8 rounded-md hover:bg-accent inline-flex items-center justify-center text-muted-foreground"><Download className="h-4 w-4" /></button>
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
