import React from 'react';
import { WizardData } from '../../types';
import { 
  Sparkles, 
  Edit3, 
  Building2, 
  Palette, 
  Layout, 
  Layers, 
  Wand2, 
  Cpu, 
  Smartphone, 
  CheckCircle2,
  ShoppingBag,
  BookOpen,
  Briefcase,
  UtensilsCrossed,
  PhoneCall,
  Coins,
  AlertTriangle
} from 'lucide-react';

interface Step15Props {
  data: WizardData;
  onGoToStep: (stepNumber: number) => void;
  onStartGenerate: () => void;
  isGenerating: boolean;
  userCredits?: number;
  isSuperAdmin?: boolean;
}

export const Step15Summary: React.FC<Step15Props> = ({
  data,
  onGoToStep,
  onStartGenerate,
  isGenerating,
  userCredits = 0,
  isSuperAdmin = false,
}) => {
  const enabledSections = (data.sections || []).filter((s) => s.enabled).map((s) => s.name);
  const isBlog = data.websiteType === 'Blog' || data.websiteType === 'Berita';
  const isPortfolio = data.websiteType === 'Portfolio';
  const isRestaurant = data.websiteType === 'Restaurant';
  const hasEnoughCredits = isSuperAdmin || userCredits >= 100;

  const itemCount = isBlog 
    ? (data.blogPosts?.length || 0)
    : isPortfolio 
    ? (data.portfolioProjects?.length || 0)
    : isRestaurant 
    ? (data.restaurantMenu?.length || 0)
    : (data.storeProducts?.length || 0);

  const itemLabel = isBlog ? 'Artikel Blog' : isPortfolio ? 'Proyek Portofolio' : isRestaurant ? 'Menu Kuliner' : 'Produk Toko';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-1.5 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Langkah 15: Ringkasan Lengkap & Buat Website</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Ringkasan Konfigurasi {data.websiteType}</h2>
        <p className="text-xs text-slate-400">
          Periksa seluruh pengaturan yang telah Anda sesuaikan dari langkah 1 hingga 14. Anda dapat mengklik tombol <strong>Edit</strong> untuk kembali ke langkah tertentu kapan saja.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Informasi & Jenis */}
        <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 space-y-3 relative group">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>Identitas & Jenis Website</span>
            </h3>
            <button
              type="button"
              onClick={() => onGoToStep(1)}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300">
            <div><span className="text-slate-500">Nama:</span> <strong className="text-white">{data.siteName}</strong></div>
            <div><span className="text-slate-500">Tipe:</span> <span className="px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-300 font-semibold">{data.websiteType}</span></div>
            <div><span className="text-slate-500">Kategori / Niche:</span> {data.category}</div>
            {isBlog && data.authorName && (
              <div><span className="text-slate-500">Penulis:</span> <strong className="text-purple-300">{data.authorName}</strong></div>
            )}
            {data.whatsappNumber && (
              <div className="flex items-center gap-1">
                <span className="text-slate-500">WhatsApp:</span> 
                <span className="text-emerald-400 font-mono font-bold">{data.whatsappNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. Warna & Palet */}
        <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 space-y-3 relative group">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-indigo-400" />
              <span>Warna & Palet ({data.paletteTheme})</span>
            </h3>
            <button
              type="button"
              onClick={() => onGoToStep(3)}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <div className="flex items-center gap-1.5 bg-[#1e293b] px-2 py-1 rounded-lg">
              <div className="w-4 h-4 rounded-md border" style={{ backgroundColor: data.colors.primary }} />
              <span className="text-[10px] font-mono text-slate-300">{data.colors.primary}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#1e293b] px-2 py-1 rounded-lg">
              <div className="w-4 h-4 rounded-md border" style={{ backgroundColor: data.colors.button }} />
              <span className="text-[10px] font-mono text-slate-300">{data.colors.button}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#1e293b] px-2 py-1 rounded-lg">
              <div className="w-4 h-4 rounded-md border" style={{ backgroundColor: data.colors.background }} />
              <span className="text-[10px] font-mono text-slate-300">{data.colors.background}</span>
            </div>
          </div>
        </div>

        {/* 3. Item Showcase (Artikel / Produk / Proyek / Menu) */}
        <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 space-y-3 relative group">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              {isBlog ? <BookOpen className="w-4 h-4 text-purple-400" /> :
               isPortfolio ? <Briefcase className="w-4 h-4 text-cyan-400" /> :
               isRestaurant ? <UtensilsCrossed className="w-4 h-4 text-amber-400" /> :
               <ShoppingBag className="w-4 h-4 text-emerald-400" />}
              <span>{itemLabel} ({itemCount} Item)</span>
            </h3>
            <button
              type="button"
              onClick={() => onGoToStep(9)}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="text-xs text-slate-300">
            {isBlog && (data.blogPosts || []).map((p) => (
              <div key={p.id} className="truncate text-slate-300">• {p.title} ({p.readTime})</div>
            ))}
            {isPortfolio && (data.portfolioProjects || []).map((p) => (
              <div key={p.id} className="truncate text-slate-300">• {p.title} ({p.category})</div>
            ))}
            {isRestaurant && (data.restaurantMenu || []).map((p) => (
              <div key={p.id} className="truncate text-slate-300">• {p.name} - Rp {p.price}</div>
            ))}
            {!isBlog && !isPortfolio && !isRestaurant && (data.storeProducts || []).map((p) => (
              <div key={p.id} className="truncate text-slate-300">• {p.name} - Rp {p.price}</div>
            ))}
          </div>
        </div>

        {/* 4. Fitur Interaktif */}
        <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 space-y-3 relative group">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Fitur yang Diaktifkan ({data.features.length})</span>
            </h3>
            <button
              type="button"
              onClick={() => onGoToStep(10)}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {data.features.map((feat) => (
              <span key={feat} className="px-2 py-0.5 rounded-md bg-[#1e293b] border border-slate-700 text-[11px] text-slate-300">
                {feat}
              </span>
            ))}
          </div>
        </div>

        {/* 5. Struktur Layout & Navigasi */}
        <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 space-y-3 relative group">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Layout className="w-4 h-4 text-indigo-400" />
              <span>Layout & Menu Navigasi</span>
            </h3>
            <button
              type="button"
              onClick={() => onGoToStep(5)}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="space-y-1 text-xs text-slate-300">
            <div><span className="text-slate-500">Hero Layout:</span> {data.layout.hero}</div>
            <div><span className="text-slate-500">Menu Navbar:</span> {(data.headerNavbar.menuItems || []).join(', ')}</div>
            <div><span className="text-slate-500">Tipografi:</span> {data.typography.fontFamily} ({data.typography.fontWeight})</div>
          </div>
        </div>

        {/* 6. Bagian Halaman (Sections) */}
        <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 space-y-3 relative group">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Urutan Bagian Halaman ({enabledSections.length})</span>
            </h3>
            <button
              type="button"
              onClick={() => onGoToStep(7)}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {enabledSections.map((sec, i) => (
              <span key={sec} className="px-2 py-0.5 rounded-md bg-[#1e293b] border border-slate-700 text-[10px] text-slate-300">
                {i + 1}. {sec}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Box Konfirmasi Pembuatan */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/30 p-6 rounded-3xl text-center space-y-5 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4" />
          <span>Seluruh 15 Langkah Telah Lengkap</span>
        </div>

        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Siap Membangun Website Anda!</h3>
          <p className="text-xs text-slate-300 max-w-lg mx-auto mt-1 leading-relaxed">
            Klik tombol di bawah untuk meminta AI memproses seluruh konfigurasi, menyusun kode HTML, Tailwind CSS, dan script interaktif ke dalam Website Studio.
          </p>
        </div>

        {/* Biaya Kredit & Status Kredit */}
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">Biaya Generate: <strong>100 Kredit</strong></span>
          </div>
          <div className="text-slate-300 font-mono">
            Sisa Kredit: <strong className={hasEnoughCredits ? 'text-emerald-400' : 'text-rose-400'}>
              {isSuperAdmin ? 'Unlimited (Admin)' : `${userCredits} Kredit`}
            </strong>
          </div>
        </div>

        {!hasEnoughCredits && (
          <div className="max-w-md mx-auto p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 text-left">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>Kredit Anda tidak mencukupi (Membutuhkan 100 Kredit, sisa Anda: {userCredits}). Silakan hubungi Administrator untuk menambah kredit.</span>
          </div>
        )}

        <button
          type="button"
          onClick={onStartGenerate}
          disabled={isGenerating || !hasEnoughCredits}
          className="px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 hover:from-indigo-600 hover:to-cyan-500 text-white font-extrabold rounded-2xl text-sm shadow-xl shadow-indigo-500/30 transition transform hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          <span>{isGenerating ? 'Memproses Website...' : '✨ GENERATE WEBSITE DENGAN VIMOS AI (100 KREDIT)'}</span>
        </button>
      </div>
    </div>
  );
};
