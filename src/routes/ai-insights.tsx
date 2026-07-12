import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle2, ArrowLeft } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { AppShell, useRequireAuth } from "@/components/app-shell";
import { Card, CardHeader, Badge, ProgressBar } from "@/components/ui-bits";
import { AI_RECOMMENDATIONS, PROJECTS } from "@/lib/mock-data";

export const Route = createFileRoute("/ai-insights")({
  component: AIInsightsPage,
  head: () => ({ meta: [{ title: "تحليلات الذكاء الاصطناعي — منصة إدارة المشاريع" }] }),
});

function AIInsightsPage() {
  const user = useRequireAuth();
  if (!user) return null;

  const avgHealth = Math.round(PROJECTS.reduce((a, p) => a + p.health, 0) / PROJECTS.length);
  const avgDelay = Math.round(PROJECTS.reduce((a, p) => a + p.delayRisk, 0) / PROJECTS.length);
  const highRisk = PROJECTS.filter((p) => p.delayRisk >= 50).length;

  const healthBySector = ["البيئة", "المياه", "الزراعة"].map((s) => {
    const list = PROJECTS.filter((p) => p.sector === s);
    const value = list.length ? Math.round(list.reduce((a, p) => a + p.health, 0) / list.length) : 0;
    return { name: s, value };
  });

  return (
    <AppShell
      role={user.role}
      userName={user.name}
      roleLabel={user.roleLabel}
      pageTitle="تحليلات الذكاء الاصطناعي"
      pageSubtitle="رؤى وتحليلات آلية لدعم القرار وحوكمة المشاريع"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricBlock icon={<TrendingUp className="h-4 w-4" />} label="متوسط مؤشر الصحة" value={`${avgHealth}%`} tone="success" />
        <MetricBlock icon={<AlertTriangle className="h-4 w-4" />} label="متوسط مخاطر التأخّر" value={`${avgDelay}%`} tone="warning" />
        <MetricBlock icon={<AlertTriangle className="h-4 w-4" />} label="مشاريع عالية المخاطر" value={String(highRisk)} tone="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="مؤشر صحة المشاريع حسب القطاع" />
          <div className="px-5 pb-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={healthBySector}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f0" />
                <XAxis dataKey="name" reversed tick={{ fontSize: 12, fill: "#667085" }} />
                <YAxis tick={{ fontSize: 12, fill: "#667085" }} unit="%" />
                <Tooltip />
                <Bar dataKey="value" fill="#005D45" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-primary/20 bg-primary/[0.02]">
          <CardHeader title="الملخص التنفيذي" action={<span className="inline-flex items-center gap-1 text-[11px] text-primary font-semibold"><Sparkles className="h-3 w-3" /> AI</span>} />
          <div className="px-5 pb-5 text-sm leading-7">
            محفظة المشاريع تظهر أداءً {avgHealth >= 70 ? "مستقرًا" : "متذبذبًا"} بمتوسط صحة {avgHealth}%. يوجد {highRisk} مشاريع بحاجة إلى مراجعة عاجلة بسبب ارتفاع مخاطر التأخّر. يُوصى بإعادة توزيع الموارد وتفعيل خطط التصعيد للمشاريع الحرجة.
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="التوصيات الآلية" subtitle="مرتبة حسب الأثر المتوقع" />
        <div className="px-5 pb-5 space-y-3">
          {AI_RECOMMENDATIONS.map((r) => (
            <div key={r.id} className="border border-border rounded-lg p-4 hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge tone="muted">{r.category}</Badge>
                      <Badge tone={r.impact === "عالٍ" ? "danger" : r.impact === "متوسط" ? "warning" : "success"}>أثر {r.impact}</Badge>
                    </div>
                    <div className="font-semibold text-foreground text-sm">{r.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 leading-6">{r.description}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="تحليل المخاطر عبر المشاريع" />
        <div className="px-5 pb-5 space-y-2.5">
          {PROJECTS.filter((p) => p.delayRisk >= 25).sort((a, b) => b.delayRisk - a.delayRisk).slice(0, 6).map((p) => (
            <Link to="/projects/$id" params={{ id: String(p.id) }} key={p.id} className="flex items-center gap-3 py-2 hover:bg-accent/40 rounded-md px-2 -mx-2">
              <CheckCircle2 className={`h-4 w-4 ${p.delayRisk >= 60 ? "text-red-600" : "text-amber-600"}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{p.name}</div>
                <div className="text-[11px] text-muted-foreground">{p.sector} · مدير: {p.manager}</div>
              </div>
              <div className="w-40 flex items-center gap-2">
                <ProgressBar value={p.delayRisk} tone={p.delayRisk >= 60 ? "danger" : "warning"} />
                <span className="text-xs w-9 text-muted-foreground">{p.delayRisk}%</span>
              </div>
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}

function MetricBlock({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: "success" | "warning" | "danger" }) {
  const map = {
    success: "bg-green-50 text-green-600",
    warning: "bg-amber-50 text-amber-600",
    danger: "bg-red-50 text-red-600",
  };
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${map[tone]}`}>{icon}</div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
      </div>
    </div>
  );
}
