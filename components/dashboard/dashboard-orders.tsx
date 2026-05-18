"use client";

import * as React from "react";
import { Package, ExternalLink, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, cn } from "@/lib/utils";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  payment_method: string;
  created_at: string;
}

export function DashboardOrders() {
  const { profile } = useAuth();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchOrders = React.useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });
      
    if (data) {
      setOrders(data);
    }
    setLoading(false);
  }, [profile]);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
          <Package className="w-5 h-5" /> My Orders
        </h4>
        <button onClick={fetchOrders} className="text-foreground-secondary hover:text-accent transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center text-foreground-secondary">
          <Package className="w-12 h-12 opacity-50" />
          <p>You haven&apos;t placed any orders yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-foreground-secondary font-bold uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-6 py-4 rounded-l-lg">Order ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-center rounded-r-lg">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-mono font-bold text-accent">{order.id}</td>
                  <td className="px-6 py-4">
                    <span className="text-foreground-secondary">{new Date(order.created_at).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-4">
                     <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        order.status === "delivered" && "bg-green-500/20 text-green-400",
                        order.status === "processing" && "bg-blue-500/20 text-blue-400",
                        order.status === "pending" && "bg-yellow-500/20 text-yellow-400",
                        order.status === "shipped" && "bg-purple-500/20 text-purple-400",
                        order.status === "cancelled" && "bg-red-500/20 text-red-400",
                      )}>
                        {order.status}
                      </span>
                  </td>
                  <td className="px-6 py-4 font-bold">{formatCurrency(order.total_amount)}</td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 hover:bg-white/10 rounded-full text-foreground-secondary hover:text-accent transition-all inline-block">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
