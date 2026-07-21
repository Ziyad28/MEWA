import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UserPlus, Users } from "lucide-react";
import { AppShell, useRequirePermission } from "@/components/app-shell";
import { Badge, Card, CardHeader } from "@/components/ui-bits";
import { PageSkeleton } from "@/components/page-skeleton";
import {
  DEMO_PASSWORD,
  getManagedUsers,
  ROLE_LABELS,
  saveManagedUsers,
  type Role,
  type User,
} from "@/lib/auth";
import { recordAudit } from "@/lib/portal-store";

export const Route = createFileRoute("/users")({
  component: UsersPage,
  head: () => ({ meta: [{ title: "المستخدمون والأدوار — المنصة الذكية" }] }),
});

function UsersPage() {
  const currentUser = useRequirePermission("users.manage");
  const [users, setUsers] = useState<User[]>(() => getManagedUsers());
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [section, setSection] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [role, setRole] = useState<Role>("pm");
  if (!currentUser) return <PageSkeleton />;

  const commit = (next: User[], action: string, details: string) => {
    setUsers(next);
    saveManagedUsers(next);
    recordAudit(action, "نظام", details);
  };

  const addUser = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.trim()) return;
    if (users.some((item) => item.email.toLowerCase() === email.trim().toLowerCase())) {
      window.alert("البريد الإلكتروني مستخدم مسبقًا.");
      return;
    }
    const user: User = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      roleLabel: ROLE_LABELS[role],
      active: true,
      phone: phone.trim() || undefined,
      department: department.trim() || undefined,
      section: section.trim() || undefined,
      jobTitle: jobTitle.trim() || undefined,
    };
    commit([...users, user], "إضافة مستخدم", `${user.name} — ${user.roleLabel}`);
    setName("");
    setEmail("");
    setPhone("");
    setDepartment("");
    setSection("");
    setJobTitle("");
    setRole("pm");
    setShowForm(false);
  };

  return (
    <AppShell
      role={currentUser.role}
      userName={currentUser.name}
      roleLabel={currentUser.roleLabel}
      pageTitle="المستخدمون والأدوار"
      pageSubtitle="إدارة الحسابات وتعيين الصلاحيات من مكان واحد"
    >
      <Card>
        <CardHeader
          title="حسابات المنصة"
          subtitle={`${users.length} مستخدمين`}
          action={
            <button
              onClick={() => setShowForm((value) => !value)}
              className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-white inline-flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              إضافة مستخدم
            </button>
          }
        />
        {showForm && (
          <form
            onSubmit={addUser}
            className="mx-5 mb-5 grid grid-cols-1 gap-3 rounded-xl border border-border bg-muted/20 p-4 md:grid-cols-3"
          >
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="اسم الموظف"
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
            />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="البريد الوزاري"
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
            />
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="رقم الجوال (اختياري)"
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
            />
            <input
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              placeholder="الإدارة (اختياري)"
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
            />
            <input
              value={section}
              onChange={(event) => setSection(event.target.value)}
              placeholder="القسم (اختياري)"
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
            />
            <input
              value={jobTitle}
              onChange={(event) => setJobTitle(event.target.value)}
              placeholder="المسمى الوظيفي (اختياري)"
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
            />
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
            >
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button className="h-10 rounded-lg bg-primary text-sm font-semibold text-white">
              حفظ المستخدم
            </button>
          </form>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground">
                <th className="px-5 py-3 text-right">المستخدم</th>
                <th className="px-5 py-3 text-right">البريد</th>
                <th className="px-5 py-3 text-right">الدور</th>
                <th className="px-5 py-3 text-right">الحالة</th>
                <th className="px-5 py-3 text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.email} className="border-t border-border">
                  <td className="px-5 py-4 font-semibold">{user.name}</td>
                  <td className="px-5 py-4 text-muted-foreground">{user.email}</td>
                  <td className="px-5 py-4">
                    <select
                      value={user.role}
                      disabled={user.email === currentUser.email}
                      onChange={(event) => {
                        const nextRole = event.target.value as Role;
                        commit(
                          users.map((item) =>
                            item.email === user.email
                              ? { ...item, role: nextRole, roleLabel: ROLE_LABELS[nextRole] }
                              : item,
                          ),
                          "تغيير دور مستخدم",
                          `${user.name}: ${ROLE_LABELS[nextRole]}`,
                        );
                      }}
                      className="h-9 rounded-lg border border-border bg-background px-2"
                    >
                      {Object.entries(ROLE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <Badge tone={user.active === false ? "muted" : "success"}>
                      {user.active === false ? "معطل" : "نشط"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button
                        disabled={user.email === currentUser.email}
                        onClick={() =>
                          commit(
                            users.map((item) =>
                              item.email === user.email
                                ? { ...item, active: item.active === false }
                                : item,
                            ),
                            user.active === false ? "تفعيل مستخدم" : "تعطيل مستخدم",
                            user.name,
                          )
                        }
                        className="h-9 rounded-lg border border-border px-3 text-xs disabled:opacity-40"
                      >
                        {user.active === false ? "تفعيل" : "تعطيل"}
                      </button>
                      <button
                        onClick={() => {
                          commit(
                            users.map((item) =>
                              item.email === user.email
                                ? { ...item, password: DEMO_PASSWORD }
                                : item,
                            ),
                            "إعادة تعيين كلمة المرور",
                            user.name,
                          );
                          window.alert(
                            `أُعيدت كلمة المرور التجريبية للمستخدم ${user.name} إلى ${DEMO_PASSWORD}.`,
                          );
                        }}
                        className="h-9 rounded-lg border border-border px-3 text-xs"
                      >
                        إعادة تعيين كلمة المرور
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="p-5">
        <div className="flex items-start gap-3">
          <Users className="h-5 w-5 text-primary" />
          <div>
            <div className="font-bold">ضابط أمان</div>
            <p className="mt-1 text-sm text-muted-foreground">
              لا يمكن لمسؤول النظام تعطيل حسابه أو تغيير دوره أثناء تسجيل الدخول، وتسجل كل تغييرات
              الحسابات والأدوار في سجل العمليات غير القابل للحذف.
            </p>
          </div>
        </div>
      </Card>
    </AppShell>
  );
}
