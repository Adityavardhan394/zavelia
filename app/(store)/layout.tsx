import { Toaster } from "sonner";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { StoreFooter } from "@/components/layout/store-footer";
import { StoreHeader } from "@/components/layout/store-header";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AnnouncementBar />
      <StoreHeader />
      <main className="flex-1">{children}</main>
      <StoreFooter />
      <Toaster
        position="top-center"
        toastOptions={{
          className:
            "font-[family-name:var(--font-sans)] border-[var(--color-champagne)]",
        }}
      />
    </>
  );
}
