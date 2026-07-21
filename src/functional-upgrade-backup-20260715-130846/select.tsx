import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FolderKanban, Building2, LogOut, User as UserIcon, ChevronLeft } from "lucide-react";
import ministryLogoOnDark from "@/assets/mewa-logo-on-dark.svg";
import hero from "@/assets/select-hero-hq.png";
import { getUser, logout, roleHome, type User } from "@/lib/auth";

export const Route = createFileRoute("/select")({
  component: SelectUnit,
  head: () => ({
    meta: [
      { title: "اختر الوحدة — منصة إدارة وحوكمة المشاريع التقنية" },
      { name: "description", content: "بوابة الدخول لاختيار وحدة العمل: مشاريع الوزارة أو الشركات المتعاونة." },
    ],
  }),
});

function SelectUnit() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) { navigate({ to: "/" }); return; }
    setUser(u);
  }, [navigate]);

  if (!user) return null;

  return (
    <div dir="rtl" className="relative min-h-screen w-full overflow-hidden text-white">
      {/* Background image */}
      <img
        src={hero}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      {/* Green overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,61,43,0.68) 0%, rgba(0,87,63,0.40) 48%, rgba(0,45,32,0.64) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 52%, rgba(0,20,14,0.38) 100%)" }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-8 lg:px-14 pt-6">
          <div className="flex items-center">
            <img
              src={ministryLogoOnDark}
              alt="وزارة البيئة والمياه والزراعة"
              className="h-auto w-[230px] sm:w-[280px] drop-shadow-md"
            />
          </div>
          <button
            onClick={() => { logout(); navigate({ to: "/" }); }}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-white/25 bg-white/5 backdrop-blur-sm text-sm text-white/90 hover:bg-white/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </button>
        </header>

        {/* Center */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C8A24A]/60 bg-[#C8A24A]/10 backdrop-blur-sm text-[#F0D78C] text-sm">
            <UserIcon className="h-4 w-4" />
            <span>مرحبًا، {user.name}</span>
          </div>
          <h1 className="mt-6 text-4xl lg:text-5xl font-bold tracking-tight text-white text-center [text-shadow:0_2px_16px_rgba(0,0,0,0.48)]">
            اختر الوحدة
          </h1>
          <div className="mt-3 h-[2px] w-16 bg-[#C8A24A] rounded-full" />
          <p className="mt-4 text-sm lg:text-base text-white/85 text-center max-w-md">
            حدد الوحدة التي ترغب في الدخول إليها لبدء العمل
          </p>

          <div className="mt-12 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
            <PortalCard
              title="مشاريع الوزارة"
              description="إدارة ومتابعة المشاريع التقنية التابعة للوزارة."
              icon={<FolderKanban className="h-8 w-8" />}
              cta="الدخول إلى المشاريع"
              onClick={() => navigate({ to: roleHome(user.role) })}
            />
            <PortalCard
              title="الشركات المتعاونة"
              description="استعراض الشركات المرتبطة بمشاريع الوزارة."
              icon={<Building2 className="h-8 w-8" />}
              cta="الدخول إلى الشركات"
              onClick={() => navigate({ to: "/companies" })}
            />
          </div>
        </main>

        <footer className="text-center text-[11px] text-white/60 pb-6">
          © 2025 وزارة البيئة والمياه والزراعة — منصة إدارة وحوكمة المشاريع التقنية
        </footer>
      </div>
    </div>
  );
}

function PortalCard({
  title,
  description,
  icon,
  cta,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  cta: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group text-right rounded-2xl bg-white/[0.06] backdrop-blur-xl border border-white/15 p-8 lg:p-10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] hover:bg-white/[0.10] hover:border-[#C8A24A]/50 hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-white/10 border border-white/20 text-[#F0D78C] mb-6 mx-auto group-hover:bg-[#C8A24A]/20 transition-colors">
        {icon}
      </div>
      <h2 className="text-2xl font-bold text-white text-center">{title}</h2>
      <div className="mx-auto mt-3 h-px w-10 bg-[#C8A24A]/70" />
      <p className="mt-4 text-sm text-white/75 text-center leading-relaxed min-h-[40px]">
        {description}
      </p>
      <div className="mt-8 flex justify-center">
        <span className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-white text-[#003D2B] text-sm font-semibold shadow-md group-hover:bg-[#C8A24A] group-hover:text-white transition-colors">
          {cta}
          <ChevronLeft className="h-4 w-4" />
        </span>
      </div>
    </button>
  );
}
