import React from 'react';
import { WizardData } from '../../types';
import { Palette, Sparkles, Layout, Check } from 'lucide-react';

interface Step4Props {
  data: WizardData;
  updateData: (fields: Partial<WizardData>) => void;
}

const palettePresets = [
  {
    id: 'Monochrome',
    name: 'Pure Monochrome',
    desc: 'Hitam pekat, abu-abu netral, dan putih bersih kontras tinggi',
    colors: {
      primary: '#FFFFFF',
      secondary: '#18181B',
      background: '#09090B',
      text: '#FAFAFA',
      button: '#FFFFFF',
      accent: '#E4E4E7',
    },
  },
  {
    id: 'Dark',
    name: 'Cyber Obsidian',
    desc: 'Hitam obsidian pekat dengan sentuhan zinc modern',
    colors: {
      primary: '#F4F4F5',
      secondary: '#27272A',
      background: '#000000',
      text: '#FFFFFF',
      button: '#E4E4E7',
      accent: '#A1A1AA',
    },
  },
  {
    id: 'Minimalist',
    name: 'Clean Light',
    desc: 'Latar terang minimalis, bersih, segar dan mudah dibaca',
    colors: {
      primary: '#09090B',
      secondary: '#F4F4F5',
      background: '#FFFFFF',
      text: '#09090B',
      button: '#09090B',
      accent: '#71717A',
    },
  },
  {
    id: 'Modern',
    name: 'Modern Zinc',
    desc: 'Nuansa zinc tech berkelas dengan kontras tinggi',
    colors: {
      primary: '#3B82F6',
      secondary: '#18181B',
      background: '#09090B',
      text: '#FAFAFA',
      button: '#3B82F6',
      accent: '#60A5FA',
    },
  },
  {
    id: 'Elegant',
    name: 'Elegant Warmth',
    desc: 'Hitam arang eksklusif dipadu sentuhan amber mewah',
    colors: {
      primary: '#F59E0B',
      secondary: '#1C1917',
      background: '#0C0A09',
      text: '#F5F5F4',
      button: '#F59E0B',
      accent: '#FCD34D',
    },
  },
  {
    id: 'Luxury',
    name: 'Luxe Emerald',
    desc: 'Hijau zamrud elegan dengan kesan premium aristokrat',
    colors: {
      primary: '#10B981',
      secondary: '#064E3B',
      background: '#022C22',
      text: '#ECFDF5',
      button: '#10B981',
      accent: '#34D399',
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
    <div className="space-y-6 max-w-4xl mx-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="text-center space-y-1.5 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold">
          <Palette className="w-3.5 h-3.5 text-white" />
          <span>Langkah 4: Live Mockup Palet Warna</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Preview & Pilihan Palet AI</h2>
        <p className="text-xs text-zinc-400">
          Lihat langsung perpaduan warna Anda pada komponen website atau pilih palet siap pakai dari AI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Live Interactive Miniature Mockup */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Layout className="w-3.5 h-3.5 text-white" />
              <span>Live Website Mockup</span>
            </h3>
            <span className="text-[10px] text-zinc-500 font-mono">Render Realtime</span>
          </div>

          {/* Miniature Website Mockup Frame */}
          <div
            className="rounded-2xl p-5 border border-zinc-800 shadow-2xl transition-all duration-300"
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
                  style={{ backgroundColor: colors.primary, color: '#000000' }}
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
                className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border"
                style={{
                  backgroundColor: `${colors.accent}25`,
                  color: colors.accent,
                  borderColor: `${colors.accent}40`,
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
                    color: colors.button === '#FFFFFF' || colors.button.toLowerCase() === '#fff' ? '#000000' : '#ffffff',
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
            <h3 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Pilihan Palet AI</span>
            </h3>

            <button
              type="button"
              onClick={handleRandomizeAIPalette}
              className="text-xs text-zinc-300 hover:text-white font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Acak Palet</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {palettePresets.map((palette) => {
              const isSelected = data.paletteTheme === palette.id;

              return (
                <div
                  key={palette.id}
                  onClick={() => handleApplyPalette(palette)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-zinc-900 border-white shadow-xl ring-1 ring-white/20'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">{palette.name}</span>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Swatches preview bar */}
                  <div className="flex items-center gap-1.5 mb-2">
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

                  <p className="text-[10px] text-zinc-400 line-clamp-1">{palette.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
