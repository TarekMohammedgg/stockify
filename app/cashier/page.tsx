import { getOrders, getLowStock } from "@/lib/actions/cashier";
import { OrdersPanel } from "./orders-panel";

export default async function CashierHomePage() {
  const [orders, lowStock] = await Promise.all([getOrders(), getLowStock()]);

  return <OrdersPanel initialOrders={orders} lowStock={lowStock} />;
}
