"use client";

import * as React from "react";
import { 
  Search, 
  Filter, 
  ShoppingBag, 
  Eye, 
  Printer, 
  CheckCircle2,
  Clock,
  Truck,
  MoreHorizontal,
  X,
  ChevronDown,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/toast";

const MOCK_ORDERS = [
  { 
    id: "VEL-82103", 
    customer: "Atiq Rahman", 
    email: "atiq@mail.com",
    phone: "+880 1712-345678",
    date: "Oct 12, 2023", 
    status: "processing", 
    amount: 145.00, 
    method: "bKash",
    trxId: "8J9K2L1M3N",
    sender: "01712-345678",
    address: "House 12, Road 4, Sector 7, Uttara, Dhaka",
    items: [
      { name: "Essential Organic T-Shirt", variant: "Black / XL", price: 45, qty: 2 },
      { name: "Minimalist Watch", variant: "Silver", price: 55, qty: 1 }
    ]
  },
  { 
    id: "VEL-74129", 
    customer: "Sarah Khan", 
    email: "sarah@mail.com",
    phone: "+880 1822-112233",
    date: "Oct 12, 2023", 
    status: "delivered", 
    amount: 320.50, 
    method: "Nagad",
    trxId: "9P1O2I3U4Y",
    sender: "01822-112233",
    address: "Apartment 4B, Gulshan Lake View, Dhaka",
    items: [
      { name: "Heavyweight Boxy Hoodie", variant: "Grey / M", price: 120, qty: 2 },
      { name: "Relaxed Linen Trousers", variant: "Stone", price: 80.5, qty: 1 }
    ]
  },
  { 
    id: "VEL-65122", 
    customer: "Michael Brown", 
    email: "mike@mail.com",
    phone: "+880 1911-223344",
    date: "Oct 11, 2023", 
    status: "pending", 
    amount: 210.00, 
    method: "COD",
    trxId: null,
    sender: null,
    address: "Road 10, Banani, Dhaka",
    items: [
      { name: "Structured Leather Tote", variant: "Tan", price: 210, qty: 1 }
    ]
  },
];

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export default function AdminOrdersPage() {
  const { addToast } = useToast();
  const [orders, setOrders] = React.useState(MOCK_ORDERS);
  const [selectedOrder, setSelectedOrder] = React.useState<typeof MOCK_ORDERS[0] | null>(null);
  const [printingOrder, setPrintingOrder] = React.useState<typeof MOCK_ORDERS[0] | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    addToast({ title: `Order ${orderId} updated to ${newStatus}`, type: "success" });
  };

  const handlePrint = (order: typeof MOCK_ORDERS[0]) => {
    setPrintingOrder(order);
    setTimeout(() => {
        window.print();
        setPrintingOrder(null);
    }, 100);
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.trxId && o.trxId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto h-full">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl font-serif text-black mb-1">Orders</h1>
          <p className="text-sm text-black/60">Fulfill orders and manage payment verifications.</p>
        </div>
        <div className="flex gap-2 text-xs">
            <Button variant="outline" className="gap-2 bg-white" onClick={() => window.print()}>
                <Printer className="w-3.5 h-3.5" /> Batch Print
            </Button>
            <Button variant="primary" className="shadow-premium">Export CSV</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-black/5 shadow-sm flex flex-col min-h-0 flex-1 overflow-hidden print:hidden">
        <div className="p-4 border-b border-black/5 flex flex-col md:flex-row gap-4 justify-between items-center bg-white/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
            <input 
              type="text" 
              placeholder="Search by Order ID, Customer or TrxID" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F5F5F0] rounded-lg text-sm border-none focus:ring-2 focus:ring-blue-600/20 outline-none transition-all placeholder:text-black/30"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 bg-white"><Filter className="w-4 h-4" /> Filter</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F5F5F0]/50 text-black/40 font-bold uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Payment Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[#F5F5F0]/30 transition-colors group">
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">{order.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-black">{order.customer}</span>
                      <span className="text-xs text-black/40">{order.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-black">{order.method}</span>
                        {order.trxId && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[9px] font-black uppercase">MANUAL</span>}
                      </div>
                      {order.trxId ? (
                        <div className="text-[10px] space-y-0.5">
                           <p className="text-black/60"><span className="font-bold">Trx:</span> {order.trxId}</p>
                           <p className="text-black/60"><span className="font-bold">From:</span> {order.sender}</p>
                        </div>
                      ) : (
                        <span className="text-[10px] text-black/40 italic">Cash on Delivery</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative inline-block text-left group/status">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className={cn(
                          "appearance-none pl-3 pr-8 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider cursor-pointer outline-none border-none transition-all shadow-sm",
                          order.status === "delivered" && "bg-green-100 text-green-700",
                          order.status === "processing" && "bg-blue-100 text-blue-700",
                          order.status === "pending" && "bg-yellow-100 text-yellow-700",
                          order.status === "shipped" && "bg-purple-100 text-purple-700",
                          order.status === "cancelled" && "bg-red-100 text-red-700",
                        )}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50" />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-black">{formatCurrency(order.amount)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2.5 hover:bg-black/5 rounded-full text-black/40 hover:text-blue-600 transition-all shadow-sm bg-white border border-black/5" 
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handlePrint(order)}
                        className="p-2.5 hover:bg-black/5 rounded-full text-black/40 hover:text-green-600 transition-all shadow-sm bg-white border border-black/5"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal Overlay */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end p-4 md:p-6 lg:p-8 print:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-xl bg-[#F5F5F0] h-full rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 bg-white border-b border-black/5 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-serif text-black">{selectedOrder.id}</h2>
                  <p className="text-xs text-black/40 uppercase font-bold tracking-widest mt-1">Order Details</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-black/40" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Customer Section */}
                <div className="bg-white rounded-xl p-5 border border-black/5 space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-black/40">
                    <span>Customer Information</span>
                    <button className="text-blue-600 hover:underline">Edit</button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#F5F5F0] rounded-lg"><Mail className="w-4 h-4 text-black/40" /></div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-black/40 font-bold uppercase">Email</span>
                        <span className="text-sm font-medium">{selectedOrder.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#F5F5F0] rounded-lg"><Phone className="w-4 h-4 text-black/40" /></div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-black/40 font-bold uppercase">Phone</span>
                        <span className="text-sm font-medium">{selectedOrder.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 flex items-start gap-3">
                      <div className="p-2 bg-[#F5F5F0] rounded-lg mt-1"><MapPin className="w-4 h-4 text-black/40" /></div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-black/40 font-bold uppercase">Shipping Address</span>
                        <span className="text-sm font-medium leading-relaxed">{selectedOrder.address}</span>
                      </div>
                  </div>
                </div>

                {/* Items Section */}
                <div className="bg-white rounded-xl p-5 border border-black/5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-black/40 mb-4">Ordered Items</h3>
                  <div className="divide-y divide-black/5">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-black">{item.name}</span>
                          <span className="text-[10px] text-black/40 font-medium uppercase">{item.variant}</span>
                        </div>
                        <div className="flex items-center gap-6">
                           <span className="text-xs text-black/40 font-bold">×{item.qty}</span>
                           <span className="text-sm font-bold text-black">{formatCurrency(item.price * item.qty)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Section */}
                <div className="bg-white rounded-xl p-5 border border-black/5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-black/40">Payment Details</h3>
                  <div className="p-4 bg-[#F5F5F0]/50 rounded-lg border border-black/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-black/40" />
                      <div>
                        <p className="text-sm font-bold text-black">{selectedOrder.method}</p>
                        <p className="text-[10px] text-black/40 font-medium">{selectedOrder.trxId ? `TrxID: ${selectedOrder.trxId}` : 'Cash Payment'}</p>
                      </div>
                    </div>
                    {selectedOrder.trxId && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[9px] font-black rounded uppercase">Verified</span>
                    )}
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-black/40 font-medium">Subtotal</span>
                      <span className="font-bold text-black">{formatCurrency(selectedOrder.amount - 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-black/40 font-medium">Shipping Fee</span>
                      <span className="font-bold text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between text-base pt-2 border-t border-black/5">
                      <span className="font-serif text-black">Total Paid</span>
                      <span className="font-bold text-blue-600">{formatCurrency(selectedOrder.amount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-white border-t border-black/5 flex gap-3">
                <Button 
                  variant="primary" 
                  className="flex-1 gap-2 shadow-premium"
                  onClick={() => {
                    handleStatusChange(selectedOrder.id, "shipped");
                    setSelectedOrder(null);
                  }}
                >
                  <Truck className="w-4 h-4" /> Ship Order
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => handlePrint(selectedOrder)}
                >
                  <Printer className="w-4 h-4" /> Print Invoice
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SINGLE INVOICE VIEW FOR PRINTING */}
      {printingOrder && (
        <div className="fixed inset-0 z-[200] bg-white p-12 text-black overflow-y-auto">
             {/* Invoice Header */}
             <div className="flex justify-between items-start mb-12 border-b-2 border-black pb-8">
                <div>
                  <h1 className="text-4xl font-serif tracking-tighter mb-2">VELQOR</h1>
                  <p className="text-sm text-black/60 uppercase tracking-widest font-bold">Premium E-Commerce</p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-serif mb-1">INVOICE</h2>
                  <p className="text-sm font-bold">{printingOrder.id}</p>
                  <p className="text-xs text-black/60 mt-1">{printingOrder.date}</p>
                </div>
             </div>

             {/* Bill To & Info */}
             <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-black/40 mb-3">BILL TO:</h3>
                  <p className="text-lg font-bold mb-1">{printingOrder.customer}</p>
                  <p className="text-sm text-black/60 mb-1">{printingOrder.email}</p>
                  <p className="text-sm text-black/60 mb-1">{printingOrder.phone}</p>
                  <p className="text-sm text-black/60 mt-2 max-w-xs">{printingOrder.address}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-black/40 mb-1">PAYMENT METHOD:</h3>
                    <p className="text-sm font-bold">{printingOrder.method} {printingOrder.trxId && `(TrxID: ${printingOrder.trxId})`}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-black/40 mb-1">ORDER STATUS:</h3>
                    <p className="text-sm font-bold uppercase tracking-wider">{printingOrder.status}</p>
                  </div>
                </div>
             </div>

             {/* Items Table */}
             <table className="w-full mb-12">
                <thead className="border-b-2 border-black">
                  <tr>
                    <th className="text-left py-3 text-xs font-bold uppercase">Description</th>
                    <th className="text-center py-3 text-xs font-bold uppercase">Qty</th>
                    <th className="text-right py-3 text-xs font-bold uppercase">Price</th>
                    <th className="text-right py-3 text-xs font-bold uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {printingOrder.items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-4">
                        <p className="font-bold">{item.name}</p>
                        <p className="text-[10px] text-black/60 uppercase">{item.variant}</p>
                      </td>
                      <td className="py-4 text-center">{item.qty}</td>
                      <td className="py-4 text-right">{formatCurrency(item.price)}</td>
                      <td className="py-4 text-right font-bold">{formatCurrency(item.price * item.qty)}</td>
                    </tr>
                  ))}
                </tbody>
             </table>

             {/* Totals */}
             <div className="flex justify-end pt-8 border-t-2 border-black/10">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-black/60 font-medium">Subtotal</span>
                    <span className="font-bold">{formatCurrency(printingOrder.amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-black/60 font-medium">Shipping</span>
                    <span className="font-bold text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-xl font-serif pt-4 border-t border-black mt-2">
                    <span>Total Amount</span>
                    <span className="font-bold">{formatCurrency(printingOrder.amount)}</span>
                  </div>
                </div>
             </div>

             <div className="mt-20 pt-12 border-t border-black/5 text-center">
                <p className="text-sm font-serif italic text-black/40">Thank you for choosing VELQOR. Your order matters to us.</p>
                <p className="text-[10px] text-black/20 uppercase tracking-widest mt-4">Automated Invoice Generated on {new Date().toLocaleDateString()}</p>
             </div>
        </div>
      )}
    </div>
  );
}
