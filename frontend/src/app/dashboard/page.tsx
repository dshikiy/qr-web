"use client";

import { useState, useEffect } from "react";
import { 
  QrCode as QrIcon, 
  Plus, 
  Edit2, 
  ExternalLink,
  Search,
  Loader2,
  Trash2,
  Check,
  X,
  Eye,
  ShieldCheck,
  LogOut,
  Download,
  User as UserIcon,
  AlertTriangle,
  CheckCircle2,
  Baby,
  Dog,
  Plane,
  Smartphone
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";

interface Profile {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  tag_type: string;
  status: string;
  profile_id: string | null;
}

interface Product {
  id: string;
  title: string;
  price: string;
  color: string;
  icon: any;
}

const PRODUCTS: Product[] = [
  { id: "kids", title: "SafeTag Kids", price: "3000", color: "bg-kids", icon: Baby },
  { id: "pets", title: "SafeTag Pets", price: "4200", color: "bg-pets", icon: Dog },
  { id: "travel", title: "SafeTag Travel", price: "1500", color: "bg-travel", icon: Plane },
  { id: "tech", title: "SafeTag Tech", price: "1200", color: "bg-tech", icon: Smartphone },
];

export default function DashboardPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editType, setEditType] = useState("");
  const [editProfileId, setEditProfileId] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [showQR, setShowQR] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState(0); // 0: closed, 1: selection, 2: checkout, 3: success
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const router = useRouter();

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      const [tagsRes, profilesRes] = await Promise.all([
        fetch(`${apiUrl}/api/users/me/tags`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${apiUrl}/api/profiles`, { headers: { "Authorization": `Bearer ${token}` } })
      ]);
      
      if (tagsRes.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (tagsRes.ok) setTags(await tagsRes.json());
      if (profilesRes.ok) setProfiles(await profilesRes.json());

      const userRes = await fetch(`${apiUrl}/api/users/me`, { headers: { "Authorization": `Bearer ${token}` } });
      if (userRes.ok) setUser(await userRes.json());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const handleCreateTestTag = async () => {
    // If admin, create immediately
    if (user?.is_admin) {
      await executeCreateTag();
    } else {
      // If regular user, show product selection first
      setCheckoutStep(1); // We'll use step 1 for selection, step 2 for checkout, step 3 for success
    }
  };

  const handleSelectProduct = (product: any) => {
    setSelectedProduct(product);
    setCheckoutStep(2);
  };

  const handleCompletePurchase = async () => {
    setCheckoutStep(3);
    // After simulated success, we actually create the tag in DB
    setTimeout(async () => {
      await executeCreateTag();
      setCheckoutStep(0);
    }, 2000);
  };

  const executeCreateTag = async () => {
    setCreating(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      const res = await fetch(`${apiUrl}/api/test/create-tag`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        // Pass selected product type if available
        const typeParam = selectedProduct ? `?type=${selectedProduct.id.toUpperCase()}` : "";
        router.push(`/activate/${data.id}${typeParam}`);
      }
    } catch (error) {
      console.error("Failed to create test tag:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateTag = async (id: string) => {
    setUpdating(true);
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      const res = await fetch(`${apiUrl}/api/tags/${id}?profile_id=${editProfileId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ tag_type: editType, status: "ACTIVE" })
      });
      if (res.ok) {
        setEditingId(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm("Бұл бирканы аккаунттан ажыратқыңыз келе ме?")) return;
    
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      const res = await fetch(`${apiUrl}/api/tags/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleLost = async (tag: Tag) => {
    const newStatus = tag.status === "ACTIVE" ? "LOST" : "ACTIVE";
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      await fetch(`${apiUrl}/api/tags/${tag.id}?profile_id=${tag.profile_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ tag_type: tag.tag_type, status: newStatus })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type.toLowerCase()) {
      case 'kids': return 'bg-kids/10 text-kids border-kids/20';
      case 'pets': return 'bg-pets/10 text-pets border-pets/20';
      case 'travel': return 'bg-travel/10 text-travel border-travel/20';
      case 'tech': return 'bg-tech/10 text-tech border-tech/20';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         tag.tag_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "All" || tag.tag_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getProfileName = (id: string | null) => {
    if (!id) return "Таңдалмаған";
    return profiles.find(p => p.id === id)?.name || "Профиль табылмады";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleDownloadQR = (tagId: string) => {
    const canvas = document.getElementById(`qr-${tagId}`) as HTMLCanvasElement;
    if (!canvas) return;
    
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `safetag-${tagId.substring(0, 8)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-12">
        <h1 className="text-4xl font-black tracking-tight text-gray-900">Басты бет</h1>
        <p className="text-gray-500 mt-2 font-medium">SafeTag жүйесіне қош келдіңіз!</p>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-8 rounded-[2rem] soft-shadow border border-gray-50 group hover:border-blue-100 transition-all">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
            <QrIcon size={24} />
          </div>
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1">Биркалар саны</p>
          <h3 className="text-3xl font-black text-gray-900">{tags.length}</h3>
        </div>
        
        <div className="bg-white p-8 rounded-[2rem] soft-shadow border border-gray-50 group hover:border-green-100 transition-all">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-600 group-hover:text-white transition-all">
            <ShieldCheck size={24} />
          </div>
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1">Белсенді</p>
          <h3 className="text-3xl font-black text-gray-900">{tags.filter(t => t.status === 'ACTIVE').length}</h3>
        </div>

        <div className="bg-white p-8 rounded-[2rem] soft-shadow border border-gray-50 group hover:border-orange-100 transition-all">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition-all">
            <UserIcon size={24} />
          </div>
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1">Профильдер</p>
          <h3 className="text-3xl font-black text-gray-900">{profiles.length}</h3>
        </div>

        <div className="bg-blue-600 p-8 rounded-[2rem] shadow-xl shadow-blue-100 flex flex-col justify-between group hover:bg-blue-700 transition-all cursor-pointer" onClick={handleCreateTestTag}>
          <div className="w-12 h-12 bg-white/20 text-white rounded-xl flex items-center justify-center mb-4">
            <Plus size={24} />
          </div>
          <div>
            <h4 className="text-white font-black text-lg leading-tight">Жаңа бирка қосу</h4>
            <p className="text-blue-100 text-xs font-medium mt-1">Қауіпсіздікті арттырыңыз</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 mt-16 pt-8 border-t border-gray-100">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900" id="tags-section">Менің биркаларым</h2>
          <p className="text-gray-500 mt-1 font-medium">Барлық тіркелген құралдар</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {user?.is_admin && (
            <Link 
              href="/admin" 
              className="bg-white border border-gray-100 px-6 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-gray-50 transition-all soft-shadow text-gray-600"
            >
              <ShieldCheck size={20} className="text-blue-600" />
              <span>Админ панель</span>
            </Link>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Биркаларды іздеу..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {[
            { label: "Барлығы", value: "All" },
            { label: "Kids", value: "KIDS" },
            { label: "Pets", value: "PETS" },
            { label: "Travel", value: "TRAVEL" },
            { label: "Tech", value: "TECH" }
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilterType(item.value)}
              className={`px-6 py-4 rounded-2xl font-bold transition-all border whitespace-nowrap ${
                filterType === item.value 
                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100" 
                : "bg-white text-gray-500 border-gray-border hover:bg-gray-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-white border border-gray-border rounded-[2rem] animate-pulse" />
          ))}
        </div>
      ) : filteredTags.length === 0 ? (
        <div className="bg-white border border-gray-border rounded-[2.5rem] p-20 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
            <QrIcon size={40} />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">Биркалар табылмады</h3>
          <p className="text-gray-500 mb-8 max-w-sm">
            {searchQuery || filterType !== "All" 
              ? "Іздеу сүзгілеріне сай келетін биркалар жоқ." 
              : "Сізде әлі белсендірілген SafeTag жоқ."}
          </p>
          <button 
            onClick={handleCreateTestTag}
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <span>Жаңа бирка қосу</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTags.map((tag) => (
            <div key={tag.id} className="bg-white border border-gray-border rounded-[2rem] p-8 soft-shadow hover:translate-y-[-4px] transition-all group relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-6">
                  {editingId === tag.id ? (
                    <div className="flex flex-col gap-2 w-full">
                      <select 
                        value={editType} 
                        onChange={(e) => setEditType(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none bg-gray-50"
                      >
                        {[
                          { label: "Kids", value: "KIDS" },
                          { label: "Pets", value: "PETS" },
                          { label: "Travel", value: "TRAVEL" },
                          { label: "Tech", value: "TECH" }
                        ].map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      <select 
                        value={editProfileId} 
                        onChange={(e) => setEditProfileId(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none bg-gray-50"
                      >
                        <option value="">Профильді таңдаңыз</option>
                        {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                  ) : (
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getTypeStyles(tag.tag_type)}`}>
                      {tag.tag_type}
                    </div>
                  )}
                  <div className={`w-3 h-3 rounded-full ${tag.status === 'ACTIVE' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'}`} />
                </div>
                
                <div className="mb-6">
                  <h3 className="text-xl font-black text-gray-900 mb-1">ID: {tag.id.substring(0, 8)}</h3>
                  <p className="text-gray-500 text-sm font-medium">Профиль: <span className="text-gray-700 font-bold">{getProfileName(tag.profile_id)}</span></p>
                </div>
                
                {/* Hidden canvas for download */}
                <div style={{ display: 'none' }}>
                  <QRCodeCanvas 
                    id={`qr-${tag.id}`}
                    value={`${window.location.origin}/t/${tag.id}`} 
                    size={512}
                    level="H"
                  />
                </div>
              </div>

              {/* QR Overlay */}
              {showQR === tag.id && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-300">
                  <button onClick={() => setShowQR(null)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 transition-colors"><X size={24} /></button>
                  <div className="bg-white p-4 rounded-3xl shadow-2xl border border-gray-100 mb-4">
                    <QRCodeCanvas 
                      value={`${window.location.origin}/t/${tag.id}`} 
                      size={200}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <button 
                    onClick={() => handleDownloadQR(tag.id)}
                    className="mt-2 flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all"
                  >
                    <Download size={16} />
                    Жүктеу (PNG)
                  </button>
                </div>
              )}
              
              <div className="flex gap-2 mt-4">
                {editingId === tag.id ? (
                  <>
                    <button 
                      onClick={() => handleUpdateTag(tag.id)}
                      disabled={updating}
                      className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-50 hover:bg-blue-700 transition-all"
                    >
                      {updating ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} 
                      <span>Сақтау</span>
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-3.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all"><X size={16} /></button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setShowQR(tag.id)}
                      className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 hover:bg-gray-800"
                    >
                      <QrIcon size={14} /> <span>QR</span>
                    </button>
                    <button 
                      onClick={() => handleDownloadQR(tag.id)}
                      className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
                      title="Жүктеу"
                    >
                      <Download size={16} />
                    </button>
                    <button 
                      onClick={() => { setEditingId(tag.id); setEditType(tag.tag_type); setEditProfileId(tag.profile_id || ""); }}
                      className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-900 transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <Link 
                      href={`/t/${tag.id}`} 
                      target="_blank" 
                      className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-blue-600 transition-all"
                    >
                      <ExternalLink size={16} />
                    </Link>
                    <button 
                      onClick={() => handleToggleLost(tag)}
                      className={`p-3 rounded-xl transition-all ${tag.status === 'LOST' ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'bg-gray-50 text-gray-400 hover:text-red-500'}`}
                      title={tag.status === 'LOST' ? "Табылды деп белгілеу" : "Жоғалды деп белгілеу"}
                    >
                      <AlertTriangle size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteTag(tag.id)}
                      className="p-3 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Checkout Modal Simulation for Regular Users */}
      {checkoutStep > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative overflow-hidden animate-in zoom-in duration-300">
            <button 
              onClick={() => setCheckoutStep(0)} 
              className="absolute top-8 right-8 p-2 text-gray-300 hover:text-gray-900 transition-colors"
            >
              <X size={24} />
            </button>

            {checkoutStep === 1 ? (
              <>
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">Бирка түрін таңдаңыз</h2>
                  <p className="text-gray-400 font-medium mt-2">Қажетті категорияны таңдап, сатып алыңыз</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-10">
                  {PRODUCTS.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className="p-6 bg-gray-50 border border-gray-100 rounded-[2rem] hover:border-blue-500 transition-all group flex flex-col items-center text-center"
                    >
                      <div className={`w-12 h-12 ${p.color} rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-current/10`}>
                        <p.icon size={24} />
                      </div>
                      <h4 className="font-black text-gray-900 text-sm">{p.title}</h4>
                      <p className="text-blue-600 font-black text-xs mt-1">{p.price} ₸</p>
                    </button>
                  ))}
                </div>
              </>
            ) : checkoutStep === 2 ? (
              <>
                <div className="flex flex-col items-center mb-10">
                  <div className={`w-20 h-20 ${selectedProduct?.color} rounded-[2rem] flex items-center justify-center text-white mb-6 shadow-xl`}>
                    <selectedProduct.icon size={32} />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">Төлем жасау</h2>
                  <p className="text-gray-400 font-medium mt-2">{selectedProduct?.title}</p>
                </div>

                <div className="space-y-6 mb-10">
                  <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Тауар құны</p>
                      <p className="text-xl font-black text-gray-900">{selectedProduct?.price} ₸</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Жеткізу</p>
                      <p className="text-xl font-black text-green-500">ТЕГІН</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleCompletePurchase}
                  className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                >
                  Сатып алу (Имитация)
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center text-center py-10">
                <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-8 shadow-inner">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Төлем сәтті өтті!</h2>
                <p className="text-gray-500 font-medium mb-10 leading-relaxed">
                  Биркаңыз сәтті сатып алынды. <br />
                  Қазір сізді белсендіру бетіне бағыттаймыз...
                </p>
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
