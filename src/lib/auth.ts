export type Role = "admin" | "manager" | "pm" | "team" | "capacity" | "employee";

export interface User {
  name: string;
  email: string;
  role: Role;
  roleLabel: string;
  active?: boolean;
  phone?: string;
  departmentId?: string;
  subDepartmentId?: string;
  isGeneralManager?: boolean;
  jobTitle?: string;
  /** Frontend-only demo credential. Replace with server-side authentication later. */
  password?: string;
}

export const DEMO_PASSWORD = "Mewa@2026";

const DEMO_USERS: Record<string, User> = {
  "admin@mewa.gov.sa": { name: "مسؤول النظام", email: "admin@mewa.gov.sa", role: "admin", roleLabel: "مسؤول النظام" },
  
  // 1. الإدارة العامة للتحول الرقمي
  "dt_gm@mewa.gov.sa": { name: "مدير الإدارة", email: "dt_gm@mewa.gov.sa", role: "manager", roleLabel: "مدير الإدارة", departmentId: "dt", isGeneralManager: true },
  "dt_sub1@mewa.gov.sa": { name: "مدير الإدارة", email: "dt_sub1@mewa.gov.sa", role: "manager", roleLabel: "مدير الإدارة", departmentId: "dt", subDepartmentId: "dt_emerging", isGeneralManager: false },
  "dt_sub2@mewa.gov.sa": { name: "مدير الإدارة", email: "dt_sub2@mewa.gov.sa", role: "manager", roleLabel: "مدير الإدارة", departmentId: "dt", subDepartmentId: "dt_arch", isGeneralManager: false },
  "dt_sub3@mewa.gov.sa": { name: "مدير الإدارة", email: "dt_sub3@mewa.gov.sa", role: "manager", roleLabel: "مدير الإدارة", departmentId: "dt", subDepartmentId: "dt_planning", isGeneralManager: false },
  "dt_sub4@mewa.gov.sa": { name: "مدير الإدارة", email: "dt_sub4@mewa.gov.sa", role: "manager", roleLabel: "مدير الإدارة", departmentId: "dt", subDepartmentId: "dt_services", isGeneralManager: false },

  // 2. الإدارة العامة للحلول التطبيقية
  "app_gm@mewa.gov.sa": { name: "مدير الإدارة", email: "app_gm@mewa.gov.sa", role: "manager", roleLabel: "مدير الإدارة", departmentId: "app", isGeneralManager: true },
  "app_sub1@mewa.gov.sa": { name: "مدير الإدارة", email: "app_sub1@mewa.gov.sa", role: "manager", roleLabel: "مدير الإدارة", departmentId: "app", subDepartmentId: "app_solutions", isGeneralManager: false },
  "app_sub2@mewa.gov.sa": { name: "مدير الإدارة", email: "app_sub2@mewa.gov.sa", role: "manager", roleLabel: "مدير الإدارة", departmentId: "app", subDepartmentId: "app_bi", isGeneralManager: false },
  "app_sub3@mewa.gov.sa": { name: "مدير الإدارة", email: "app_sub3@mewa.gov.sa", role: "manager", roleLabel: "مدير الإدارة", departmentId: "app", subDepartmentId: "app_products", isGeneralManager: false },

  // 3. الإدارة العامة للبنية التحتية وخدمات المستفيدين
  "infra_gm@mewa.gov.sa": { name: "مدير الإدارة", email: "infra_gm@mewa.gov.sa", role: "manager", roleLabel: "مدير الإدارة", departmentId: "infra", isGeneralManager: true },
  "infra_sub1@mewa.gov.sa": { name: "مدير الإدارة", email: "infra_sub1@mewa.gov.sa", role: "manager", roleLabel: "مدير الإدارة", departmentId: "infra", subDepartmentId: "infra_db", isGeneralManager: false },
  "infra_sub2@mewa.gov.sa": { name: "مدير الإدارة", email: "infra_sub2@mewa.gov.sa", role: "manager", roleLabel: "مدير الإدارة", departmentId: "infra", subDepartmentId: "infra_network", isGeneralManager: false },
  "infra_sub3@mewa.gov.sa": { name: "مدير الإدارة", email: "infra_sub3@mewa.gov.sa", role: "manager", roleLabel: "مدير الإدارة", departmentId: "infra", subDepartmentId: "infra_ops", isGeneralManager: false },
  "infra_sub4@mewa.gov.sa": { name: "مدير الإدارة", email: "infra_sub4@mewa.gov.sa", role: "manager", roleLabel: "مدير الإدارة", departmentId: "infra", subDepartmentId: "infra_support", isGeneralManager: false },

  "manager@mewa.gov.sa": { name: "عبدالله الحربي", email: "manager@mewa.gov.sa", role: "manager", roleLabel: "مدير الإدارة", departmentId: "dt", isGeneralManager: true },
  "pm@mewa.gov.sa": { name: "خالد الشهري", email: "pm@mewa.gov.sa", role: "pm", roleLabel: "مدير المشروع" },
  "team@mewa.gov.sa": { name: "سعد بن محمد", email: "team@mewa.gov.sa", role: "team", roleLabel: "عضو فريق المشروع" },
  "capacity@mewa.gov.sa": { name: "نورة العتيبي", email: "capacity@mewa.gov.sa", role: "capacity", roleLabel: "مسؤول الشركات وبناء القدرات" },
  "guest@mewa.gov.sa": { name: "منال الشهري", email: "guest@mewa.gov.sa", role: "employee", roleLabel: "مدعو لورشة عمل" },
};

const KEY = "mewa_user";
const SESSION_KEY = "mewa_user_session";
const USERS_KEY = "mewa_users_v1";

export const ROLE_LABELS: Record<Role, string> = {
  admin: "مسؤول النظام",
  pmo: "موظف الوزارة",
  manager: "مدير الإدارة",
  pm: "مدير المشروع",
  team: "عضو فريق المشروع",
  capacity: "مسؤول الشركات وبناء القدرات",
  employee: "موظف (مدعو)",
};

export function getManagedUsers(): User[] {
  if (typeof window === "undefined") return Object.values(DEMO_USERS);
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return Object.values(DEMO_USERS);
    const stored = (JSON.parse(raw) as User[]).map((user) => {
      const isManal =
        user.email.toLowerCase() === "guest@mewa.gov.sa" || user.name.trim() === "منال الشهري";
      return isManal
        ? { ...user, role: "employee" as const, roleLabel: ROLE_LABELS.employee }
        : user;
    });
    window.localStorage.setItem(USERS_KEY, JSON.stringify(stored));
    const knownEmails = new Set(stored.map((user) => user.email.toLowerCase()));
    return [
      ...stored,
      ...Object.values(DEMO_USERS).filter((user) => !knownEmails.has(user.email.toLowerCase())),
    ];
  } catch {
    return Object.values(DEMO_USERS);
  }
}

export function saveManagedUsers(users: User[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  window.dispatchEvent(new CustomEvent("mewa-portal-update"));
}

export function login(email: string, password: string, remember = false): User | null {
  const key = email.trim().toLowerCase();
  const user = getManagedUsers().find((item) => item.email.toLowerCase() === key);
  if (!user || user.active === false || password !== (user.password ?? DEMO_PASSWORD)) return null;
  if (typeof window !== "undefined") {
    const storage = remember ? localStorage : sessionStorage;
    const otherStorage = remember ? sessionStorage : localStorage;
    storage.setItem(remember ? KEY : SESSION_KEY, JSON.stringify(user));
    otherStorage.removeItem(remember ? SESSION_KEY : KEY);
  }
  return user;
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY) ?? localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function roleHome(role: Role): string {
  if (role === "admin") return "/users";
  if (role === "manager") return "/manager";
  if (role === "pm") return "/pm";
  if (role === "team") return "/projects";
  if (role === "employee") return "/workshop-invitations";
  return "/capacity-building";
}
