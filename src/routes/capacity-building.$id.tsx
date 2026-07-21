import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, ChevronDown, ChevronUp, Download, Mail, RefreshCw } from "lucide-react";
import { AppShell, useRequirePermission } from "@/components/app-shell";
import { Badge, Card, CardHeader, EmptyState } from "@/components/ui-bits";
import { PageSkeleton } from "@/components/page-skeleton";
import { printPdf, recordAudit } from "@/lib/portal-store";
import {
  getWorkshops,
  noResponseCount,
  saveWorkshops,
  workshopStatus,
  type WorkshopEvaluation,
} from "@/lib/workshops";

const RATING_LABELS: Record<string, string> = {
  "needs-expertise": "فهم الشركة لاختصاصات وأولويات الجهة",
  "needs-value": "وضوح القيمة المضافة مقارنة بالموردين أو الشركاء الآخرين",
  "needs-initiatives": "ارتباط خدماتها بمبادرات الوكالة",
  "needs-practical": "قدرتها على تقديم حلول عملية قابلة للتنفيذ",
  "readiness-government": "وجود خبرات ذات صلة بالقطاع الحكومي",
  "readiness-method": "وضوح منهجية العمل وآلية نقل المعرفة",
  "readiness-team": "قدرة الفريق المقترح على التنفيذ",
  "readiness-products": "وجود منتجات أو منصات يمكن تجربتها أو إثبات فعاليتها",
  "impact-efficiency": "تحسين الكفاءة أو جودة الخدمات",
  "impact-digital": "رفع نضج التحول الرقمي أو إدارة البيانات",
  "impact-capability": "تمكين القيادات أو بناء القدرات الداخلية",
  "impact-risk": "تقليل المخاطر التشغيلية أو التقنية",
  "impact-strategy": "دعم تحقيق مستهدفات استراتيجية الوكالة",
};

const ANSWER_LABELS: Record<string, string> = {
  benefits: "أبرز المجالات التي يمكن أن تستفيد فيها الوكالة من الشركة",
  initiative: "المشروع أو المبادرة الأنسب كبداية للتعاون",
  "expected-impact": "الأثر المتوقع إذا تم التعاون",
  concerns: "المخاوف أو التحفظات التي ظهرت أثناء الورشة",
  unanswered: "الأسئلة التي تحتاج متابعة مع الشركة",
  suitability: "مدى مناسبة الشركة للتعاون وأسباب ذلك",
};

export const Route = createFileRoute("/capacity-building/$id")({
  component: WorkshopDetailsPage,
  loader: ({ params }) => {
    if (!Number(params.id)) throw notFound();
    return { id: Number(params.id) };
  },
  head: () => ({ meta: [{ title: "تفاصيل الورشة — الشركات وبناء القدرات" }] }),
});

function WorkshopDetailsPage() {
  const user = useRequirePermission("workshops.manage");
  const [expandedEvaluation, setExpandedEvaluation] = useState<string | null>(null);
  const { id } = Route.useLoaderData();
  const workshop = getWorkshops().find((item) => item.id === id);
  if (!user) return <PageSkeleton />;
  if (!workshop) return <div className="p-8 text-center">الورشة غير موجودة.</div>;
  const current = workshop;

  const status = workshopStatus(current);
  const noResponse = noResponseCount(current);
  const responseCount = current.confirmed + current.declined;
  const invitationResponseRate = current.audienceCount
    ? Math.round((responseCount / current.audienceCount) * 100)
    : 0;
  const evaluators = current.participants.filter((participant) => participant.evaluation);
  const evaluationResponseRate = current.confirmed
    ? Math.round((evaluators.length / current.confirmed) * 100)
    : 0;

  function resend(type: "دعوة" | "تذكير") {
    if (!noResponse) return;
    const next = {
      ...current,
      messages: [
        ...current.messages,
        {
          id: Date.now(),
          type,
          sentAt: new Date().toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" }),
          status: "تم الإرسال" as const,
          opened: 0,
        },
      ],
    };
    saveWorkshops(getWorkshops().map((item) => (item.id === current.id ? next : item)));
    recordAudit(
      `إعادة إرسال ${type}`,
      "ورشة",
      `${current.title} — ${noResponse} مستلم`,
      current.id,
    );
  }

  function downloadReport() {
    printPdf(`التقرير النهائي — ${current.title}`, [
      ["البيان", "القيمة"],
      ["الشركة", current.company],
      ["مسؤول الورشة", current.presenter],
      ["التاريخ", current.date],
      ["عدد المدعوين", current.audienceCount],
      ["الحضور المؤكدون", current.confirmed],
      ["المعتذرون", current.declined],
      ["نسبة الاستجابة للدعوة", `${invitationResponseRate}%`],
      ["نسبة الاستجابة للتقييم", `${evaluationResponseRate}%`],
      [
        "متوسط التقييم",
        current.evaluationAverage ? `${current.evaluationAverage} من 5` : "لا توجد نتائج",
      ],
      [
        "التوصيات",
        current.evaluationComments.length
          ? current.evaluationComments.join(" — ")
          : "لا توجد توصيات مسجلة",
      ],
    ]);
    recordAudit("تحميل التقرير النهائي", "ورشة", current.title, current.id);
  }

  return (
    <AppShell
      role={user.role}
      userName={user.name}
      roleLabel={user.roleLabel}
      pageTitle={current.title}
      pageSubtitle="تفاصيل الورشة ومتابعة الإجراءات التلقائية"
    >
      <Link
        to="/capacity-building"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
      >
        <ArrowRight className="h-4 w-4" />
        العودة إلى إدارة ورش العمل
      </Link>

      <Card>
        <CardHeader
          title="معلومات الورشة"
          action={
            <Badge
              tone={
                status === "قادمة"
                  ? "primary"
                  : status === "جارية"
                    ? "warning"
                    : status === "منتهية"
                      ? "success"
                      : "muted"
              }
            >
              {status}
            </Badge>
          }
        />
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 px-5 pb-5 text-sm md:grid-cols-3">
          <Info label="الشركة" value={current.company} />
          <Info label="مسؤول الورشة" value={current.presenter} />
          <Info label="الجهة المنظمة" value={current.organizer} />
          <Info label="التاريخ" value={current.date} />
          <Info label="الوقت" value={`${current.startTime} – ${current.endTime}`} />
          <Info label="المكان" value={current.location} />
          <Info label="الفئة المستهدفة" value={current.targetLabel} />
          <Info label="حالة الدعوات" value={current.invitationStatus} />
          <Info label="عدد المدعوين" value={String(current.audienceCount)} />
          <div className="md:col-span-3">
            <Info label="وصف الورشة" value={current.description || "—"} />
          </div>
          {current.notes && (
            <div className="md:col-span-3">
              <Info label="ملاحظات" value={current.notes} />
            </div>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title="المشاركون" subtitle="متابعة ردود الفئة المستهدفة" />
        <div className="grid grid-cols-1 gap-3 px-5 pb-5 md:grid-cols-3">
          <CountCard
            label="أكد الحضور"
            value={current.confirmed}
            tone="text-green-700 bg-green-50 border-green-200"
          />
          <CountCard
            label="اعتذر"
            value={current.declined}
            tone="text-red-700 bg-red-50 border-red-200"
          />
          <CountCard
            label="لم يرد"
            value={noResponse}
            tone="text-amber-700 bg-amber-50 border-amber-200"
          />
        </div>
        {current.participants.length > 0 && (
          <div className="overflow-x-auto border-t border-border">
            <table className="w-full min-w-[620px] text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th className="px-5 py-3 text-right">الموظف المدعو</th>
                  <th className="px-5 py-3 text-right">البريد الوزاري</th>
                  <th className="px-5 py-3 text-right">رد الحضور</th>
                  <th className="px-5 py-3 text-right">التقييم</th>
                </tr>
              </thead>
              <tbody>
                {current.participants.map((participant) => (
                  <tr key={participant.email} className="border-t border-border">
                    <td className="px-5 py-3 font-semibold">{participant.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{participant.email}</td>
                    <td className="px-5 py-3">
                      <Badge
                        tone={
                          participant.response === "مؤكد"
                            ? "success"
                            : participant.response === "معتذر"
                              ? "danger"
                              : "warning"
                        }
                      >
                        {participant.response}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      {participant.evaluation ? "تم الإرسال" : "لم يرسل"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {noResponse > 0 && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">
            <button
              onClick={() => resend("دعوة")}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm"
            >
              <Mail className="h-4 w-4" />
              إعادة إرسال الدعوة لمن لم يرد
            </button>
            <button
              onClick={() => resend("تذكير")}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white"
            >
              <RefreshCw className="h-4 w-4" />
              إرسال تذكير لمن لم يرد
            </button>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="سجل الرسائل" subtitle="الرسائل التي أرسلها النظام تلقائيًا" />
        {current.messages.length === 0 ? (
          <EmptyState
            icon={<Mail className="h-6 w-6" />}
            title="لم تُرسل رسائل بعد"
            description="ستظهر الدعوات والتذكيرات ونماذج التقييم هنا بعد إرسالها."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th className="px-5 py-3 text-right">نوع الرسالة</th>
                  <th className="px-5 py-3 text-right">وقت الإرسال</th>
                  <th className="px-5 py-3 text-right">حالة الإرسال</th>
                  <th className="px-5 py-3 text-right">تم فتح الرسالة</th>
                  <th className="px-5 py-3 text-right">قنوات التنبيه</th>
                </tr>
              </thead>
              <tbody>
                {current.messages.map((message) => (
                  <tr key={message.id} className="border-t border-border">
                    <td className="px-5 py-4 font-semibold">{message.type}</td>
                    <td className="px-5 py-4">{message.sentAt}</td>
                    <td className="px-5 py-4">
                      <Badge tone={message.status === "تم الإرسال" ? "success" : "warning"}>
                        {message.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">{message.opened} مستلم</td>
                    <td className="px-5 py-4">
                      {(message.channels ?? ["المنصة", "البريد الإلكتروني"]).join("، ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="نتائج التقييم" subtitle="ملخص التقييمات والتعليقات المستلمة" />
        <div className="grid grid-cols-1 gap-3 px-5 pb-5 md:grid-cols-2">
          <CountCard
            label="متوسط التقييم"
            value={current.evaluationAverage ? `${current.evaluationAverage} / 5` : "—"}
            tone="text-primary bg-primary/5 border-primary/20"
          />
          <CountCard
            label="نسبة الاستجابة للتقييم"
            value={`${evaluationResponseRate}%`}
            tone="text-primary bg-primary/5 border-primary/20"
          />
        </div>
        <div className="border-t border-border px-5 py-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold">تقييمات الموظفين وإجاباتهم</h3>
            <span className="text-xs text-muted-foreground">
              {evaluators.length} من {current.confirmed} من الحضور المؤكدين أرسلوا التقييم
            </span>
          </div>
          {evaluators.length ? (
            <div className="mt-4 space-y-3">
              {evaluators.map((participant) => {
                const evaluation = participant.evaluation!;
                const isExpanded = expandedEvaluation === participant.email;
                return (
                  <div
                    key={participant.email}
                    className="overflow-hidden rounded-xl border border-border bg-background"
                  >
                    <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="font-bold">{participant.name}</div>
                        <div className="mt-1 text-sm text-muted-foreground" dir="ltr">
                          {participant.email}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          أُرسل في {evaluation.submittedAt}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge tone="success">{evaluationAverage(evaluation)} / 5</Badge>
                        <span className="text-sm text-muted-foreground">
                          {Object.keys(evaluation.ratings).length +
                            Object.keys(evaluation.answers).length}{" "}
                          إجابة
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedEvaluation(isExpanded ? null : participant.email)
                          }
                          className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary/25 px-4 text-sm font-semibold text-primary"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          {isExpanded ? "إخفاء الإجابات" : "عرض جميع الإجابات"}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="space-y-6 border-t border-border bg-muted/15 p-5">
                        <EvaluationSection title="تقييم المحاور">
                          <div className="overflow-x-auto rounded-lg border border-border bg-background">
                            <table className="w-full min-w-[620px] text-sm">
                              <thead>
                                <tr className="text-xs text-muted-foreground">
                                  <th className="px-4 py-3 text-right">المحور</th>
                                  <th className="px-4 py-3 text-right">الإجابة</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(evaluation.ratings).map(([key, rating]) => (
                                  <tr key={key} className="border-t border-border">
                                    <td className="px-4 py-3">
                                      {current.evaluationQuestions.find(
                                        (question) => question.id === key,
                                      )?.label ??
                                        RATING_LABELS[key] ??
                                        key}
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-primary">
                                      {rating}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </EvaluationSection>

                        <EvaluationSection title="الإجابات التفصيلية">
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {Object.entries(evaluation.answers).map(([key, answer]) => (
                              <AnswerBox
                                key={key}
                                label={
                                  current.evaluationQuestions.find(
                                    (question) => question.id === key,
                                  )?.label ??
                                  ANSWER_LABELS[key] ??
                                  key
                                }
                                value={answer || "لم يُجب"}
                              />
                            ))}
                          </div>
                        </EvaluationSection>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 rounded-lg bg-muted/30 p-4 text-sm text-muted-foreground">
              لم يرسل أي موظف نموذج التقييم حتى الآن. عند الإرسال سيظهر اسمه وبريده وجميع إجاباته
              هنا.
            </p>
          )}
        </div>
      </Card>

      {status === "منتهية" && current.automations.finalReport && (
        <Card className="flex flex-col items-start justify-between gap-4 p-5 md:flex-row md:items-center">
          <div>
            <h2 className="font-bold">التقرير النهائي</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              يتضمن بيانات الورشة والحضور ونسبة الاستجابة والتقييم والتوصيات.
            </p>
          </div>
          <button
            onClick={downloadReport}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white"
          >
            <Download className="h-4 w-4" />
            تحميل التقرير النهائي PDF
          </button>
        </Card>
      )}
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium text-foreground">{value}</div>
    </div>
  );
}

function evaluationAverage(evaluation: WorkshopEvaluation) {
  const ratings = Object.values(evaluation.ratings);
  if (!ratings.length) return "—";
  const total = ratings.reduce(
    (sum, rating) => sum + (rating === "جيد" ? 3 : rating === "متوسط" ? 2 : 1),
    0,
  );
  return ((total / ratings.length / 3) * 5).toFixed(1);
}

function EvaluationSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="mb-3 text-sm font-bold">{title}</h4>
      {children}
    </section>
  );
}

function AnswerBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-2 whitespace-pre-wrap text-sm leading-6">{value}</div>
    </div>
  );
}

function CountCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: string;
}) {
  return (
    <div className={`rounded-xl border p-4 ${tone}`}>
      <div className="text-xs font-medium">{label}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}
