export interface PaymentMethod {
  name: string;
  instructions: string;
  number?: string;
  type?: string;
  logo?: string;
}

export const PAYMENT_METHODS: Record<string, PaymentMethod> = {
  bkash: {
    name: "bKash",
    number: "017XX-XXXXXX",
    type: "Personal (Send Money)",
    instructions: "Please send the total amount to the number above using the 'Send Money' option in your bKash app.",
    logo: "https://logos-download.com/wp-content/uploads/2022/01/BKash_Logo.png"
  },
  nagad: {
    name: "Nagad",
    number: "018XX-XXXXXX",
    type: "Personal (Send Money)",
    instructions: "Please send the total amount to the number above using the 'Send Money' option in your Nagad app.",
    logo: "https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png"
  },
  rocket: {
    name: "Rocket",
    number: "019XX-XXXXXX",
    type: "Personal (Send Money)",
    instructions: "Please send the total amount to the number above using the 'Send Money' option in your Rocket app.",
    logo: "https://www.logo.wine/a/logo/Dutch-Bangla_Bank/Dutch-Bangla_Bank-Rocket-Logo.wine.svg"
  },
  cod: {
    name: "Cash on Delivery",
    instructions: "Pay with cash when your order is delivered to your doorstep."
  }
};
