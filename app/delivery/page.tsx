import { listDeliveryOrders } from "@/lib/actions/delivery";
import DeliveryPanel from "./delivery-panel";

export default async function DeliveryPage() {
  let initialOrders: Awaited<ReturnType<typeof listDeliveryOrders>> = [];
  try {
    initialOrders = await listDeliveryOrders();
  } catch (err) {
    console.error("[DeliveryPage] listDeliveryOrders", err);
  }
  return <DeliveryPanel initialOrders={initialOrders} />;
}
