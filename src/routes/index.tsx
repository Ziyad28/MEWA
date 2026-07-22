import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { User, Lock, LogIn, Fingerprint } from "lucide-react";
import ministryLogo from "@/assets/mewa-logo.svg";
import ministryLogoOnDark from "@/assets/mewa-logo-on-dark.svg";
import heroImg from "@/assets/login-hero-hq.png";
import { DEMO_PASSWORD, getUser, login } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (u) navigate({ to: "/select" });
  }, [navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    const u = login(email, password, remember);
    if (!u) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة، أو أن الحساب معطّل.");
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
                المنصة الذكية لإدارة الشركات والمشاريع
              </h1>
            </div>
          </div>
          <div className="border-t border-white/15 pt-4 space-y-1.5 [text-shadow:0_1px_6px_rgba(0,0,0,0.45)]">
            <p className="text-sm font-medium text-white/90">
              وكالة الوزارة لتقنية المعلومات والتحول الرقمي
            </p>
            <p className="text-xs text-white/65">
              جميع الحقوق محفوظة © 2026 وزارة البيئة والمياه والزراعة
            </p>
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
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setNotice(
                    "استعادة كلمة المرور ستُفعّل عند ربط المنصة بخدمة البريد والباك إند. حاليًا يستطيع مسؤول النظام إعادة تعيينها من إدارة المستخدمين.",
                  );
                }}
                className="text-primary hover:underline"
              >
                نسيت كلمة المرور؟
              </button>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                {error}
              </div>
            )}

            {notice && (
              <div className="rounded-md border border-primary/20 bg-primary/10 p-3 text-sm leading-6 text-primary-deep">
                {notice}
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
              onClick={() => {
                setError(null);
                setNotice(
                  "الدخول عبر النفاذ الوطني جاهز في الواجهة، وسيُفعّل بعد ربط المنصة بخدمة النفاذ الوطني والباك إند.",
                );
              }}
              className="w-full h-12 rounded-lg border border-border bg-background hover:bg-accent text-sm font-medium flex items-center justify-center gap-2"
            >
              <Fingerprint className="h-4 w-4" />
              الدخول عبر النفاذ الوطني الموحد
            </button>

            <details className="mt-4 text-[11px] text-muted-foreground bg-muted/30 border border-border/50 rounded-lg p-3 transition-all [&_summary::-webkit-details-marker]:hidden">
              <summary className="cursor-pointer text-center font-medium text-primary hover:text-primary-deep flex items-center justify-center gap-1 select-none">
                <span>عرض جميع الحسابات التجريبية للنظام ({DEMO_PASSWORD})</span>
              </summary>
              <div className="mt-4 space-y-3 text-right border-t border-border/50 pt-3">
                <div className="space-y-1">
                  <div className="font-semibold text-foreground">أدوار النظام الأساسية:</div>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <div>مسؤول نظام: <code>admin@...</code></div>
                    <div>مكتب مشاريع: <code>pmo@...</code></div>
                    <div>مدير مشروع: <code>pm@...</code></div>
                    <div>موظف: <code>goust@...</code></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-foreground">التحول الرقمي:</div>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <div className="col-span-2 text-primary font-medium">المدير العام: <code>dt_gm@...</code></div>
                    <div>تقنيات ناشئة: <code>dt_sub1@...</code></div>
                    <div>بنية مؤسسية: <code>dt_sub2@...</code></div>
                    <div>تخطيط وتميز: <code>dt_sub3@...</code></div>
                    <div>خدمات إلكترونية: <code>dt_sub4@...</code></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-foreground">الحلول التطبيقية:</div>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <div className="col-span-2 text-primary font-medium">المدير العام: <code>app_gm@...</code></div>
                    <div>حلول مؤسسية: <code>app_sub1@...</code></div>
                    <div>ذكاء الأعمال: <code>app_sub2@...</code></div>
                    <div>منتجات رقمية: <code>app_sub3@...</code></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-foreground">البنية التحتية:</div>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <div className="col-span-2 text-primary font-medium">المدير العام: <code>infra_gm@...</code></div>
                    <div>قواعد بيانات: <code>infra_sub1@...</code></div>
                    <div>الشبكات: <code>infra_sub2@...</code></div>
                    <div>تشغيل أنظمة: <code>infra_sub3@...</code></div>
                    <div>دعم فني: <code>infra_sub4@...</code></div>
                  </div>
                </div>
                <div className="text-center text-[10px] text-muted-foreground pt-2">
                  * جميع الإيميلات تنتهي بـ <code>mewa.gov.sa</code>
                </div>
              </div>
            </details>
          </form>
        </div>
      </div>
    </div>
  );
}
