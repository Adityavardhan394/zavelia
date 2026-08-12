import { Suspense } from "react";
import AdminLoginForm from "./login-form";

export const metadata = { title: "Login" };

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-[var(--color-espresso)]/60">
          Loading…
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
