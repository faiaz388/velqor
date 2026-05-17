import { LoginForm } from "@/components/auth/login-form";
import { SocialAuth } from "@/components/auth/social-auth";

export const metadata = {
  title: "Login | VELQOR",
  description: "Sign in to your premium account",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Welcome Back</h2>
        <p className="text-sm text-foreground-secondary">Please enter your details to continue</p>
      </div>
      
      <LoginForm />
      
      <SocialAuth />
    </div>
  );
}
