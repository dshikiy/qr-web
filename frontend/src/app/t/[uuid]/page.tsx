"use client";

import { Phone, User, ShieldCheck, AlertCircle, Home, MapPin, Info, Stethoscope, Shield, MessageCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, use } from "react";

interface TagData {
  status: string;
  name?: string;
  phone_number?: string;
  photo_url?: string | null;
  tag_type?: string;
  additional_info?: string;
  custom_data?: Record<string, string>;
}

export default function ScanPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = use(params);
  const [tagData, setTagData] = useState<TagData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTagData = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      try {
        const res = await fetch(`${apiUrl}/api/tags/${uuid}/public`, {
          cache: "no-store",
        });
        
        if (res.ok) {
          const data = await res.json();
          setTagData(data);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    getTagData();
  }, [uuid]);

  useEffect(() => {
    if (tagData?.status === "unactivated") {
      window.location.href = `/activate/${uuid}`;
    }
  }, [tagData, uuid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-light flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!tagData) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-light">
        <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-10 flex flex-col items-center gap-6 soft-shadow border border-gray-border text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-2">
            <AlertCircle size={40} />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Кешіріңіз</h1>
          <p className="text-gray-500 leading-relaxed">
            Бұл QR код белсенді емес немесе табылмады.
          </p>
          <Link 
            href="/"
            className="mt-4 flex items-center gap-2 text-blue-600 font-bold hover:underline"
          >
            <Home size={18} />
            Басты бетке қайту
          </Link>
        </div>
      </main>
    );
  }

  const smartActions = {
    KIDS: {
      label: "Жақын маңдағы полиция",
      icon: <Shield size={18} />,
      link: "https://yandex.kz/maps/?text=полиция",
      color: "bg-blue-50 text-blue-600 border-blue-100"
    },
    PETS: {
      label: "Жақын маңдағы ветклиника",
      icon: <Stethoscope size={18} />,
      link: "https://yandex.kz/maps/?text=ветеринарная+клиника",
      color: "bg-green-50 text-green-600 border-green-100"
    },
    TRAVEL: {
      label: "Жақын маңдағы вокзал/әуежай",
      icon: <MapPin size={18} />,
      link: "https://yandex.kz/maps/?text=вокзал",
      color: "bg-purple-50 text-purple-600 border-purple-100"
    }
  };

  const currentAction = tagData.tag_type ? (smartActions as any)[tagData.tag_type] : null;
  const cleanPhone = tagData.phone_number?.replace(/\D/g, "");

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-6 bg-gray-light">
      <div className="w-full max-w-md bg-white rounded-[3rem] p-10 flex flex-col items-center soft-shadow border border-gray-border animate-in fade-in slide-in-from-bottom-10 duration-700">
        
        {/* Branding Header */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
            <ShieldCheck className="text-white w-4 h-4" />
          </div>
          <span className="font-black text-xs tracking-tighter text-gray-900 uppercase">SafeTag QR</span>
        </div>

        {/* Profile Avatar */}
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-8 border-gray-light bg-gray-50 flex items-center justify-center text-gray-200 mb-6 shadow-inner">
          {tagData.photo_url ? (
            <img src={tagData.photo_url} alt={tagData.name} className="w-full h-full object-cover" />
          ) : (
            <User size={64} strokeWidth={1.5} />
          )}
        </div>

        {/* Info */}
        <div className="text-center space-y-1 mb-8">
          <h1 className="text-4xl font-black tracking-tight text-gray-900">
            {tagData.name}
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className={`px-3 py-1 text-white text-[10px] font-black rounded-full uppercase tracking-widest ${tagData.status === 'LOST' ? 'bg-red-600 animate-pulse' : 'bg-blue-600'}`}>
              {tagData.status === 'LOST' ? 'ЖОҒАЛҒАН / LOST' : tagData.tag_type}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${tagData.status === 'LOST' ? 'bg-red-500' : 'bg-green-500'}`}></span>
          </div>
        </div>

        {tagData.status === 'LOST' && (
          <div className="w-full mb-8 p-6 bg-red-50 border-2 border-red-500/20 rounded-3xl text-center">
            <p className="text-red-600 font-black text-xs uppercase tracking-widest mb-1">МАҢЫЗДЫ ХАБАРЛАМА</p>
            <p className="text-gray-900 font-bold text-sm leading-relaxed">
              Бұл зат (немесе жаратылыс) жоғалған деп белгіленген. <br />
              Өтініш, иесіне шұғыл хабарласыңыз!
            </p>
          </div>
        )}

        {/* Contact Actions */}
        <div className="w-full space-y-4 mb-8">
          <a
            href={`tel:${tagData.phone_number}`}
            className="w-full py-5 rounded-[2rem] bg-blue-600 hover:bg-blue-700 text-white shadow-[0_15px_30px_-10px_rgba(0,102,255,0.4)] flex items-center justify-center gap-4 transition-all active:scale-95 group"
          >
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Phone className="w-5 h-5 fill-white text-white" />
            </div>
            <span className="text-lg font-black uppercase tracking-tight">Қоңырау шалу</span>
          </a>

          <a
            href={`https://wa.me/${cleanPhone}`}
            target="_blank"
            className="w-full py-5 rounded-[2rem] bg-green-500 hover:bg-green-600 text-white shadow-[0_15px_30px_-10px_rgba(34,197,94,0.4)] flex items-center justify-center gap-4 transition-all active:scale-95 group"
          >
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageCircle className="w-5 h-5 fill-white text-white" />
            </div>
            <span className="text-lg font-black uppercase tracking-tight">WhatsApp-қа жазу</span>
          </a>

          <button
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                  const { latitude, longitude } = pos.coords;
                  const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
                  const text = `Сәлеметсіз бе! Мен сіздің жоғалған затыңызды таптым. Менің қазіргі орналасқан жерім: ${mapUrl}`;
                  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, "_blank");
                }, (err) => {
                  alert("Геолокацияға рұқсат берілмеді. Өтініш, қолмен хабарласыңыз.");
                });
              }
            }}
            className="w-full py-4 rounded-2xl border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all flex items-center justify-center gap-3 font-bold text-xs"
          >
            <MapPin size={16} />
            Орналасқан жерімді жіберу
          </button>
        </div>

        {/* Smart Action */}
        {currentAction && (
          <a
            href={currentAction.link}
            target="_blank"
            className={`w-full py-4 rounded-2xl border ${currentAction.color} flex items-center justify-center gap-3 font-bold text-sm transition-all hover:brightness-95 active:scale-95 mb-8`}
          >
            {currentAction.icon}
            {currentAction.label}
          </a>
        )}

        {/* Additional Info Box */}
        {tagData.additional_info && (
          <div className="w-full p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50 mb-6">
            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Info size={12} /> Иесінен мәлімет
            </h4>
            <p className="text-gray-700 text-sm leading-relaxed font-medium">
              {tagData.additional_info}
            </p>
          </div>
        )}

        {/* Custom Data Grid */}
        {tagData.custom_data && Object.keys(tagData.custom_data).length > 0 && (
          <div className="w-full grid grid-cols-2 gap-3 mb-8">
            {Object.entries(tagData.custom_data).map(([key, value]) => (
              <div key={key} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{key}</p>
                <p className="text-gray-900 text-sm font-black truncate">{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Footer Note */}
        <p className="text-gray-400 text-[10px] text-center px-4 leading-relaxed font-medium">
          Бұл зат жоғалған жағдайда, иесіне хабарласу үшін жоғарыдағы батырманы басыңыз. 
          SafeTag арқылы қауіпсіздікті қамтамасыз етіңіз.
        </p>

        {/* Security Note */}
        <div className="flex items-center gap-2 text-gray-300 mt-8">
          <ShieldCheck size={14} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Access</span>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-12 text-gray-200 font-black text-4xl select-none pointer-events-none opacity-50 tracking-tighter">
        SAFETAG
      </div>
    </main>
  );
}
