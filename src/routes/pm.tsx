import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingUp, Hourglass, CheckCircle2, AlertCircle, Building2, User, Calendar, Flag, FileText } from "lucide-react";
import { AppShell, useRequireAuth } from "@/components/app-shell";
import { ProgressAreaChart } from "@/components/dashboard-charts";
import { Card, CardHeader, StatCard, Badge, HealthRing } from "@/components/ui-bits";
import { KPIS_PM, PROGRESS_SERIES, PROJECTS, COMPANIES } from "@/lib/mock-data";

export const Route = createFileRoute("/pm")({
  component: PmDashboard,
});

function PmDashboard() {
  const user = useRequireAuth("pm");
  if (!user) return null;

  // PM sees only their assigned projects
  const myProjects = PROJECTS.filter((p) => p.manager === user.name);
  const project = myProjects[0] ?? PROJECTS[1]!;
  const company = COMPANIES.find((c) => c.id === project.companyId);

  return (
    <AppShell
      role="pm"
      userName={user.name}
      roleLabel={user.roleLabel}
      pageTitle="ط¥ط¯ط§ط±ط© ط®ط·ط© ط§ظ„طھظ†ظپظٹط°"
      pageSubtitle="ظ†ط¸ط±ط© ط¹ط§ظ…ط© ط¹ظ„ظ‰ ظ…ط´ط§ط±ظٹط¹ظƒ"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="ظ†ط³ط¨ط© طھظ‚ط¯ظ… ط§ظ„ظ…ط´ط±ظˆط¹" value={`${KPIS_PM.progress}%`} delta="6%" icon={<TrendingUp className="h-4 w-4" />} tone="primary" spark={[45,52,58,62,66,68]} updated="ط§ظ„ظٹظˆظ… 08:15" />
        <StatCard label="ظ‚ظٹط¯ ط§ظ„طھظ†ظپظٹط°" value={KPIS_PM.inProgress} unit="ظ…ظ‡ط§ظ…" icon={<Hourglass className="h-4 w-4" />} tone="warning" spark={[6,8,9,10,11,12]} updated="ط§ظ„ظٹظˆظ… 08:15" />
        <StatCard label="ظ…ظƒطھظ…ظ„ط©" value={KPIS_PM.completed} unit="ظ…ظ‡ط§ظ…" delta="2 ظ…ظ‡ط§ظ…" icon={<CheckCircle2 className="h-4 w-4" />} tone="success" spark={[2,3,4,6,7,8]} updated="ط§ظ„ظٹظˆظ… 08:15" />
        <StatCard label="ظ…طھط£ط®ط±ط©" value={KPIS_PM.overdue} unit="ظ…ظ‡ط§ظ…" delta="1 ظ…ظ‡ظ…ط©" deltaType="down" icon={<AlertCircle className="h-4 w-4" />} tone="danger" spark={[6,5,5,4,4,4]} updated="ط§ظ„ظٹظˆظ… 08:15" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader title="ظ†ط³ط¨ط© طھظ‚ط¯ظ… ط§ظ„ظ…ط´ط±ظˆط¹" subtitle={project.name} action={<span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">ط¢ط®ط± 6 ط£ط´ظ‡ط±</span>} />
          <div className="px-4 pb-5 h-[300px]">
            <ProgressAreaChart data={PROGRESS_SERIES} />
          </div>
        </Card>

        <Card>
          <CardHeader title="ظ…ط¹ظ„ظˆظ…ط§طھ ط§ظ„ظ…ط´ط±ظˆط¹" action={<Link to="/projects/$id" params={{ id: String(project.id) }} className="text-xs text-primary hover:underline">ظپطھط­ ط§ظ„ظ…ط´ط±ظˆط¹</Link>} />
          <div className="px-5 pb-5 space-y-2.5 text-sm">
            <div className="flex items-center justify-center pb-2">
              <HealthRing value={project.health} size={72} />
            </div>
            <Row icon={<Flag className="h-3.5 w-3.5" />} label="ط§ط³ظ… ط§ظ„ظ…ط´ط±ظˆط¹" value={project.name} />
            <Row icon={<Building2 className="h-3.5 w-3.5" />} label="ط§ظ„ط´ط±ظƒط© ط§ظ„ظ…ظ†ظپط°ط©" value={company?.name ?? "-"} />
            <Row icon={<Flag className="h-3.5 w-3.5" />} label="ط§ظ„ظ‚ط·ط§ط¹" value={project.sector} />
            <Row icon={<Calendar className="h-3.5 w-3.5" />} label="ط§ظ„ط¨ط¯ط§ظٹط©" value={project.start} />
            <Row icon={<Calendar className="h-3.5 w-3.5" />} label="ط§ظ„ط§ظ†طھظ‡ط§ط،" value={project.end} />
            <Row icon={<User className="h-3.5 w-3.5" />} label="ظ…ط¯ظٹط± ط§ظ„ظ…ط´ط±ظˆط¹" value={user.name} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="ط£ط­ط¯ط« ط§ظ„ظˆط«ط§ط¦ظ‚" action={<Link to="/documents" className="text-xs text-primary hover:underline">ط¹ط±ط¶ ط§ظ„ظƒظ„</Link>} />
          <div className="px-5 pb-4 space-y-2">
            {[
              { n: "ط®ط·ط© ط§ظ„ظ…ط´ط±ظˆط¹ v2.0", t: "ط®ط·ط©", d: "2025/06/15" },
              { n: "طھظ‚ط±ظٹط± ط§ظ„ط£ط¯ط§ط، ط§ظ„ط´ظ‡ط±ظٹ", t: "طھظ‚ط±ظٹط±", d: "2025/06/14" },
              { n: "ظ…طھط·ظ„ط¨ط§طھ ط§ظ„ظ…ط´ط±ظˆط¹", t: "ظ…طھط·ظ„ط¨ط§طھ", d: "2025/06/12" },
            ].map((d) => (
              <div key={d.n} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border text-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium truncate">{d.n}</div>
                    <div className="text-[11px] text-muted-foreground">{d.t} آ· {d.d}</div>
                  </div>
                </div>
                <Badge tone="muted">{d.t}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="ط§ظ„ظ…ظ‡ط§ظ… ط§ظ„ط£ط®ظٹط±ط©" />
          <div className="px-5 pb-5 space-y-2">
            {[
              { t: "طھط­ط¯ظٹط« ط§ظ„ط®ط·ط© ط§ظ„طھظپطµظٹظ„ظٹط©", done: true },
              { t: "ظ…ط±ط§ط¬ط¹ط© ط§ظ„ظ…طھط·ظ„ط¨ط§طھ", done: true },
              { t: "ط§ط®طھط¨ط§ط± ط§ظ„طھظƒط§ظ…ظ„", done: false },
              { t: "طھط¯ط±ظٹط¨ ط§ظ„ظ…ط³طھط®ط¯ظ…ظٹظ†", done: false },
            ].map((task) => (
              <label key={task.t} className="flex items-center gap-3 py-2 border-b border-border last:border-0 text-sm">
                <input type="checkbox" defaultChecked={task.done} className="h-4 w-4 rounded border-border accent-primary" />
                <span className={task.done ? "text-muted-foreground line-through" : "text-foreground"}>{task.t}</span>
              </label>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-border/50 last:border-0">
      <div className="text-muted-foreground text-xs inline-flex items-center gap-1.5">{icon}{label}</div>
      <div className="font-medium text-foreground text-xs text-left">{value}</div>
    </div>
  );
}
