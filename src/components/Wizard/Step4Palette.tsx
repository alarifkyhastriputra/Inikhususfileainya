import React from 'react';
import { WizardData } from '../../types';
import { Palette, Sparkles, Layout, Check } from 'lucide-react';

interface Step4Props {
  data: WizardData;
  updateData: (fields: Partial<WizardData>) => void;
}

const palettePresets = [
  {
    id: 'Modern',
    name: 'Modern Tech',
    desc: 'Nuansa biru indigo tech berkelas dengan kontras tinggi',
    colors: {
      primary: '#4F46E5',
      secondary: '#1E293B',
      background: '#0F172A',
      text: '#F8FAFC',
      button: '#4F46E5',
      accent: '#06B6D4',
    },
  },
  {
    id: 'Dark',
    name: 'Cyber Dark',
    desc: 'Hitam obsidian pekat dengan aksen neon futuristik',
    colors: {
      primary: '#6366F1',
      secondary: '#18181B',
      background: '#09090B',
      text: '#FAFAFA',
      button: '#6366F1',
      accent: '#10B981',
    },
  },
  {
    id: 'Elegant',
    name: 'Elegant Gold',
    desc: 'Hitam arang eksklusif dipadu sentuhan emas mewah',
    colors: {
      primary: '#D97706',
      secondary: '#1C1917',
      background: '#0C0A09',
      text: '#F5F5F4',
      button: '#D97706',
      accent: '#FBBF24',
    },
  },
  {
    id: 'Minimalist',
    name: 'Clean Minimalist',
    desc: 'Latar terang minimalis, bersih, segar dan mudah dibaca',
    colors: {
      primary: '#0F172A',
      secondary: '#F1F5F9',
      background: '#FFFFFF',
      text: '#0F172A',
      button: '#0F172A',
      accent: '#3B82F6',
    },
  },
  {
    id: 'Luxury',
    name: 'Luxe Emerald',
    desc: 'Hijau zamrud elegan dengan kesan premium aristokrat',
    colors: {
      primary: '#059669',
      secondary: '#064E3B',
      background: '#022C22',
      text: '#ECFDF5',
      button: '#059669',
      accent: '#34D399',
    },
  },
  {
    id: 'Colorful',
    name: 'Vibrant Creative',
    desc: 'Palet penuh energi dengan perpaduan ungu & merah muda',
    colors: {
      primary: '#EC4899',
      secondary: '#312E81',
      background: '#0F172A',
      text: '#FDF2F8',
      button: '#EC4899',
      accent: '#8B5CF6',
    },
  },
  {
    id: 'Monochrome',
    name: 'Pure Monochrome',
    desc: 'Gradasi hitam, abu-abu arang dan putih yang netral',
    colors: {
      primary: '#E2E8F0',
      secondary: '#1E293B',
      background: '#0A0A0A',
      text: '#F8FAFC',
      button: '#334155',
      accent: '#94A3B8',
    },
  },
  {
    id: 'Futuristic',
    name: 'Neon Futuristic',
    desc: 'Cyan bercahaya dan ungu nebula bernuansa masa depan',
    colors: {
      primary: '#06B6D4',
      secondary: '#1E1B4B',
      background: '#030712',
      text: '#F0FDFA',
      button: '#06B6D4',
      accent: '#A855F7',
    },
  },
];

export const Step4Palette: React.FC<Step4Props> = ({ data, updateData }) => {
  const { colors } = data;

  const handleApplyPalette = (palette: typeof palettePresets[0]) => {
    updateData({
      paletteTheme: palette.id,
      colors: { ...palette.colors },
    });
  };

  const handleRandomizeAIPalette = () => {
    const random = palettePresets[Math.floor(Math.random() * palettePresets.length)];
    handleApplyPalette(random);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-1.5 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Palette className="w-3.5 h-3.5" />
          Langkah 4: Live Mockup Palet Warna
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Preview & Pilihan Palet AI</h2>
        <p className="text-xs text-slate-400">
          Lihat langsung perpaduan warna Anda pada komponen website atau pilih palet siap pakai dari AI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Live Interactive Miniature Mockup */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Layout className="w-3.5 h-3.5 text-indigo-400" />
              <span>Live Website Mockup</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Render Realtime</span>
          </div>

          {/* Miniature Website Mockup Frame */}
          <div
            className="rounded-2xl p-5 border border-slate-700/80 shadow-2xl transition-all duration-300"
            style={{
              backgroundColor: colors.background,
              color: colors.text,
            }}
          >
            {/* Header Mockup */}
            <div
              className="flex items-center justify-between pb-3 mb-4 border-b transition"
              style={{
                borderColor: `${colors.text}20`,
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold"
                  style={{ backgroundColor: colors.primary, color: '#ffffff' }}
                >
                  {data.siteName.charAt(0) || 'V'}
                </div>
                <span className="text-xs font-bold" style={{ color: colors.text }}>
                  {data.siteName || 'Vimos Website'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] opacity-75 font-medium">
                <span>Home</span>
                <span>Products</span>
                <span>Contact</span>
              </div>
            </div>

            {/* Hero Mockup */}
            <div className="py-4 space-y-3 text-center sm:text-left">
              <div
                className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
                style={{
                  backgroundColor: `${colors.accent}25`,
                  color: colors.accent,
                }}
              >
                Kategori: {data.category}
              </div>

              <h4 className="text-base sm:text-lg font-extrabold leading-tight">
                {data.siteName ? `Selamat Datang di ${data.siteName}` : 'Judul Website Anda'}
              </h4>

              <p className="text-[11px] opacity-80 leading-relaxed max-w-sm">
                {data.siteDescription || 'Toko online terpercaya dengan produk kualitas terbaik.'}
              </p>

              {/* Action Button */}
              <div className="pt-1">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl text-xs font-bold shadow-md transition"
                  style={{
                    backgroundColor: colors.button,
                    color: '#ffffff',
                  }}
                >
                  {data.websiteType === 'Toko Online' ? 'Belanja Sekarang' : 'Mulai Sekarang'}
                </button>
              </div>
            </div>

            {/* Cards Mockup */}
            <div className="grid grid-cols-2 gap-2.5 pt-4 mt-4 border-t" style={{ borderColor: `${colors.text}15` }}>
              <div
                className="p-3 rounded-xl border transition"
                style={{
                  backgroundColor: colors.secondary,
                  borderColor: `${colors.text}15`,
                }}
              >
                <div
                  className="w-3 h-3 rounded-full mb-1.5"
                  style={{ backgroundColor: colors.accent }}
                />
                <div className="text-[11px] font-bold mb-0.5">Produk Pilihan</div>
                <div className="text-[10px] opacity-70">Deskripsi singkat item fitur</div>
              </div>

              <div
                className="p-3 rounded-xl border transition"
                style={{
                  backgroundColor: colors.secondary,
                  borderColor: `${colors.text}15`,
                }}
              >
                <div
                  className="w-3 h-3 rounded-full mb-1.5"
                  style={{ backgroundColor: colors.primary }}
                />
                <div className="text-[11px] font-bold mb-0.5">Layanan 24/7</div>
                <div className="text-[10px] opacity-70">Kemudahan transaksi cepat</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: AI Palettes Preset List */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Pilihan Palet AI</span>
            </h3>

            <button
              type="button"
              onClick={handleRandomizeAIPalette}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              🎨 Acak Palet dengan AI
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
            {palettePresets.map((palette) => {
              const isSelected = data.paletteTheme === palette.id;

              return (
                <div
                  key={palette.id}
                  onClick={() => handleApplyPalette(palette)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#1e293b] border-indigo-500 shadow-md shadow-indigo-600/20'
                      : 'bg-[#111827] border-slate-800 hover:border-slate-700 hover:bg-[#182238]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">{palette.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </div>

                  {/* Swatches preview bar */}
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div
                      className="w-5 h-5 rounded-md border border-white/20 shadow-sm"
                      style={{ backgroundColor: palette.colors.primary }}
                      title="Primary"
                    />
                    <div
                      className="w-5 h-5 rounded-md border border-white/20 shadow-sm"
                      style={{ backgroundColor: palette.colors.secondary }}
                      title="Secondary"
                    />
                    <div
                      className="w-5 h-5 rounded-md border border-white/20 shadow-sm"
                      style={{ backgroundColor: palette.colors.background }}
                      title="Background"
                    />
                    <div
                      className="w-5 h-5 rounded-md border border-white/20 shadow-sm"
                      style={{ backgroundColor: palette.colors.button }}
                      title="Button"
                    />
                    <div
                      className="w-5 h-5 rounded-md border border-white/20 shadow-sm"
                      style={{ backgroundColor: palette.colors.accent }}
                      title="Accent"
                    />
                  </div>

                  <p className="text-[10px] text-slate-400 line-clamp-1">{palette.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
