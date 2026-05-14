"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  QrCode, 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  ArrowLeft,
  Loader2,
  AlertCircle,
  Check
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/auth";

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/admin/stats`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.status === 403) {
          router.push("/dashboard");
          return;
        }

        if (res.ok) {
          setStats(await res.json());
        } else {
          setError("Деректерді алу мүмкін болмады");
        }
      } catch (err) {
        console.error(err);
        setError("Сервермен байланыс үзілді");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

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
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="p-3 bg-white rounded-2xl soft-shadow text-gray-400 hover:text-gray-900 transition-all">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                <ShieldCheck className="text-blue-600" size={36} />
                Admin Panel
              </h1>
              <p className="text-gray-500 mt-1 font-medium">SafeTag жүйесін басқару</p>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-[2rem] flex items-center gap-4 text-red-600 font-bold">
            <AlertCircle size={24} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Stat Card 1 */}
          <div className="bg-white p-8 rounded-[2.5rem] soft-shadow border border-gray-100 group hover:border-blue-200 transition-all">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Users size={28} />
            </div>
            <p className="text-gray-400 font-black text-xs uppercase tracking-widest mb-1">Жалпы қолданушылар</p>
            <h3 className="text-5xl font-black text-gray-900">{stats?.total_users || 0}</h3>
            <div className="mt-4 flex items-center gap-2 text-green-500 font-bold text-sm">
              <TrendingUp size={16} />
              <span>Белсенді өсім</span>
            </div>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-white p-8 rounded-[2.5rem] soft-shadow border border-gray-100 group hover:border-orange-200 transition-all">
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-6 group-hover:bg-orange-600 group-hover:text-white transition-all">
              <QrCode size={28} />
            </div>
            <p className="text-gray-400 font-black text-xs uppercase tracking-widest mb-1">Барлық биркалар</p>
            <h3 className="text-5xl font-black text-gray-900">{stats?.total_tags || 0}</h3>
            <div className="mt-4 flex items-center gap-2 text-gray-400 font-bold text-sm">
              <Activity size={16} />
              <span>Жүйедегі қор қалдығы</span>
            </div>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-white p-8 rounded-[2.5rem] soft-shadow border border-gray-100 group hover:border-green-200 transition-all">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-6 group-hover:bg-green-600 group-hover:text-white transition-all">
              <ShieldCheck size={28} />
            </div>
            <p className="text-gray-400 font-black text-xs uppercase tracking-widest mb-1">Белсенді биркалар</p>
            <h3 className="text-5xl font-black text-gray-900">{stats?.active_tags || 0}</h3>
            <div className="mt-4 flex items-center gap-2 text-green-500 font-bold text-sm">
              <Check size={16} />
              <span>Қорғаныс астында</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Tags Factory */}
          <Link href="/admin/tags" className="bg-white p-8 rounded-[2.5rem] soft-shadow border border-gray-100 hover:border-blue-200 transition-all flex flex-col items-center text-center group">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <QrCode size={32} />
            </div>
            <h4 className="text-xl font-black text-gray-900 mb-2">Биркаларды генерациялау</h4>
            <p className="text-gray-400 text-sm font-medium">Партиямен жаңа QR кодтарды жасау және жүктеу</p>
          </Link>

          {/* Tags Management */}
          <Link href="/admin/manage-tags" className="bg-white p-8 rounded-[2.5rem] soft-shadow border border-gray-100 hover:border-orange-200 transition-all flex flex-col items-center text-center group">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-6 group-hover:bg-orange-600 group-hover:text-white transition-all">
              <Activity size={32} />
            </div>
            <h4 className="text-xl font-black text-gray-900 mb-2">Биркаларды басқару</h4>
            <p className="text-gray-400 text-sm font-medium">Жүйедегі барлық биркалардың тізімі мен күйі</p>
          </Link>

          {/* Users Management */}
          <Link href="/admin/users" className="bg-white p-8 rounded-[2.5rem] soft-shadow border border-gray-100 hover:border-green-200 transition-all flex flex-col items-center text-center group">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-6 group-hover:bg-green-600 group-hover:text-white transition-all">
              <Users size={32} />
            </div>
            <h4 className="text-xl font-black text-gray-900 mb-2">Қолданушылар тізімі</h4>
            <p className="text-gray-400 text-sm font-medium">Тіркелген қолданушыларды қарау және басқару</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
