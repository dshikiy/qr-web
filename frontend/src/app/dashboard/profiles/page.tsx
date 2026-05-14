"use client";

import { useState, useEffect, useRef } from "react";
import { User, Plus, Edit2, Phone, Save, X, Loader2, Trash2, AlertCircle, FileText, Settings, PlusCircle, Camera, Upload, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  name: string;
  phone_number: string;
  photo_url?: string | null;
  additional_info?: string;
  custom_data?: Record<string, string>;
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editInfo, setEditInfo] = useState("");
  const [editPhotoUrl, setEditPhotoUrl] = useState<string | null>(null);
  const [customFields, setCustomFields] = useState<{key: string, value: string}[]>([]);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const fetchProfiles = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      const res = await fetch(`${apiUrl}/api/profiles`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setProfiles(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfiles(); }, [router]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, profileId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // If we are editing an existing profile, upload immediately
    if (profileId) {
      setUploading(true);
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch(`${apiUrl}/api/profiles/${profileId}/upload-photo`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          setEditPhotoUrl(data.photo_url);
          fetchProfiles();
        } else {
          setError("Сурет жүктеу сәтсіз аяқталды");
        }
      } catch (err) {
        setError("Сервермен байланыс үзілді");
      } finally {
        setUploading(false);
      }
    }
  };

  const addCustomField = () => setCustomFields([...customFields, {key: "", value: ""}]);
  const removeCustomField = (index: number) => setCustomFields(customFields.filter((_, i) => i !== index));
  const updateCustomField = (index: number, k: string, v: string) => {
    const next = [...customFields];
    next[index] = {key: k, value: v};
    setCustomFields(next);
  };

  const getCustomData = () => {
    const data: Record<string, string> = {};
    customFields.forEach(f => {
      if (f.key.trim()) data[f.key.trim()] = f.value;
    });
    return data;
  };

  const handleUpdate = async (id: string) => {
    setSaving(true);
    setError("");
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      const res = await fetch(`${apiUrl}/api/profiles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: editName, 
          phone_number: editPhone, 
          additional_info: editInfo,
          custom_data: getCustomData(),
          photo_url: editPhotoUrl
        })
      });
      if (res.ok) {
        setEditingId(null);
        fetchProfiles();
      } else {
        const data = await res.json();
        setError(data.detail || "Профильді жаңарту мүмкін болмады");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      const res = await fetch(`${apiUrl}/api/profiles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: editName, 
          phone_number: editPhone, 
          additional_info: editInfo,
          custom_data: getCustomData()
        })
      });
      if (res.ok) {
        const newProfile = await res.json();
        
        // If there's a photo waiting to be uploaded
        if (fileInputRef.current?.files?.[0]) {
          const formData = new FormData();
          formData.append("file", fileInputRef.current.files[0]);
          await fetch(`${apiUrl}/api/profiles/${newProfile.id}/upload-photo`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
          });
        }

        setShowAdd(false);
        resetForm();
        fetchProfiles();
      } else {
        const data = await res.json();
        setError(data.detail || "Профиль жасау мүмкін болмады");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setEditName(""); 
    setEditPhone(""); 
    setEditInfo("");
    setEditPhotoUrl(null);
    setCustomFields([]);
    setError("");
  };

  const startEditing = (p: Profile) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditPhone(p.phone_number);
    setEditInfo(p.additional_info || "");
    setEditPhotoUrl(p.photo_url || null);
    const fields = Object.entries(p.custom_data || {}).map(([key, value]) => ({key, value}));
    setCustomFields(fields);
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Бұл профильді біржола жойғыңыз келе ме?")) return;
    
    setError("");
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      const res = await fetch(`${apiUrl}/api/profiles/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchProfiles();
      } else {
        const data = await res.json();
        setError(data.detail || "Профильді жою мүмкін болмады");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.push("/dashboard")} 
            className="p-3 bg-white border border-gray-100 rounded-2xl soft-shadow text-gray-400 hover:text-gray-900 transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-black text-gray-900">Профильдер</h1>
            <p className="text-gray-500 mt-2 font-medium">Байланыс деректерін басқару</p>
          </div>
        </div>
        <button 
          onClick={() => { setShowAdd(true); resetForm(); }}
          className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-blue-50 hover:bg-blue-700 transition-all"
        >
          <Plus size={20} /> Жаңа профиль
        </button>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {(showAdd || editingId) && (
        <div className="mb-10 p-10 bg-white rounded-[3rem] border border-gray-100 soft-shadow animate-in fade-in slide-in-from-top-4 relative overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-black text-gray-900">{editingId ? "Профильді өңдеу" : "Жаңа профиль қосу"}</h2>
            <button onClick={() => { setShowAdd(false); setEditingId(null); }} className="p-2 text-gray-400 hover:text-gray-900 transition-colors"><X size={24} /></button>
          </div>

          <form onSubmit={editingId ? (e) => {e.preventDefault(); handleUpdate(editingId)} : handleCreate} className="space-y-10">
            
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative w-32 h-32 rounded-[2.5rem] bg-gray-50 border-4 border-gray-100 flex items-center justify-center cursor-pointer group overflow-hidden transition-all hover:border-blue-200"
              >
                {editPhotoUrl ? (
                  <img src={editPhotoUrl} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                ) : (
                  <div className="flex flex-col items-center text-gray-300 group-hover:text-blue-400 transition-colors">
                    <Camera size={40} strokeWidth={1.5} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {uploading ? <Loader2 className="animate-spin text-white" /> : <Upload className="text-white" size={24} />}
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={(e) => handlePhotoUpload(e, editingId || undefined)} 
              />
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Профиль суреті</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-blue-600 uppercase tracking-widest px-1">Аты</label>
                <input 
                  value={editName} onChange={e => setEditName(e.target.value)} required
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/5 transition-all font-bold" placeholder="Мысалы: Айсұлтан"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-blue-600 uppercase tracking-widest px-1">Телефон</label>
                <input 
                  value={editPhone} onChange={e => setEditPhone(e.target.value)} required
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/5 transition-all font-bold" placeholder="+77011234567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-blue-600 uppercase tracking-widest px-1 flex items-center gap-2">
                <FileText size={14} /> Қосымша ақпарат
              </label>
              <textarea 
                value={editInfo} onChange={e => setEditInfo(e.target.value)}
                rows={3}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/5 transition-all resize-none font-medium" 
                placeholder="Мысалы: Аллергиясы бар немесе пәтер нөмірі..."
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                  <Settings size={14} /> Қосымша өрістер
                </label>
                <button type="button" onClick={addCustomField} className="text-blue-600 font-bold text-xs flex items-center gap-1 hover:underline">
                  <PlusCircle size={14} /> Өріс қосу
                </button>
              </div>
              
              <div className="space-y-3">
                {customFields.map((field, idx) => (
                  <div key={idx} className="flex gap-3 animate-in fade-in slide-in-from-left-2">
                    <input 
                      placeholder="Атауы (Пәтер)" 
                      value={field.key} onChange={e => updateCustomField(idx, e.target.value, field.value)}
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none text-sm font-bold"
                    />
                    <input 
                      placeholder="Мәні (45)" 
                      value={field.value} onChange={e => updateCustomField(idx, field.key, e.target.value)}
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none text-sm font-medium"
                    />
                    <button type="button" onClick={() => removeCustomField(idx)} className="p-3 text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" disabled={saving || uploading} className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3">
                {saving ? <Loader2 className="animate-spin" /> : <Save />}
                <span>Сақтау</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1,2].map(i => <div key={i} className="h-32 bg-white border border-gray-border rounded-[2rem] animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {profiles.map(profile => (
            <div key={profile.id} className="bg-white border border-gray-border rounded-[2rem] p-8 soft-shadow flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-blue-200 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gray-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 group-hover:bg-blue-50 transition-colors overflow-hidden border-2 border-gray-100">
                  {profile.photo_url ? (
                    <img src={profile.photo_url} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">{profile.name}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                    <p className="text-gray-500 font-medium flex items-center gap-2"><Phone size={14} className="text-blue-600" /> {profile.phone_number}</p>
                    {profile.additional_info && <p className="text-blue-600 font-bold text-xs flex items-center gap-1 uppercase tracking-widest"><FileText size={14} /> Мәлімет бар</p>}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => startEditing(profile)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-black transition-all shadow-lg shadow-gray-100"
                >
                  <Edit2 size={18} /> <span>Өңдеу</span>
                </button>
                <button 
                  onClick={() => handleDelete(profile.id)}
                  className="p-4 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
          {profiles.length === 0 && !showAdd && (
            <div className="text-center py-20 bg-white border border-dashed border-gray-border rounded-[3rem]">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-6">
                <Camera size={40} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Профильдер әлі жасалмаған</h3>
              <p className="text-gray-400 font-medium mb-6">Жоғалған жағдайда байланысу үшін бірінші профильді қосыңыз</p>
              <button 
                onClick={() => setShowAdd(true)}
                className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-blue-50 hover:bg-blue-700 transition-all"
              >
                Профиль қосу
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
