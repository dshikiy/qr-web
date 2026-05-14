"use client";

import { QrCode, User, Settings, LogOut, LayoutDashboard, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-light flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-border flex flex-col p-8 fixed h-full">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <span className="font-black text-2xl tracking-tighter">SAFETAG</span>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <Link 
            href="/dashboard" 
            className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${pathname === '/dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <LayoutDashboard size={20} />
            Басты бет
          </Link>
          <Link 
            href="/dashboard" 
            className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${pathname === '/dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <QrCode size={20} />
            Менің биркаларым
          </Link>
          <Link 
            href="/dashboard/profiles" 
            className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${pathname === '/dashboard/profiles' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <User size={20} />
            Менің профилім
          </Link>
          <Link 
            href="/dashboard/settings" 
            className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${pathname === '/dashboard/settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <Settings size={20} />
            Баптаулар
          </Link>
        </nav>

        <div className="pt-8 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-50 font-bold transition-all w-full text-left"
          >
            <LogOut size={20} />
            Шығу
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-12">
        {children}
      </main>
    </div>
  );
}
