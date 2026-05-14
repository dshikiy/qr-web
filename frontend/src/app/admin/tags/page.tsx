"use client";

import { useState } from "react";
import { 
  QrCode, 
  Plus, 
  Download, 
  ArrowLeft,
  Loader2,
  Copy,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminTagsPage() {
  const [count, setCount] = useState(50);
  const [loading, setLoading] = useState(false);
  const [generatedTags, setGeneratedTags] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setGeneratedTags([]);
    
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    try {
      const res = await fetch(`${apiUrl}/api/admin/tags/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ count })
      });
      
      if (res.ok) {
        setGeneratedTags(await res.json());
      } else {
        const data = await res.json();
        setError(data.detail || "Генерация сәтсіз аяқталды");
      }
    } catch (err) {
      console.error(err);
      setError("Сервермен байланыс үзілді");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const text = generatedTags.map(t => t.url).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,ID,URL\n" 
      + generatedTags.map(t => `${t.id},${t.url}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `safetags_batch_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center gap-6 mb-12">
          <Link href="/admin" className="p-3 bg-white rounded-2xl soft-shadow text-gray-400 hover:text-gray-900 transition-all">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-gray-900">Factory Mode</h1>
            <p className="text-gray-500 mt-1 font-medium">Биркаларды партиямен генерациялау</p>
          </div>
        </header>

        <div className="bg-white rounded-[2.5rem] p-10 soft-shadow border border-gray-100 mb-8">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Биркалар саны</label>
              <div className="flex gap-4">
                <input 
                  type="number" 
                  min="1" 
                  max="1000"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  className="flex-1 px-6 py-4 bg-gray-50 border border-gray-border rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-xl"
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-gray-800 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={24} /> : <Plus size={24} />}
                  Генерациялау
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-3 px-1">Бір уақытта ең көбі 1000 дана генерациялауға болады.</p>
            </div>
          </form>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-[2rem] flex items-center gap-4 text-red-600 font-bold">
            <AlertCircle size={24} />
            {error}
          </div>
        )}

        {generatedTags.length > 0 && (
          <div className="bg-white rounded-[2.5rem] p-10 soft-shadow border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-gray-900">Нәтиже: {generatedTags.length} дана</h2>
              <div className="flex gap-3">
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl font-bold transition-all text-sm"
                >
                  {copied ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
                  Көшіру
                </button>
                <button 
                  onClick={downloadCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl font-bold transition-all text-sm"
                >
                  <Download size={18} />
                  CSV жүктеу
                </button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto border border-gray-border rounded-2xl bg-gray-50 font-mono text-xs">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white border-b border-gray-border">
                  <tr>
                    <th className="px-6 py-4 font-black uppercase tracking-widest text-gray-400">UUID</th>
                    <th className="px-6 py-4 font-black uppercase tracking-widest text-gray-400">URL</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedTags.map((tag) => (
                    <tr key={tag.id} className="border-b border-gray-100 last:border-0">
                      <td className="px-6 py-4 text-gray-600">{tag.id}</td>
                      <td className="px-6 py-4 text-blue-600">{tag.url}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
