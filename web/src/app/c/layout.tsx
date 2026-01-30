"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/c/cloud/api-keys", label: "API Keys" },
  { href: "/c/cloud/usage", label: "Usage" },
  { href: "/c/cloud/billing", label: "Billing" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="mx-auto flex w-full max-w-[1080px] flex-1 px-4">
        {/* Sidebar */}
        <aside className="w-52 shrink-0 border-r border-border">
          <nav className="py-4 pr-4">
            <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
              Cloud Dashboard
            </h2>
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                      pathname === item.href
                        ? "bg-foreground text-background"
                        : "hover:bg-accent"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 py-4 pl-4">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
