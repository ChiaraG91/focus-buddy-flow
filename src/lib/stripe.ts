// Stripe product & price mapping
export const STRIPE_PLANS = {
  yearly: {
    productId: "prod_U7MWp4yFRHOVyV",
    priceId: "price_1T97n1C8B4hBn89lY5poZpU4",
    name: "Premium Annuale",
    price: "29,99 €/anno",
    priceAmount: 29.99,
    interval: "anno",
  },
  lifetime: {
    productId: "prod_U7MYbMITL5y21Z",
    priceId: "price_1T97p2C8B4hBn89lAaIS9wX2",
    name: "Premium a Vita",
    price: "69,99 € una tantum",
    priceAmount: 69.99,
    interval: null,
  },
} as const;

export type PlanType = keyof typeof STRIPE_PLANS;
