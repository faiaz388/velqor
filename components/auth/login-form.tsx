"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-sm mx-auto">
      <Input 
        name="email"
        type="email" 
        label="Email Address"
        required 
        className="bg-white/5 backdrop-blur-sm border-white/10"
      />

      <div className="flex flex-col gap-1 relative">
        <Input 
          name="password"
          type={showPassword ? "text" : "password"} 
          label="Password"
          required 
          className="bg-white/5 backdrop-blur-sm border-white/10"
        />
        <button 
          type="button" 
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-0 top-7 p-1 text-foreground/30 hover:text-foreground transition-colors z-10"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex items-center gap-3 ml-1">
        <input 
          type="checkbox" 
          name="rememberMe" 
          id="rememberMe" 
          className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-accent focus:ring-accent accent-accent"
        />
        <label htmlFor="rememberMe" className="text-sm text-foreground-secondary cursor-pointer select-none">Remember this device</label>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium text-center"
        >
          {error}
        </motion.div>
      )}

      <Button type="submit" variant="primary" size="lg" disabled={loading} className="w-full relative overflow-hidden group h-12">
        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Sign In to Velqor"}
      </Button>

      <div className="text-center">
        <p className="text-sm text-foreground-secondary">
          Don&apos;t have an account?{" "}
          <Link href="/register" virtual-link="true" className="text-accent font-medium hover:underline">Create account</Link>
        </p>
      </div>
    </form>
  );
}
