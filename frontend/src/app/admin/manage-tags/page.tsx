"use client";

import { useState, useEffect } from "react";
import { 
  QrCode, 
  ArrowLeft,
  Loader2,
  AlertCircle,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  User,
  Link as LinkIcon
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminManageTagsPage() {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  
  const router = useRouter();

  const fetchTags = async () => {
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    try {
      const res = await fetch(`${apiUrl}/api/admin/tags`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.status === 403) {
        router.push("/dashboard");
        return;
      }

      if (res.ok) {
        setTags(await res.json());
      } else {
        setError("Биркалар тізімін алу мүмкін болмады");
      }
    } catch (err) {
      console.error(err);
      setError("Сервермен байланыс үзілді");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [router]);

  const handleUnlink = async (tagId: string) => {
    if (!confirm("Бұл бирканы иесінен ажыратуды растайсыз ба?")) return;
    
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    try {
      const res = await fetch(`${apiUrl}/api/admin/tags/${tagId}/unlink`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        fetchTags();
      } else {
        alert("Қате орын алды");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTags = tags.filter(t => {
    const matchesSearch = t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "All" || t.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
              <QrCode className="text-orange-600" size={36} />
              Биркаларды басқару
            </h1>
            <p className="text-gray-500 mt-1 font-medium">Жүйедегі барлық биркалар тізімі</p>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Tag ID бойынша іздеу..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-white border border-gray-100 rounded-[2rem] soft-shadow focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            />
          </div>
          <div className="flex gap-2">
            {["All", "ACTIVE", "INACTIVE", "LOST"].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all ${
                  filterStatus === s 
                  ? "bg-gray-900 text-white border-gray-900 shadow-lg" 
                  : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
                }`}
              >
                {s === "All" ? "Барлығы" : s}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[3rem] soft-shadow border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-10 py-6 font-black uppercase tracking-widest text-gray-400 text-xs">Бирка (ID)</th>
                <th className="px-10 py-6 font-black uppercase tracking-widest text-gray-400 text-xs">Мәртебесі</th>
                <th className="px-10 py-6 font-black uppercase tracking-widest text-gray-400 text-xs">Иесі (User ID)</th>
                <th className="px-10 py-6 font-black uppercase tracking-widest text-gray-400 text-xs">Әрекеттер</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTags.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                        <QrCode size={20} />
                      </div>
                      <div>
                        <p className="font-black text-gray-900">{t.id.substring(0, 8)}...</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.tag_type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      t.status === 'ACTIVE' 
                        ? 'bg-green-50 text-green-600 border-green-100' 
                        : t.status === 'LOST'
                        ? 'bg-red-50 text-red-600 border-red-100'
                        : 'bg-gray-50 text-gray-400 border-gray-100'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    {t.user_id ? (
                      <div className="flex items-center gap-2 text-gray-700 font-bold text-xs">
                        <User size={14} className="text-gray-300" />
                        {t.user_id.substring(0, 8)}...
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300 font-bold italic">Байланбаған</span>
                    )}
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex gap-2">
                      <Link 
                        href={`/t/${t.id}`} 
                        target="_blank"
                        className="p-3 bg-gray-50 text-gray-400 hover:text-blue-600 rounded-xl transition-all"
                      >
                        <ExternalLink size={18} />
                      </Link>
                      {t.user_id && (
                        <button 
                          onClick={() => handleUnlink(t.id)}
                          className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 rounded-xl transition-all"
                          title="Unlink from user"
                        >
                          <LinkIcon size={18} className="rotate-45" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTags.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-10 py-20 text-center text-gray-400 font-bold">
                    Биркалар табылмады
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
