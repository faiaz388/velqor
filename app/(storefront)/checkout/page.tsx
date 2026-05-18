"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Copy, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/hooks/use-cart";
import { formatCurrency, cn } from "@/lib/utils";
import { PAYMENT_METHODS } from "@/lib/payment-config";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

type CheckoutStep = "contact" | "shipping" | "payment";
type MfsMethod = "bkash" | "nagad" | "rocket" | "cod";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { addToast } = useToast();
  const [step, setStep] = React.useState<CheckoutStep>("contact");
  const [selectedMethod, setSelectedMethod] = React.useState<MfsMethod>("bkash");
  const [transactionId, setTransactionId] = React.useState("");
  const [senderNumber, setSenderNumber] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [paymentNumbers, setPaymentNumbers] = React.useState<Record<string, string>>({
    bkash: process.env.NEXT_PUBLIC_BKASH_NUMBER || "017XX-XXXXXX",
    nagad: process.env.NEXT_PUBLIC_NAGAD_NUMBER || "018XX-XXXXXX",
    rocket: process.env.NEXT_PUBLIC_ROCKET_NUMBER || "019XX-XXXXXX"
  });
  const supabase = createClient();

  const [deliveryLocation, setDeliveryLocation] = React.useState<"inside" | "outside">("inside");

  // Form State
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [city, setCity] = React.useState("");
  const [postalCode, setPostalCode] = React.useState("");

  const tax = subtotal * 0; 
  const shipping = deliveryLocation === "inside" ? 80 : 130;
  const total = subtotal + tax + shipping;

  React.useEffect(() => {
    async function fetchPaymentSettings() {
      const { data, error } = await supabase
        .from('site_settings')
        .select('data')
        .eq('id', 'payment')
        .single();
      
      if (data && !error) {
        setPaymentNumbers(data.data);
      }
    }
    fetchPaymentSettings();
  }, [supabase]);

  const handleNext = (nextStep: CheckoutStep) => {
    // Validation
    if (step === "contact") {
      if (!email || !phone) {
        addToast({ title: "Please fill in contact details", type: "error" });
        return;
      }
    }

    if (step === "shipping") {
      if (!firstName || !lastName || !address || !city || !postalCode) {
        addToast({ title: "Please fill in all shipping details", type: "error" });
        return;
      }
    }

    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    if (selectedMethod !== "cod" && (!transactionId || !senderNumber)) {
      addToast({ title: "Please provide payment details.", type: "error" });
      return;
    }

    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    addToast({ title: "Order placed successfully!", type: "success" });
    clearCart();
    
    // Redirect to success/tracking page (we'll build this next)
    window.location.href = "/order-confirmed";
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast({ title: "Copied to clipboard", type: "success" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left Column - Forms */}
      <div className="flex-1 flex flex-col border-r border-foreground/5 md:min-h-screen">
        <header className="px-6 md:px-16 pt-8 pb-4">
          <Link href="/" className="text-2xl font-serif text-foreground">
            VELQOR
          </Link>
          
          <nav className="flex items-center gap-2 mt-6 text-xs text-foreground-secondary">
            <span className={cn("font-medium", step === "contact" ? "text-foreground" : "text-green-600")}>Contact</span>
            <ChevronRight className="w-3 h-3" />
            <span className={cn("font-medium", step === "shipping" ? "text-foreground" : (step === "payment" ? "text-green-600" : ""))}>Shipping</span>
            <ChevronRight className="w-3 h-3" />
            <span className={cn("font-medium", step === "payment" && "text-foreground")}>Payment</span>
          </nav>
        </header>

        <main className="flex-1 px-6 md:px-16 py-8 max-w-xl pb-24">
          <AnimatePresence mode="wait">
            {step === "contact" && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col gap-6"
              >
                <div className="flex justify-between items-end">
                  <h2 className="text-2xl font-serif">Contact Information</h2>
                  <span className="text-sm text-foreground-secondary">
                    Already have an account? <Link href="/login" className="text-foreground underline">Log in</Link>
                  </span>
                </div>
                <Input 
                  label="Email address" 
                  type="email" 
                  placeholder="example@mail.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input 
                  label="Phone number" 
                  type="tel" 
                  placeholder="01XXX-XXXXXX" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                
                <div className="mt-4">
                  <Button variant="primary" size="lg" className="w-full" onClick={() => handleNext("shipping")}>
                    Continue to Shipping
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "shipping" && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col gap-6"
              >
                <h2 className="text-2xl font-serif">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="First name" 
                    placeholder="Atiq" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <Input 
                    label="Last name" 
                    placeholder="Rahman" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <Input 
                  label="Address" 
                  placeholder="House 12, Road 4, Sector 7" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <Input label="Apartment, suite, etc. (optional)" />
                <div className="grid grid-cols-3 gap-4">
                  <Input 
                    label="City" 
                    className="col-span-2" 
                    placeholder="Dhaka" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <Input 
                    label="Postal code" 
                    placeholder="1230" 
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </div>

                <div className="space-y-3 mt-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">Delivery Region</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      onClick={() => setDeliveryLocation("inside")}
                      className={cn(
                        "p-4 border rounded-xl cursor-pointer transition-all flex items-center justify-between",
                        deliveryLocation === "inside" 
                          ? "border-blue-600 bg-blue-50/10 ring-1 ring-blue-600 shadow-sm" 
                          : "border-foreground/5 hover:border-foreground/20"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-4 h-4 rounded-full border flex items-center justify-center",
                          deliveryLocation === "inside" ? "border-blue-600" : "border-foreground/20"
                        )}>
                          {deliveryLocation === "inside" && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                        </div>
                        <span className="text-sm font-medium">Inside Dhaka</span>
                      </div>
                      <span className="text-xs font-bold text-foreground">৳80</span>
                    </div>
                    <div 
                      onClick={() => setDeliveryLocation("outside")}
                      className={cn(
                        "p-4 border rounded-xl cursor-pointer transition-all flex items-center justify-between",
                        deliveryLocation === "outside" 
                          ? "border-blue-600 bg-blue-50/10 ring-1 ring-blue-600 shadow-sm" 
                          : "border-foreground/5 hover:border-foreground/20"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-4 h-4 rounded-full border flex items-center justify-center",
                          deliveryLocation === "outside" ? "border-blue-600" : "border-foreground/20"
                        )}>
                          {deliveryLocation === "outside" && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                        </div>
                        <span className="text-sm font-medium">Outside Dhaka</span>
                      </div>
                      <span className="text-xs font-bold text-foreground">৳130</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-4">
                  <Button variant="outline" size="lg" className="w-1/3 border-none" onClick={() => handleNext("contact")}>
                    Back
                  </Button>
                  <Button variant="primary" size="lg" className="w-2/3" onClick={() => handleNext("payment")}>
                    Continue to Payment
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "payment" && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col gap-6"
              >
                <h2 className="text-2xl font-serif">Payment</h2>
                <p className="text-sm text-foreground-secondary mb-2">Select your preferred payment method and follow the instructions.</p>
                
                <div className="flex flex-col gap-3">
                  {(Object.keys(PAYMENT_METHODS) as MfsMethod[]).map((method) => (
                    <div 
                      key={method}
                      onClick={() => setSelectedMethod(method)}
                      className={cn(
                        "p-4 border rounded-xl cursor-pointer transition-all flex items-center justify-between",
                        selectedMethod === method 
                          ? "border-blue-600 bg-blue-50/10 ring-1 ring-blue-600" 
                          : "border-foreground/5 hover:border-foreground/20"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-4 h-4 rounded-full border flex items-center justify-center",
                          selectedMethod === method ? "border-blue-600" : "border-foreground/20"
                        )}>
                          {selectedMethod === method && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                        </div>
                        <span className="font-medium text-sm">{PAYMENT_METHODS[method].name}</span>
                      </div>
                      {"logo" in PAYMENT_METHODS[method] && PAYMENT_METHODS[method].logo && (
                        <div className="h-6 w-12 relative grayscale opacity-60">
                           <Image 
                            src={PAYMENT_METHODS[method].logo as string} 
                            alt={PAYMENT_METHODS[method].name} 
                            fill 
                            className={cn("object-contain", selectedMethod === method && "grayscale-0 opacity-100")} 
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {selectedMethod !== "cod" && (
                    <motion.div
                      key={selectedMethod}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-[#F5F5F0] rounded-xl p-6 flex flex-col gap-4 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold uppercase tracking-wider text-black/40">MARCHANT {PAYMENT_METHODS[selectedMethod].name} Number</span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">{PAYMENT_METHODS[selectedMethod].type}</span>
                        </div>
                        <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-black/5">
                          <span className="text-lg font-mono font-bold tracking-wider">{paymentNumbers[selectedMethod] || PAYMENT_METHODS[selectedMethod].number}</span>
                          <button onClick={() => copyToClipboard(paymentNumbers[selectedMethod] || PAYMENT_METHODS[selectedMethod].number || "")} className="p-2 hover:bg-black/5 rounded-md transition-colors">
                            <Copy className="w-4 h-4 text-black/40" />
                          </button>
                        </div>
                        <p className="text-xs text-black/60 leading-relaxed italic">
                          <AlertCircle className="w-3 h-3 inline mr-1 mb-0.5" />
                          {PAYMENT_METHODS[selectedMethod].instructions}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          <Input 
                            label="Your Number" 
                            placeholder="01XXX-XXXXXX" 
                            value={senderNumber}
                            onChange={(e) => setSenderNumber(e.target.value)}
                          />
                          <Input 
                            label="Transaction ID" 
                            placeholder="8J9K2L1M..." 
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-4 flex gap-4">
                  <Button variant="outline" size="lg" className="w-1/3 border-none" onClick={() => handleNext("shipping")}>
                    Back
                  </Button>
                  <Button variant="primary" size="lg" className="w-2/3" onClick={handlePlaceOrder} disabled={isProcessing}>
                    {isProcessing ? "Processing..." : `Place Order — ${formatCurrency(total)}`}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Right Column - Order Summary (Same as before but cleaned up) */}
      <div className="w-full md:w-[45%] lg:w-[40%] bg-[#F5F5F0]/50 px-6 md:px-12 py-8 md:min-h-screen">
        <div className="sticky top-8 flex flex-col gap-6">
          <h2 className="text-xl font-serif border-b border-foreground/5 pb-4 hidden md:block">Order Summary</h2>
          
          <div className="flex flex-col gap-4 max-h-[40vh] overflow-y-auto pr-2 hide-scrollbar">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantId}`} className="flex gap-4 items-center">
                <div className="relative w-16 h-16 bg-white rounded-md overflow-hidden shrink-0 border border-foreground/5">
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-bold z-10 shadow-sm">
                    {item.quantity}
                  </div>
                </div>
                <div className="flex-1 flex flex-col">
                  <span className="text-sm font-medium">{item.title}</span>
                  {item.variantName && <span className="text-xs text-foreground-secondary">{item.variantName}</span>}
                </div>
                <span className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-foreground/5 pt-6 flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm text-foreground-secondary">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-foreground-secondary">
              <span>Shipping</span>
              <span>{formatCurrency(shipping)}</span>
            </div>
          </div>

          <div className="border-t border-foreground/5 pt-6 flex justify-between items-center">
            <span className="text-lg font-medium text-foreground">Total</span>
            <div className="flex items-end gap-2">
              <span className="text-xs text-foreground-secondary mb-1">BDT</span>
              <span className="text-2xl font-bold text-foreground">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 text-xs leading-relaxed">
            <p><strong>Note:</strong> After placing the order, our team will verify your transaction. You can track your order status in real-time.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
