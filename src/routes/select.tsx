import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  FolderKanban,
  Building2,
  GraduationCap,
  LogOut,
  User as UserIcon,
  Users,
} from "lucide-react";
import ministryLogoOnDark from "@/assets/mewa-logo-on-dark.svg";
import hero from "@/assets/ministry-building-hero.png";
import { getUser, logout, roleHome, type User } from "@/lib/auth";
import { can } from "@/lib/access-control";

export const Route = createFileRoute("/select")({
  component: SelectUnit,
  head: () => ({
    meta: [
      { title: "القائمة الرئيسية — المنصة الذكية لإدارة الشركات والمشاريع" },
      {
        name: "description",
        content: "بوابة الدخول لاختيار وحدة العمل: مشاريع الوكالة أو الشركات المتعاونة.",
      },
    ],
  }),
});

function SelectUnit() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      navigate({ to: "/" });
      return;
    }
    setUser(u);
  }, [navigate]);

  if (!user) return null;

  return (
    <div dir="rtl" className="relative h-[100dvh] w-full overflow-hidden bg-[#022f23] text-white">
      {/* Background image */}
      <img
        src={hero}
        alt=""
        className="absolute inset-0 h-full w-full scale-[1.01] object-cover object-center"
      />
      {/* Green overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,48,34,0.48) 0%, rgba(0,79,57,0.22) 48%, rgba(0,39,28,0.44) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 48%, rgba(21,104,76,0.04) 0%, rgba(0,25,18,0.03) 52%, rgba(0,18,13,0.28) 100%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#002d21]/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex h-full min-h-0 flex-col">
        {/* Header */}
        <header className="px-6 pt-5 sm:px-8">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
            <div className="flex items-center">
              <img
                src={ministryLogoOnDark}
                alt="وزارة البيئة والمياه والزراعة"
                className="h-auto w-[230px] sm:w-[285px] drop-shadow-[0_4px_14px_rgba(0,0,0,0.28)]"
              />
            </div>
            <button
              onClick={() => {
                logout();
                navigate({ to: "/" });
              }}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/25 bg-white/[0.07] px-4 text-sm font-medium text-white/90 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.75)] backdrop-blur-md transition-all hover:border-white/40 hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E2C46F]"
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </button>
          </div>
        </header>

        {/* Center */}
        <main className="flex min-h-0 flex-1 -translate-y-2 flex-col items-center justify-center px-6 py-2">
          <h1 className="text-center text-[42px] font-bold leading-none tracking-tight text-white sm:text-5xl lg:text-[52px] [text-shadow:0_3px_18px_rgba(0,0,0,0.52)]">
            المنصة الذكية لإدارة الشركات والمشاريع
          </h1>
          <div className="mt-4 flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-[#E2C46F]" />
            <span className="h-[2px] w-20 rounded-full bg-gradient-to-l from-[#E2C46F]/30 via-[#E2C46F] to-[#E2C46F]/30" />
            <span className="h-1 w-1 rounded-full bg-[#E2C46F]" />
          </div>
          <div className="mt-4 inline-flex h-9 items-center gap-2 rounded-full border border-[#D5B254]/55 bg-[#947327]/20 px-4 text-sm font-medium text-[#F4D984] shadow-[0_8px_30px_-16px_rgba(0,0,0,0.9)] backdrop-blur-md">
            <UserIcon className="h-4 w-4" />
            <span>مرحبًا، {user.name}</span>
          </div>

          <div className="mt-6 grid w-full max-w-5xl grid-cols-1 gap-5 md:grid-cols-2">
            {(can(user.role, "projects.viewAll") || can(user.role, "projects.viewAssigned")) && (
              <PortalCard
                title="مشاريع الوكالة"
                description="إدارة ومتابعة المشاريع التقنية التابعة للوكالة."
                icon={<FolderKanban className="h-8 w-8" />}
                onClick={() => navigate({ to: roleHome(user.role) })}
              />
            )}
            {can(user.role, "companies.view") && (
              <PortalCard
                title="الشركات المتعاونة"
                description="استعراض الشركات المرتبطة بمشاريع الوكالة."
                icon={<Building2 className="h-8 w-8" />}
                onClick={() => navigate({ to: "/companies" })}
              />
            )}
            {can(user.role, "workshops.manage") && (
              <div className="md:col-span-2 md:mx-auto md:w-[calc(50%-0.625rem)]">
                <PortalCard
                  title="الشركات وبناء القدرات"
                  description="تسجيل الورش المعتمدة ومتابعة الدعوات والتقييم والتقرير النهائي."
                  icon={<GraduationCap className="h-7 w-7" />}
                  onClick={() => navigate({ to: "/capacity-building" })}
                  compact
                />
              </div>
            )}
            {can(user.role, "workshops.respond") && (
              <div className="md:col-span-2 md:mx-auto md:w-[calc(50%-0.625rem)]">
                <PortalCard
                  title="دعوات ورش العمل"
                  description="استعراض دعواتك، تأكيد الحضور، وتعبئة نماذج التقييم داخل المنصة."
                  icon={<GraduationCap className="h-7 w-7" />}
                  onClick={() => navigate({ to: "/workshop-invitations" })}
                  compact
                />
              </div>
            )}
            {can(user.role, "users.manage") && (
              <div className="md:col-span-2 md:mx-auto md:w-[calc(50%-0.625rem)]">
                <PortalCard
                  title="إدارة المستخدمين والأدوار"
                  description="إنشاء الحسابات وتعيين الأدوار وإدارة حالة الوصول."
                  icon={<Users className="h-7 w-7" />}
                  onClick={() => navigate({ to: "/users" })}
                  compact
                />
              </div>
            )}
          </div>
        </main>

        <footer className="mx-auto w-[calc(100%-3rem)] max-w-5xl border-t border-white/15 pb-4 pt-3 text-center [text-shadow:0_1px_6px_rgba(0,0,0,0.45)]">
          <p className="text-sm font-semibold tracking-[0.01em] text-white/90">
            وكالة الوزارة لتقنية المعلومات والتحول الرقمي
          </p>
          <p className="mt-1.5 text-[11px] text-white/55">© 2026 وزارة البيئة والمياه والزراعة</p>
        </footer>
      </div>
    </div>
  );
}

function PortalCard({
  title,
  description,
  icon,
  onClick,
  compact = false,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#E2C46F]/42 bg-[#166A45]/85 text-right shadow-[0_24px_60px_-28px_rgba(7,46,31,0.78)] backdrop-blur-[6px] transition-all duration-300 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-l before:from-transparent before:via-[#F4D984]/75 before:to-transparent after:absolute after:-left-16 after:-top-20 after:h-44 after:w-44 after:rounded-full after:bg-[#54C08A]/[0.11] after:blur-2xl hover:-translate-y-1 hover:border-[#E2C46F]/70 hover:bg-[#1B8354]/90 hover:shadow-[0_30px_70px_-30px_rgba(7,46,31,0.88)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E2C46F] ${compact ? "min-h-[132px] p-5" : "min-h-[210px] p-7 lg:min-h-[220px] lg:p-8"}`}
    >
      <div
        className={`relative z-10 flex items-center justify-center rounded-2xl border border-[#F0D78C]/45 bg-[#E2C46F]/15 text-[#F4D984] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_12px_30px_-18px_rgba(0,0,0,0.7)] transition-all duration-300 group-hover:scale-105 group-hover:border-[#E2C46F]/80 group-hover:bg-[#C8A24A]/25 ${compact ? "mb-2 h-12 w-12" : "mb-5 h-[68px] w-[68px]"}`}
      >
        {icon}
      </div>
      <h2
        className={`relative z-10 text-center font-bold text-white ${compact ? "text-xl" : "text-2xl lg:text-[26px]"}`}
      >
        {title}
      </h2>
      <div
        className={`relative z-10 mx-auto h-px w-12 bg-gradient-to-l from-transparent via-[#D5B254] to-transparent ${compact ? "mt-2" : "mt-3"}`}
      />
      <p
        className={`relative z-10 text-center text-[13px] text-white/78 lg:text-sm ${compact ? "mt-2 leading-5" : "mt-3 leading-7"}`}
      >
        {description}
      </p>
    </button>
  );
}
