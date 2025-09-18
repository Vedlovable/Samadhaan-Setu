"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const links = [
    { href: "/dashboard", label: "Dashboard", show: !!user },
    { href: "/report", label: "Report Issue", show: user?.role === "citizen" },
    { href: "/admin", label: "Admin", show: user?.role === "admin" },
  ].filter((l) => l.show);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">SS</span>
          <span className="font-semibold">Samadhaan Setu</span>
        </Link>
        <nav className="hidden gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm transition-colors hover:text-foreground ${pathname === l.href ? "text-foreground" : "text-muted-foreground"}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {!user ? (
            <Button size="sm" onClick={() => router.push("/login")}>Login</Button>
          ) : (
            <>
              <span className="hidden text-sm text-muted-foreground md:inline">{user.name}</span>
              <Button size="sm" variant="outline" onClick={() => { logout(); router.push("/login"); }}>Logout</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}