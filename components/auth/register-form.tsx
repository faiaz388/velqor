"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function RegisterForm() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [strength, setStrength] = React.useState(0);

  const checkStrength = (pass: string) => {
    let s = 0;
    if (pass.length > 8) s++;
    if (/[A-Z]/.test(pass)) s++;
    if (/[0-9]/.test(pass)) s++;
    if (/[^A-Za-z0-9]/.test(pass)) s++;
    setStrength(s);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    checkStrength(val);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    const username = formData.get("username") as string;
    const pass = formData.get("password") as string;
    const confirmPass = formData.get("confirmPassword") as string;

    if (pass !== confirmPass) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (strength < 2) {
      setError("Please use a stronger password");
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          name,
          username,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Auto login after registration is handled by Supabase by default unless email verification is strictly required
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full max-w-sm mx-auto">
      <div className="grid grid-cols-2 gap-4">
        <Input name="name" label="Full Name" required className="bg-white/5 border-white/10" />
        <Input name="username" label="Username" required className="bg-white/5 border-white/10" />
      </div>

      <Input name="email" type="email" label="Email Address" required className="bg-white/5 border-white/10" />

      <div className="flex flex-col gap-1">
        <Input 
          name="password" 
          type="password" 
          label="Password" 
          required 
          onChange={handlePasswordChange}
          className="bg-white/5 border-white/10" 
        />
        {/* Strength Meter */}
        <div className="flex gap-1 mt-1 px-1">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= strength ? (strength <= 2 ? 'bg-orange-500' : 'bg-green-500') : 'bg-white/10'}`} 
            />
          ))}
        </div>
        <p className="text-[10px] text-foreground-secondary ml-1 uppercase tracking-wider font-bold">
          {strength === 0 ? "Enter password" : strength <= 2 ? "Weak" : strength === 3 ? "Good" : "Strong"}
        </p>
      </div>

      <Input name="confirmPassword" type="password" label="Confirm Password" required className="bg-white/5 border-white/10" />

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center font-medium">
          {error}
        </motion.div>
      )}

      <Button type="submit" variant="primary" size="lg" disabled={loading} className="w-full mt-2 h-12">
        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Create Your Account"}
      </Button>

      <div className="text-center">
        <p className="text-sm text-foreground-secondary">
          Already have an account?{" "}
          <Link href="/login" virtual-link="true" className="text-accent font-medium hover:underline">Log In</Link>
        </p>
      </div>
    </form>
  );
}
