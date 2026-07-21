import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { User, Lock, LogIn, Fingerprint } from "lucide-react";
import ministryLogo from "@/assets/mewa-logo.svg";
import ministryLogoOnDark from "@/assets/mewa-logo-on-dark.svg";
import heroImg from "@/assets/login-hero-hq.png";
import { getUser, login, roleHome } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("pmo@mewa.gov.sa");
  const [password, setPassword] = useState("••••••••");
  const [error, setError] = useState<string | null>(null);
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (u) navigate({ to: "/select" });
  }, [navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = login(email);
    if (!u) {
      setError("البريد الإلكتروني غير معروف. جرّب: pmo@mewa.gov.sa أو manager@mewa.gov.sa أو pm@mewa.gov.sa");
      return;
    }
    navigate({ to: "/select" });
  };

  return (
    <div dir="rtl" className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* Right hero panel (visually on right in RTL = first in DOM for grid col-1) */}
      <div className="relative overflow-hidden bg-primary-deep hidden lg:block">
        <img
          src={heroImg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-deep/40 via-primary-deep/25 to-primary-deep/78" />
        <div className="relative z-10 h-full flex flex-col p-10 text-white">
          <div className="flex items-center gap-3">
            <img
              src={ministryLogoOnDark}
              alt="وزارة البيئة والمياه والزراعة"
              className="h-auto w-[280px] max-w-full drop-shadow-md"
            />
          </div>
          <div className="flex-1 flex items-center">
            <div>
              <h1 className="text-3xl font-bold leading-snug [text-shadow:0_2px_14px_rgba(0,0,0,0.55)]">
                منصة
                <br />
                إدارة وحوكمة المشاريع التقنية
              </h1>
              <p className="mt-3 text-white/90 text-sm [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">إدارة ذكية لمشاريع الوزارة</p>
            </div>
          </div>
          <div className="text-xs text-white/70">
            جميع الحقوق محفوظة © 2025 وزارة البيئة والمياه والزراعة
          </div>
        </div>
      </div>

      {/* Login form panel */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-6 flex justify-center">
            <img
              src={ministryLogo}
              alt="وزارة البيئة والمياه والزراعة"
              className="h-auto w-[280px] max-w-full"
            />
          </div>
          <h2 className="text-2xl font-bold text-foreground">تسجيل الدخول</h2>
          <p className="text-sm text-muted-foreground mt-1">يرجى إدخال بيانات الدخول الخاصة بك</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="اسم المستخدم أو البريد الإلكتروني"
                className="w-full h-12 pr-10 pl-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>

            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                className="w-full h-12 pr-10 pl-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                تذكرني
              </label>
              <a href="#" className="text-primary hover:underline">
                نسيت كلمة المرور؟
              </a>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full h-12 rounded-lg bg-primary-deep hover:bg-primary text-white font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              تسجيل الدخول
            </button>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex-1 h-px bg-border" />
              <span>أو</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button
              type="button"
              className="w-full h-12 rounded-lg border border-border bg-background hover:bg-accent text-sm font-medium flex items-center justify-center gap-2"
            >
              <Fingerprint className="h-4 w-4" />
              الدخول عبر النفاذ الوطني الموحد
            </button>

            <p className="text-[11px] text-muted-foreground text-center pt-2">
              حسابات تجريبية: pmo@mewa.gov.sa · manager@mewa.gov.sa · pm@mewa.gov.sa
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
