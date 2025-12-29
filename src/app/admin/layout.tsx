"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Smartphone,
  Users,
  ShoppingCart,
  MessageSquare,
  Settings,
  Menu,
  X,
  Phone,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/inventory", label: "Inventory", icon: Smartphone },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">MobileHub</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-1">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href || 
                (link.href !== "/admin" && pathname.startsWith(link.href));
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <link.icon className={cn("h-5 w-5", isActive ? "text-blue-600" : "text-gray-400")} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <Separator className="my-4" />

          <div className="px-4">
            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <p className="text-xs font-medium opacity-90">Store Location</p>
              <p className="text-sm font-semibold mt-1">Nehru Place, Delhi</p>
              <p className="text-xs mt-2 opacity-75">+91 98765 43210</p>
            </div>
          </div>
        </ScrollArea>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center h-16 px-4 bg-white border-b border-gray-200 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1 flex items-center justify-between ml-4 lg:ml-0">
            <h1 className="text-lg font-semibold text-gray-900">
              {sidebarLinks.find(l => l.href === pathname)?.label || "Dashboard"}
            </h1>
            
            <div className="flex items-center gap-4">
              <Link href="/" target="_blank">
                <Button variant="outline" size="sm">
                  View Website
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                  A
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
