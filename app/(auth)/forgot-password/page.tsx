"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Reset Password</h2>
        <p className="text-sm text-foreground-secondary">
          {submitted 
            ? "We've sent reset instructions to your email." 
            : "Enter your email to receive a reset link."}
        </p>
      </div>

      {submitted ? (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-6 py-4"
        >
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <Button variant="outline" onClick={() => setSubmitted(false)} className="w-full">
            Try another email
          </Button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Input 
            name="email" 
            type="email" 
            label="Email Address" 
            required 
            className="bg-white/5 border-white/10" 
          />

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center font-medium">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" disabled={loading} className="w-full h-12">
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Send Reset Link"}
          </Button>
        </form>
      )}

      <Link href="/login" virtual-link="true" className="flex items-center justify-center gap-2 text-sm text-foreground-secondary hover:text-foreground transition-colors mt-2">
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </Link>
    </div>
  );
}
