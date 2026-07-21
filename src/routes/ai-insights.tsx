import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Eye,
  XCircle,
  CircleCheckBig,
} from "lucide-react";
import { AppShell, useRequirePermission } from "@/components/app-shell";
import { PerformanceBarChart } from "@/components/dashboard-charts";
import { Card, CardHeader, Badge, ProgressBar } from "@/components/ui-bits";
import { type Project } from "@/lib/mock-data";
import { addNotification, usePortalData } from "@/lib/portal-store";
import { scopeProjects } from "@/lib/access-control";

export const Route = createFileRoute("/ai-insights")({
  component: AIInsightsPage,
  head: () => ({ meta: [{ title: "القرارات الذكية — المنصة الذكية لإدارة الشركات والمشاريع" }] }),
});

type DecisionStatus = "approved" | "ignored";
type Recommendation = {
  id: number;
  project: Project;
  title: string;
  description: string;
  reason: string;
  expectedImpact: string;
  impact: "عالٍ" | "متوسط";
  category: "مخاطر" | "أداء" | "جدولة" | "موارد";
  confidence: number;
};

function AIInsightsPage() {
  const user = useRequirePermission("ai.view");
  const { projects } = usePortalData();
  const [statuses, setStatuses] = useState<Record<number, DecisionStatus>>({});
  const storageKey = user ? `mewa_ai_decisions_${user.role}_${user.email}` : "mewa_ai_decisions";

  useEffect(() => {
    if (!user || typeof window === "undefined") return;
    try {
      setStatuses(JSON.parse(localStorage.getItem(storageKey) ?? "{}"));
    } catch {
      setStatuses({});
    }
  }, [storageKey, user]);

  const scopedProjects = useMemo(() => {
    return scopeProjects(user, projects).filter((project) => !project.archived);
  }, [projects, user]);

  const recommendations = useMemo(
    () =>
      buildRecommendations(
        scopedProjects,
        user && (user.role === "pmo" || user.role === "manager" || user.role === "pm")
          ? user.role
          : undefined,
      ),
    [scopedProjects, user?.role],
  );
  if (!user) return null;

  const avgHealth = scopedProjects.length
    ? Math.round(scopedProjects.reduce((a, p) => a + p.health, 0) / scopedProjects.length)
    : 0;
  const avgDelay = scopedProjects.length
    ? Math.round(scopedProjects.reduce((a, p) => a + p.delayRisk, 0) / scopedProjects.length)
    : 0;
  const highRisk = scopedProjects.filter((p) => p.delayRisk >= 50).length;
  const roleScope =
    user.role === "pmo"
      ? "جميع مشاريع الوكالة"
      : user.role === "manager"
        ? "مشاريع الإدارة"
        : "المشاريع المسندة إليك";
  const recommendationTitle =
    user.role === "pmo"
      ? "التوجيهات الاستراتيجية المقترحة"
      : user.role === "manager"
        ? "القرارات الإدارية المقترحة"
        : "الإجراءات التشغيلية المقترحة";
  const approvalLabel =
    user.role === "pmo"
      ? "اعتماد التوجيه"
      : user.role === "manager"
        ? "اعتماد القرار"
        : "بدء الإجراء";

  const healthBySector = ["البيئة", "المياه", "الزراعة"]
    .map((sector) => {
      const list = scopedProjects.filter((project) => project.sector === sector);
      return {
        name: sector,
        value: list.length
          ? Math.round(list.reduce((sum, project) => sum + project.health, 0) / list.length)
          : 0,
      };
    })
    .filter((item) => item.value > 0);

  function setDecision(recommendation: Recommendation, status: DecisionStatus) {
    const next = { ...statuses, [recommendation.id]: status };
    setStatuses(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    const approved = status === "approved";
    addNotification(
      approved ? "اعتماد توصية ذكية" : "تجاهل توصية ذكية",
      `${approved ? "تم اعتماد" : "تم تجاهل"} التوصية الخاصة بمشروع ${recommendation.project.name}.`,
      `/projects/${recommendation.project.id}`,
    );
  }

  return (
    <AppShell
      role={user.role}
      userName={user.name}
      roleLabel={user.roleLabel}
      pageTitle="القرارات الذكية"
      pageSubtitle={`تحليل مخصص لـ ${roleScope}`}
    >
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-3 text-xs text-blue-800 flex items-start gap-2">
        <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
        <div>
          <strong>نموذج تحليلي تجريبي:</strong> النتائج مبنية على بيانات البروتوتايب الحالية، وتُربط
          بالبيانات الفعلية ونموذج الذكاء الاصطناعي بعد اعتماد المشروع.
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricBlock
          icon={<TrendingUp className="h-4 w-4" />}
          label="متوسط مؤشر الصحة"
          value={`${avgHealth}%`}
          tone="success"
        />
        <MetricBlock
          icon={<AlertTriangle className="h-4 w-4" />}
          label="متوسط مخاطر التأخّر"
          value={`${avgDelay}%`}
          tone="warning"
        />
        <MetricBlock
          icon={<AlertTriangle className="h-4 w-4" />}
          label="مشاريع عالية المخاطر"
          value={String(highRisk)}
          tone="danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader
            title="مؤشر صحة المشاريع حسب القطاع"
            subtitle={roleScope}
            action={
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                <Sparkles className="h-3 w-3" /> تحليل محدث
              </span>
            }
          />
          <div className="px-4 pb-5 h-[300px]">
            <PerformanceBarChart data={healthBySector} label="مؤشر الصحة" color="#007A5B" />
          </div>
        </Card>

        <Card className="border-primary/20 bg-primary/[0.02]">
          <CardHeader
            title="الملخص التنفيذي"
            action={
              <span className="inline-flex items-center gap-1 text-[11px] text-primary font-semibold">
                <Sparkles className="h-3 w-3" /> مخصص لدورك
              </span>
            }
          />
          <div className="px-5 pb-5 text-sm leading-7">
            نطاق التحليل يشمل {scopedProjects.length} مشاريع. الأداء{" "}
            {avgHealth >= 70 ? "مستقر" : "بحاجة إلى متابعة"} بمتوسط صحة {avgHealth}%، ويوجد{" "}
            {highRisk} مشاريع بحاجة إلى مراجعة عاجلة. التوصيات أدناه مرتبة حسب مخاطر التأخير والأثر
            المتوقع.
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title={recommendationTitle}
          subtitle={`${recommendations.length} توصيات مخصصة لصلاحياتك`}
        />
        <div className="px-5 pb-5 space-y-4">
          {recommendations.map((recommendation) => {
            const status = statuses[recommendation.id];
            return (
              <article
                key={recommendation.id}
                className={`border rounded-xl p-4 transition-all ${status === "approved" ? "border-green-200 bg-green-50/40" : status === "ignored" ? "border-border bg-muted/20 opacity-75" : "border-border hover:border-primary/40"}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge tone="muted">{recommendation.category}</Badge>
                        <Badge tone={recommendation.impact === "عالٍ" ? "danger" : "warning"}>
                          أثر {recommendation.impact}
                        </Badge>
                        <span className="text-[11px] rounded-full bg-blue-50 text-blue-700 px-2.5 py-1">
                          ثقة {recommendation.confidence}%
                        </span>
                        {status && (
                          <Badge tone={status === "approved" ? "success" : "muted"}>
                            {status === "approved" ? "معتمدة" : "تم تجاهلها"}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-bold text-foreground text-sm">{recommendation.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-6">
                        {recommendation.description}
                      </p>
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg bg-muted/40 p-3">
                          <strong className="text-foreground">سبب التوصية:</strong>
                          <span className="text-muted-foreground"> {recommendation.reason}</span>
                        </div>
                        <div className="rounded-lg bg-primary/5 p-3">
                          <strong className="text-primary">الأثر المتوقع:</strong>
                          <span className="text-muted-foreground">
                            {" "}
                            {recommendation.expectedImpact}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <Link
                      to="/projects/$id"
                      params={{ id: String(recommendation.project.id) }}
                      className="h-9 px-3 rounded-lg border border-border bg-card text-xs font-medium inline-flex items-center gap-1.5 hover:bg-accent"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      عرض المشروع
                    </Link>
                    {status !== "approved" && (
                      <button
                        onClick={() => setDecision(recommendation, "approved")}
                        className="h-9 px-3 rounded-lg bg-primary text-white text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <CircleCheckBig className="h-3.5 w-3.5" />
                        {approvalLabel}
                      </button>
                    )}
                    {status !== "ignored" && (
                      <button
                        onClick={() => setDecision(recommendation, "ignored")}
                        className="h-9 px-3 rounded-lg border border-border text-xs font-medium inline-flex items-center gap-1.5 hover:bg-red-50 hover:text-red-700"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        تجاهل
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardHeader title="تحليل المخاطر ضمن صلاحياتك" />
        <div className="px-5 pb-5 space-y-2.5">
          {[...scopedProjects]
            .filter((project) => project.delayRisk >= 25)
            .sort((a, b) => b.delayRisk - a.delayRisk)
            .slice(0, 6)
            .map((project) => (
              <Link
                to="/projects/$id"
                params={{ id: String(project.id) }}
                key={project.id}
                className="flex items-center gap-3 py-2 hover:bg-accent/40 rounded-md px-2 -mx-2"
              >
                <CheckCircle2
                  className={`h-4 w-4 ${project.delayRisk >= 60 ? "text-red-600" : "text-amber-600"}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{project.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {project.sector} · مدير: {project.manager}
                  </div>
                </div>
                <div className="w-40 flex items-center gap-2">
                  <ProgressBar
                    value={project.delayRisk}
                    tone={project.delayRisk >= 60 ? "danger" : "warning"}
                  />
                  <span className="text-xs w-9 text-muted-foreground">{project.delayRisk}%</span>
                </div>
                <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
        </div>
      </Card>
    </AppShell>
  );
}

function buildRecommendations(
  projects: Project[],
  role?: "pmo" | "manager" | "pm",
): Recommendation[] {
  const ranked = [...projects].sort(
    (a, b) => b.delayRisk + (100 - b.health) - (a.delayRisk + (100 - a.health)),
  );
  if (!role || ranked.length === 0) return [];

  if (role === "pm") {
    return ranked
      .flatMap((project) => [
        {
          id: project.id * 10 + 1,
          project,
          title: `تحديث الخطة الأسبوعية لمشروع ${project.name}`,
          category: "جدولة" as const,
          impact: project.delayRisk >= 50 ? ("عالٍ" as const) : ("متوسط" as const),
          confidence: Math.min(94, 66 + Math.round(project.delayRisk * 0.35)),
          description:
            "إجراء تشغيلي لمدير المشروع: مراجعة المهام المتأخرة وتحديث تواريخ التسليم والمسؤوليات خلال هذا الأسبوع.",
          reason: `مخاطر التأخير ${project.delayRisk}% مقابل إنجاز فعلي ${project.progress}%.`,
          expectedImpact: "تقليل فجوة الجدول وتحسين دقة تحديثات المشروع الأسبوعية.",
        },
        {
          id: project.id * 10 + 2,
          project,
          title: `إغلاق المخاطر المفتوحة في مشروع ${project.name}`,
          category: "مخاطر" as const,
          impact: project.health < 60 ? ("عالٍ" as const) : ("متوسط" as const),
          confidence: Math.min(92, 64 + Math.round((100 - project.health) * 0.35)),
          description:
            "إجراء تنفيذي: تحديث مالك كل خطر وخطة المعالجة ورفع ما يحتاج تصعيدًا إلى مدير الإدارة.",
          reason: `مؤشر صحة المشروع ${project.health}% وحالته الحالية ${project.status}.`,
          expectedImpact: "خفض المخاطر غير المعالجة وتسريع التصعيد عند الحاجة.",
        },
      ])
      .slice(0, 4);
  }

  if (role === "manager") {
    const strongest = [...projects].sort((a, b) => b.health - a.health)[0] ?? ranked[0]!;
    return ranked.slice(0, 4).map((project, index) => ({
      id: project.id * 10 + 3,
      project,
      title:
        index === 0
          ? `اعتماد خطة تصحيحية لمشروع ${project.name}`
          : index === 1
            ? `إعادة موازنة الموارد بين ${strongest.name} و${project.name}`
            : `تصعيد متابعة مدير مشروع ${project.name}`,
      category:
        index === 1
          ? ("موارد" as const)
          : project.delayRisk >= 55
            ? ("جدولة" as const)
            : ("أداء" as const),
      impact: index < 2 ? ("عالٍ" as const) : ("متوسط" as const),
      confidence: Math.min(95, 70 + Math.round(project.delayRisk * 0.3)),
      description:
        index === 1
          ? "قرار إداري لإعادة توزيع جزء من السعة المتاحة بين مشاريع الإدارة بعد مراجعة الأولويات."
          : `قرار إداري لمراجعة أداء المشروع مع ${project.manager} وتحديد التزام تصحيحي وتاريخ متابعة.`,
      reason: `مخاطر التأخير ${project.delayRisk}%، الصحة ${project.health}%، والإنجاز ${project.progress}%.`,
      expectedImpact:
        index === 1
          ? "تحسين استغلال موارد الإدارة وتقليل ضغط المشروع الأعلى مخاطرة."
          : "رفع المساءلة وتسريع معالجة التعثر على مستوى الإدارة.",
    }));
  }

  return ranked.slice(0, 4).map((project, index) => ({
    id: project.id * 10 + 4,
    project,
    title:
      index === 0
        ? `توجيه تصعيد تنفيذي لمشروع ${project.name}`
        : index === 1
          ? `إعادة ترتيب أولوية محفظة ${project.sector}`
          : `توحيد معالجة مخاطر ${project.name} على مستوى الوكالة`,
    category:
      index === 1
        ? ("موارد" as const)
        : project.delayRisk >= 55
          ? ("مخاطر" as const)
          : ("أداء" as const),
    impact: index < 2 ? ("عالٍ" as const) : ("متوسط" as const),
    confidence: Math.min(96, 72 + Math.round(project.delayRisk * 0.28)),
    description:
      "توجيه استراتيجي لمكتب إدارة المشاريع لموازنة الأولويات ورفع القرار المناسب للحوكمة التنفيذية.",
    reason: `ترتيب المشروع ضمن المحفظة يعكس مخاطر ${project.delayRisk}% وصحة ${project.health}% مقارنة ببقية مشاريع الوكالة.`,
    expectedImpact: "تحسين قرارات المحفظة وتركيز المتابعة التنفيذية على المشاريع الأعلى أثرًا.",
  }));
}

function MetricBlock({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "success" | "warning" | "danger";
}) {
  const map = {
    success: { icon: "bg-green-50 text-green-700 border-green-100", bar: "bg-green-600" },
    warning: { icon: "bg-amber-50 text-amber-700 border-amber-100", bar: "bg-amber-500" },
    danger: { icon: "bg-red-50 text-red-700 border-red-100", bar: "bg-red-500" },
  };
  const styles = map[tone];
  return (
    <div className="relative overflow-hidden bg-card border border-border/80 rounded-2xl p-5 flex items-center gap-4 shadow-[0_4px_18px_rgba(16,24,40,0.055)] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(16,24,40,0.09)] transition-all duration-300">
      <div className={`absolute inset-x-0 top-0 h-1 ${styles.bar}`} />
      <div
        className={`h-11 w-11 rounded-xl border flex items-center justify-center ${styles.icon}`}
      >
        {icon}
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">{value}</div>
      </div>
    </div>
  );
}
