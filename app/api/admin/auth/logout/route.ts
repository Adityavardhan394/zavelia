import { signOut } from "@/lib/auth";
import { ok } from "@/lib/utils/api";

export async function POST() {
  await signOut({ redirect: false });
  return ok({ ok: true });
}
