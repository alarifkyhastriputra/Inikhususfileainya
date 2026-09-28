import React from 'react';
import { WizardData } from '../../types';
import { Layout, Check, Sparkles } from 'lucide-react';

interface Step5Props {
  data: WizardData;
  updateData: (fields: Partial<WizardData>) => void;
}

export const Step5Layout: React.FC<Step5Props> = ({ data, updateData }) => {
  const { layout } = data;

  const updateSubLayout = <K extends keyof typeof layout>(key: K, value: typeof layout[K]) => {
    updateData({
      layout: {
        ...layout,
        [key]: value,
      },
    });
  };

  const headerOptions = [
    { id: 'logo-left', label: 'Logo Kiri', desc: 'Logo di kiri, navigasi rapi di kanan' },
    { id: 'logo-center', label: 'Logo Tengah', desc: 'Logo simetris di tengah halaman' },
    { id: 'logo-menu', label: 'Logo + Menu Lengkap', desc: 'Lengkap dengan tombol kontak / aksi' },
    { id: 'header-large', label: 'Header Besar', desc: 'Banner atas promosi & navigasi bertingkat' },
  ];

  const navbarOptions = [
    { id: 'horizontal', label: 'Menu Horizontal', desc: 'Menu berjejer rapi di atas' },
    { id: 'hamburger', label: 'Hamburger Drawer', desc: 'Ikon menu minimalis yang elegan' },
    { id: 'floating', label: 'Floating Navbar', desc: 'Melayang anggun dengan efek blur' },
    { id: 'sidebar', label: 'Sidebar Navigation', desc: 'Navigasi di samping halaman' },
  ];

  const heroOptions = [
    { id: 'text-left-img-right', label: 'Teks Kiri + Gambar Kanan', desc: 'Struktur klasik dengan tingkat konversi tinggi' },
    { id: 'text-center', label: 'Teks Tengah Fokus', desc: 'Judul dan tombol fokus di tengah' },
    { id: 'large-image', label: 'Gambar Besar / Full', desc: 'Visual banner memukau mendominasi' },
    { id: 'split', label: 'Split 50:50 Screen', desc: 'Bagi dua layar seimbang kiri dan kanan' },
  ];

  const contentOptions = [
    { id: 'grid', label: 'Modern Grid', desc: 'Kartu item berjejer rapi 3 atau 4 kolom' },
    { id: '2-col', label: '2 Kolom Seimbang', desc: 'Tata letak elegan untuk penjelasan fitur' },
    { id: '3-col', label: '3 Kolom Klasik', desc: 'Sangat cocok untuk produk atau layanan' },
    { id: '1-col', label: '1 Kolom Cerita', desc: 'Alur cerita vertikal dari atas ke bawah' },
  ];

  const footerOptions = [
    { id: '3-col', label: '3 Kolom Lengkap', desc: 'Tentang kami, menu cepat & info kontak' },
    { id: '4-col', label: '4 Kolom Mega Footer', desc: 'Struktur komprehensif dengan media sosial' },
    { id: 'simple', label: 'Simple Minimalis', desc: 'Satu baris copyright & tautan penting' },
    { id: 'footer-large', label: 'Footer Besar Promo', desc: 'Disertai form berlangganan newsletter' },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="text-center space-y-1.5 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold">
          <Layout className="w-3.5 h-3.5 text-white" />
          <span>Langkah 5: Struktur & Tata Letak</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Pilih Struktur Layout</h2>
        <p className="text-xs text-zinc-400">
          Tentukan susunan bagian Header, Navbar, Hero, Konten, dan Footer yang Anda sukai.
        </p>
      </div>

      {/* 1. Header Layout */}
      <div className="space-y-3 bg-zinc-950 p-5 rounded-2xl border border-zinc-800 shadow-xl">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>1. Tampilan Header</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {headerOptions.map((opt) => {
            const isSelected = layout.header === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => updateSubLayout('header', opt.id as any)}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-zinc-900 border-white text-white shadow-lg ring-1 ring-white/20'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold">{opt.label}</span>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">{opt.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Navbar Layout */}
      <div className="space-y-3 bg-zinc-950 p-5 rounded-2xl border border-zinc-800 shadow-xl">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>2. Tipe Navbar</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {navbarOptions.map((opt) => {
            const isSelected = layout.navbar === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => updateSubLayout('navbar', opt.id as any)}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-zinc-900 border-white text-white shadow-lg ring-1 ring-white/20'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold">{opt.label}</span>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">{opt.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Hero Layout */}
      <div className="space-y-3 bg-zinc-950 p-5 rounded-2xl border border-zinc-800 shadow-xl">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>3. Gaya Hero Section</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {heroOptions.map((opt) => {
            const isSelected = layout.hero === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => updateSubLayout('hero', opt.id as any)}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-zinc-900 border-white text-white shadow-lg ring-1 ring-white/20'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold">{opt.label}</span>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">{opt.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Content Grid Layout */}
      <div className="space-y-3 bg-zinc-950 p-5 rounded-2xl border border-zinc-800 shadow-xl">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>4. Susunan Konten</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {contentOptions.map((opt) => {
            const isSelected = layout.content === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => updateSubLayout('content', opt.id as any)}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-zinc-900 border-white text-white shadow-lg ring-1 ring-white/20'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold">{opt.label}</span>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">{opt.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Footer Layout */}
      <div className="space-y-3 bg-zinc-950 p-5 rounded-2xl border border-zinc-800 shadow-xl">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>5. Desain Footer</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {footerOptions.map((opt) => {
            const isSelected = layout.footer === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => updateSubLayout('footer', opt.id as any)}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-zinc-900 border-white text-white shadow-lg ring-1 ring-white/20'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold">{opt.label}</span>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">{opt.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
