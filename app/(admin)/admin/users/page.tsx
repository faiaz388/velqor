"use client";

import * as React from "react";
import { Users, Ban, Trash2, MoreVertical, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  is_banned: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const supabase = createClient();

  const fetchUsers = React.useCallback(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  }, [supabase]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleBan = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_banned: !currentStatus })
      .eq("id", id);

    if (!error) {
      setUsers(users.map(u => u.id === id ? { ...u, is_banned: !currentStatus } : u));
    }
  };

  return (
    <div className="flex flex-col gap-8 py-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-serif text-foreground mb-2">User Management</h1>
          <p className="text-foreground-secondary">Monitor and moderate registered users</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="flex flex-col items-center px-4 border-r border-white/5">
            <span className="text-2xl font-bold font-mono">{users.length}</span>
            <span className="text-[10px] uppercase tracking-widest text-foreground-secondary font-bold">Total Users</span>
          </div>
          <div className="flex flex-col items-center px-4">
            <span className="text-2xl font-bold font-mono text-red-500">{users.filter(u => u.is_banned).length}</span>
            <span className="text-[10px] uppercase tracking-widest text-foreground-secondary font-bold">Banned</span>
          </div>
        </div>
      </div>

      <div className="max-w-md">
        <Input label="Search users by name or username..." className="bg-white/5 border-white/10" />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[10px] uppercase tracking-widest font-bold text-foreground-secondary">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent">
                      {user.name?.[0] || user.username?.[0] || "?"}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-foreground-secondary">@{user.username}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {user.is_banned ? (
                    <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-widest">
                      <Ban className="w-3 h-3" /> Banned
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-500 text-xs font-bold uppercase tracking-widest">
                      <UserCheck className="w-3 h-3" /> Active
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-xs text-foreground-secondary">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => toggleBan(user.id, user.is_banned)}
                      className={user.is_banned ? "text-green-500 hover:bg-green-500/10" : "text-orange-500 hover:bg-orange-500/10"}
                    >
                      <Ban className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {users.length === 0 && !loading && (
          <div className="py-20 text-center flex flex-col items-center gap-4">
            <Users className="w-12 h-12 text-white/10" />
            <p className="text-foreground-secondary">No users found in the system</p>
          </div>
        )}
      </div>
    </div>
  );
}
