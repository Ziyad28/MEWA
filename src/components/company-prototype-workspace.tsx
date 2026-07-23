import { useState } from "react";
import { FileCheck2, FileText, Upload } from "lucide-react";
import { Card, CardHeader } from "@/components/ui-bits";
import {
  addNotification,
  getCompanies,
  saveCompanies,
  usePortalData,
  type PrototypeCompany,
} from "@/lib/portal-store";

export function CompanyPrototypeWorkspace({ companyId }: { companyId: number }) {
  const { companies } = usePortalData();
  const company = companies.find((item) => item.id === companyId);
  const [attachment, setAttachment] = useState("");
  if (!company) return null;
  const update = (next: PrototypeCompany, notice?: string) => {
    saveCompanies(getCompanies().map((item) => (item.id === next.id ? next : item)));
    if (notice) addNotification("تحديث شركة", notice, `/companies/${next.id}`);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader
            title="العقود والمرفقات"
            action={<FileCheck2 className="h-5 w-5 text-primary" />}
          />
          <div className="px-5 pb-5 space-y-2">
            {company.attachments.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <FileText className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="text-[11px] text-muted-foreground">{item.date}</div>
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                value={attachment}
                onChange={(e) => setAttachment(e.target.value)}
                placeholder="اسم العقد أو المرفق"
                className="h-10 flex-1 rounded-lg border border-border px-3 text-sm"
              />
              <button
                onClick={() => {
                  if (!attachment.trim()) return;
                  update(
                    {
                      ...company,
                      attachments: [
                        {
                          id: Date.now(),
                          name: attachment.trim(),
                          date: new Date().toLocaleDateString("en-CA"),
                        },
                        ...company.attachments,
                      ],
                    },
                    `أضيف مرفق جديد لشركة ${company.name}.`,
                  );
                  setAttachment("");
                }}
                className="h-10 px-4 rounded-lg bg-primary text-white inline-flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                إضافة
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="السجل الزمني للتعاون" />
          <div className="px-5 pb-5 relative">
            <div className="absolute right-[25px] top-2 bottom-4 w-px bg-border" />
            {company.timeline.map((item) => (
              <div key={item.id} className="relative pr-8 pb-5">
                <span className="absolute right-0 top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-primary/10" />
                <div className="font-semibold text-sm">{item.title}</div>
                <div className="text-[11px] text-muted-foreground">{item.date}</div>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
