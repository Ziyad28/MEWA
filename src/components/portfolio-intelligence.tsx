import { AlertTriangle, BrainCircuit, Trophy } from "lucide-react";
import { Card, CardHeader, ProgressBar } from "@/components/ui-bits";
import type { PrototypeProject } from "@/lib/portal-store";

export function PortfolioIntelligence({ projects }: { projects: PrototypeProject[] }) {
  const ranked = [...projects].filter((item) => !item.archived).sort((a, b) => b.health - a.health);
  const top = ranked[0];
  const risk = [...ranked].sort((a, b) => b.delayRisk - a.delayRisk)[0];
  return <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <Card><CardHeader title="الأفضل أداءً" action={<Trophy className="h-5 w-5 text-amber-500" />} /><div className="px-5 pb-5"><div className="font-bold">{top?.name}</div><div className="mt-3"><ProgressBar value={top?.health ?? 0} tone="success" /></div><div className="mt-2 text-xs text-muted-foreground">صحة المشروع {top?.health}% وإنجاز {top?.progress}%.</div></div></Card>
    <Card><CardHeader title="الأعلى عرضة للتأخير" action={<AlertTriangle className="h-5 w-5 text-red-500" />} /><div className="px-5 pb-5"><div className="font-bold">{risk?.name}</div><div className="mt-3"><ProgressBar value={risk?.delayRisk ?? 0} tone="danger" /></div><div className="mt-2 text-xs text-muted-foreground">مخاطر التأخير {risk?.delayRisk}% بسبب انخفاض الصحة إلى {risk?.health}% مقارنة بنسبة الإنجاز الحالية.</div></div></Card>
    <Card className="border-primary/20 bg-primary/[0.02]"><CardHeader title="تفسير التوصية الذكية" action={<BrainCircuit className="h-5 w-5 text-primary" />} /><div className="px-5 pb-5 text-xs leading-6"><strong>التوصية:</strong> إعطاء أولوية متابعة لمشروع {risk?.name}.<br /><strong>السبب:</strong> يعتمد التنبؤ على مخاطر التأخير ({risk?.delayRisk}%)، صحة المشروع ({risk?.health}%)، الإنجاز ({risk?.progress}%)، وتاريخ النهاية ({risk?.end}).<br /><strong>الإجراء:</strong> مراجعة المهام المتأخرة والصرف الفعلي واعتماد خطة تصحيحية.</div></Card>
  </div>;
}
