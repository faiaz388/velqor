import { RegisterForm } from "@/components/auth/register-form";
import { SocialAuth } from "@/components/auth/social-auth";

export const metadata = {
  title: "Join VELQOR | Premium Experience",
  description: "Create your production-ready account",
};

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Create Account</h2>
        <p className="text-sm text-foreground-secondary">Join the minimalist collection today</p>
      </div>
      
      <RegisterForm />
      
      <SocialAuth />
    </div>
  );
}
