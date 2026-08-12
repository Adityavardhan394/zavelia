import { Cormorant_Garamond, Inter } from "next/font/google";
import { requireAdmin } from "@/lib/auth";
import { AdminShellWrapper } from "@/components/admin/admin-shell";
import "./admin.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-admin-display",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-admin-sans",
});

export const metadata = {
  title: {
    default: "Admin · ZAVÉLIA",
    template: "%s · ZAVÉLIA Admin",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Soft lookup only — pages enforce redirect. Shell uses pathname for login chrome.
  const user = await requireAdmin();

  return (
    <div className={`${display.variable} ${sans.variable}`}>
      <AdminShellWrapper
        user={user ? { name: user.name, email: user.email } : null}
      >
        {children}
      </AdminShellWrapper>
    </div>
  );
}
