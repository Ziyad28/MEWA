export const SECTORS = ["المياه", "البيئة", "الزراعة"] as const;
export type Sector = (typeof SECTORS)[number];

export type ProjectStatus = "قيد التنفيذ" | "مكتملة" | "متأخرة";

export interface Project {
  id: number;
  name: string;
  sector: Sector;
  manager: string;
  status: ProjectStatus;
  progress: number;
  updated: string;
  start: string;
  end: string;
  companyId: number;
  health: number;
  delayRisk: number;
}

export interface Company {
  id: number;
  name: string;
  logo?: string;
  description: string;
  regNo: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  contactPerson: string;
  sector: Sector;
  status: "نشط" | "قيد المراجعة" | "منتهي";
  performance: number;
  commitment: number;
}

export const COMPANIES: Company[] = [
  { id: 1, name: "شركة تقنيات المياه المتقدمة", description: "حلول رقمية لإدارة قطاع المياه والبنية التحتية.", regNo: "1010234567", address: "الرياض - حي العليا", email: "info@waterco.sa", phone: "+966 11 234 5678", website: "waterco.sa", contactPerson: "م. سعد الغامدي", sector: "المياه", status: "نشط", performance: 88, commitment: 92 },
  { id: 2, name: "الحلول البيئية الذكية", description: "أنظمة رصد ومراقبة بيئية متكاملة.", regNo: "1010345678", address: "جدة - حي الروضة", email: "contact@envsmart.sa", phone: "+966 12 345 6789", website: "envsmart.sa", contactPerson: "أ. نورة العتيبي", sector: "البيئة", status: "نشط", performance: 76, commitment: 81 },
  { id: 3, name: "مجموعة الزراعة الرقمية", description: "منصات تقنية للزراعة الذكية وإنترنت الأشياء.", regNo: "1010456789", address: "الدمام - حي الفيصلية", email: "hello@agridigital.sa", phone: "+966 13 456 7890", website: "agridigital.sa", contactPerson: "م. فيصل القحطاني", sector: "الزراعة", status: "نشط", performance: 82, commitment: 78 },
  { id: 4, name: "شركة البنية التحتية الوطنية", description: "تنفيذ مشاريع البنية التحتية التقنية.", regNo: "1010567890", address: "الرياض - حي الملقا", email: "info@nis.sa", phone: "+966 11 567 8901", website: "nis.sa", contactPerson: "م. عبدالرحمن الدوسري", sector: "المياه", status: "نشط", performance: 70, commitment: 68 },
  { id: 5, name: "مركز الأمن السيبراني", description: "خدمات الأمن السيبراني وحماية البيانات.", regNo: "1010678901", address: "الرياض - حي السفارات", email: "info@cybersec.sa", phone: "+966 11 678 9012", website: "cybersec.sa", contactPerson: "أ. ريم الزهراني", sector: "البيئة", status: "قيد المراجعة", performance: 74, commitment: 80 },
  { id: 6, name: "شركة التحول الرقمي المتحدة", description: "حلول التحول الرقمي للجهات الحكومية.", regNo: "1010789012", address: "الرياض - حي الياسمين", email: "info@dtu.sa", phone: "+966 11 789 0123", website: "dtu.sa", contactPerson: "م. ماجد العنزي", sector: "الزراعة", status: "نشط", performance: 90, commitment: 94 },
];

export const PROJECTS: Project[] = [
  { id: 1, name: "مشروع التحول الرقمي", sector: "البيئة", manager: "فهد المطيري", status: "قيد التنفيذ", progress: 66, updated: "2025/06/15", start: "2025/01/01", end: "2025/12/31", companyId: 6, health: 78, delayRisk: 22 },
  { id: 2, name: "مشروع الأمن السيبراني", sector: "البيئة", manager: "خالد الشهري", status: "قيد التنفيذ", progress: 45, updated: "2025/06/14", start: "2025/02/10", end: "2025/11/30", companyId: 5, health: 62, delayRisk: 41 },
  { id: 3, name: "مشروع البنية التحتية", sector: "المياه", manager: "خالد الشهري", status: "قيد التنفيذ", progress: 80, updated: "2025/06/13", start: "2024/09/01", end: "2025/09/30", companyId: 4, health: 85, delayRisk: 15 },
  { id: 4, name: "مشروع الخدمات الذكية", sector: "الزراعة", manager: "خالد الشهري", status: "قيد التنفيذ", progress: 30, updated: "2025/06/12", start: "2025/03/01", end: "2026/02/28", companyId: 3, health: 55, delayRisk: 48 },
  { id: 5, name: "منصة رصد المياه", sector: "المياه", manager: "سعد الغامدي", status: "مكتملة", progress: 100, updated: "2025/05/20", start: "2024/01/15", end: "2025/05/10", companyId: 1, health: 96, delayRisk: 4 },
  { id: 6, name: "نظام الرصد البيئي", sector: "البيئة", manager: "نورة العتيبي", status: "قيد التنفيذ", progress: 58, updated: "2025/06/10", start: "2024/11/01", end: "2025/12/01", companyId: 2, health: 70, delayRisk: 30 },
  { id: 7, name: "منصة الزراعة الذكية", sector: "الزراعة", manager: "فيصل القحطاني", status: "متأخرة", progress: 35, updated: "2025/06/08", start: "2024/06/01", end: "2025/06/30", companyId: 3, health: 40, delayRisk: 72 },
];

export const KPIS_PMO = {
  total: 128,
  completed: 45,
  inProgress: 67,
  delayed: 16,
};

export const KPIS_MANAGER = {
  total: 14,
  inProgress: 10,
  completed: 3,
  overall: 72,
};

export const KPIS_PM = {
  progress: 68,
  inProgress: 12,
  completed: 8,
  overdue: 4,
};

export const PROGRESS_SERIES = [
  { month: "يناير", value: 20 },
  { month: "فبراير", value: 38 },
  { month: "مارس", value: 52 },
  { month: "أبريل", value: 68 },
  { month: "مايو", value: 78 },
  { month: "يونيو", value: 85 },
];

export const STATUS_PIE = [
  { name: "مكتملة", value: 45, color: "#16A34A" },
  { name: "قيد التنفيذ", value: 67, color: "#F59E0B" },
  { name: "متأخرة", value: 16, color: "#DC2626" },
];
