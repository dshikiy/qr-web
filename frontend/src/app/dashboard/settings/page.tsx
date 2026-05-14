'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Shield, Bell, Globe, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/auth';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          setUser(await res.json());
        } else if (res.status === 401) {
          router.push('/login');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Құпия сөздер сәйкес келмейді");
      return;
    }
    if (newPassword.length < 6) {
      setError("Құпия сөз кемінде 6 таңбадан тұруы керек");
      return;
    }

    setSaving(true);
    setError("");
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${API_URL}/api/users/me/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ email: user.email, password: newPassword })
      });

      if (res.ok) {
        setSuccess(true);
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await res.json();
        setError(data.detail || "Құпия сөзді өзгерту мүмкін болмады");
      }
    } catch (err) {
      console.error(err);
      setError("Сервермен байланыс үзілді");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-gray-900">Баптаулар</h1>
        <p className="text-gray-500 mt-2 font-medium">Аккаунт пен жүйе баптауларын басқару</p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={20} />
          Сәтті сақталды!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Tabs (Desktop) */}
        <div className="md:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-6 py-4 bg-blue-50 text-blue-600 rounded-2xl font-bold transition-all text-left">
            <User size={20} />
            Профиль
          </button>
          <button className="w-full flex items-center gap-3 px-6 py-4 text-gray-400 hover:bg-gray-50 rounded-2xl font-bold transition-all text-left cursor-not-allowed opacity-50">
            <Shield size={20} />
            Қауіпсіздік
          </button>
          <button className="w-full flex items-center gap-3 px-6 py-4 text-gray-400 hover:bg-gray-50 rounded-2xl font-bold transition-all text-left cursor-not-allowed opacity-50">
            <Bell size={20} />
            Хабарламалар
          </button>
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-gray-border rounded-[2rem] p-8 soft-shadow">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
              <Mail className="text-blue-600" size={24} />
              Байланыс ақпараты
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Email мекенжайы</label>
                <input 
                  type="email" 
                  disabled 
                  value={user?.email || ""}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-border rounded-2xl text-gray-500 cursor-not-allowed font-medium"
                />
                <p className="text-xs text-gray-400 mt-2 px-1">Email мекенжайын өзгерту үшін қолдау көрсету орталығына хабарласыңыз.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="bg-white border border-gray-border rounded-[2rem] p-8 soft-shadow">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
              <Shield className="text-blue-600" size={24} />
              Құпия сөзді өзгерту
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Жаңа құпия сөз</label>
                <input 
                  type="password" 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-border rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Құпия сөзді растау</label>
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-border rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex justify-end pt-8">
              <button 
                type="submit"
                disabled={saving || !newPassword || !confirmPassword}
                className="w-full md:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-50 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : (success ? <CheckCircle2 size={20} /> : <Save size={20} />)}
                <span>{success ? "Сақталды!" : "Құпия сөзді жаңарту"}</span>
              </button>
            </div>
          </form>

          {/* Account Management */}
          <div className="bg-white border border-gray-border rounded-[2rem] p-8 soft-shadow border-red-50">
            <h2 className="text-xl font-bold mb-4 text-red-600">Қауіпті аймақ</h2>
            <p className="text-gray-500 text-sm mb-6">Аккаунтты жою қайтарылмайтын әрекет. Барлық деректеріңіз бен биркаларыңыз ажыратылады.</p>
            <button className="text-red-600 font-bold hover:underline">
              Аккаунтты жою
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
