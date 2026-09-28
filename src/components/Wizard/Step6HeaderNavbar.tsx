import React, { useState } from 'react';
import { WizardData } from '../../types';
import { Sparkles, Plus, Trash2, AlignLeft, AlignCenter, AlignRight, Type, Image, Wand2 } from 'lucide-react';
import { ImgurImageInput } from '../ImgurImageInput';

interface Step6Props {
  data: WizardData;
  updateData: (fields: Partial<WizardData>) => void;
}

export const Step6HeaderNavbar: React.FC<Step6Props> = ({ data, updateData }) => {
  const { headerNavbar } = data;
  const [newMenuText, setNewMenuText] = useState('');

  const updateHeaderNav = <K extends keyof typeof headerNavbar>(key: K, value: typeof headerNavbar[K]) => {
    updateData({
      headerNavbar: {
        ...headerNavbar,
        [key]: value,
      },
    });
  };

  const handleAddMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuText.trim()) return;
    updateHeaderNav('menuItems', [...headerNavbar.menuItems, newMenuText.trim()]);
    setNewMenuText('');
  };

  const handleRemoveMenu = (index: number) => {
    updateHeaderNav(
      'menuItems',
      headerNavbar.menuItems.filter((_, idx) => idx !== index)
    );
  };

  const handleCreateAILogo = () => {
    const brand = data.ownerBrand || data.siteName || 'VIMOS';
    updateHeaderNav('logoType', 'ai-icon');
    updateHeaderNav('logoText', brand.toUpperCase());
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="text-center space-y-1.5 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Langkah 6: Header & Navigasi Menu</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Kustomisasi Header & Navbar</h2>
        <p className="text-xs text-zinc-400">
          Tentukan bentuk logo, daftar menu navigasi, dan posisi perataannya di navbar.
        </p>
      </div>

      <div className="space-y-6 bg-zinc-950 p-6 rounded-2xl border border-zinc-800 shadow-xl">
        {/* Pilihan Bentuk Logo */}
        <div>
          <label className="block text-xs font-semibold text-zinc-200 mb-3">Tipe & Format Logo</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => updateHeaderNav('logoType', 'text')}
              className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition cursor-pointer ${
                headerNavbar.logoType === 'text'
                  ? 'bg-zinc-900 border-white text-white shadow-md ring-1 ring-white/20'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
              }`}
            >
              <Type className="w-5 h-5 text-white shrink-0" />
              <div>
                <div className="text-xs font-bold">Teks Logo</div>
                <div className="text-[10px] text-zinc-400">Nama brand berformat teks</div>
              </div>
            </button>

            <button
              type="button"
              onClick={handleCreateAILogo}
              className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition cursor-pointer ${
                headerNavbar.logoType === 'ai-icon'
                  ? 'bg-zinc-900 border-white text-white shadow-md ring-1 ring-white/20'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
              }`}
            >
              <Wand2 className="w-5 h-5 text-white shrink-0" />
              <div>
                <div className="text-xs font-bold">Logo AI Badge</div>
                <div className="text-[10px] text-zinc-400">Monogram ikon grafis AI</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => updateHeaderNav('logoType', 'upload')}
              className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition cursor-pointer ${
                headerNavbar.logoType === 'upload'
                  ? 'bg-zinc-900 border-white text-white shadow-md ring-1 ring-white/20'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
              }`}
            >
              <Image className="w-5 h-5 text-white shrink-0" />
              <div>
                <div className="text-xs font-bold">Upload / URL Logo</div>
                <div className="text-[10px] text-zinc-400">Gunakan gambar sendiri</div>
              </div>
            </button>
          </div>
        </div>

        {/* Input Nama Teks Logo */}
        <div>
          <label className="block text-xs font-semibold text-zinc-200 mb-1.5">Teks Logo / Brand</label>
          <input
            type="text"
            value={headerNavbar.logoText}
            onChange={(e) => updateHeaderNav('logoText', e.target.value)}
            placeholder="Contoh: VIMOS STORE"
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 text-white rounded-xl py-2.5 px-4 text-xs outline-none transition"
          />
        </div>

        {headerNavbar.logoType === 'upload' && (
          <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-2">
            <ImgurImageInput
              value={headerNavbar.logoUrl || ''}
              onChange={(url) => updateHeaderNav('logoUrl', url)}
              label="Logo Gambar / Link Imgur"
              placeholder="https://i.imgur.com/... atau upload logo"
              aspectRatio="auto"
              itemTypeLabel="Logo Brand"
            />
          </div>
        )}

        {/* Daftar Menu Navbar */}
        <div>
          <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
            Daftar Menu Navigasi
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {headerNavbar.menuItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMenu(idx)}
                  className="p-0.5 text-zinc-400 hover:text-white transition cursor-pointer"
                  title="Hapus Menu"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddMenu} className="flex items-center gap-2">
            <input
              type="text"
              value={newMenuText}
              onChange={(e) => setNewMenuText(e.target.value)}
              placeholder="Tambah menu baru (misal: Testimoni, Promo, Galeri)..."
              className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 text-white text-xs rounded-xl py-2.5 px-3 outline-none transition"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-xl flex items-center gap-1 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah</span>
            </button>
          </form>
        </div>

        {/* Posisi Menu Navbar */}
        <div>
          <label className="block text-xs font-semibold text-zinc-200 mb-2">Posisi Menu</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'left', label: 'Rata Kiri', icon: AlignLeft },
              { id: 'center', label: 'Rata Tengah', icon: AlignCenter },
              { id: 'right', label: 'Rata Kanan', icon: AlignRight },
            ].map((pos) => {
              const Icon = pos.icon;
              const isSelected = headerNavbar.position === pos.id;

              return (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => updateHeaderNav('position', pos.id as any)}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition cursor-pointer ${
                    isSelected
                      ? 'bg-white text-black border-white shadow-md font-bold'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{pos.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
