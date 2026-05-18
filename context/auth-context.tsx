"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  name: string;
  username: string;
  email: string;
  photo_url: string;
  role: 'user' | 'admin';
  is_banned: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const supabase = React.useMemo(() => createClient(), []);

  const fetchProfile = React.useCallback(async (sessionUser: User) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", sessionUser.id)
        .single();

      if (error && error.code === 'PGRST116') {
        const fallbackUsername = sessionUser.email ? sessionUser.email.split('@')[0] + Math.floor(Math.random()*10000) : 'user' + Math.floor(Math.random()*100000);
        const { data: newProfile, error: insertError } = await supabase.from("profiles").insert({
          id: sessionUser.id,
          email: sessionUser.email,
          name: sessionUser.user_metadata?.name || 'New User',
          username: fallbackUsername,
          role: 'user',
          photo_url: sessionUser.user_metadata?.avatar_url || ''
        }).select().single();
        
        if (newProfile) {
          setProfile(newProfile);
        } else {
          console.error("Auto-repair failed:", insertError);
        }
      } else if (!error && data) {
        setProfile(data);
      } else {
        console.error("Profile fetch error:", error);
      }
    } catch (err) {
      console.error("Network or parsing error fetching profile:", err);
    }
  }, [supabase]);

  React.useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
