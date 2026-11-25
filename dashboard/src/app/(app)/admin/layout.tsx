import { redirect } from "next/navigation";
import { ADMIN_EMAIL, getSessionUser } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin" || user.email !== ADMIN_EMAIL) redirect("/dashboard");
  return <>{children}</>;
}
