import { Link, useRouterState } from "@tanstack/react-router";
import { FileText, History, LayoutDashboard, Package, Receipt } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Painel", icon: LayoutDashboard },
  { to: "/novo", label: "Criar", icon: FileText },
  { to: "/catalogo", label: "Catálogo", icon: Package },
  { to: "/historico", label: "Histórico", icon: History },
] as const;

export function AppLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <header className="gradient-brand text-primary-foreground">
        <div className="mx-auto w-full max-w-5xl px-5 pt-6 pb-10">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary-foreground/15">
                <Receipt className="size-5" />
              </span>
              <span className="text-lg font-extrabold tracking-tight">ReciboJá</span>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.to
                      ? "bg-primary-foreground/20"
                      : "opacity-80 hover:bg-primary-foreground/10 hover:opacity-100",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-6">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
            {subtitle ? (
              <p className="mt-1 text-sm opacity-80 md:text-base">{subtitle}</p>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto -mt-6 w-full max-w-5xl px-5">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-5xl grid-cols-4">
          {nav.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors",
                  active ? "text-accent" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
