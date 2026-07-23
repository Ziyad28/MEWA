import { useCallback, useEffect, useState } from "react";
import {
  COMPANIES,
  DOCUMENTS,
  PROJECTS,
  type Company,
  type DocItem,
  type Project,
} from "@/lib/mock-data";
import { getUser } from "@/lib/auth";

export interface StoredDocument extends DocItem {
  content?: string;
  mimeType?: string;
  version?: number;
  approval?: "معتمد" | "بانتظار الاعتماد" | "مرفوض";
  versions?: Array<{ version: number; date: string; uploadedBy: string }>;
  approvedBy?: string;
  approvedByRole?: string;
  approvedAt?: string;
  approvalHistory?: Array<{
    id: number;
    action: "اعتماد" | "إلغاء اعتماد";
    actorName: string;
    actorRole: string;
    date: string;
  }>;
}



export interface PrototypeProject extends Project {
  archived?: boolean;
  archivedBy?: string;
  archivedByRole?: string;
  archivedAt?: string;
  activityLog?: Array<{
    id: number;
    action: "أرشفة" | "استعادة";
    actorName: string;
    actorRole: string;
    date: string;
  }>;
  approvals: Array<{
    id: number;
    title: string;
    status: "معتمد" | "بانتظار الاعتماد" | "مرفوض";
    owner: string;
  }>;
  teamMembers: string[];
  tasks?: Array<{
    id: number;
    title: string;
    weight: number;
    assignee: string;
    completed: boolean;
    completedAt?: string;
  }>;
}

export interface PrototypeCompany extends Company {
  archived?: boolean;
  attachments: Array<{ id: number; name: string; date: string }>;
  timeline: Array<{ id: number; title: string; date: string; description: string }>;
}

export interface PortalNotification {
  id: number;
  title: string;
  body: string;
  time: string;
  read: boolean;
  href?: string;
  actorName?: string;
  actorRole?: string;
  createdAt?: string;
  recipientEmail?: string;
}

export interface PortalMessage {
  id: number;
  sender: string;
  subject: string;
  body: string;
  time: string;
  read: boolean;
  outgoing?: boolean;
}

export interface AuditEvent {
  id: number;
  action: string;
  entity: "مشروع" | "وثيقة" | "شركة" | "ورشة" | "نظام";
  entityId?: number;
  details: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
}

const KEYS = {
  documents: "mewa-portal-documents-v1",
  notifications: "mewa-portal-notifications-v1",
  messages: "mewa-portal-messages-v1",
  projects: "mewa-portal-projects-v2",
  companies: "mewa-portal-companies-v2",
  audit: "mewa-portal-audit-v1",
};

const INITIAL_PROJECTS: PrototypeProject[] = PROJECTS.map((project) => ({
  ...project,
  approvals: [
    {
      id: 1,
      title: "اعتماد التقرير المبدئي",
      status: project.progress > 70 ? "معتمد" : "بانتظار الاعتماد",
      owner: "مدير المشروع",
    },
  ],
  teamMembers: ["سعد بن محمد"],
  tasks: [
    { id: 1, title: "تحليل المتطلبات الأولية", weight: 10, assignee: "سعد بن محمد", completed: true, completedAt: "2026-06-15" },
    { id: 2, title: "تصميم البنية التحتية", weight: 20, assignee: "سعد بن محمد", completed: false },
  ],
}));

const INITIAL_COMPANIES: PrototypeCompany[] = COMPANIES.map((company) => ({
  ...company,
  attachments: [
    {
      id: company.id * 10 + 1,
      name: "العقد الإطاري واتفاقية مستوى الخدمة",
      date: company.contractStart,
    },
  ],
  timeline: [
    {
      id: 1,
      title: "بدء التعاقد",
      date: company.contractStart,
      description: "توقيع العقد وبدء أعمال الشراكة مع الوكالة.",
    },
    {
      id: 2,
      title: "مراجعة الأداء",
      date: company.lastUpdate,
      description: `تحديث مؤشر الأداء إلى ${company.performance}%.`,
    },
  ],
}));

const INITIAL_NOTIFICATIONS: PortalNotification[] = [
  {
    id: 1,
    title: "تحديث مشروع التحول الرقمي",
    body: "تم اعتماد إنجاز المرحلة الثانية بنسبة 66%.",
    time: "منذ 10 دقائق",
    read: false,
    href: "/projects/1",
  },
  {
    id: 2,
    title: "وثيقة جديدة",
    body: "أضيف تقرير الأداء الشهري إلى مكتبة الوثائق.",
    time: "منذ ساعة",
    read: false,
    href: "/documents",
  },
  {
    id: 3,
    title: "مراجعة عقد شركة علم",
    body: "تبقى 30 يومًا على موعد المراجعة الدورية للعقد.",
    time: "أمس",
    read: false,
    href: "/companies/2",
  },
];

const INITIAL_MESSAGES: PortalMessage[] = [
  {
    id: 1,
    sender: "مكتب إدارة المشاريع",
    subject: "اجتماع متابعة المشاريع",
    body: "نأمل تحديث نسب الإنجاز قبل اجتماع الخميس.",
    time: "09:20",
    read: false,
  },
  {
    id: 2,
    sender: "نورة العتيبي",
    subject: "اعتماد محضر الاجتماع",
    body: "تم رفع النسخة النهائية من المحضر للمراجعة.",
    time: "أمس",
    read: false,
  },
];

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("mewa-portal-update"));
}

export const getDocuments = () =>
  read<StoredDocument[]>(KEYS.documents, DOCUMENTS).map((item) => ({
    ...item,
    version: item.version ?? 1,
    approval: item.approval ?? "بانتظار الاعتماد",
    versions: item.versions ?? [{ version: 1, date: item.date, uploadedBy: item.uploadedBy }],
    approvalHistory: item.approvalHistory ?? [],
  }));
export const saveDocuments = (documents: StoredDocument[]) => write(KEYS.documents, documents);
export const getNotifications = () => read(KEYS.notifications, INITIAL_NOTIFICATIONS);
export const saveNotifications = (items: PortalNotification[]) => write(KEYS.notifications, items);
export const getMessages = () => read(KEYS.messages, INITIAL_MESSAGES);
export const saveMessages = (items: PortalMessage[]) => write(KEYS.messages, items);
export const getProjects = () =>
  read<PrototypeProject[]>(KEYS.projects, INITIAL_PROJECTS).map((item) => {
    const seed = INITIAL_PROJECTS.find((project) => project.id === item.id);
    return {
      ...seed,
      ...item,
      teamMembers: item.teamMembers ?? seed?.teamMembers ?? [],
      approvals: item.approvals ?? seed?.approvals ?? [],
      activityLog: item.activityLog ?? seed?.activityLog ?? [],
    } as PrototypeProject;
  });
export const saveProjects = (items: PrototypeProject[]) => write(KEYS.projects, items);
export const getCompanies = () =>
  read<PrototypeCompany[]>(KEYS.companies, INITIAL_COMPANIES).map((item) => {
    const seed = INITIAL_COMPANIES.find((company) => company.id === item.id);
    return {
      ...seed,
      ...item,
      ratings: item.ratings ?? seed?.ratings ?? [],
      invoices: item.invoices ?? seed?.invoices ?? [],
      attachments: item.attachments ?? seed?.attachments ?? [],
      timeline: item.timeline ?? seed?.timeline ?? [],
    } as PrototypeCompany;
  });
export const saveCompanies = (items: PrototypeCompany[]) => write(KEYS.companies, items);
export const getAuditEvents = () => read<AuditEvent[]>(KEYS.audit, []);

export function recordAudit(
  action: string,
  entity: AuditEvent["entity"],
  details: string,
  entityId?: number,
) {
  const actor = getUser();
  if (!actor) return;
  const event: AuditEvent = {
    id: Date.now(),
    action,
    entity,
    entityId,
    details,
    actorName: actor.name,
    actorRole: actor.roleLabel,
    timestamp: new Date().toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" }),
  };
  write(KEYS.audit, [event, ...getAuditEvents()]);
}

export function addNotification(title: string, body: string, href?: string) {
  const actor = getUser();
  const createdAt = new Date().toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" });
  saveNotifications([
    {
      id: Date.now(),
      title,
      body,
      time: "الآن",
      read: false,
      href,
      actorName: actor?.name,
      actorRole: actor?.roleLabel,
      createdAt,
    },
    ...getNotifications(),
  ]);
}

export function addTargetedNotification(
  recipientEmail: string,
  title: string,
  body: string,
  href?: string,
) {
  const createdAt = new Date().toLocaleString("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  saveNotifications([
    {
      id: Date.now() + Math.floor(Math.random() * 1000),
      title,
      body,
      time: "الآن",
      read: false,
      href,
      recipientEmail: recipientEmail.toLowerCase(),
      actorName: "نظام إجراءات الورش",
      actorRole: "إجراء تلقائي",
      createdAt,
    },
    ...getNotifications(),
  ]);
}

export function fileToStoredDocument(
  file: File,
  projectId: number | undefined,
  uploadedBy: string,
): Promise<StoredDocument> {
  return new Promise((resolve, reject) => {
    const allowed = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ];
    if (file.size > 20 * 1024 * 1024) {
      reject(new Error("الحد الأعلى لحجم الملف في البروتوتايب هو 20 ميجابايت."));
      return;
    }
    if (file.type && !allowed.includes(file.type)) {
      reject(new Error("نوع الملف غير مسموح. استخدم PDF أو Word أو Excel أو صورة."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("تعذر قراءة الملف."));
    reader.onload = () =>
      resolve({
        id: Date.now(),
        name: file.name,
        type: file.name.split(".").pop()?.toUpperCase() || "ملف",
        uploadedBy,
        date: new Date().toLocaleDateString("en-CA"),
        size:
          file.size < 1024 * 1024
            ? `${Math.max(1, Math.round(file.size / 1024))} KB`
            : `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        projectId,
        mimeType: file.type || "application/octet-stream",
        content: String(reader.result),
        version: 1,
        approval: "بانتظار الاعتماد",
        versions: [{ version: 1, date: new Date().toLocaleDateString("en-CA"), uploadedBy }],
      });
    reader.readAsDataURL(file);
  });
}

export function downloadDocument(document: StoredDocument) {
  if (typeof window === "undefined") return;
  const anchor = window.document.createElement("a");
  if (document.content) {
    anchor.href = document.content;
  } else {
    const content = `وثيقة: ${document.name}\nالنوع: ${document.type}\nتاريخ الإضافة: ${document.date}\nأضيفت بواسطة: ${document.uploadedBy}`;
    anchor.href = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
  }
  anchor.download = document.name.includes(".") ? document.name : `${document.name}.txt`;
  anchor.click();
  if (!document.content) URL.revokeObjectURL(anchor.href);
}

export function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const csv =
    "\ufeff" +
    rows
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = window.document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadExcel(filename: string, rows: Array<Array<string | number>>) {
  const table = `<table border="1">${rows.map((row, index) => `<tr>${row.map((cell) => `<${index === 0 ? "th" : "td"}>${String(cell)}</${index === 0 ? "th" : "td"}>`).join("")}</tr>`).join("")}</table>`;
  const url = URL.createObjectURL(
    new Blob(["\ufeff", table], { type: "application/vnd.ms-excel;charset=utf-8" }),
  );
  const anchor = window.document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function printPdf(title: string, rows: Array<Array<string | number>>) {
  const popup = window.open("", "_blank", "width=1100,height=800");
  if (!popup) return;
  popup.document.write(
    `<html dir="rtl"><head><title>${title}</title><style>body{font-family:Arial;padding:32px;color:#102a22}h1{color:#00573f}table{width:100%;border-collapse:collapse;margin-top:24px}th,td{border:1px solid #d9e3df;padding:10px;text-align:right}th{background:#00573f;color:white}</style></head><body><h1>${title}</h1><p>تاريخ الإصدار: ${new Date().toLocaleDateString("ar-SA")}</p><table>${rows.map((row, index) => `<tr>${row.map((cell) => `<${index === 0 ? "th" : "td"}>${String(cell)}</${index === 0 ? "th" : "td"}>`).join("")}</tr>`).join("")}</table><script>window.onload=()=>window.print()</script></body></html>`,
  );
  popup.document.close();
}

export function usePortalData() {
  const [, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((value) => value + 1), []);
  useEffect(() => {
    window.addEventListener("mewa-portal-update", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("mewa-portal-update", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);
  return {
    documents: getDocuments(),
    notifications: getNotifications(),
    messages: getMessages(),
    projects: getProjects(),
    companies: getCompanies(),
    auditEvents: getAuditEvents(),
    refresh,
  };
}
