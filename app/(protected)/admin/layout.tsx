import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Calendar, CreditCard, Bell, Shield, Home, Mail, FileText, ChevronRight, Store, Users2, MessageSquare, Trophy } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/admin" },
    { icon: Users, label: "Utilisateurs", href: "/admin/users" },
    { icon: Calendar, label: "Événements", href: "/admin/events" },
    { icon: Trophy, label: "Concours Rédaction", href: "/admin/concours" }, // ✅ Onglet Concours
    { icon: FileText, label: "Articles", href: "/admin/posts" },
    { icon: CreditCard, label: "Transactions", href: "/admin/transactions" },
    { icon: Mail, label: "Emails", href: "/admin/emails" },
    { icon: Users2, label: "Limites collaborateurs", href: "/admin/collaborator-limits" },
    { icon: Bell, label: "Notifications", href: "/admin/notifications" },
    { icon: Store, label: "Boutiques", href: "/admin/shops" }, // ✅ Ajout
    { icon: MessageSquare, label: "Configuration WhatsApp", href: "/admin/whatsapp" },
  ];

  const adminName = session.user.name || session.user.email || "Administrateur";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-[1600px] p-3 md:p-5 xl:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
          <aside className="lg:w-75 shrink-0">
            <div className="flex h-full min-h-[calc(100vh-1.5rem)] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white/90 shadow-2xl shadow-slate-200/60 backdrop-blur dark:border-white/10 dark:bg-slate-900/90 dark:shadow-slate-950/40 xl:min-h-[calc(100vh-3rem)]">
              <div className="border-b border-slate-200 bg-linear-to-r from-sky-500/15 via-indigo-500/10 to-violet-500/15 p-5 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-sky-500 to-violet-500 text-white shadow-lg shadow-sky-500/20">
                    <Shield size={22} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600 dark:text-sky-300">Admin</p>
                    <h1 className="truncate text-lg font-semibold text-slate-900 dark:text-white">{adminName}</h1>
                  </div>
                </div>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 py-4">
                <div className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="group flex items-center justify-between gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sky-600 group-hover:bg-sky-500/15 dark:bg-white/5 dark:text-sky-300">
                            <Icon size={18} />
                          </span>
                          <span className="truncate">{item.label}</span>
                        </span>
                        <ChevronRight size={16} className="text-slate-400 group-hover:text-sky-600 dark:text-slate-500 dark:group-hover:text-sky-300" />
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </div>
          </aside>

          <main className="min-w-0 flex-1 overflow-hidden rounded-[28px] border border-slate-200 bg-white/80 shadow-2xl shadow-slate-200/50 backdrop-blur dark:border-white/10 dark:bg-slate-900/70 dark:shadow-slate-950/30">
            <div className="h-full min-h-[calc(100vh-1.5rem)] overflow-auto p-4 md:p-6 xl:p-7">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}