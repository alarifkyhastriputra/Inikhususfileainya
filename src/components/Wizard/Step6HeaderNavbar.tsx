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
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center space-y-1.5 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Langkah 6: Header & Navigasi Menu
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Kustomisasi Header & Navbar</h2>
        <p className="text-xs text-slate-400">
          Tentukan bentuk logo, daftar menu navigasi, dan posisi perataannya di navbar.
        </p>
      </div>

      <div className="space-y-6 bg-[#111827] p-6 rounded-2xl border border-slate-800 shadow-xl">
        {/* Pilihan Bentuk Logo */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-3">Tipe & Format Logo</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => updateHeaderNav('logoType', 'text')}
              className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition ${
                headerNavbar.logoType === 'text'
                  ? 'bg-indigo-600/30 border-indigo-500 text-white'
                  : 'bg-[#1e293b] border-slate-700/80 text-slate-300 hover:border-slate-600'
              }`}
            >
              <Type className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <div className="text-xs font-bold">Teks Logo</div>
                <div className="text-[10px] text-slate-400">Nama brand berformat teks</div>
              </div>
            </button>

            <button
              type="button"
              onClick={handleCreateAILogo}
              className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition ${
                headerNavbar.logoType === 'ai-icon'
                  ? 'bg-indigo-600/30 border-indigo-500 text-white'
                  : 'bg-[#1e293b] border-slate-700/80 text-slate-300 hover:border-slate-600'
              }`}
            >
              <Wand2 className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <div className="text-xs font-bold">Logo AI Badge</div>
                <div className="text-[10px] text-slate-400">Monogram ikon grafis AI</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => updateHeaderNav('logoType', 'upload')}
              className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition ${
                headerNavbar.logoType === 'upload'
                  ? 'bg-indigo-600/30 border-indigo-500 text-white'
                  : 'bg-[#1e293b] border-slate-700/80 text-slate-300 hover:border-slate-600'
              }`}
            >
              <Image className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <div className="text-xs font-bold">Upload / URL Logo</div>
                <div className="text-[10px] text-slate-400">Gunakan gambar sendiri</div>
              </div>
            </button>
          </div>
        </div>

        {/* Input Nama Teks Logo */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5">Teks Logo / Brand</label>
          <input
            type="text"
            value={headerNavbar.logoText}
            onChange={(e) => updateHeaderNav('logoText', e.target.value)}
            placeholder="Contoh: VIMOS STORE"
            className="w-full bg-[#1e293b] border border-slate-700 focus:border-indigo-500 text-white rounded-xl py-2.5 px-4 text-xs outline-none"
          />
        </div>

        {headerNavbar.logoType === 'upload' && (
          <div className="bg-[#182238] p-4 rounded-xl border border-slate-700 space-y-2">
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
          <label className="block text-xs font-semibold text-slate-200 mb-1.5">
            Daftar Menu Navigasi
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {headerNavbar.menuItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e293b] border border-slate-700 rounded-xl text-xs text-white"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMenu(idx)}
                  className="p-0.5 text-slate-400 hover:text-rose-400 transition"
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
              className="flex-1 bg-[#1e293b] border border-slate-700 text-white text-xs rounded-xl py-2.5 px-3 outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah</span>
            </button>
          </form>
        </div>

        {/* Posisi Menu Navbar */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-2">Posisi Menu</label>
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
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'bg-[#1e293b] border-slate-700/80 text-slate-300 hover:border-slate-600'
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
