import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { formatINRFromPaise } from "@/lib/utils/money";
import { availableStock } from "@/lib/utils/stock";
import { StatCard } from "@/components/admin/stat-card";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const [
    totalOrders,
    pendingWhatsapp,
    confirmedOrders,
    revenueOrders,
    activeProducts,
    variants,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "WHATSAPP_PENDING" } }),
    prisma.order.count({ where: { status: "CONFIRMED" } }),
    prisma.order.findMany({
      where: {
        status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] },
      },
      select: { totalInPaise: true },
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.productVariant.findMany({ where: { isActive: true } }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
  ]);

  const revenue = revenueOrders.reduce((s, o) => s + o.totalInPaise, 0);
  const outOfStock = variants.filter(
    (v) => availableStock(v.stockOnHand, v.stockReserved) <= 0,
  ).length;
  const lowStock = variants.filter((v) => {
    const a = availableStock(v.stockOnHand, v.stockReserved);
    return a > 0 && a <= v.lowStockThreshold;
  }).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="admin-brand text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--color-espresso)]/70">
          Welcome, {admin.name}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total orders" value={totalOrders} />
        <StatCard
          label="Pending WhatsApp"
          value={pendingWhatsapp}
          tone="warning"
          hint="Awaiting confirmation"
        />
        <StatCard label="Confirmed" value={confirmedOrders} tone="success" />
        <StatCard
          label="Revenue"
          value={formatINRFromPaise(revenue)}
          hint="Confirmed and onward"
        />
        <StatCard label="Active products" value={activeProducts} />
        <StatCard label="Out of stock" value={outOfStock} tone="danger" />
        <StatCard label="Low stock" value={lowStock} tone="warning" />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="admin-brand text-2xl">Recent orders</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-[var(--color-rose-gold)] hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="admin-card overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--admin-border)] bg-[var(--color-ivory)]/60">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-[var(--color-espresso)]/55"
                  >
                    No orders yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[var(--admin-border)]/60 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-[var(--color-rose-gold)] hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{order.customer.name}</td>
                    <td className="px-4 py-3">
                      {order.status.replaceAll("_", " ")}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {formatINRFromPaise(order.totalInPaise)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
