import { listAllOrders } from "@/lib/actions/admin";
import AdminOrdersPanel from "./orders-panel";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  let initialOrders: Awaited<ReturnType<typeof listAllOrders>> = [];
  try {
    initialOrders = await listAllOrders();
  } catch (err) {
    console.error("[AdminOrdersPage] listAllOrders", err);
  }
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <AdminOrdersPanel initialOrders={initialOrders} />
    </div>
  );
}
