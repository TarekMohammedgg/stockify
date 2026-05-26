import { listDeliveryOrders } from "@/lib/actions/delivery";
import DeliveryPanel from "./delivery-panel";

export default async function DeliveryPage() {
  const initialOrders = await listDeliveryOrders();
  return <DeliveryPanel initialOrders={initialOrders} />;
}
