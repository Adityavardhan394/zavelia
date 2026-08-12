import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-rose-gold)]">
        404
      </p>
      <h1 className="font-heading mt-3 text-4xl">Page not found</h1>
      <p className="mt-3 text-sm text-[var(--color-espresso)]/70">
        The page you are looking for is unavailable or has moved.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Return home</Link>
      </Button>
    </div>
  );
}
