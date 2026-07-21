import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Mail, Phone, Globe, MapPin, FileText, Download, ArrowRight, FileSignature, CalendarDays, CalendarCheck2, User as UserIcon, Clock, History, BriefcaseBusiness } from "lucide-react";
import { AppShell, useRequireAuth } from "@/components/app-shell";
import { CompanyLogo } from "@/components/company-logo";
import { PerformanceBarChart, ProgressAreaChart } from "@/components/dashboard-charts";
import { Card, CardHeader, Badge, ProgressBar } from "@/components/ui-bits";
import { COMPANIES, COMPANY_PROFILES, PROJECTS } from "@/lib/mock-data";
import { downloadDocument } from "@/lib/portal-store";

export const Route = createFileRoute("/companies/$id")({
  component: CompanyDetail,
  notFoundComponent: () => (
    <div dir="rtl" className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold">الشركة غير موجودة</h2>
        <Link to="/companies" className="text-primary text-sm mt-2 inline-block">العودة إلى قائمة الشركات</Link>
      </div>
    </div>
  ),
});

function CompanyDetail() {
  const user = useRequireAuth();
  const { id } = Route.useParams();
  const company = COMPANIES.find((c) => String(c.id) === id);
  if (!company) throw notFound();
  if (!user) return null;

  const related = PROJECTS.filter((p) => p.companyId === company.id);
  const profile = COMPANY_PROFILES[company.id];
  const perf = related.map((p) => ({ name: p.name.slice(0, 12), value: p.progress }));

  return (
    <AppShell
      role="company"
      userName={user.name}
      roleLabel={user.roleLabel}
      pageTitle={company.name}
      pageSubtitle={company.description}
    >
      <div className="flex items-center gap-2 text-sm">
        <Link to="/companies" className="text-primary hover:underline inline-flex items-center gap-1">
          <ArrowRight className="h-4 w-4" />
          الشركات المتعاونة
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground">{company.name}</span>
      </div>

      {/* Company info */}
      <Card>
        <div className="p-6 flex items-start gap-5">
          <div className="h-20 w-20 rounded-xl bg-white border border-border flex items-center justify-center shrink-0 overflow-hidden">
            <CompanyLogo domain={company.domain} name={company.name} className="h-14 w-14" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge tone="primary">{company.sector}</Badge>
              <Badge tone={company.status === "نشط" ? "success" : company.status === "قيد المراجعة" ? "warning" : "muted"}>{company.status}</Badge>
              <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1"><Clock className="h-3 w-3" />آخر تحديث {company.lastUpdate}</span>
              <span className="text-[11px] text-muted-foreground">شراكة منذ {company.since}</span>
            </div>
            <h2 className="mt-2 text-lg font-bold text-foreground">{company.name}</h2>
            <div className="text-[12px] text-muted-foreground">{company.nameEn}</div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-3xl">{company.description}</p>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <InfoRow label="رقم السجل التجاري" value={company.regNo} />
              <InfoRow label="مجال العمل" value={company.sector} />
              <InfoRow label="مسؤول التواصل" value={company.contactPerson} icon={<UserIcon className="h-3.5 w-3.5" />} />
              <InfoRow label="المسمى الوظيفي" value={company.contactRole} />
              <InfoRow label="البريد الإلكتروني" value={company.email} icon={<Mail className="h-3.5 w-3.5" />} />
              <InfoRow label="رقم الهاتف" value={company.phone} icon={<Phone className="h-3.5 w-3.5" />} />
              <InfoRow label="العنوان" value={company.address} icon={<MapPin className="h-3.5 w-3.5" />} />
              <InfoRow label="الموقع الإلكتروني" value={company.website} icon={<Globe className="h-3.5 w-3.5" />} />
            </div>
          </div>
        </div>
      </Card>

      {/* Contract card */}
      <Card>
        <CardHeader title="بيانات العقد" />
        <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <ContractTile icon={<FileSignature className="h-4 w-4" />} label="رقم العقد" value={company.contractNo} />
          <ContractTile icon={<CalendarDays className="h-4 w-4" />} label="بداية العقد" value={company.contractStart} />
          <ContractTile icon={<CalendarCheck2 className="h-4 w-4" />} label="نهاية العقد" value={company.contractEnd} />
        </div>
      </Card>

      {/* Performance KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">مشاريع الوكالة الحالية</div>
          <div className="mt-2 text-3xl font-bold">{related.filter(p => p.status !== "مكتملة").length}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">مشاريع الوكالة المكتملة</div>
          <div className="mt-2 text-3xl font-bold text-green-600">{related.filter(p => p.status === "مكتملة").length}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">متوسط نسبة الإنجاز</div>
          <div className="mt-2 text-3xl font-bold text-primary">
            {related.length ? Math.round(related.reduce((a, p) => a + p.progress, 0) / related.length) : 0}%
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">تقييم الأداء</div>
          <div className="mt-2 text-3xl font-bold">{company.performance}%</div>
          <div className="text-xs text-muted-foreground mt-1">التزام بالوقت: {company.commitment}%</div>
        </Card>
      </div>

      {/* Related projects */}
      <Card>
        <CardHeader title="المشاريع المرتبطة" />
        <div className="px-2 pb-3 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-xs text-muted-foreground">
                <th className="text-right px-3 py-2 font-medium">اسم المشروع</th>
                <th className="text-right px-3 py-2 font-medium">القطاع</th>
                <th className="text-right px-3 py-2 font-medium">مدير المشروع</th>
                <th className="text-right px-3 py-2 font-medium">الحالة</th>
                <th className="text-right px-3 py-2 font-medium">نسبة الإنجاز</th>
                <th className="text-right px-3 py-2 font-medium">البداية</th>
                <th className="text-right px-3 py-2 font-medium">النهاية</th>
              </tr>
            </thead>
            <tbody>
              {related.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-3 py-3 font-medium"><Link to="/projects/$id" params={{ id: String(p.id) }} className="hover:text-primary hover:underline">{p.name}</Link></td>
                  <td className="px-3 py-3">{p.sector}</td>
                  <td className="px-3 py-3">{p.manager}</td>
                  <td className="px-3 py-3">
                    <Badge tone={p.status === "مكتملة" ? "success" : p.status === "متأخرة" ? "danger" : "warning"}>{p.status}</Badge>
                  </td>
                  <td className="px-3 py-3 w-32">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={p.progress} />
                      <span className="text-xs text-muted-foreground w-9">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{p.start}</td>
                  <td className="px-3 py-3 text-muted-foreground">{p.end}</td>
                </tr>
              ))}
              {related.length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted-foreground py-8">لا توجد مشاريع مرتبطة.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Documents */}
        <Card>
          <CardHeader title="الوثائق" />
          <div className="px-5 pb-5 space-y-2">
            {[
              { n: "عقد التعاون الرئيسي", t: "عقد", d: "2024/09/12" },
              { n: "ملحق نطاق العمل", t: "مستند", d: "2025/01/20" },
              { n: "اتفاقية مستوى الخدمة", t: "عقد", d: "2024/09/12" },
            ].map((doc) => (
              <div key={doc.n} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border text-sm">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">{doc.n}</div>
                    <div className="text-xs text-muted-foreground">{doc.t} · {doc.d}</div>
                  </div>
                </div>
                <button title={`تنزيل ${doc.n}`} onClick={() => downloadDocument({ id: Date.now(), name: doc.n, type: doc.t, date: doc.d, size: "—", uploadedBy: company.name })} className="h-8 w-8 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance chart */}
        <Card className="overflow-hidden">
          <CardHeader title="تحليل الأداء عبر المشاريع" subtitle="مقارنة الأداء الحالي لمشاريع الشركة" />
          <div className="px-4 pb-5 h-[300px]">
            <PerformanceBarChart data={perf} label="مؤشر الأداء" />
          </div>
        </Card>
      </div>

      {/* Performance trend */}
      <Card className="overflow-hidden">
        <CardHeader title="مؤشر أداء الشركة" subtitle="اتجاه الأداء خلال آخر 6 أشهر" action={<span className="rounded-full bg-[#C8A24A]/10 px-3 py-1 text-[11px] font-semibold text-[#9A7518]">اتجاه تصاعدي</span>} />
        <div className="px-4 pb-5 h-[280px]">
          <ProgressAreaChart data={company.perfHistory} color="#C8A24A" label="مؤشر الأداء" />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 font-bold"><BriefcaseBusiness className="h-5 w-5 text-primary" />نبذة عن الشركة</div>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{profile?.overview ?? company.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">{profile?.specialties.map((item) => <Badge key={item} tone="primary">{item}</Badge>)}</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 font-bold"><History className="h-5 w-5 text-primary" />تاريخ التعاون مع الوكالة</div>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{profile?.history}</p>
          <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-lg bg-primary/5 p-3"><div className="text-xs text-muted-foreground">بداية الشراكة</div><div className="mt-1 font-bold">{company.since}</div></div><div className="rounded-lg bg-primary/5 p-3"><div className="text-xs text-muted-foreground">مشاريع مع الوكالة</div><div className="mt-1 font-bold">{related.length} مشاريع</div></div></div>
        </Card>
      </div>
    </AppShell>
  );
}

function ContractTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
      <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">{icon}</div>
      <div className="min-w-0">
        <div className="text-[11px] text-muted-foreground">{label}</div>
        <div className="text-sm font-semibold text-foreground truncate">{value}</div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 border-b border-border/40 last:border-0">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-medium text-foreground flex items-center gap-1.5">
        {icon}
        {value}
      </span>
    </div>
  );
}
