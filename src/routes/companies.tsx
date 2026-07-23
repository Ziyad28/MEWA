import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  Building2,
  Mail,
  Phone,
  ArrowLeft,
  TrendingUp,
  FolderKanban,
  Plus,
  Pencil,
  X,
} from "lucide-react";
import { AppShell, useRequirePermission } from "@/components/app-shell";
import { Card, Badge } from "@/components/ui-bits";
import { ORG_STRUCTURE } from "@/lib/mock-data";
import { PageSkeleton } from "@/components/page-skeleton";
import { CompanyLogo } from "@/components/company-logo";
import {
  addNotification,
  getCompanies,
  recordAudit,
  saveCompanies,
  usePortalData,
  type PrototypeCompany,
} from "@/lib/portal-store";
import { can, canAccessCompany } from "@/lib/access-control";

export const Route = createFileRoute("/companies")({
  component: CompaniesList,
});

function CompaniesList() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const user = useRequirePermission("companies.view");
  const { companies, projects } = usePortalData();
  const [q, setQ] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PrototypeCompany | null>(null);
  const [form, setForm] = useState({
    name: "",
    nameEn: "",
    email: "",
    phone: "",
    domain: "",
    contractStart: "2026-01-01",
    contractEnd: "2027-12-31",
    description: "",
    departmentId: "all",
    subDepartmentId: "all",
  });
  const isCompanyDetail = /^\/companies\/[^/]+$/.test(pathname);

  const scoped = useMemo(() => {
    if (user?.role === "pm") {
      return companies.filter((company) => canAccessCompany(user, company.id, projects));
    }
    return companies.filter((company) => !company.archived);
  }, [user, companies, projects]);

  const filtered = useMemo(() => {
    return scoped.filter((c) => {
      if (q && !c.name.includes(q)) return false;
      return true;
    });
  }, [q, scoped]);

  if (isCompanyDetail) return <Outlet />;
  if (!user) return <PageSkeleton />;
  const canManage =
    can(user.role, "companies.manage") && (user.role === "admin" || !user.isGeneralManager);

  function openForm(company?: PrototypeCompany) {
    setEditing(company ?? null);
    setForm(
      company
        ? {
            name: company.name,
            nameEn: company.nameEn,
            email: company.email,
            phone: company.phone,
            domain: company.domain,
            contractStart: company.contractStart,
            contractEnd: company.contractEnd,
            description: company.description,
            departmentId: company.departmentId ?? "all",
            subDepartmentId: company.subDepartmentId ?? "all",
          }
        : {
            name: "",
            nameEn: "",
            email: "",
            phone: "",
            domain: "",
            contractStart: "2026-01-01",
            contractEnd: "2027-12-31",
            description: "",
            departmentId: "all",
            subDepartmentId: "all",
          },
    );
    setShowForm(true);
  }
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (
      !user ||
      !form.name.trim() ||
      !(can(user.role, "companies.manage") && (user.role === "admin" || !user.isGeneralManager))
    )
      return;
    const list = getCompanies();
    if (editing) {
      saveCompanies(
        list.map((company) =>
          company.id === editing.id
            ? {
                ...company,
                ...form,
                departmentId: form.departmentId !== "all" ? form.departmentId : undefined,
                subDepartmentId: form.subDepartmentId !== "all" ? form.subDepartmentId : undefined,
                website: form.domain,
                lastUpdate: new Date().toLocaleDateString("en-CA"),
              }
            : company,
        ),
      );
      recordAudit("تعديل شركة", "شركة", form.name, editing.id);
      addNotification("تحديث بيانات شركة", `تم تحديث ${form.name}.`, `/companies/${editing.id}`);
    } else {
      const id = Math.max(...list.map((company) => company.id), 0) + 1;
      const company: PrototypeCompany = {
        id,
        name: form.name,
        nameEn: form.nameEn || form.name,
        domain: form.domain,
        description: form.description || "شركة متعاونة ضمن مشاريع الوكالة.",
        regNo: `10${Date.now().toString().slice(-8)}`,
        address: "الرياض",
        email: form.email,
        phone: form.phone,
        website: form.domain,
        contactPerson: "مسؤول الحساب",
        contactRole: "مدير الحساب",
        departmentId: form.departmentId !== "all" ? form.departmentId : undefined,
        subDepartmentId: form.subDepartmentId !== "all" ? form.subDepartmentId : undefined,
        status: "نشط",
        performance: 80,
        commitment: 80,
        since: form.contractStart,
        contractNo: `AGENCY-${new Date().getFullYear()}-${id}`,
        contractStart: form.contractStart,
        contractEnd: form.contractEnd,
        lastUpdate: new Date().toLocaleDateString("en-CA"),
        perfHistory: [],
        attachments: [],
        timeline: [
          {
            id: Date.now(),
            title: "بدء التعاقد",
            date: form.contractStart,
            description: "إضافة الشركة إلى سجل شركاء الوكالة.",
          },
        ],
      };
      saveCompanies([company, ...list]);
      recordAudit("إضافة شركة", "شركة", company.name, company.id);
      addNotification("شركة جديدة", `أضيفت ${company.name} إلى سجل الشركات.`, `/companies/${id}`);
    }
    setShowForm(false);
  }

  return (
    <AppShell
      role={user.role}
      navigationScope="companies"
      userName={user.name}
      roleLabel={user.roleLabel}
      pageTitle="الشركات المتعاونة"
      pageSubtitle="الشركات المرتبطة بالمشاريع التقنية التابعة للوكالة"
    >
      <Card className="p-4">
        <div className="relative max-w-lg">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث باسم الشركة"
            className="w-full h-11 pr-10 pl-3 rounded-lg border border-border bg-background text-sm"
          />
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          عدد الشركات المسجلة:{" "}
          <span className="font-semibold text-foreground">{filtered.length}</span>
        </div>
      </Card>

      {canManage && (
        <div className="flex justify-end">
          <button
            onClick={() => openForm()}
            className="h-10 px-4 rounded-lg bg-primary text-white inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            إضافة شركة
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const active = projects.filter(
            (p) => p.companyId === c.id && p.status !== "مكتملة",
          ).length;
          const total = projects.filter((p) => p.companyId === c.id).length;
          return (
            <article
              key={c.id}
              className="bg-card border border-border rounded-xl p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:shadow-md hover:border-primary/40 transition-all flex flex-col"
            >
              <div className="flex items-start gap-3">
                <div className="h-16 w-24 rounded-xl bg-white border border-border flex items-center justify-center shrink-0 overflow-hidden p-2">
                  <CompanyLogo domain={c.domain} name={c.name} className="h-11 w-20" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{c.name}</h3>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{c.nameEn}</div>
                  <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                    <Badge
                      tone={
                        c.status === "نشط"
                          ? "success"
                          : c.status === "قيد المراجعة"
                            ? "warning"
                            : "muted"
                      }
                    >
                      {c.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1">
                {c.description}
              </p>
              {total > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2 text-center pt-4 border-t border-border">
                  <div>
                    <div className="text-[10px] text-muted-foreground">مشاريع نشطة</div>
                    <div className="text-sm font-bold text-foreground flex items-center justify-center gap-1">
                      <FolderKanban className="h-3 w-3 text-primary" />
                      {active}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">مشاريع مع الوكالة</div>
                    <div className="text-sm font-bold text-foreground">{total}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">متوسط الإنجاز</div>
                    <div
                      className={`text-sm font-bold flex items-center justify-center gap-1 text-primary`}
                    >
                      <TrendingUp className="h-3 w-3" />
                      {Math.round(
                        projects
                          .filter((p) => p.companyId === c.id)
                          .reduce((acc, p) => acc + p.progress, 0) / total,
                      )}
                      %
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-auto pt-4 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3 w-3" />
                  {c.email}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => window.location.assign(`/companies/${c.id}`)}
                    className="h-9 px-3 rounded-lg bg-primary/10 hover:bg-primary hover:text-white text-primary font-semibold inline-flex items-center gap-1.5 transition-colors"
                  >
                    عرض التفاصيل <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                  {canManage && (
                    <button
                      onClick={() => openForm(c)}
                      className="h-9 w-9 rounded-lg border border-border hover:bg-accent inline-flex items-center justify-center"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {showForm && (
        <div className="fixed inset-0 z-[80] bg-black/45 flex items-center justify-center p-4">
          <form
            onSubmit={submit}
            className="w-full max-w-2xl rounded-2xl bg-card border border-border shadow-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  {editing ? "تعديل بيانات الشركة" : "إضافة شركة متعاونة"}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  بيانات بروتوتايب محفوظة داخل المتصفح.
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
              <CompanyField
                label="اسم الشركة"
                value={form.name}
                onChange={(value) => setForm({ ...form, name: value })}
              />
              <CompanyField
                label="الاسم الإنجليزي"
                value={form.nameEn}
                onChange={(value) => setForm({ ...form, nameEn: value })}
              />
              <CompanyField
                label="النطاق الإلكتروني"
                value={form.domain}
                onChange={(value) => setForm({ ...form, domain: value })}
              />
              <CompanyField
                label="البريد الإلكتروني"
                type="email"
                value={form.email}
                onChange={(value) => setForm({ ...form, email: value })}
              />
              <CompanyField
                label="الهاتف"
                value={form.phone}
                onChange={(value) => setForm({ ...form, phone: value })}
              />
              <CompanyField
                label="بداية العقد"
                type="date"
                value={form.contractStart}
                onChange={(value) => setForm({ ...form, contractStart: value })}
              />
              <CompanyField
                label="نهاية العقد"
                type="date"
                value={form.contractEnd}
                onChange={(value) => setForm({ ...form, contractEnd: value })}
              />
              <CompanyField
                label="نبذة"
                value={form.description}
                onChange={(value) => setForm({ ...form, description: value })}
              />
              <label className="space-y-1.5 text-xs font-medium">
                <span>الإدارة العامة المرتبطة</span>
                <select
                  value={form.departmentId}
                  onChange={(e) =>
                    setForm({ ...form, departmentId: e.target.value, subDepartmentId: "all" })
                  }
                  className="h-11 w-full rounded-lg border border-border px-3 bg-background"
                >
                  <option value="all">غير محدد</option>
                  {Object.entries(ORG_STRUCTURE).map(([id, dept]) => (
                    <option key={id} value={id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </label>
              {form.departmentId !== "all" && (
                <label className="space-y-1.5 text-xs font-medium">
                  <span>الإدارة الفرعية (إن وجدت)</span>
                  <select
                    value={form.subDepartmentId}
                    onChange={(e) => setForm({ ...form, subDepartmentId: e.target.value })}
                    className="h-11 w-full rounded-lg border border-border px-3 bg-background"
                  >
                    <option value="all">مباشرة مع الإدارة العامة</option>
                    {ORG_STRUCTURE[
                      form.departmentId as keyof typeof ORG_STRUCTURE
                    ]?.subDepartments.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
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
                حفظ الشركة
              </button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}

// Suppress unused warnings for icons kept for future use
void Building2;
void Phone;

function CompanyField({
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
        required={label === "اسم الشركة"}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-lg border border-border px-3 bg-background"
      />
    </label>
  );
}
