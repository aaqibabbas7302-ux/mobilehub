"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Smartphone, 
  Users, 
  ShoppingCart, 
  MessageSquare, 
  Settings,
  Phone,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  Zap,
  Loader2,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Inventory", href: "/admin/inventory", icon: Smartphone },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Leads", href: "/admin/leads", icon: UserPlus, badge: "New" },
  { name: "Marketing", href: "/admin/marketing", icon: Zap },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "WhatsApp", href: "/admin/conversations", icon: Phone },
  { name: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<{ username: string; full_name?: string; role?: string } | null>(null);

  // Check authentication on mount
  useEffect(() => {
    // Skip auth check for login page
    if (pathname === "/admin/login") {
      setIsLoading(false);
      return;
    }

    const checkAuth = () => {
      const sessionStr = localStorage.getItem("admin_session");
      if (sessionStr) {
        try {
          const session = JSON.parse(sessionStr);
          setAdminUser({
            username: session.username || "Admin",
            full_name: session.full_name,
            role: session.role,
          });
          setIsAuthenticated(true);
        } catch {
          router.push("/admin/login");
        }
      } else {
        router.push("/admin/login");
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    router.push("/admin/login");
  };

  // Show login page without layout
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render layout if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 bottom-0 w-72 glass border-r border-gray-800 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <Link href="/admin" className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500 blur-lg opacity-50" />
                  <div className="relative bg-gradient-to-br from-orange-500 to-red-600 p-2.5 rounded-xl">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <span className="text-lg font-bold">MobileHub</span>
                  <span className="block text-[10px] text-orange-500 uppercase tracking-wider">Admin Panel</span>
                </div>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/admin" && pathname.startsWith(item.href));
              
              return (
                <Link key={item.name} href={item.href} onClick={() => setSidebarOpen(false)}>
                  <div className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-orange-500/20 to-red-500/10 text-orange-500 border border-orange-500/20' 
                      : 'hover:bg-white/5 text-gray-400 hover:text-white'
                  }`}>
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : ''}`} />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {item.badge && (
                      <Badge className="bg-orange-500 text-white border-0 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    {isActive && (
                      <ChevronRight className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="p-4 border-t border-gray-800">
            {/* User Info */}
            {adminUser && (
              <div className="glass-card rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white font-semibold">
                    {(adminUser.full_name || adminUser.username).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{adminUser.full_name || adminUser.username}</p>
                    <p className="text-xs text-gray-500 capitalize">{adminUser.role?.replace("_", " ") || "Admin"}</p>
                  </div>
                </div>
              </div>
            )}
            
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/5">
                <LogOut className="w-4 h-4 mr-3" />
                Back to Website
              </Button>
            </Link>
            
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 mt-2"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Header */}
        <header className="sticky top-0 z-30 glass border-b border-gray-800">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)} 
                className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input 
                  placeholder="Search inventory, orders..." 
                  className="w-80 pl-10 bg-white/5 border-gray-800 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-white/10 rounded-xl transition-colors">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
              </button>
              
              <div className="flex items-center gap-3 pl-4 border-l border-gray-800">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-sm font-bold">
                  {(adminUser?.full_name || adminUser?.username || "A").charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">{adminUser?.full_name || adminUser?.username || "Admin"}</p>
                  <p className="text-xs text-gray-500 capitalize">{adminUser?.role?.replace("_", " ") || "Administrator"}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="relative p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
