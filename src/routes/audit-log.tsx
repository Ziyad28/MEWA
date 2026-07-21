import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ClipboardList, Search } from "lucide-react";
import { AppShell, useRequirePermission } from "@/components/app-shell";
import { Badge, Card, EmptyState } from "@/components/ui-bits";
import { PageSkeleton } from "@/components/page-skeleton";
import { usePortalData } from "@/lib/portal-store";

export const Route = createFileRoute("/audit-log")({
  component: AuditLogPage,
  head: () => ({ meta: [{ title: "سجل العمليات — المنصة الذكية لإدارة الشركات والمشاريع" }] }),
});

function AuditLogPage() {
  const user = useRequirePermission("audit.viewAll");
  const { auditEvents } = usePortalData();
  const [query, setQuery] = useState("");
  const [entity, setEntity] = useState("all");
  const filtered = useMemo(
    () =>
      auditEvents.filter((event) => {
        if (entity !== "all" && event.entity !== entity) return false;
        if (
          query &&
          !`${event.action} ${event.details} ${event.actorName} ${event.actorRole}`.includes(query)
        )
          return false;
        return true;
      }),
    [auditEvents, entity, query],
  );

  if (!user) return <PageSkeleton />;

  return (
    <AppShell
      role={user.role}
      userName={user.name}
      roleLabel={user.roleLabel}
      pageTitle="سجل العمليات"
      pageSubtitle="سجل رقابي غير قابل للحذف للإجراءات المهمة داخل المنصة"
    >
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث بالإجراء أو المنفذ"
              className="h-11 w-full rounded-lg border border-border bg-background pr-10 pl-3 text-sm"
            />
          </div>
          <select
            value={entity}
            onChange={(event) => setEntity(event.target.value)}
            className="h-11 rounded-lg border border-border bg-background px-3 text-sm"
          >
            <option value="all">كل السجلات</option>
            <option value="مشروع">المشاريع</option>
            <option value="وثيقة">الوثائق</option>
            <option value="شركة">الشركات</option>
            <option value="ورشة">الورش</option>
            <option value="نظام">النظام</option>
          </select>
        </div>
      </Card>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="h-6 w-6" />}
            title="لا توجد عمليات مسجلة"
            description="ستظهر الإجراءات المهمة هنا فور تنفيذها."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th className="px-4 py-3 text-right font-medium">الإجراء</th>
                  <th className="px-4 py-3 text-right font-medium">النوع</th>
                  <th className="px-4 py-3 text-right font-medium">التفاصيل</th>
                  <th className="px-4 py-3 text-right font-medium">المنفذ</th>
                  <th className="px-4 py-3 text-right font-medium">الدور</th>
                  <th className="px-4 py-3 text-right font-medium">التاريخ والوقت</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((event) => (
                  <tr key={event.id} className="border-t border-border">
                    <td className="px-4 py-3 font-semibold">{event.action}</td>
                    <td className="px-4 py-3">
                      <Badge tone="muted">{event.entity}</Badge>
                    </td>
                    <td className="px-4 py-3">{event.details}</td>
                    <td className="px-4 py-3 font-medium">{event.actorName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{event.actorRole}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {event.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
