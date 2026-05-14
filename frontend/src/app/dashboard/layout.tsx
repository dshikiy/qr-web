"use client";

import { QrCode, User, Settings, LogOut, LayoutDashboard, ShieldCheck, Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Басты бет", href: "/dashboard" },
    { icon: QrCode, label: "Менің биркаларым", href: "/dashboard" },
    { icon: User, label: "Менің профилім", href: "/dashboard/profiles" },
    { icon: Settings, label: "Баптаулар", href: "/dashboard/settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <ShieldCheck className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tighter">SAFETAG</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-500">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-100 flex flex-col p-8 transition-transform duration-300 md:relative md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="hidden md:flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <ShieldCheck className="text-white w-7 h-7" />
          </div>
          <span className="font-black text-2xl tracking-tighter">SAFETAG</span>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {menuItems.map((item, idx) => {
            const isActive = pathname === item.href && (idx !== 0 || pathname === '/dashboard');
            // Specific logic: if idx 0 (Home) and idx 1 (Tags) both point to /dashboard, 
            // maybe we highlight them both or just the first one.
            // Let's just highlight based on exact href match for now.
            
            return (
              <Link 
                key={idx}
                href={item.href} 
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' 
                    : 'text-gray-400 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <item.icon size={22} className={isActive ? "" : "group-hover:scale-110 transition-transform"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="pt-8 mt-auto border-t border-gray-50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-50 font-black transition-all w-full text-left group"
          >
            <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
            Шығу
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 lg:p-16 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
