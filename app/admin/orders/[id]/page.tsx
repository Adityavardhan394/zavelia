import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { absoluteUrl } from "@/lib/utils/cn";
import {
  OrderDetailClient,
  type OrderDetail,
} from "@/components/admin/order-detail-client";

export const metadata = { title: "Order detail" };
export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const { id } = await params;
  const [order, settings] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
      },
    }),
    prisma.siteSettings.findFirst(),
  ]);

  if (!order) notFound();

  const detail: OrderDetail = {
    ...order,
    shippingAddressSnapshot:
      (order.shippingAddressSnapshot as OrderDetail["shippingAddressSnapshot"]) ??
      {},
  };

  return (
    <OrderDetailClient
      order={detail}
      whatsappNumber={
        settings?.whatsappDisplayNumber ||
        process.env.WHATSAPP_BUSINESS_NUMBER ||
        ""
      }
      siteUrl={absoluteUrl()}
    />
  );
}
