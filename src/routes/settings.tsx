import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, useRequirePermission } from "@/components/app-shell";
import { Card, CardHeader } from "@/components/ui-bits";
import { PageSkeleton } from "@/components/page-skeleton";
import { recordAudit } from "@/lib/portal-store";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const user = useRequirePermission("settings.manage");
  const [approval, setApproval] = useState(
    () => typeof window === "undefined" || localStorage.getItem("mewa-setting-approval") !== "off",
  );
  if (!user) return <PageSkeleton />;
  const save = () => {
    localStorage.setItem("mewa-setting-approval", approval ? "on" : "off");
    recordAudit("تحديث إعدادات المنصة", "نظام", `مسار الاعتماد: ${approval ? "مفعل" : "معطل"}`);
    window.alert("تم حفظ الإعدادات.");
  };
  return (
    <AppShell
      role={user.role}
      userName={user.name}
      roleLabel={user.roleLabel}
      pageTitle="إعدادات المنصة"
      pageSubtitle="إعدادات التشغيل العامة التي يديرها مسؤول المنصة فقط"
    >
      <Card>
        <CardHeader title="إعدادات التشغيل" />
        <div className="space-y-4 px-5 pb-5">
          <Setting
            label="اعتماد الوثائق"
            description="إلزام الوثائق المرفوعة بالمرور على جهة الاعتماد المختصة."
            value={approval}
            onChange={setApproval}
          />
          <button
            onClick={save}
            className="h-11 rounded-lg bg-primary px-5 font-semibold text-white"
          >
            حفظ الإعدادات
          </button>
        </div>
      </Card>
    </AppShell>
  );
}

function Setting({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
      <div>
        <div className="font-semibold">{label}</div>
        <div className="mt-1 text-xs text-muted-foreground">{description}</div>
      </div>
      <input
        type="checkbox"
        checked={value}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-primary"
      />
    </label>
  );
}
