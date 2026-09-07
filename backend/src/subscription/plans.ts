export const PLANS = [
  { id: "free", name: "Free", price: 0, interval: "month", currency: "INR" },
  { id: "starter", name: "Starter", price: 999, interval: "month", currency: "INR" },
  { id: "pro", name: "Pro", price: 999, interval: "month", currency: "INR" },
  { id: "growth", name: "Growth", price: 2999, interval: "month", currency: "INR" },
  { id: "business", name: "Business", price: 7999, interval: "month", currency: "INR" },
  { id: "enterprise", name: "Enterprise", price: 25000, interval: "month", currency: "INR" },
] as const;

export type PlanId = typeof PLANS[number]["id"];

export function getPlanById(id: string) {
  return PLANS.find((p) => p.id === id) || null;
}
