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
    // Add a race condition to prevent infinite hangs (RLS loop)
    const profilePromise = (async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", sessionUser.id)
          .single();

        if (error && error.code === 'PGRST116') {
          const fallbackUsername = sessionUser.email 
            ? sessionUser.email.split('@')[0] + Math.floor(Math.random()*10000) 
            : 'user' + Math.floor(Math.random()*100000);
            
          const { data: newProfile, error: insertError } = await supabase.from("profiles").insert({
            id: sessionUser.id,
            email: sessionUser.email,
            name: sessionUser.user_metadata?.name || 'New User',
            username: fallbackUsername,
            role: 'customer',
            photo_url: sessionUser.user_metadata?.avatar_url || ''
          }).select().single();
          
          if (newProfile) {
            setProfile(newProfile);
            return newProfile;
          } else {
            console.error("Auto-repair failed:", insertError);
            return null;
          }
        } else if (!error && data) {
          setProfile(data);
          return data;
        } else {
          console.error("Profile fetch error:", error);
          return null;
        }
      } catch (err) {
        console.error("Network or parsing error fetching profile:", err);
        return null;
      }
    })();

    // 2 second timeout for profile fetch to prevent hangs
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Profile fetch timed out")), 2000)
    );

    try {
      await Promise.race([profilePromise, timeoutPromise]);
    } catch (err) {
      console.error("Profile fetch failed or timed out:", err);
      // Even if it fails, we shouldn't hang the UI forever
    }
  }, [supabase]);

  React.useEffect(() => {
    let mounted = true;

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (!mounted) return;

        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user);
        }
      } catch (err) {
        console.error("Initial auth error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      setUser(session?.user ?? null);
      if (session?.user) {
        setLoading(true); // Maintain loading state while fetching profile on change
        await fetchProfile(session.user);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
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
