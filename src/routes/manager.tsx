import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, CheckCircle2, Hourglass, TrendingUp } from "lucide-react";
import { AppShell, useRequireAuth } from "@/components/app-shell";
import { PerformanceBarChart } from "@/components/dashboard-charts";
import { Card, CardHeader, StatCard, ProgressBar, StatusBadge } from "@/components/ui-bits";
import { KPIS_MANAGER, PROJECTS } from "@/lib/mock-data";
import { downloadDocument } from "@/lib/portal-store";

export const Route = createFileRoute("/manager")({
  component: ManagerDashboard,
});

const barData = PROJECTS.slice(0, 6).map((p) => ({ name: p.name, value: p.progress }));

function ManagerDashboard() {
  const user = useRequireAuth("manager");
  if (!user) return null;

  return (
    <AppShell
      role="manager"
      userName={user.name}
      roleLabel={user.roleLabel}
      pageTitle="ظ…طھط§ط¨ط¹ط© ظ…ط¹ط§ظٹظٹط± ط§ظ„ط¥ظ†ط¬ط§ط²"
      pageSubtitle="ظ†ط¸ط±ط© ط¹ط§ظ…ط© ط¹ظ„ظ‰ ظ…ط´ط§ط±ظٹط¹ ط§ظ„ط¥ط¯ط§ط±ط©"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="ظ†ط³ط¨ط© ط§ظ„طھظ‚ط¯ظ… ط§ظ„ط¹ط§ظ…ط©" value={`${KPIS_MANAGER.overall}%`} delta="4%" icon={<TrendingUp className="h-4 w-4" />} tone="primary" spark={[52,58,62,66,70,72]} updated="ط§ظ„ظٹظˆظ… 09:20" />
        <StatCard label="ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظ…ط´ط§ط±ظٹط¹" value={KPIS_MANAGER.total} unit="ظ…ط´ط±ظˆط¹" delta="2 ظ…ط´ط§ط±ظٹط¹" icon={<Briefcase className="h-4 w-4" />} tone="primary" spark={[9,10,11,12,13,14]} updated="ط§ظ„ظٹظˆظ… 09:20" />
        <StatCard label="ظ‚ظٹط¯ ط§ظ„طھظ†ظپظٹط°" value={KPIS_MANAGER.inProgress} unit="ظ…ط´ط±ظˆط¹" delta="1 ظ…ط´ط±ظˆط¹" icon={<Hourglass className="h-4 w-4" />} tone="warning" spark={[6,7,8,9,10,10]} updated="ط§ظ„ظٹظˆظ… 09:20" />
        <StatCard label="ظ…ظƒطھظ…ظ„ط©" value={KPIS_MANAGER.completed} unit="ظ…ط´ط±ظˆط¹" delta="1 ظ…ط´ط±ظˆط¹" icon={<CheckCircle2 className="h-4 w-4" />} tone="success" spark={[1,1,2,2,3,3]} updated="ط§ظ„ظٹظˆظ… 09:20" />
      </div>

      <div className="grid grid-cols-1 gap-5">
        <Card className="overflow-hidden">
          <CardHeader title="ظ†ط³ط¨ط© طھظ‚ط¯ظ… ط§ظ„ظ…ط´ط§ط±ظٹط¹" subtitle="ظ…ظ‚ط§ط±ظ†ط© ظ…ط³طھظˆظ‰ ط§ظ„ط¥ظ†ط¬ط§ط² ظ„ط£ط¨ط±ط² ظ…ط´ط§ط±ظٹط¹ ط§ظ„ط¥ط¯ط§ط±ط©" action={<span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">6 ظ…ط´ط§ط±ظٹط¹</span>} />
          <div className="px-4 pb-5 h-[350px]">
            <PerformanceBarChart layout="vertical" data={barData} label="ظ†ط³ط¨ط© ط§ظ„طھظ‚ط¯ظ…" />
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
