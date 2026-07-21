import type { Role, User } from "@/lib/auth";
import type { Project } from "@/lib/mock-data";
import type { PrototypeProject, StoredDocument } from "@/lib/portal-store";

export type Permission =
  | "projects.viewAll"
  | "projects.viewAssigned"
  | "projects.create"
  | "projects.editCore"
  | "projects.assignManager"
  | "projects.manageExecution"
  | "projects.approve"
  | "projects.archive"
  | "companies.view"
  | "companies.manage"
  | "documents.view"
  | "documents.upload"
  | "documents.approve"
  | "documents.deleteAny"
  | "documents.deleteOwnDraft"
  | "reports.viewPortfolio"
  | "reports.viewAssigned"
  | "reports.export"
  | "ai.view"
  | "ai.act"
  | "audit.viewAll"
  | "users.manage"
  | "settings.manage"
  | "workshops.manage"
  | "workshops.respond";

const ROLE_PERMISSIONS: Record<Role, ReadonlySet<Permission>> = {
  admin: new Set(["audit.viewAll", "users.manage", "settings.manage"]),
  pmo: new Set([
    "projects.viewAll",
    "projects.create",
    "projects.editCore",
    "projects.assignManager",
    "projects.archive",
    "companies.view",
    "companies.manage",
    "documents.view",
    "documents.upload",
    "documents.approve",
    "reports.viewPortfolio",
    "reports.export",
    "ai.view",
    "ai.act",
  ]),
  manager: new Set([
    "projects.viewAll",
    "projects.approve",
    "companies.view",
    "documents.view",
    "documents.approve",
    "reports.viewPortfolio",
    "reports.export",
    "ai.view",
  ]),
  pm: new Set([
    "projects.viewAssigned",
    "projects.editCore",
    "projects.manageExecution",
    "companies.view",
    "documents.view",
    "documents.upload",
    "documents.deleteOwnDraft",
    "reports.viewAssigned",
    "reports.export",
    "ai.view",
  ]),
  capacity: new Set(["workshops.manage"]),
  employee: new Set(["workshops.respond"]),
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].has(permission);
}

export function canAccessProject(user: User, project: Pick<Project, "manager">): boolean {
  return can(user.role, "projects.viewAll") || project.manager === user.name;
}

export function scopeProjects<T extends Pick<Project, "manager">>(
  user: User | null,
  projects: T[],
): T[] {
  if (!user) return [];
  return projects.filter((project) => canAccessProject(user, project));
}

export function canManageProject(
  user: User,
  project: Pick<PrototypeProject, "manager" | "archived">,
): boolean {
  return (
    !project.archived &&
    can(user.role, "projects.manageExecution") &&
    canAccessProject(user, project)
  );
}

export function canApproveProject(
  user: User,
  project: Pick<PrototypeProject, "manager" | "archived">,
): boolean {
  return !project.archived && can(user.role, "projects.approve") && canAccessProject(user, project);
}

export function canAccessDocument(
  user: User,
  document: Pick<StoredDocument, "projectId">,
  projects: Array<Pick<Project, "id" | "manager">>,
): boolean {
  if (!document.projectId) return can(user.role, "documents.view");
  const project = projects.find((item) => item.id === document.projectId);
  return Boolean(project && canAccessProject(user, project));
}

export function canDeleteDocument(
  user: User,
  document: Pick<StoredDocument, "approval" | "uploadedBy" | "projectId">,
  projects: Array<Pick<Project, "id" | "manager">>,
): boolean {
  if (can(user.role, "documents.deleteAny")) return true;
  return (
    can(user.role, "documents.deleteOwnDraft") &&
    document.approval !== "معتمد" &&
    document.uploadedBy === user.name &&
    canAccessDocument(user, document, projects)
  );
}

export function canAccessCompany(
  user: User,
  companyId: number,
  projects: Array<Pick<Project, "companyId" | "manager">>,
): boolean {
  return (
    can(user.role, "projects.viewAll") ||
    projects.some((project) => project.companyId === companyId && project.manager === user.name)
  );
}
