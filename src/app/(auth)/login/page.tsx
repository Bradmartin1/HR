import { LoginForm } from "@/components/auth/LoginForm";
import { Shield } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-2 text-center">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">Rushtown HR</span>
        </div>
        <p className="text-sm text-muted-foreground">Sign in to your account</p>
      </div>
      <LoginForm />
    </div>
  );
}
