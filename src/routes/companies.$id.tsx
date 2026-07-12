import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Building2, Mail, Phone, Globe, MapPin, FileText, Download, ArrowRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { AppShell, useRequireAuth } from "@/components/app-shell";
import { Card, CardHeader, Badge, ProgressBar } from "@/components/ui-bits";
import { COMPANIES, PROJECTS } from "@/lib/mock-data";

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
        <div className="p-5 flex items-start gap-5">
          <div className="h-16 w-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 className="h-8 w-8" />
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <InfoRow label="رقم السجل" value={company.regNo} />
            <InfoRow label="القطاع" value={company.sector} />
            <InfoRow label="مسؤول التواصل" value={company.contactPerson} />
            <InfoRow label="حالة التعاون" value={company.status} />
            <InfoRow label="البريد الإلكتروني" value={company.email} icon={<Mail className="h-3.5 w-3.5" />} />
            <InfoRow label="رقم الهاتف" value={company.phone} icon={<Phone className="h-3.5 w-3.5" />} />
            <InfoRow label="العنوان" value={company.address} icon={<MapPin className="h-3.5 w-3.5" />} />
            <InfoRow label="الموقع الإلكتروني" value={company.website} icon={<Globe className="h-3.5 w-3.5" />} />
          </div>
        </div>
      </Card>

      {/* Performance KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">المشاريع الحالية</div>
          <div className="mt-2 text-3xl font-bold">{related.filter(p => p.status !== "مكتملة").length}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">المشاريع المكتملة</div>
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
                  <td className="px-3 py-3 font-medium">{p.name}</td>
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
                <button className="h-8 w-8 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance chart */}
        <Card>
          <CardHeader title="تحليل الأداء عبر المشاريع" />
          <div className="px-5 pb-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perf}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f0" />
                <XAxis dataKey="name" reversed tick={{ fontSize: 11, fill: "#667085" }} />
                <YAxis tick={{ fontSize: 12, fill: "#667085" }} unit="%" />
                <Tooltip />
                <Bar dataKey="value" fill="#005D45" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </AppShell>
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
