"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  ArrowLeft,
  Loader2,
  AlertCircle,
  Mail,
  Calendar,
  Shield,
  Search
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/auth";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      
      try {
        const res = await fetch(`${API_URL}/api/admin/users`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.status === 403) {
          router.push("/dashboard");
          return;
        }

        if (res.ok) {
          setUsers(await res.json());
        } else {
          setError("Қолданушылар тізімін алу мүмкін болмады");
        }
      } catch (err) {
        console.error(err);
        setError("Сервермен байланыс үзілді");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [router]);

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center gap-6 mb-12">
          <Link href="/admin" className="p-3 bg-white rounded-2xl soft-shadow text-gray-400 hover:text-gray-900 transition-all">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
              <Users className="text-green-600" size={36} />
              Қолданушылар
            </h1>
            <p className="text-gray-500 mt-1 font-medium">Тіркелген қолданушылар тізімі</p>
          </div>
        </header>

        {error && (
          <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-[2rem] flex items-center gap-4 text-red-600 font-bold">
            <AlertCircle size={24} />
            {error}
          </div>
        )}

        <div className="relative mb-8">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Email бойынша іздеу..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-white border border-gray-100 rounded-[2rem] soft-shadow focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
          />
        </div>

        <div className="bg-white rounded-[3rem] soft-shadow border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-10 py-6 font-black uppercase tracking-widest text-gray-400 text-xs">Қолданушы</th>
                <th className="px-10 py-6 font-black uppercase tracking-widest text-gray-400 text-xs">Мәртебесі</th>
                <th className="px-10 py-6 font-black uppercase tracking-widest text-gray-400 text-xs">Тіркелген күні</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                        <Mail size={20} />
                      </div>
                      <div>
                        <p className="font-black text-gray-900">{u.email}</p>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">ID: {u.id.substring(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    {u.is_admin ? (
                      <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-2 w-fit">
                        <Shield size={12} /> Admin
                      </span>
                    ) : (
                      <span className="px-4 py-1.5 bg-gray-50 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100 w-fit block">
                        User
                      </span>
                    )}
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2 text-gray-500 font-medium">
                      <Calendar size={16} className="text-gray-300" />
                      {new Date(u.created_at).toLocaleDateString('kk-KZ')}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-10 py-20 text-center text-gray-400 font-bold">
                    Қолданушылар табылмады
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
