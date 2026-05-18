"use client";

import * as React from "react";
import { Settings, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

export function DashboardProfile() {
  const { profile, refreshProfile } = useAuth();
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState(profile?.name || "");
  const [loading, setLoading] = React.useState(false);

  if (!profile) return null;

  const handleSave = async () => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ name }).eq("id", profile.id);
    
    if (error) {
      addToast({ title: "Failed to update profile", type: "error" });
    } else {
      addToast({ title: "Profile updated successfully", type: "success" });
      await refreshProfile();
      setIsEditing(false);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
        <h4 className="text-lg font-medium flex items-center gap-2">
          <Settings className="w-5 h-5" /> Account Settings
        </h4>
        {!isEditing ? (
          <Button variant="ghost" size="sm" className="text-accent" onClick={() => setIsEditing(true)}>
            <Edit2 className="w-4 h-4 mr-2" /> Edit Info
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-red-400" onClick={() => setIsEditing(false)}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={loading || !name.trim()}>
              <Check className="w-4 h-4 mr-2" /> {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-foreground-secondary uppercase tracking-widest">Display Name</span>
            {isEditing ? (
              <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            ) : (
              <span className="font-medium text-lg mt-2">{profile.name}</span>
            )}
          </div>
          <div className="flex flex-col gap-1 mt-2">
            <span className="text-xs text-foreground-secondary uppercase tracking-widest">Username</span>
            <span className="font-medium text-accent mt-2">@{profile.username}</span>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-foreground-secondary uppercase tracking-widest">Two-Factor Auth</span>
            <span className="text-sm text-foreground-secondary italic mt-2">Not Enabled</span>
          </div>
          <div className="flex flex-col gap-1 mt-2">
            <span className="text-xs text-foreground-secondary uppercase tracking-widest">Login History</span>
            <span className="text-sm underline cursor-pointer hover:text-accent mt-2">View all sessions</span>
          </div>
        </div>
      </div>
      
      <div className="mt-12 p-4 bg-accent/5 rounded-2xl border border-accent/10">
        <p className="text-xs text-foreground-secondary leading-relaxed uppercase tracking-tighter">
          Need to delete your account? This action is permanent and will remove all your data from our servers.
          <button className="ml-2 text-red-500 font-bold hover:underline">Delete Account</button>
        </p>
      </div>
    </div>
  );
}
