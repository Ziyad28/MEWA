import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Eye,
  Mail,
  MapPin,
  Smartphone,
  XCircle,
} from "lucide-react";
import { AppShell, useRequirePermission } from "@/components/app-shell";
import { PageSkeleton } from "@/components/page-skeleton";
import { Badge, Card, CardHeader, EmptyState } from "@/components/ui-bits";
import { addTargetedNotification, recordAudit } from "@/lib/portal-store";
import {
  evaluationWindow,
  getWorkshops,
  participantFor,
  saveWorkshops,
  workshopStatus,
  type AttendanceResponse,
  type EvaluationRating,
  type Workshop,
  type WorkshopEvaluation,
} from "@/lib/workshops";

export const Route = createFileRoute("/workshop-invitations")({
  component: WorkshopInvitationsPage,
  head: () => ({ meta: [{ title: "دعوات ورش العمل — منصة إدارة وحوكمة المشاريع" }] }),
});

const EMPTY_EVALUATION = {
  ratings: {} as Record<string, EvaluationRating>,
  answers: {} as Record<string, string>,
  recommendation: "مناسب للمتابعة" as WorkshopEvaluation["recommendation"],
  priority: "متوسطة" as WorkshopEvaluation["priority"],
  cooperationArea: "",
  conditions: "",
  notes: "",
};

function WorkshopInvitationsPage() {
  const user = useRequirePermission("workshops.respond");
  const [workshops, setWorkshops] = useState<Workshop[]>(() => getWorkshops());
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [clock, setClock] = useState(() => new Date());
  const [evaluation, setEvaluation] = useState(EMPTY_EVALUATION);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const invitations = useMemo(() => {
    if (!user) return [];
    return workshops.filter((workshop) => {
      const participant = participantFor(workshop, user.email);
      if (!participant) return false;

      const status = workshopStatus(workshop);
      const isEndedOrCancelled = status === "منتهية" || status === "ملغاة";
      const needsEvaluation =
        participant.response === "مؤكد" &&
        !participant.evaluation &&
        evaluationWindow(workshop, clock).isOpen;

      return !isEndedOrCancelled || needsEvaluation;
    });
  }, [clock, user, workshops]);

  useEffect(() => {
    if (!user) return;
    const reminders: Array<{ workshop: Workshop; phone?: string }> = [];
    let changed = false;
    const next = workshops.map((workshop) => {
      const participant = participantFor(workshop, user.email);
      const windowState = evaluationWindow(workshop, clock);
      if (
        !participant ||
        participant.response !== "مؤكد" ||
        participant.evaluation ||
        participant.evaluationNotifiedAt ||
        !workshop.automations.evaluation ||
        !windowState.isOpen
      ) {
        return workshop;
      }
      changed = true;
      reminders.push({ workshop, phone: participant.phone });
      const notifiedAt = new Date().toLocaleString("ar-SA", {
        dateStyle: "medium",
        timeStyle: "short",
      });
      return {
        ...workshop,
        participants: workshop.participants.map((item) =>
          item.email.toLowerCase() === user.email.toLowerCase()
            ? { ...item, evaluationNotifiedAt: notifiedAt }
            : item,
        ),
        messages: workshop.messages.some((message) => message.type === "تقييم")
          ? workshop.messages
          : [
              ...workshop.messages,
              {
                id: Date.now(),
                type: "تقييم" as const,
                sentAt: notifiedAt,
                status: "تم الإرسال" as const,
                opened: 0,
                channels: [
                  "المنصة" as const,
                  "البريد الإلكتروني" as const,
                  ...(participant.phone ? (["رسالة جوال"] as const) : []),
                ],
              },
            ],
      };
    });
    if (!changed) return;
    setWorkshops(next);
    saveWorkshops(next);
    reminders.forEach(({ workshop }) =>
      addTargetedNotification(
        user.email,
        `نموذج تقييم ورشة ${workshop.title} متاح الآن`,
        "يمكنك تعبئة نموذج التقييم داخل المنصة. يظل النموذج متاحًا حتى 24 ساعة بعد انتهاء الورشة.",
        "/workshop-invitations",
      ),
    );
  }, [clock, user, workshops]);

  if (!user) return <PageSkeleton />;
  const currentUser = user;

  const selected = invitations.find((workshop) => workshop.id === selectedId);
  const selectedParticipant = selected ? participantFor(selected, currentUser.email) : undefined;

  function openWorkshop(workshop: Workshop) {
    if (selectedId === workshop.id) {
      setSelectedId(null);
      return;
    }

    const participant = participantFor(workshop, currentUser.email);
    if (!participant) return;
    const evaluationIsOpen =
      participant.response === "مؤكد" && evaluationWindow(workshop, clock).isOpen;
    const shouldOpenInvitation = !participant.invitationOpenedAt;
    const shouldOpenEvaluation = evaluationIsOpen && !participant.evaluationOpenedAt;

    if (shouldOpenInvitation || shouldOpenEvaluation) {
      const openedAt = new Date().toLocaleString("ar-SA", {
        dateStyle: "medium",
        timeStyle: "short",
      });
      const openedTypes = [
        ...(shouldOpenInvitation ? (["دعوة"] as const) : []),
        ...(shouldOpenEvaluation ? (["تقييم"] as const) : []),
      ];
      const latestMessageIds = new Set(
        openedTypes.map((type) =>
          workshop.messages
            .filter((message) => message.type === type)
            .reduce((latest, message) => Math.max(latest, message.id), 0),
        ),
      );
      const next = workshops.map((item) =>
        item.id !== workshop.id
          ? item
          : {
              ...item,
              participants: item.participants.map((entry) =>
                entry.email.toLowerCase() !== currentUser.email.toLowerCase()
                  ? entry
                  : {
                      ...entry,
                      ...(shouldOpenInvitation ? { invitationOpenedAt: openedAt } : {}),
                      ...(shouldOpenEvaluation ? { evaluationOpenedAt: openedAt } : {}),
                    },
              ),
              messages: item.messages.map((message) =>
                latestMessageIds.has(message.id)
                  ? { ...message, opened: message.opened + 1 }
                  : message,
              ),
            },
      );
      setWorkshops(next);
      saveWorkshops(next);
    }
    setSelectedId(workshop.id);
  }

  function respond(workshop: Workshop, response: AttendanceResponse) {
    const respondedAt = new Date().toLocaleString("ar-SA", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const next = workshops.map((item) => {
      if (item.id !== workshop.id) return item;
      const participants = item.participants.map((participant) =>
        participant.email.toLowerCase() === currentUser.email.toLowerCase()
          ? { ...participant, response, respondedAt }
          : participant,
      );
      const confirmed = participants.filter(
        (participant) => participant.response === "مؤكد",
      ).length;
      const declined = participants.filter(
        (participant) => participant.response === "معتذر",
      ).length;
      return {
        ...item,
        participants,
        confirmed,
        declined,
        invitationStatus: (confirmed + declined === participants.length
          ? "اكتملت الردود"
          : "جاري انتظار الردود") as Workshop["invitationStatus"],
      };
    });
    setWorkshops(next);
    saveWorkshops(next);
    recordAudit(
      response === "مؤكد" ? "تأكيد حضور ورشة" : "الاعتذار عن ورشة",
      "ورشة",
      `${currentUser.name} — ${workshop.title}`,
      workshop.id,
    );
    addTargetedNotification(
      currentUser.email,
      response === "مؤكد" ? "تم تأكيد حضورك" : "تم تسجيل اعتذارك",
      `تم حفظ ردك على دعوة ورشة ${workshop.title}.`,
      "/workshop-invitations",
    );
  }

  function submitEvaluation(event: React.FormEvent) {
    event.preventDefault();
    if (!selected || !selectedParticipant) return;
    const missingRequired = selected.evaluationQuestions.some((question) => {
      if (!question.required) return false;
      return question.type === "rating"
        ? !evaluation.ratings[question.id]
        : !evaluation.answers[question.id]?.trim();
    });
    if (missingRequired) {
      window.alert("يرجى الإجابة عن جميع الأسئلة الإلزامية قبل إرسال النموذج.");
      return;
    }
    const submittedAt = new Date().toLocaleString("ar-SA", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const completed: WorkshopEvaluation = { ...evaluation, submittedAt };
    const next = workshops.map((workshop) => {
      if (workshop.id !== selected.id) return workshop;
      const participants = workshop.participants.map((participant) =>
        participant.email.toLowerCase() === currentUser.email.toLowerCase()
          ? { ...participant, evaluation: completed }
          : participant,
      );
      const evaluations = participants.flatMap((participant) =>
        participant.evaluation ? [participant.evaluation] : [],
      );
      const ratingValues = evaluations.flatMap((item) =>
        Object.values(item.ratings).map((rating) =>
          rating === "جيد" ? 3 : rating === "متوسط" ? 2 : 1,
        ),
      );
      const evaluationAverage = ratingValues.length
        ? Number(
            (
              (ratingValues.reduce((sum, value) => sum + value, 0) / ratingValues.length / 3) *
              5
            ).toFixed(1),
          )
        : undefined;
      const evaluationComments = evaluations
        .flatMap((item) => [...Object.values(item.answers).filter(Boolean), item.notes])
        .filter(Boolean);
      return {
        ...workshop,
        participants,
        evaluationAverage,
        evaluationResponses: evaluations.length,
        evaluationComments,
      };
    });
    setWorkshops(next);
    saveWorkshops(next);
    recordAudit("إرسال تقييم ورشة", "ورشة", `${currentUser.name} — ${selected.title}`, selected.id);
    addTargetedNotification(
      currentUser.email,
      "تم استلام تقييمك",
      `شكرًا لك. تم حفظ تقييم ورشة ${selected.title} داخل المنصة.`,
      "/workshop-invitations",
    );
    setEvaluation(EMPTY_EVALUATION);
  }

  return (
    <AppShell
      role={currentUser.role}
      userName={currentUser.name}
      roleLabel={currentUser.roleLabel}
      pageTitle="دعوات ورش العمل"
      pageSubtitle="تأكيد الحضور وتعبئة نماذج التقييم من داخل المنصة"
    >
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary-deep">
        <div className="flex items-start gap-3">
          <Bell className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <div className="font-bold">الدعوات والردود تتم داخل المنصة</div>
            <p className="mt-1 leading-6">
              البريد الإلكتروني ورسالة الجوال تستخدمان للتنبيه فقط، بينما يتم تأكيد الحضور وتعبئة
              التقييم من هذه الصفحة. في النسخة الحالية تعمل إشعارات المنصة، أما البريد والجوال فهما
              في وضع تجريبي لحين ربط الباك إند.
            </p>
          </div>
        </div>
      </div>

      {invitations.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Mail className="h-6 w-6" />}
            title="لا توجد دعوات حاليًا"
            description="ستظهر هنا الورش التي تمت دعوتك إليها من مسؤول الشركات وبناء القدرات."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {invitations.map((workshop) => {
            const participant = participantFor(workshop, currentUser.email)!;
            const status = workshopStatus(workshop);
            return (
              <Card key={workshop.id} className="overflow-hidden">
                <div className="border-r-4 border-primary p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-primary">دعوة لحضور ورشة</div>
                      <h2 className="mt-1 text-lg font-bold">{workshop.title}</h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {workshop.description ||
                          `ندعوك لحضور الورشة المقدمة من ${workshop.company}.`}
                      </p>
                    </div>
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
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <Meta
                      icon={<Building2 className="h-4 w-4 shrink-0 text-primary" />}
                      value={workshop.company}
                    />
                    <Meta
                      icon={<Calendar className="h-4 w-4 shrink-0 text-primary" />}
                      value={workshop.date}
                    />
                    <Meta
                      icon={<Clock className="h-4 w-4 shrink-0 text-primary" />}
                      value={`${workshop.startTime} – ${workshop.endTime}`}
                    />
                    <Meta
                      icon={<MapPin className="h-4 w-4 shrink-0 text-primary" />}
                      value={workshop.location || "يحدد لاحقًا"}
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                    <span className="text-xs text-muted-foreground">حالة الورشة: {status}</span>
                    <button
                      onClick={() => openWorkshop(workshop)}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold text-primary"
                    >
                      <Eye className="h-4 w-4" />
                      {selectedId === workshop.id ? "إخفاء التفاصيل" : "عرض التفاصيل"}
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {selected && selectedParticipant && (
        <WorkshopDetails
          workshop={selected}
          participantResponse={selectedParticipant.response}
          hasEvaluation={Boolean(selectedParticipant.evaluation)}
          userPhone={selectedParticipant.phone}
          clock={clock}
          evaluation={evaluation}
          setEvaluation={setEvaluation}
          onRespond={(response) => respond(selected, response)}
          onSubmitEvaluation={submitEvaluation}
        />
      )}
    </AppShell>
  );
}

function WorkshopDetails({
  workshop,
  participantResponse,
  hasEvaluation,
  userPhone,
  clock,
  evaluation,
  setEvaluation,
  onRespond,
  onSubmitEvaluation,
}: {
  workshop: Workshop;
  participantResponse: AttendanceResponse;
  hasEvaluation: boolean;
  userPhone?: string;
  clock: Date;
  evaluation: typeof EMPTY_EVALUATION;
  setEvaluation: React.Dispatch<React.SetStateAction<typeof EMPTY_EVALUATION>>;
  onRespond: (response: AttendanceResponse) => void;
  onSubmitEvaluation: (event: React.FormEvent) => void;
}) {
  const windowState = evaluationWindow(workshop, clock);
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title={`تفاصيل الدعوة — ${workshop.title}`} />
        <div className="grid grid-cols-1 gap-4 px-5 pb-5 text-sm md:grid-cols-3">
          <Info label="الشركة" value={workshop.company} />
          <Info label="مسؤول الورشة" value={workshop.presenter || "—"} />
          <Info label="الجهة المنظمة" value={workshop.organizer} />
          <Info label="التاريخ" value={workshop.date} />
          <Info label="الوقت" value={`${workshop.startTime} – ${workshop.endTime}`} />
          <Info label="المكان" value={workshop.location || "يحدد لاحقًا"} />
          <div className="md:col-span-3">
            <Info label="نبذة عن الورشة" value={workshop.description || "لا يوجد وصف إضافي."} />
          </div>
        </div>
        {!workshop.cancelled && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4">
            <div>
              <div className="text-sm font-bold">هل ترغب في حضور الورشة؟</div>
              <div className="mt-1 text-xs text-muted-foreground">
                يمكنك تعديل ردك قبل موعد الورشة.
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onRespond("مؤكد")}
                className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold ${participantResponse === "مؤكد" ? "bg-primary text-white" : "border border-primary text-primary"}`}
              >
                <CheckCircle2 className="h-4 w-4" /> نعم، سأحضر
              </button>
              <button
                onClick={() => onRespond("معتذر")}
                className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold ${participantResponse === "معتذر" ? "bg-red-600 text-white" : "border border-red-200 text-red-700"}`}
              >
                <XCircle className="h-4 w-4" /> أعتذر
              </button>
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-3 border-t border-border bg-muted/20 px-5 py-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5" /> إشعار المنصة
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" /> البريد الإلكتروني
          </span>
          {userPhone && (
            <span className="inline-flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5" /> رسالة جوال
            </span>
          )}
        </div>
      </Card>

      {hasEvaluation ? (
        <Card className="border-green-200 bg-green-50 p-5 text-green-800">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6" />
            <div>
              <div className="font-bold">تم إرسال التقييم</div>
              <p className="mt-1 text-sm">شكرًا لمشاركتك. تم حفظ إجاباتك داخل المنصة.</p>
            </div>
          </div>
        </Card>
      ) : participantResponse !== "مؤكد" ? (
        <Card className="p-5 text-sm text-muted-foreground">
          يظهر نموذج التقييم للموظفين الذين أكدوا الحضور فقط.
        </Card>
      ) : !workshop.automations.evaluation ? null : windowState.isUpcoming ? (
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <div className="font-bold">نموذج التقييم لم يفتح بعد</div>
              <p className="mt-1 text-sm text-muted-foreground">
                سيفتح تلقائيًا قبل نهاية الورشة بنصف ساعة، وسيصلك تنبيه عبر المنصة والبريد
                الإلكتروني{userPhone ? " والجوال" : ""}.
              </p>
            </div>
          </div>
        </Card>
      ) : windowState.isClosed ? (
        <Card className="p-5 text-sm text-muted-foreground">
          انتهت فترة التقييم بعد مرور 24 ساعة على انتهاء الورشة.
        </Card>
      ) : (
        <EvaluationForm
          workshop={workshop}
          evaluation={evaluation}
          setEvaluation={setEvaluation}
          onSubmit={onSubmitEvaluation}
        />
      )}
    </div>
  );
}

function EvaluationForm({
  workshop,
  evaluation,
  setEvaluation,
  onSubmit,
}: {
  workshop: Workshop;
  evaluation: typeof EMPTY_EVALUATION;
  setEvaluation: React.Dispatch<React.SetStateAction<typeof EMPTY_EVALUATION>>;
  onSubmit: (event: React.FormEvent) => void;
}) {
  const STANDARD_EVALUATION_QUESTIONS = [
    { id: "q1", label: "تحسين الكفاءة أو جودة الخدمات", type: "rating" as const, required: true },
    { id: "q2", label: "رفع نضج التحول الرقمي أو إدارة البيانات", type: "rating" as const, required: true },
    { id: "q3", label: "تمكين القيادات أو بناء القدرات الداخلية", type: "rating" as const, required: true },
    { id: "q4", label: "تقليل المخاطر التشغيلية أو التقنية", type: "rating" as const, required: true },
    { id: "q5", label: "دعم تحقيق مستهدفات استراتيجية الوكالة", type: "rating" as const, required: true },
    { id: "text1", label: "ما أبرز المجالات يمكن أن نستفيد فيها من الشركة؟", type: "long_text" as const, required: false },
    { id: "text2", label: "ما المشروع أو المبادرة الأنسب كبداية للتعاون إن وجد؟", type: "long_text" as const, required: false },
    { id: "text3", label: "ما الأثر المتوقع إذا تم التعاون؟ اذكر الأثر الإداري/التقني/المالي/الخدمي إن أمكن.", type: "long_text" as const, required: false },
    { id: "text4", label: "ما المخاوف أو التحفظات التي ظهرت أثناء الاجتماع؟", type: "long_text" as const, required: false },
    { id: "text5", label: "ما الأسئلة التي لم تجب عنها الشركة وتحتاج متابعة؟", type: "long_text" as const, required: false },
    { id: "text6", label: "هل ترى أن الشركة مناسبة للتعاون؟ ولماذا؟", type: "long_text" as const, required: true },
  ];

  return (
    <Card>
      <CardHeader
        title="نموذج تقييم التعاون والشركة"
        subtitle={`مرتبط بورشة ${workshop.title} — ${workshop.company}`}
        action={<ClipboardCheck className="h-5 w-5 text-primary" />}
      />
      <form onSubmit={onSubmit} className="space-y-6 px-5 pb-6">
        <section className="rounded-xl border border-border p-4">
          <h3 className="font-bold text-primary-deep">أسئلة تقييم الورشة</h3>
          <div className="mt-4 space-y-5">
            {STANDARD_EVALUATION_QUESTIONS.map((question, index) => (
              <label key={question.id} className="block space-y-2 text-sm font-medium">
                <span>
                  {index + 1}. {question.label}
                  {question.required && <span className="mr-1 text-red-600">*</span>}
                </span>
                  {question.type === "rating" ? (
                    <div className="flex flex-wrap gap-2">
                      {(["جيد", "متوسط", "ضعيف"] as EvaluationRating[]).map((rating) => (
                        <label
                          key={rating}
                          className={`cursor-pointer rounded-lg border px-4 py-2 text-xs ${evaluation.ratings[question.id] === rating ? "border-primary bg-primary text-white" : "border-border"}`}
                        >
                          <input
                            type="radio"
                            name={question.id}
                            value={rating}
                            checked={evaluation.ratings[question.id] === rating}
                            onChange={() =>
                              setEvaluation((current) => ({
                                ...current,
                                ratings: { ...current.ratings, [question.id]: rating },
                              }))
                            }
                            className="sr-only"
                          />
                          {rating}
                        </label>
                      ))}
                    </div>
                  ) : question.type === "long_text" ? (
                    <textarea
                      rows={4}
                      value={evaluation.answers[question.id] ?? ""}
                      onChange={(event) =>
                        setEvaluation((current) => ({
                          ...current,
                          answers: {
                            ...current.answers,
                            [question.id]: event.target.value,
                          },
                        }))
                      }
                      className="w-full rounded-lg border border-border bg-background p-3 text-sm"
                    />
                  ) : (
                    <input
                      value={evaluation.answers[question.id] ?? ""}
                      onChange={(event) =>
                        setEvaluation((current) => ({
                          ...current,
                          answers: {
                            ...current.answers,
                            [question.id]: event.target.value,
                          },
                        }))
                      }
                      className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm"
                    />
                  )}
                </label>
              ))}
            </div>
          </section>

        <div className="flex justify-end">
          <button
            className="h-11 rounded-lg bg-primary px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            إرسال التقييم
          </button>
        </div>
      </form>
    </Card>
  );
}

function Meta({ icon, value }: { icon: React.ReactElement; value: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span>{value}</span>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
