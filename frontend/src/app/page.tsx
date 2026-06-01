"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Shield, 
  Zap, 
  Droplets, 
  CheckCircle2, 
  Baby, 
  Dog, 
  Plane, 
  Smartphone,
  ChevronRight,
  Star,
  Users,
  QrCode,
  ShieldCheck,
  ArrowRight,
  X
} from "lucide-react";

interface Product {
  id: string;
  title: string;
  description: string;
  features: string[];
  price: string;
  color: string;
  icon: React.ReactNode;
}

const products: Product[] = [
  {
    id: "kids",
    title: "SafeTag Kids",
    description: "Балалардың қауіпсіздігі үшін арнайы білезік. Мектепте, саябақта немесе сауда орталығында балаңыз әрқашан қорғауда.",
    features: ["QR код арқылы тез байланыс", "Ыңғайлы силикон материал", "Су өткізбейтін және берік"],
    price: "3000",
    color: "bg-kids",
    icon: <Baby className="w-8 h-8" />,
  },
  {
    id: "pets",
    title: "SafeTag Pets",
    description: "Үй жануарларыңыз үшін стильді адресат. Егер үй жануарыңыз жоғалса, оны тапқан адам бірден сізге хабарласа алады.",
    features: ["GPS координаталарын жіберу", "Тот баспайтын металл", "Жеңіл әрі ыңғайлы"],
    price: "4200",
    color: "bg-pets",
    icon: <Dog className="w-8 h-8" />,
  },
  {
    id: "travel",
    title: "SafeTag Travel",
    description: "Чемодандар мен сөмкелерге арналған стикер. Әуежайда немесе вокзалда жүгіңізді жоғалтудан қорықпаңыз.",
    features: ["Халықаралық қолданыс", "Берік жапсырма", "Тозуға төзімді"],
    price: "1500",
    color: "bg-travel",
    icon: <Plane className="w-8 h-8" />,
  },
  {
    id: "tech",
    title: "SafeTag Tech",
    description: "Телефон, ноутбук және басқа құрылғыларға арналған шағын стикерлер жиынтығы.",
    features: ["Шағын дизайн", "Оңай жапсырылады", "Құрылғыны сәйкестендіру"],
    price: "1200",
    color: "bg-tech",
    icon: <Smartphone className="w-8 h-8" />,
  },
];

const steps = [
  { 
    title: "Бирканы сатып алыңыз", 
    desc: "Өзіңізге ыңғайлы дизайн мен форматты таңдап, тапсырыс беріңіз.",
    icon: <Zap className="text-orange-500" />
  },
  { 
    title: "QR-кодты белсендіріңіз", 
    desc: "Бирканы сканерлеп, байланыс деректеріңіз бен профиліңізді толтырыңыз.",
    icon: <QrCode className="text-blue-500" />
  },
  { 
    title: "Қорғанысты растаңыз", 
    desc: "Енді сіздің затыңыз немесе жақыныңыз SafeTag бақылауында!",
    icon: <ShieldCheck className="text-green-500" />
  }
];

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutStep, setCheckoutStep] = useState(0); // 0: closed, 1: details, 2: success

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleBuy = (product: Product) => {
    setSelectedProduct(product);
    setCheckoutStep(1);
  };

  const completePayment = () => {
    setCheckoutStep(2);
    setTimeout(() => {
      // After simulation, lead to login if not logged in
      if (!isLoggedIn) {
        // We stay on success for a bit
      }
    }, 3000);
  };

  return (
    <main className="min-h-screen bg-[#FDFDFF]">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-xl border-b border-gray-100 py-4" : "bg-transparent py-6"}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Shield className="text-white w-7 h-7" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-gray-900">SAFETAG</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-10 text-sm font-bold text-gray-500">
            <a href="#products" className="hover:text-blue-600 transition-colors">Өнімдер</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">Қалай жұмыс істейді?</a>
            <a href="#features" className="hover:text-blue-600 transition-colors">Артықшылықтар</a>
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link href="/dashboard" className="bg-gray-900 text-white text-sm font-black px-8 py-4 rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 flex items-center gap-2 active:scale-95">
                Бақылау панелі
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block text-sm font-black text-gray-900 px-6 py-4 hover:bg-gray-50 rounded-2xl transition-all">
                  Кіру
                </Link>
                <Link href="/login" className="bg-blue-600 text-white text-sm font-black px-8 py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95">
                  Тіркелу
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[800px] bg-gradient-to-b from-blue-50/50 to-transparent rounded-[100%] -z-10 blur-3xl opacity-50" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-left animate-in fade-in slide-in-from-left-10 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-8">
              <Star size={14} className="fill-blue-600" />
              <span>Қазақстандағы №1 ақылды биркалар</span>
            </div>
            <h1 className="text-6xl lg:text-7xl font-black tracking-tight mb-8 text-gray-900 leading-[1.05]">
              Жақындарыңыз <br />
              <span className="text-blue-600">әрқашан қауіпсіздікте</span>
            </h1>
            <p className="text-xl text-gray-500 mb-12 max-w-xl leading-relaxed font-medium">
              SafeTag QR — бұл жоғалған заттарды, үй жануарларын немесе жақындарыңызды табудың ең жылдам жолы. Бір сканерлеу — бірден байланыс.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#products" className="bg-gray-900 text-white px-10 py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-gray-800 transition-all shadow-2xl shadow-gray-200 active:scale-95">
                Каталогты қарау <ArrowRight size={20} />
              </a>
              <div className="flex items-center gap-4 px-6">
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden"><img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" /></div>)}
                </div>
                <div className="text-xs font-bold text-gray-400">
                  <span className="text-gray-900 block font-black">10,000+</span>
                  Белсенді қолданушы
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative animate-in fade-in slide-in-from-right-10 duration-1000">
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-8 border-white">
              <img src="/hero.png" alt="SafeTag Products" className="w-full h-auto" />
            </div>
            <div className="absolute -bottom-10 -right-10 bg-white p-6 rounded-[2rem] shadow-2xl z-20 animate-bounce duration-[3000ms] border border-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Статус</p>
                  <p className="font-black text-gray-900">Қорғаныс астында</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Symbols */}
      <section className="bg-white py-12 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center md:justify-between items-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="flex items-center gap-2 font-black text-xl italic text-gray-400">KAZPOST</div>
            <div className="flex items-center gap-2 font-black text-xl italic text-gray-400">KASPI.KZ</div>
            <div className="flex items-center gap-2 font-black text-xl italic text-gray-400">WILD BERRIES</div>
            <div className="flex items-center gap-2 font-black text-xl italic text-gray-400">OZON</div>
            <div className="flex items-center gap-2 font-black text-xl italic text-gray-400">FORBES KAZAKHSTAN</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 px-6" id="how-it-works">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-4">Бұл қалай жұмыс істейді?</h2>
            <p className="text-gray-500 font-medium text-lg">Небәрі 3 қарапайым қадам</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -translate-y-1/2 hidden md:block -z-10" />
            {steps.map((step, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] soft-shadow border border-gray-50 text-center flex flex-col items-center group hover:-translate-y-2 transition-all duration-500">
                <div className="w-20 h-20 bg-gray-50 rounded-[1.8rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-500 font-medium text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-32 px-6 bg-[#F8FAFF]" id="products">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-6">Біздің өнімдер</h2>
              <p className="text-gray-500 font-medium text-lg">Әр түрлі жағдайларға арналған ақылды шешімдер жиынтығы.</p>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-300 border border-gray-100 cursor-not-allowed"><ChevronRight size={24} className="rotate-180" /></div>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-900 border border-gray-100 hover:bg-gray-50 cursor-pointer shadow-sm"><ChevronRight size={24} /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-[2.5rem] p-10 border border-gray-100 soft-shadow hover:translate-y-[-8px] transition-all duration-500 group flex flex-col h-full">
                <div className={`w-16 h-16 ${product.color} rounded-2xl flex items-center justify-center text-white mb-8 group-hover:rotate-6 transition-transform shadow-lg`}>
                  {product.icon}
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">{product.title}</h3>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed font-medium flex-1">{product.description}</p>
                
                <div className="space-y-4 mb-10">
                  {product.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-gray-700 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
                
                <div className="mt-auto pt-8 border-t border-gray-50">
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-black text-gray-900">{product.price}</span>
                    <span className="text-gray-400 font-black text-xl">₸</span>
                  </div>
                  <button 
                    onClick={() => handleBuy(product)}
                    className={`w-full py-5 rounded-2xl text-white font-black transition-all active:scale-95 ${product.color} hover:opacity-90 shadow-xl shadow-current/10 flex items-center justify-center`}
                  >
                    Сатып алу
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Checkout Modal Simulation */}
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
                <div className="flex flex-col items-center mb-10">
                  <div className={`w-20 h-20 ${selectedProduct?.color} rounded-[2rem] flex items-center justify-center text-white mb-6 shadow-xl`}>
                    {selectedProduct?.icon}
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">Тапсырысты рәсімдеу</h2>
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

                  <div className="space-y-4">
                    <input type="text" placeholder="Аты-жөніңіз" className="w-full px-6 py-4 bg-gray-50 border border-gray-border rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/5 transition-all font-bold" />
                    <input type="text" placeholder="Телефон нөміріңіз" className="w-full px-6 py-4 bg-gray-50 border border-gray-border rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/5 transition-all font-bold" />
                  </div>
                </div>

                <button 
                  onClick={completePayment}
                  className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                >
                  Төлем жасау (Имитация)
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center text-center py-10">
                <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-8 shadow-inner">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Төлем сәтті өтті!</h2>
                <p className="text-gray-500 font-medium mb-10 leading-relaxed">
                  Құттықтаймыз! Сіздің SafeTag-ыңыз дайын. <br />
                  Енді оны белсендіру үшін жүйеге кіріңіз.
                </p>
                <Link 
                  href="/login" 
                  className="w-full py-6 bg-gray-900 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-gray-200 hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  Жалғастыру <ArrowRight size={24} />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto bg-blue-600 rounded-[4rem] p-16 md:p-24 relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(37,99,235,0.3)]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center text-white">
            <div>
              <Users size={48} className="mx-auto mb-6 opacity-50" />
              <h4 className="text-6xl font-black mb-4">15K+</h4>
              <p className="text-blue-100 font-bold uppercase tracking-widest text-xs">Бақытты отбасылар</p>
            </div>
            <div>
              <Zap size={48} className="mx-auto mb-6 opacity-50" />
              <h4 className="text-6xl font-black mb-4">0.5с</h4>
              <p className="text-blue-100 font-bold uppercase tracking-widest text-xs">Сканерлеу жылдамдығы</p>
            </div>
            <div>
              <ShieldCheck size={48} className="mx-auto mb-6 opacity-50" />
              <h4 className="text-6xl font-black mb-4">99%</h4>
              <p className="text-blue-100 font-bold uppercase tracking-widest text-xs">Қайтару көрсеткіші</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-32 pb-16 px-6 bg-[#0A0B10] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Shield className="text-white w-6 h-6" />
                </div>
                <span className="font-black text-2xl tracking-tighter">SAFETAG</span>
              </div>
              <p className="text-gray-500 max-w-md leading-relaxed font-medium">
                Біздің миссиямыз — заманауи технологиялар арқылы әрбір қазақстандыққа жан тыныштығын сыйлау. Заттарыңыз бен жақындарыңыз әрқашан бақылауда болсын.
              </p>
            </div>
            <div>
              <h5 className="font-black text-lg mb-8 tracking-tight">Өнімдер</h5>
              <ul className="space-y-4 text-gray-500 font-bold text-sm">
                <li><a href="#" className="hover:text-white transition-colors">SafeTag Kids</a></li>
                <li><a href="#" className="hover:text-white transition-colors">SafeTag Pets</a></li>
                <li><a href="#" className="hover:text-white transition-colors">SafeTag Travel</a></li>
                <li><a href="#" className="hover:text-white transition-colors">SafeTag Tech</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-black text-lg mb-8 tracking-tight">Байланыс</h5>
              <ul className="space-y-4 text-gray-500 font-bold text-sm">
                <li>info@safetag.kz</li>
                <li>+7 (700) 123 45 67</li>
                <li>Ақтау қ. 28-й мкр 46/1</li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-gray-600 text-xs font-black uppercase tracking-widest">
            <p>© 2026 SafeTag QR. Барлық құқықтар қорғалған.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Құпиялылық саясаты</a>
              <a href="#" className="hover:text-white transition-colors">Пайдалану шарттары</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
