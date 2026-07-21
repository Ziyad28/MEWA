export type Role = "admin" | "pmo" | "manager" | "pm" | "capacity" | "employee";

export interface User {
  name: string;
  email: string;
  role: Role;
  roleLabel: string;
  active?: boolean;
  phone?: string;
  department?: string;
  section?: string;
  jobTitle?: string;
  /** Frontend-only demo credential. Replace with server-side authentication later. */
  password?: string;
}

export const DEMO_PASSWORD = "Mewa@2026";

const DEMO_USERS: Record<string, User> = {
  "admin@mewa.gov.sa": {
    name: "مسؤول النظام",
    email: "admin@mewa.gov.sa",
    role: "admin",
    roleLabel: "مسؤول النظام",
  },
  "pmo@mewa.gov.sa": {
    name: "فهد المطيري",
    email: "pmo@mewa.gov.sa",
    role: "pmo",
    roleLabel: "موظف مكتب إدارة المشاريع (PMO)",
  },
  "manager@mewa.gov.sa": {
    name: "عبدالله الحربي",
    email: "manager@mewa.gov.sa",
    role: "manager",
    roleLabel: "مدير الإدارة",
  },
  "pm@mewa.gov.sa": {
    name: "خالد الشهري",
    email: "pm@mewa.gov.sa",
    role: "pm",
    roleLabel: "مدير المشروع",
  },
  "capacity@mewa.gov.sa": {
    name: "نورة العتيبي",
    email: "capacity@mewa.gov.sa",
    role: "capacity",
    roleLabel: "مسؤول الشركات وبناء القدرات",
  },
  "goust@mewa.gov.sa": {
    name: "منال الشهري",
    email: "goust@mewa.gov.sa",
    role: "employee",
    roleLabel: "موظف",
  },
};

const KEY = "mewa_user";
const SESSION_KEY = "mewa_user_session";
const USERS_KEY = "mewa_users_v1";

export const ROLE_LABELS: Record<Role, string> = {
  admin: "مسؤول النظام",
  pmo: "موظف مكتب إدارة المشاريع (PMO)",
  manager: "مدير الإدارة",
  pm: "مدير المشروع",
  capacity: "مسؤول الشركات وبناء القدرات",
  employee: "موظف",
};

export function getManagedUsers(): User[] {
  if (typeof window === "undefined") return Object.values(DEMO_USERS);
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return Object.values(DEMO_USERS);
    const stored = (JSON.parse(raw) as User[]).map((user) => {
      const isManal =
        user.email.toLowerCase() === "goust@mewa.gov.sa" || user.name.trim() === "منال الشهري";
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
  if (role === "pmo") return "/pmo";
  if (role === "manager") return "/manager";
  if (role === "pm") return "/pm";
  if (role === "employee") return "/workshop-invitations";
  return "/capacity-building";
}
