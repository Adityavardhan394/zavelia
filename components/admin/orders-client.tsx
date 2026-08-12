"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/admin/data-table";
import { formatINRFromPaise } from "@/lib/utils/money";

const STATUSES = [
  "ALL",
  "WHATSAPP_PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

const PAYMENTS = ["ALL", "UNPAID", "COD_PENDING", "PAID", "REFUNDED"] as const;

export type OrderListItem = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalInPaise: number;
  createdAt: string | Date;
  customer: { name: string; phone: string };
};

export function OrdersClient({ orders }: { orders: OrderListItem[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("ALL");
  const [payment, setPayment] = useState<(typeof PAYMENTS)[number]>("ALL");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (status !== "ALL" && o.status !== status) return false;
      if (payment !== "ALL" && o.paymentStatus !== payment) return false;
      if (!query) return true;
      return (
        o.orderNumber.toLowerCase().includes(query) ||
        o.customer.name.toLowerCase().includes(query) ||
        o.customer.phone.includes(query)
      );
    });
  }, [orders, q, status, payment]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Search order #, name, phone…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-72"
          />
          <select
            className="h-11 rounded-md border border-[var(--color-champagne)] bg-white px-3 text-sm"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as (typeof STATUSES)[number])
            }
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "ALL" ? "All statuses" : s.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <select
            className="h-11 rounded-md border border-[var(--color-champagne)] bg-white px-3 text-sm"
            value={payment}
            onChange={(e) =>
              setPayment(e.target.value as (typeof PAYMENTS)[number])
            }
          >
            {PAYMENTS.map((p) => (
              <option key={p} value={p}>
                {p === "ALL" ? "All payments" : p.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <Button asChild variant="secondary">
          <a href="/api/admin/exports/orders">Export CSV</a>
        </Button>
      </div>

      <DataTable
        rows={filtered}
        rowKey={(o) => o.id}
        columns={[
          {
            key: "number",
            header: "Order",
            render: (o) => (
              <Link
                href={`/admin/orders/${o.id}`}
                className="font-medium text-[var(--color-rose-gold)] hover:underline"
              >
                {o.orderNumber}
              </Link>
            ),
          },
          {
            key: "customer",
            header: "Customer",
            render: (o) => (
              <div>
                <p>{o.customer.name}</p>
                <p className="text-xs text-[var(--color-espresso)]/50">
                  {o.customer.phone}
                </p>
              </div>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (o) => o.status.replaceAll("_", " "),
          },
          {
            key: "payment",
            header: "Payment",
            render: (o) => o.paymentStatus.replaceAll("_", " "),
          },
          {
            key: "total",
            header: "Total",
            render: (o) => formatINRFromPaise(o.totalInPaise),
          },
          {
            key: "date",
            header: "Created",
            render: (o) => format(new Date(o.createdAt), "dd MMM yyyy HH:mm"),
          },
        ]}
      />
    </div>
  );
}
