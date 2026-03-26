import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-2 text-center lg:items-start lg:text-left">
        {/* Mobile logo (hidden on desktop where the left panel shows it) */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: "#007384" }}>
            <span className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>RP</span>
          </div>
          <span className="text-xl tracking-wide" style={{ fontFamily: "var(--font-heading)", color: "#007384" }}>
            RUSHTOWN HR
          </span>
        </div>
        <h2 className="text-2xl tracking-wide" style={{ fontFamily: "var(--font-heading)", color: "#130C0E" }}>
          SIGN IN
        </h2>
        <p className="text-sm" style={{ color: "#8E9089" }}>Enter your credentials to access the platform</p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
