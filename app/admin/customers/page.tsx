import Link from "next/link";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { DataTable } from "@/components/admin/data-table";
import { formatINRFromPaise } from "@/lib/utils/money";

export const metadata = { title: "Customers" };
export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      _count: { select: { orders: true } },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { totalInPaise: true, createdAt: true, orderNumber: true },
      },
    },
  });

  const withSpend = await Promise.all(
    customers.map(async (c) => {
      const spend = await prisma.order.aggregate({
        where: {
          customerId: c.id,
          status: {
            in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
          },
        },
        _sum: { totalInPaise: true },
      });
      return {
        ...c,
        lifetimeSpend: spend._sum.totalInPaise ?? 0,
      };
    }),
  );

  return (
    <div className="space-y-4">
      <h1 className="admin-brand text-2xl">Customers</h1>
      <p className="text-sm text-[var(--color-espresso)]/60">
        Customers created through checkout. No public registration.
      </p>
      <DataTable
        rows={withSpend}
        rowKey={(c) => c.id}
        columns={[
          {
            key: "name",
            header: "Customer",
            render: (c) => (
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-[var(--color-espresso)]/50">
                  {c.email || "No email"}
                </p>
              </div>
            ),
          },
          { key: "phone", header: "Phone", render: (c) => c.phone },
          {
            key: "orders",
            header: "Orders",
            render: (c) => c._count.orders,
          },
          {
            key: "spend",
            header: "Lifetime (confirmed)",
            render: (c) => formatINRFromPaise(c.lifetimeSpend),
          },
          {
            key: "last",
            header: "Last order",
            render: (c) =>
              c.orders[0] ? (
                <Link
                  href={`/admin/orders`}
                  className="text-[var(--color-rose-gold)] hover:underline"
                >
                  {c.orders[0].orderNumber} ·{" "}
                  {format(c.orders[0].createdAt, "dd MMM yyyy")}
                </Link>
              ) : (
                "—"
              ),
          },
        ]}
      />
    </div>
  );
}
