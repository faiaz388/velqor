"use client";

import * as React from "react";
import { LifeBuoy, Plus, MessageSquare, Clock } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

export function DashboardTickets() {
  const { profile } = useAuth();
  const { addToast } = useToast();
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isCreating, setIsCreating] = React.useState(false);
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const fetchTickets = React.useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", profile.id)
      .order("updated_at", { ascending: false });
      
    if (data) {
      setTickets(data);
    }
    setLoading(false);
  }, [profile]);

  React.useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleCreateTicket = async () => {
    if (!profile || !subject.trim() || !message.trim()) return;
    
    setSubmitting(true);
    const supabase = createClient();
    
    // Create Ticket
    const { data: ticketData, error: ticketError } = await supabase
      .from("support_tickets")
      .insert({ user_id: profile.id, subject })
      .select("id")
      .single();

    if (ticketError) {
      addToast({ title: "Failed to create ticket", type: "error" });
      setSubmitting(false);
      return;
    }

    // Create Initial Message
    const { error: msgError } = await supabase
      .from("ticket_messages")
      .insert({ ticket_id: ticketData.id, user_id: profile.id, message });

    if (msgError) {
      addToast({ title: "Ticket created but message failed", type: "error" });
    } else {
      addToast({ title: "Support ticket created", type: "success" });
      setIsCreating(false);
      setSubject("");
      setMessage("");
      fetchTickets();
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
        <h4 className="text-lg font-medium flex items-center gap-2">
          <LifeBuoy className="w-5 h-5" /> Support Tickets
        </h4>
        <Button variant="outline" size="sm" onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> New Ticket</>}
        </Button>
      </div>

      {isCreating ? (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4">
          <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="E.g. Issue with order VEL-1234" />
          <div className="relative pt-5">
            <textarea
              className="peer flex min-h-[120px] w-full rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors placeholder:text-transparent"
              placeholder="Message"
              value={message}
              id="ticket-msg"
              onChange={(e) => setMessage(e.target.value)}
            />
            <label
              htmlFor="ticket-msg"
              className="absolute left-3 top-7 text-sm text-foreground-secondary transition-all peer-placeholder-shown:top-7 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-xs peer-focus:text-accent pointer-events-none bg-background px-1"
            >
              How can we help you?
            </label>
          </div>
          <div className="flex justify-end mt-2">
            <Button variant="primary" onClick={handleCreateTicket} disabled={submitting || !subject.trim() || !message.trim()}>
              {submitting ? "Submitting..." : "Submit Ticket"}
            </Button>
          </div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center text-foreground-secondary">
          <MessageSquare className="w-12 h-12 opacity-50" />
          <p>You have no active support tickets.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="p-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 transition-all flex items-center justify-between group cursor-pointer">
              <div className="flex flex-col gap-1 text-left">
                 <h5 className="font-semibold text-foreground group-hover:text-accent transition-colors">{ticket.subject}</h5>
                 <div className="flex items-center gap-4 text-xs text-foreground-secondary">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(ticket.updated_at).toLocaleDateString()}</span>
                    <span>ID: {ticket.id.split('-')[0]}</span>
                 </div>
              </div>
              <div>
                 <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    ticket.status === "resolved" && "bg-green-500/20 text-green-400",
                    ticket.status === "closed" && "bg-foreground/20 text-foreground-secondary",
                    ticket.status === "in_progress" && "bg-blue-500/20 text-blue-400",
                    ticket.status === "open" && "bg-yellow-500/20 text-yellow-400",
                  )}>
                    {ticket.status.replace("_", " ")}
                  </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
