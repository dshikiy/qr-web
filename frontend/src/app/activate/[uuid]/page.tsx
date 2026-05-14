"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  QrCode, 
  UserPlus, 
  ShieldCheck, 
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface Profile {
  id: string;
  name: string;
  phone_number: string;
}

export default function ActivatePage({ params }: { params: Promise<{ uuid: string }> }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState("");
  const [tagType, setTagType] = useState("KIDS");
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState("");
  const [showNewProfile, setShowNewProfile] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { uuid } = use(params);

  useEffect(() => {
    const type = searchParams.get("type");
    if (type) setTagType(type);

    const verifyTag = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      try {
        const res = await fetch(`${apiUrl}/api/tags/${uuid}/public`);
        if (res.ok) {
          const tagData = await res.json();
          if (tagData.status === "ACTIVE") {
            router.push(`/t/${uuid}`);
            return;
          }
        }
      } catch (err) {
        console.error("Verification error:", err);
      }
    };

    const fetchProfiles = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push(`/login?callbackUrl=/activate/${uuid}`);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      try {
        const res = await fetch(`${apiUrl}/api/profiles`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfiles(data);
          if (data.length > 0) setSelectedProfile(data[0].id);
        } else if (res.status === 401) {
          router.push(`/login?callbackUrl=/activate/${uuid}`);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    verifyTag().then(() => fetchProfiles());
  }, [uuid, router]);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActivating(true);
    setError("");

    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      let profileId = selectedProfile;

      // Create new profile if requested
      if (showNewProfile) {
        const profileRes = await fetch(`${apiUrl}/api/profiles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ name: newName, phone_number: newPhone })
        });
        if (!profileRes.ok) throw new Error("Профиль жасау мүмкін болмады");
        const newProfile = await profileRes.json();
        profileId = newProfile.id;
      }

      const res = await fetch(`${apiUrl}/api/tags/${uuid}/activate?profile_id=${profileId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ tag_type: tagType, status: "ACTIVE" })
      });

      if (!res.ok) throw new Error("Бирканы белсендіру мүмкін болмады");

      setShowSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-light flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (showSuccess) {
    return (
      <main className="min-h-screen bg-gray-light flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white rounded-[2.5rem] p-16 soft-shadow border border-gray-border flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-8 shadow-inner">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-4">Белсендірілді!</h1>
          <p className="text-gray-500 font-medium mb-10 leading-relaxed text-lg">
            Құттықтаймыз! Сіздің SafeTag-ыңыз сәтті белсендірілді және профильге байланды. <br />
            Қазір сізді бақылау панеліне бағыттаймыз...
          </p>
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-light flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] p-10 soft-shadow border border-gray-border animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-100">
            <QrCode className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-gray-900">SafeTag белсендіру</h1>
          <p className="text-gray-500 mt-2 text-center">Бирканы профиліңізге байлап, оны белсенді етіңіз</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <form onSubmit={handleActivate} className="space-y-8">
          {/* Tag Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-1">Бирка түрі</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Kids", value: "KIDS" },
                { label: "Pets", value: "PETS" },
                { label: "Travel", value: "TRAVEL" },
                { label: "Tech", value: "TECH" }
              ].map((item) => {
                const isLocked = searchParams.get("type") !== null;
                const isSelected = tagType === item.value;
                
                return (
                  <button
                    key={item.value}
                    type="button"
                    disabled={isLocked && !isSelected}
                    onClick={() => !isLocked && setTagType(item.value)}
                    className={`py-4 rounded-2xl font-bold border transition-all ${
                      isSelected 
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" 
                        : isLocked
                        ? "bg-gray-50 border-gray-100 text-gray-300 opacity-50 cursor-not-allowed"
                        : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            {searchParams.get("type") && (
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider px-1">
                Таңдалған пакет бойынша бекітілді
              </p>
            )}
          </div>

          {/* Profile Selection */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Профиль таңдау</label>
              <button 
                type="button" 
                onClick={() => setShowNewProfile(!showNewProfile)}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                {showNewProfile ? "Бұрынғыны таңдау" : "+ Жаңа профиль"}
              </button>
            </div>

            {showNewProfile ? (
              <div className="space-y-3 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <input
                  type="text"
                  placeholder="Аты (мысалы: Рекс немесе Айсұлтан)"
                  className="w-full px-5 py-4 bg-white border border-gray-border rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Телефон (мысалы: +77011234567)"
                  className="w-full px-5 py-4 bg-white border border-gray-border rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>
            ) : (
              <select
                className="w-full px-5 py-4 bg-gray-50 border border-gray-border rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none cursor-pointer"
                value={selectedProfile}
                onChange={(e) => setSelectedProfile(e.target.value)}
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.phone_number})</option>
                ))}
                {profiles.length === 0 && <option disabled>Профильдер табылмады</option>}
              </select>
            )}
          </div>

          <button
            type="submit"
            disabled={activating || (!showNewProfile && !selectedProfile)}
            className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg transition-all shadow-[0_15px_30px_-10px_rgba(0,102,255,0.4)] flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {activating ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
            <span>Белсендіру</span>
          </button>
        </form>
      </div>
    </main>
  );
}
