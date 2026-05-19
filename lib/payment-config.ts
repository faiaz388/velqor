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
    logo: "https://freelogopng.com/images/all_img/1690557451bkash-logo-png.png"
  },
  nagad: {
    name: "Nagad",
    number: "018XX-XXXXXX",
    type: "Personal (Send Money)",
    instructions: "Please send the total amount to the number above using the 'Send Money' option in your Nagad app.",
    logo: "https://freelogopng.com/images/all_img/1690557522nagad-logo-png.png"
  },
  rocket: {
    name: "Rocket",
    number: "019XX-XXXXXX",
    type: "Personal (Send Money)",
    instructions: "Please send the total amount to the number above using the 'Send Money' option in your Rocket app.",
    logo: "https://freelogopng.com/images/all_img/1690557600rocket-logo-png.png"
  },
  cod: {
    name: "Cash on Delivery",
    instructions: "Pay with cash when your order is delivered to your doorstep."
  }
};
