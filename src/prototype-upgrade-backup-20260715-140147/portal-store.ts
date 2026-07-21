import { useCallback, useEffect, useState } from "react";
import { DOCUMENTS, type DocItem } from "@/lib/mock-data";

export interface StoredDocument extends DocItem {
  content?: string;
  mimeType?: string;
}

export interface PortalNotification {
  id: number;
  title: string;
  body: string;
  time: string;
  read: boolean;
  href?: string;
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

const KEYS = {
  documents: "mewa-portal-documents-v1",
  notifications: "mewa-portal-notifications-v1",
  messages: "mewa-portal-messages-v1",
};

const INITIAL_NOTIFICATIONS: PortalNotification[] = [
  { id: 1, title: "تحديث مشروع التحول الرقمي", body: "تم اعتماد إنجاز المرحلة الثانية بنسبة 66%.", time: "منذ 10 دقائق", read: false, href: "/projects/1" },
  { id: 2, title: "وثيقة جديدة", body: "أضيف تقرير الأداء الشهري إلى مكتبة الوثائق.", time: "منذ ساعة", read: false, href: "/documents" },
  { id: 3, title: "مراجعة عقد شركة علم", body: "تبقى 30 يومًا على موعد المراجعة الدورية للعقد.", time: "أمس", read: false, href: "/companies/2" },
];

const INITIAL_MESSAGES: PortalMessage[] = [
  { id: 1, sender: "مكتب إدارة المشاريع", subject: "اجتماع متابعة المشاريع", body: "نأمل تحديث نسب الإنجاز قبل اجتماع الخميس.", time: "09:20", read: false },
  { id: 2, sender: "نورة العتيبي", subject: "اعتماد محضر الاجتماع", body: "تم رفع النسخة النهائية من المحضر للمراجعة.", time: "أمس", read: false },
];

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("mewa-portal-update"));
}

export const getDocuments = () => read<StoredDocument[]>(KEYS.documents, DOCUMENTS);
export const saveDocuments = (documents: StoredDocument[]) => write(KEYS.documents, documents);
export const getNotifications = () => read(KEYS.notifications, INITIAL_NOTIFICATIONS);
export const saveNotifications = (items: PortalNotification[]) => write(KEYS.notifications, items);
export const getMessages = () => read(KEYS.messages, INITIAL_MESSAGES);
export const saveMessages = (items: PortalMessage[]) => write(KEYS.messages, items);

export function fileToStoredDocument(file: File, projectId: number | undefined, uploadedBy: string): Promise<StoredDocument> {
  return new Promise((resolve, reject) => {
    if (file.size > 4 * 1024 * 1024) {
      reject(new Error("الحد الأعلى لحجم الملف في النسخة الحالية هو 4 ميجابايت."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("تعذر قراءة الملف."));
    reader.onload = () => resolve({
      id: Date.now(),
      name: file.name,
      type: file.name.split(".").pop()?.toUpperCase() || "ملف",
      uploadedBy,
      date: new Date().toLocaleDateString("en-CA"),
      size: file.size < 1024 * 1024 ? `${Math.max(1, Math.round(file.size / 1024))} KB` : `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      projectId,
      mimeType: file.type || "application/octet-stream",
      content: String(reader.result),
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
  const csv = "\ufeff" + rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = window.document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
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
    refresh,
  };
}
