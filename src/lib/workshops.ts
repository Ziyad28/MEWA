export type WorkshopStatus = "قادمة" | "جارية" | "منتهية" | "ملغاة";
export type InvitationStatus =
  "لم يتم الإرسال" | "تم إرسال الدعوات" | "جاري انتظار الردود" | "اكتملت الردود";
export type TargetType = "all" | "management" | "section" | "manual";
export type AttendanceResponse = "بانتظار الرد" | "مؤكد" | "معتذر";
export type EvaluationRating = "جيد" | "متوسط" | "ضعيف";
export type EvaluationQuestionType = "rating" | "text" | "long_text";

export interface EvaluationQuestion {
  id: string;
  label: string;
  type: EvaluationQuestionType;
  required: boolean;
}

export interface WorkshopEvaluation {
  ratings: Record<string, EvaluationRating>;
  answers: Record<string, string>;
  recommendation: "مناسب للمتابعة" | "مناسب بشروط" | "غير مناسب حاليًا" | "أحتاج معلومات إضافية";
  priority: "عالية" | "متوسطة" | "منخفضة";
  cooperationArea: string;
  conditions: string;
  notes: string;
  submittedAt: string;
}

export interface WorkshopParticipant {
  email: string;
  name: string;
  phone?: string;
  response: AttendanceResponse;
  respondedAt?: string;
  evaluation?: WorkshopEvaluation;
  evaluationNotifiedAt?: string;
  invitationOpenedAt?: string;
  evaluationOpenedAt?: string;
}

export interface WorkshopAutomation {
  invitations: boolean;
  reminder: boolean;
  responses: boolean;
  evaluation: boolean;
  finalReport: boolean;
}

export interface WorkshopMessage {
  id: number;
  type: "دعوة" | "تذكير" | "تقييم";
  sentAt: string;
  status: "تم الإرسال" | "مجدول";
  opened: number;
  channels?: Array<"المنصة" | "البريد الإلكتروني" | "رسالة جوال">;
}

export interface Workshop {
  id: number;
  title: string;
  company: string;
  presenter: string;
  description: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  organizer: string;
  notes: string;
  targetType: TargetType;
  targetLabel: string;
  audienceCount: number;
  confirmed: number;
  declined: number;
  invitationStatus: InvitationStatus;
  cancelled: boolean;
  presentationFile?: string;
  automations: WorkshopAutomation;
  messages: WorkshopMessage[];
  evaluationAverage?: number;
  evaluationResponses?: number;
  evaluationComments: string[];
  evaluationQuestions: EvaluationQuestion[];
  participants: WorkshopParticipant[];
  archived?: boolean;
}

export const STANDARD_EVALUATION_QUESTIONS = [
  { id: "q1", label: "تحسين الكفاءة أو جودة الخدمات", type: "rating" as const, required: true },
  {
    id: "q2",
    label: "رفع نضج التحول الرقمي أو إدارة البيانات",
    type: "rating" as const,
    required: true,
  },
  {
    id: "q3",
    label: "تمكين القيادات أو بناء القدرات الداخلية",
    type: "rating" as const,
    required: true,
  },
  {
    id: "q4",
    label: "تقليل المخاطر التشغيلية أو التقنية",
    type: "rating" as const,
    required: true,
  },
  {
    id: "q5",
    label: "دعم تحقيق مستهدفات استراتيجية الوكالة",
    type: "rating" as const,
    required: true,
  },
  {
    id: "text1",
    label: "ما أبرز المجالات يمكن أن نستفيد فيها من الشركة؟",
    type: "long_text" as const,
    required: false,
  },
  {
    id: "text2",
    label: "ما المشروع أو المبادرة الأنسب كبداية للتعاون إن وجد؟",
    type: "long_text" as const,
    required: false,
  },
  {
    id: "text3",
    label: "ما الأثر المتوقع إذا تم التعاون؟ اذكر الأثر الإداري/التقني/المالي/الخدمي إن أمكن.",
    type: "long_text" as const,
    required: false,
  },
  {
    id: "text4",
    label: "ما المخاوف أو التحفظات التي ظهرت أثناء الاجتماع؟",
    type: "long_text" as const,
    required: false,
  },
  {
    id: "text5",
    label: "ما الأسئلة التي لم تجب عنها الشركة وتحتاج متابعة؟",
    type: "long_text" as const,
    required: false,
  },
  {
    id: "text6",
    label: "هل ترى أن الشركة مناسبة للتعاون؟ ولماذا؟",
    type: "long_text" as const,
    required: true,
  },
];

const KEY = "mewa-workshops-v1";

export function getWorkshops(): Workshop[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const workshops = raw ? (JSON.parse(raw) as Workshop[]) : [];
    return workshops.map((workshop) => ({
      ...workshop,
      participants: workshop.participants ?? [],
      messages: (workshop.messages ?? []).map((message) => ({
        ...message,
        channels: message.channels ?? ["المنصة", "البريد الإلكتروني"],
      })),
      evaluationComments: workshop.evaluationComments ?? [],
      evaluationQuestions: workshop.evaluationQuestions ?? [],
    }));
  } catch {
    return [];
  }
}

export function saveWorkshops(workshops: Workshop[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(workshops));
  window.dispatchEvent(new CustomEvent("mewa-portal-update"));
}

export function workshopStatus(workshop: Workshop): WorkshopStatus {
  if (workshop.cancelled) return "ملغاة";
  const now = new Date();
  const start = new Date(`${workshop.date}T${workshop.startTime || "00:00"}`);
  let end = new Date(`${workshop.date}T${workshop.endTime || "23:59"}`);
  if (end < start) {
    end = new Date(end.getTime() + 12 * 60 * 60 * 1000);
  }
  if (now < start) return "قادمة";
  if (now <= end) return "جارية";
  return "منتهية";
}

export function noResponseCount(workshop: Workshop) {
  return Math.max(0, workshop.audienceCount - workshop.confirmed - workshop.declined);
}

export function evaluationWindow(workshop: Workshop, now = new Date()) {
  const start = new Date(`${workshop.date}T${workshop.startTime || "00:00"}`);
  let end = new Date(`${workshop.date}T${workshop.endTime || "23:59"}`);
  if (end < start) {
    end = new Date(end.getTime() + 12 * 60 * 60 * 1000);
  }
  const opensAt = new Date(end.getTime() - 30 * 60 * 1000);
  const closesAt = new Date(end.getTime() + 24 * 60 * 60 * 1000);
  return {
    opensAt,
    closesAt,
    isOpen: !workshop.cancelled && now >= opensAt && now <= closesAt,
    isUpcoming: now < opensAt,
    isClosed: now > closesAt,
  };
}

export function participantFor(workshop: Workshop, email: string) {
  return workshop.participants.find(
    (participant) => participant.email.toLowerCase() === email.toLowerCase(),
  );
}
