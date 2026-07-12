export type Role = "pmo" | "manager" | "pm";

export interface User {
  name: string;
  email: string;
  role: Role;
  roleLabel: string;
}

const DEMO_USERS: Record<string, User> = {
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
};

const KEY = "mewa_user";

export function login(email: string): User | null {
  const key = email.trim().toLowerCase();
  const user = DEMO_USERS[key];
  if (!user) return null;
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(user));
  }
  return user;
}

export function logout() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function roleHome(role: Role): string {
  if (role === "pmo") return "/pmo";
  if (role === "manager") return "/manager";
  return "/pm";
}
