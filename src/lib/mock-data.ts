export const SECTORS = ["المياه", "البيئة", "الزراعة"] as const;
export type Sector = (typeof SECTORS)[number];

export type ProjectStatus = "قيد التنفيذ" | "مكتملة" | "متأخرة" | "متعثر" | "متوقف مؤقتًا" | "مخططة";
export type Priority = "عالية" | "متوسطة" | "منخفضة";

export const ORG_STRUCTURE = {
  dt: {
    name: "الإدارة العامة للتحول الرقمي",
    subDepartments: [
      { id: "dt_emerging", name: "إدارة التقنيات الناشئة" },
      { id: "dt_enterprise", name: "إدارة البنية المؤسسية" },
      { id: "dt_planning", name: "إدارة التخطيط والتميز المؤسسي" },
      { id: "dt_eservices", name: "إدارة الخدمات الإلكترونية" },
    ],
  },
  app: {
    name: "الإدارة العامة للحلول التطبيقية",
    subDepartments: [
      { id: "app_solutions", name: "إدارة الحلول المؤسسية" },
      { id: "app_bi", name: "إدارة ذكاء الأعمال" },
      { id: "app_products", name: "إدارة المنتجات الرقمية" },
    ],
  },
  infra: {
    name: "الإدارة العامة للبنية التحتية وخدمات المستفيدين",
    subDepartments: [
      { id: "infra_db", name: "إدارة قواعد البيانات" },
      { id: "infra_network", name: "إدارة الشبكات والاتصالات" },
      { id: "infra_ops", name: "إدارة تشغيل أنظمة البنية التحتية" },
      { id: "infra_support", name: "إدارة خدمات المستفيدين" },
    ],
  },
};

export interface Project {
  id: number;
  name: string;
  sector: Sector;
  manager: string;
  status: ProjectStatus;
  priority: Priority;
  progress: number;
  plannedProgress: number;
  updated: string;
  start: string;
  end: string;
  companyId?: number;
  health: number;
  delayRisk: number;
  budget: string;
  description: string;
  spark: number[];
  departmentId?: string;
  subDepartmentId?: string;
}

export interface Company {
  id: number;
  name: string;
  nameEn: string;
  domain: string;
  description: string;
  regNo: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  contactPerson: string;
  contactRole: string;
  sector: Sector;
  status: "نشط" | "قيد المراجعة" | "منتهي";
  performance: number;
  commitment: number;
  since: string;
  contractNo: string;
  contractStart: string;
  contractEnd: string;
  lastUpdate: string;
  perfHistory: { month: string; value: number }[];
}

const PH = (base: number) => [
  { month: "يناير", value: Math.max(40, base - 12) },
  { month: "فبراير", value: Math.max(45, base - 8) },
  { month: "مارس", value: Math.max(50, base - 5) },
  { month: "أبريل", value: Math.max(55, base - 2) },
  { month: "مايو", value: base - 1 },
  { month: "يونيو", value: base },
];

export const COMPANIES: Company[] = [
  { id: 1, name: "شركة الاتصالات السعودية (stc)", nameEn: "stc", domain: "stc.com.sa", description: "خدمات الاتصالات وحلول تقنية المعلومات للجهات الحكومية.", regNo: "1010150269", address: "الرياض - حي العليا", email: "gov@stc.com.sa", phone: "+966 11 455 0000", website: "stc.com.sa", contactPerson: "م. سعد الغامدي", contactRole: "مدير حسابات القطاع الحكومي", sector: "المياه", status: "نشط", performance: 88, commitment: 92, since: "2022/03/15", contractNo: "MEWA-2022-018", contractStart: "2022/03/15", contractEnd: "2026/03/14", lastUpdate: "2025/06/28", perfHistory: PH(88) },
  { id: 2, name: "شركة علم", nameEn: "Elm", domain: "elm.sa", description: "حلول أعمال رقمية آمنة للقطاع الحكومي.", regNo: "1010203854", address: "الرياض - حي الملقا", email: "gov@elm.sa", phone: "+966 11 806 2000", website: "elm.sa", contactPerson: "أ. نورة العتيبي", contactRole: "مديرة تنفيذ المشاريع", sector: "البيئة", status: "نشط", performance: 76, commitment: 81, since: "2021/07/20", contractNo: "MEWA-2021-034", contractStart: "2021/07/20", contractEnd: "2025/12/31", lastUpdate: "2025/06/24", perfHistory: PH(76) },
  { id: 3, name: "شركة إجادة للاستشارات", nameEn: "Ejada", domain: "ejada.com", description: "حلول التحول الرقمي وتكامل الأنظمة للقطاع العام.", regNo: "1010192431", address: "الرياض - حي الورود", email: "info@ejada.com", phone: "+966 11 293 9666", website: "ejada.com", contactPerson: "م. فيصل القحطاني", contactRole: "مدير برنامج التحول الرقمي", sector: "الزراعة", status: "نشط", performance: 82, commitment: 78, since: "2023/01/10", contractNo: "MEWA-2023-005", contractStart: "2023/01/10", contractEnd: "2026/01/09", lastUpdate: "2025/06/22", perfHistory: PH(82) },
  { id: 4, name: "شركة حلول للخدمات الرقمية (stc s)", nameEn: "Solutions by stc", domain: "solutions.com.sa", description: "خدمات إدارة تقنية المعلومات والحوسبة السحابية.", regNo: "1010333820", address: "الرياض - حي الياسمين", email: "hello@solutions.com.sa", phone: "+966 11 200 6666", website: "solutions.com.sa", contactPerson: "م. عبدالرحمن الدوسري", contactRole: "مدير الحسابات الحكومية", sector: "المياه", status: "نشط", performance: 70, commitment: 68, since: "2020/11/02", contractNo: "MEWA-2020-042", contractStart: "2020/11/02", contractEnd: "2025/11/01", lastUpdate: "2025/06/20", perfHistory: PH(70) },
  { id: 5, name: "الشركة السعودية للصناعات العسكرية (SAMI)", nameEn: "SAMI", domain: "sami.com.sa", description: "أنظمة أمنية وسيبرانية متقدمة.", regNo: "1010528540", address: "الرياض - حي السفارات", email: "info@sami.com.sa", phone: "+966 11 517 7777", website: "sami.com.sa", contactPerson: "أ. ريم الزهراني", contactRole: "مديرة الشراكات الحكومية", sector: "البيئة", status: "قيد المراجعة", performance: 74, commitment: 80, since: "2022/09/05", contractNo: "MEWA-2022-061", contractStart: "2022/09/05", contractEnd: "2025/09/04", lastUpdate: "2025/06/18", perfHistory: PH(74) },
  { id: 6, name: "شركة تكامل للخدمات (SITE)", nameEn: "SITE", domain: "site.sa", description: "بنية تحتية رقمية آمنة وخدمات سحابية سيادية.", regNo: "1010587123", address: "الرياض - حي الملز", email: "info@site.sa", phone: "+966 11 288 8888", website: "site.sa", contactPerson: "م. ماجد العنزي", contactRole: "المدير التنفيذي للعمليات", sector: "الزراعة", status: "نشط", performance: 90, commitment: 94, since: "2021/02/18", contractNo: "MEWA-2021-011", contractStart: "2021/02/18", contractEnd: "2026/02/17", lastUpdate: "2025/06/29", perfHistory: PH(90) },
];

export const COMPANY_PROFILES: Record<number, { overview: string; history: string; specialties: string[] }> = {
  1: { overview: "شريك تقني وطني يقدم خدمات الاتصال والبنية الرقمية والحلول المُدارة، ويدعم مشاريع الوكالة التي تتطلب انتشارًا واسعًا واعتمادية تشغيلية مرتفعة.", history: "بدأ التعاون المسجل مع الوكالة في مارس 2022، وتوسع من خدمات الربط إلى حلول الرصد والمنصات الرقمية مع مراجعات أداء دورية.", specialties: ["الاتصالات", "الحوسبة السحابية", "إنترنت الأشياء"] },
  2: { overview: "شركة سعودية متخصصة في الحلول والأعمال الرقمية الآمنة، وتشارك في تطوير الخدمات الحكومية وتحسين تجربة المستفيد ورفع كفاءة الإجراءات.", history: "انطلقت الشراكة المسجلة مع الوكالة في يوليو 2021، وتركزت على الرصد البيئي والأرشفة والتحول نحو الإجراءات الرقمية المتكاملة.", specialties: ["الحلول الحكومية", "البيانات", "تجربة المستفيد"] },
  3: { overview: "شريك تقني يقدم خدمات تكامل الأنظمة والتطبيقات والبيانات، ويحول المتطلبات التشغيلية إلى منصات رقمية قابلة للتوسع.", history: "بدأ التعاون مع الوكالة في يناير 2023، ثم اتسع نطاقه ليشمل الخدمات الزراعية الذكية وتكامل الأنظمة المرتبطة بها.", specialties: ["تكامل الأنظمة", "البيانات والتحليلات", "التطبيقات المؤسسية"] },
  4: { overview: "مزود حلول رقمية متكاملة يغطي البنية التحتية والخدمات المُدارة والسحابة والأمن السيبراني للقطاعين العام والخاص.", history: "يمتد التعاون المسجل مع الوكالة منذ نوفمبر 2020، مع تركيز مستمر على تحديث البنية التحتية وتحسين الاستمرارية التشغيلية.", specialties: ["الخدمات المُدارة", "السحابة", "البنية التحتية"] },
  5: { overview: "شركة وطنية تعمل في الأنظمة المتقدمة، ويغطي نطاق التعاون في المنصة الحلول السيبرانية وحماية البيئات ذات الحساسية العالية.", history: "سُجل بدء التعاون مع الوكالة في سبتمبر 2022، ويخضع نطاق العقد للمراجعة الدورية وفق مؤشرات الالتزام والأداء.", specialties: ["الأمن السيبراني", "الأنظمة المتقدمة", "الحماية التشغيلية"] },
  6: { overview: "شركة سعودية متخصصة في الخدمات الرقمية الآمنة والسحابة السيادية والتكامل التقني للبيئات الحكومية ذات المتطلبات الأمنية المرتفعة.", history: "بدأ التعاون المسجل مع الوكالة في فبراير 2021، وامتد إلى التحول الرقمي وأتمتة التراخيص والبنية الآمنة للخدمات.", specialties: ["السحابة السيادية", "الأمن الرقمي", "التحول الرقمي"] },
};

export const PROJECTS: Project[] = [
  { id: 1, name: "مشروع التحول الرقمي", sector: "البيئة", manager: "فهد المطيري", status: "قيد التنفيذ", priority: "عالية", progress: 66, plannedProgress: 70, updated: "2026/07/15", start: "2026/01/01", end: "2026/12/31", health: 78, delayRisk: 22, budget: "12.5M", description: "رقمنة الخدمات البيئية الداخلية وأتمتة سير العمل.", spark: [30,42,50,55,60,66], departmentId: "dt", subDepartmentId: "dt_eservices" },
  { id: 2, name: "مشروع الأمن السيبراني", sector: "البيئة", manager: "خالد الشهري", status: "قيد التنفيذ", priority: "عالية", progress: 45, plannedProgress: 50, updated: "2026/07/14", start: "2026/02/10", end: "2026/11/30", companyId: 5, health: 62, delayRisk: 41, budget: "8.2M", description: "تعزيز حماية الأنظمة الحساسة وبناء مركز عمليات الأمن.", spark: [10,18,25,32,38,45], departmentId: "dt", subDepartmentId: "dt_emerging" },
  { id: 3, name: "مشروع البنية التحتية", sector: "المياه", manager: "خالد الشهري", status: "قيد التنفيذ", priority: "متوسطة", progress: 80, plannedProgress: 75, updated: "2026/07/13", start: "2025/09/01", end: "2026/09/30", companyId: 4, health: 85, delayRisk: 15, budget: "24.0M", description: "تحديث مراكز البيانات الإقليمية وشبكات الاتصال.", spark: [40,50,58,68,74,80], departmentId: "infra", subDepartmentId: "infra_network" },
  { id: 4, name: "مشروع الخدمات الذكية", sector: "الزراعة", manager: "خالد الشهري", status: "قيد التنفيذ", priority: "متوسطة", progress: 30, plannedProgress: 35, updated: "2026/07/12", start: "2026/03/01", end: "2027/02/28", health: 55, delayRisk: 48, budget: "6.8M", description: "منصة خدمات ذاتية للمزارعين والمستفيدين.", spark: [5,10,14,20,25,30], departmentId: "dt", subDepartmentId: "dt_eservices" },
  { id: 5, name: "منصة رصد المياه", sector: "المياه", manager: "سعد الغامدي", status: "مكتملة", priority: "عالية", progress: 100, plannedProgress: 100, updated: "2026/05/20", start: "2025/01/15", end: "2026/05/10", companyId: 1, health: 96, delayRisk: 4, budget: "9.4M", description: "منصة موحّدة لرصد جودة ومستوى المياه على مستوى المملكة.", spark: [60,70,80,90,96,100], departmentId: "app", subDepartmentId: "app_solutions" },
  { id: 6, name: "نظام الرصد البيئي", sector: "البيئة", manager: "نورة العتيبي", status: "قيد التنفيذ", priority: "متوسطة", progress: 58, plannedProgress: 65, updated: "2026/07/10", start: "2025/11/01", end: "2026/12/01", companyId: 2, health: 70, delayRisk: 30, budget: "5.6M", description: "أجهزة استشعار وذكاء اصطناعي لرصد جودة الهواء والتربة.", spark: [15,25,34,42,50,58], departmentId: "app", subDepartmentId: "app_bi" },
  { id: 7, name: "منصة الزراعة الذكية", sector: "الزراعة", manager: "فيصل القحطاني", status: "متأخرة", priority: "عالية", progress: 35, plannedProgress: 60, updated: "2026/07/08", start: "2025/06/01", end: "2026/06/30", companyId: 3, health: 40, delayRisk: 72, budget: "11.2M", description: "منظومة IoT لري ذكي وإدارة المحاصيل.", spark: [20,28,30,32,34,35], departmentId: "dt", subDepartmentId: "dt_enterprise" },
  { id: 8, name: "مشروع أتمتة التراخيص", sector: "الزراعة", manager: "فهد المطيري", status: "قيد التنفيذ", priority: "متوسطة", progress: 52, plannedProgress: 55, updated: "2026/07/09", start: "2026/01/20", end: "2026/12/15", companyId: 6, health: 74, delayRisk: 26, budget: "4.3M", description: "أتمتة إصدار وتجديد التراخيص الزراعية.", spark: [12,20,28,38,46,52], departmentId: "app", subDepartmentId: "app_products" },
  { id: 9, name: "مشروع الأرشفة الإلكترونية", sector: "البيئة", manager: "نورة العتيبي", status: "قيد التنفيذ", priority: "منخفضة", progress: 72, plannedProgress: 75, updated: "2026/07/07", start: "2025/08/01", end: "2026/10/30", companyId: 2, health: 82, delayRisk: 18, budget: "3.1M", description: "أرشفة موحّدة للوثائق التنظيمية والفنية.", spark: [30,42,55,62,68,72], departmentId: "infra", subDepartmentId: "infra_db" },
  { id: 10, name: "منصة الشراكات الحكومية", sector: "المياه", manager: "سعد الغامدي", status: "مخططة", priority: "متوسطة", progress: 8, plannedProgress: 10, updated: "2026/07/05", start: "2026/08/01", end: "2027/07/30", health: 60, delayRisk: 20, budget: "7.5M", description: "بوابة موحّدة للشراكات مع الجهات الحكومية.", spark: [0,2,4,5,7,8], departmentId: "dt" },
];

export const KPIS_PMO = { total: 128, completed: 45, inProgress: 67, delayed: 16 };
export const KPIS_MANAGER = { total: 14, inProgress: 10, completed: 3, overall: 72 };
export const KPIS_PM = { progress: 68, inProgress: 12, completed: 8, overdue: 4 };

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

export const SPARK_PMO_TOTAL = [90, 98, 105, 112, 118, 124, 128];
export const SPARK_PMO_COMPLETED = [30, 33, 36, 39, 41, 43, 45];
export const SPARK_PMO_PROGRESS = [50, 54, 58, 60, 63, 65, 67];
export const SPARK_PMO_DELAYED = [22, 21, 20, 19, 18, 17, 16];

export interface DocItem {
  id: number;
  name: string;
  type: string;
  uploadedBy: string;
  date: string;
  size: string;
  projectId?: number;
}

export const DOCUMENTS: DocItem[] = [
  { id: 1, name: "خطة المشروع التفصيلية v2.0", type: "خطة", uploadedBy: "فهد المطيري", date: "2025/06/15", size: "2.4 MB", projectId: 1 },
  { id: 2, name: "تقرير الأداء الشهري - مايو", type: "تقرير", uploadedBy: "خالد الشهري", date: "2025/06/01", size: "1.1 MB", projectId: 2 },
  { id: 3, name: "متطلبات المشروع - النسخة النهائية", type: "متطلبات", uploadedBy: "نورة العتيبي", date: "2025/05/22", size: "3.8 MB", projectId: 6 },
  { id: 4, name: "عقد تنفيذ - شركة التحول الرقمي المتحدة", type: "عقد", uploadedBy: "فهد المطيري", date: "2025/03/10", size: "980 KB", projectId: 1 },
  { id: 5, name: "خطة إدارة المخاطر", type: "خطة", uploadedBy: "خالد الشهري", date: "2025/04/18", size: "1.7 MB", projectId: 3 },
  { id: 6, name: "تقرير تقييم الأداء الربعي Q2", type: "تقرير", uploadedBy: "سعد الغامدي", date: "2025/06/20", size: "2.9 MB", projectId: 5 },
  { id: 7, name: "محضر اجتماع اللجنة التوجيهية", type: "محضر", uploadedBy: "فيصل القحطاني", date: "2025/06/03", size: "420 KB", projectId: 7 },
];

export interface RiskItem {
  id: number;
  risk: string;
  impact: "عالي" | "متوسط" | "منخفض";
  probability: "عالي" | "متوسط" | "منخفض";
  owner: string;
  mitigation: string;
  status: "مفتوح" | "قيد المعالجة" | "مغلق";
  score: number;
  projectId: number;
}

export const RISKS: RiskItem[] = [
  { id: 1, projectId: 1, risk: "تأخر توريد البنية التحتية السحابية", impact: "عالي", probability: "متوسط", owner: "فهد المطيري", mitigation: "تفعيل مسار توريد بديل مع مزوّد ثانوي.", status: "قيد المعالجة", score: 72 },
  { id: 2, projectId: 1, risk: "نقص في الموارد التقنية المتخصصة", impact: "متوسط", probability: "عالي", owner: "PMO", mitigation: "التعاقد مع استشاريين ضمن نطاق العقد الإطاري.", status: "مفتوح", score: 68 },
  { id: 3, projectId: 2, risk: "ثغرات أمنية في المكونات الخارجية", impact: "عالي", probability: "متوسط", owner: "خالد الشهري", mitigation: "فحص دوري ومراجعة أمنية مستقلة.", status: "قيد المعالجة", score: 76 },
  { id: 4, projectId: 3, risk: "تأخر ربط المواقع البعيدة", impact: "متوسط", probability: "منخفض", owner: "مزوّد الاتصالات", mitigation: "خطة تركيب مرحلية.", status: "مغلق", score: 34 },
  { id: 5, projectId: 7, risk: "عدم اكتمال متطلبات المستفيد", impact: "عالي", probability: "عالي", owner: "فيصل القحطاني", mitigation: "ورش عمل مكثّفة وإعادة تعريف النطاق.", status: "مفتوح", score: 88 },
];

export interface UpdateItem {
  id: number;
  date: string;
  author: string;
  title: string;
  description: string;
  projectId: number;
}

export const UPDATES: UpdateItem[] = [
  { id: 1, projectId: 1, date: "2025/06/15", author: "فهد المطيري", title: "استكمال المرحلة الثانية", description: "تم استكمال تصميم البنية التقنية للمنصة وبدء مرحلة التطوير." },
  { id: 2, projectId: 1, date: "2025/05/28", author: "فهد المطيري", title: "توقيع محضر التسليم الجزئي", description: "تم استلام المكون الأول من الشركة المنفّذة ومطابقته للمعايير." },
  { id: 3, projectId: 1, date: "2025/04/10", author: "PMO", title: "إطلاق المرحلة الأولى", description: "انطلاق العمل الرسمي بحضور فريق العمل الكامل." },
  { id: 4, projectId: 2, date: "2025/06/14", author: "خالد الشهري", title: "إتمام تقييم المخاطر السيبرانية", description: "تم تسليم تقرير التقييم الأمني الشامل للفريق التنفيذي." },
  { id: 5, projectId: 3, date: "2025/06/13", author: "خالد الشهري", title: "تفعيل ثلاثة مواقع جديدة", description: "تم تشغيل المواقع الإقليمية في المنطقة الشرقية." },
];

export interface ActivityItem {
  id: number;
  date: string;
  actor: string;
  action: string;
  target: string;
  projectId: number;
}

export const ACTIVITY: ActivityItem[] = [
  { id: 1, projectId: 1, date: "2025/06/15 09:12", actor: "فهد المطيري", action: "قام بتحديث", target: "نسبة تقدم المشروع إلى 66%" },
  { id: 2, projectId: 1, date: "2025/06/14 16:40", actor: "PMO", action: "أضاف وثيقة", target: "خطة المشروع v2.0" },
  { id: 3, projectId: 1, date: "2025/06/12 11:03", actor: "خالد الشهري", action: "علّق على", target: "خطة المخاطر" },
  { id: 4, projectId: 1, date: "2025/06/10 08:47", actor: "نورة العتيبي", action: "أنشأت تحديثًا", target: "استكمال المرحلة الثانية" },
];

