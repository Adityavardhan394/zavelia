import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { OrdersClient } from "@/components/admin/orders-client";

export const metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      customer: { select: { name: true, phone: true } },
    },
  });

  return <OrdersClient orders={orders} />;
}
