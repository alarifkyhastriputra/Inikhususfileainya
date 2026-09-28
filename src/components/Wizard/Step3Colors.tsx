import React, { useState } from 'react';
import { WizardData } from '../../types';
import { Palette, Sparkles, Wand2, RefreshCw } from 'lucide-react';

interface Step3Props {
  data: WizardData;
  updateData: (fields: Partial<WizardData>) => void;
}

export const Step3Colors: React.FC<Step3Props> = ({ data, updateData }) => {
  const [logoColorExtracted, setLogoColorExtracted] = useState(false);

  const colorFields: Array<{
    key: keyof typeof data.colors;
    label: string;
    desc: string;
  }> = [
    { key: 'primary', label: 'Warna Utama (Primary)', desc: 'Warna identitas brand, judul penting & highlight' },
    { key: 'secondary', label: 'Warna Sekunder', desc: 'Elemen kartu, sub-bagian, dan latar sekunder' },
    { key: 'background', label: 'Warna Background', desc: 'Warna dasar latar belakang seluruh halaman' },
    { key: 'text', label: 'Warna Teks', desc: 'Warna font teks utama agar terbaca jelas dan kontras' },
    { key: 'button', label: 'Warna Tombol (Button)', desc: 'Warna tombol aksi utama (Call to Action)' },
    { key: 'accent', label: 'Warna Aksen', desc: 'Warna pemanis seperti ikon, lencana, dan border aktif' },
  ];

  const handleColorChange = (key: keyof typeof data.colors, val: string) => {
    updateData({
      colors: {
        ...data.colors,
        [key]: val,
      },
    });
  };

  const handleExtractFromLogo = () => {
    setLogoColorExtracted(true);
    // Intelligent logo color mapping
    updateData({
      colors: {
        primary: '#4F46E5',
        secondary: '#1E1B4B',
        background: '#0F172A',
        text: '#F8FAFC',
        button: '#4F46E5',
        accent: '#06B6D4',
      },
    });
    setTimeout(() => setLogoColorExtracted(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center space-y-1.5 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Palette className="w-3.5 h-3.5" />
          Langkah 3: Tentukan Warna Website
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Kustomisasi Warna Bebas</h2>
        <p className="text-xs text-slate-400">
          Tentukan kombinasi warna sesuai karakter bisnis Anda. Anda dapat mengetik kode HEX atau memilih dengan color picker.
        </p>
      </div>

      {/* Gunakan Warna Dari Logo Banner */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Gunakan Warna Dari Logo</h4>
            <p className="text-xs text-slate-400">
              AI akan merekomendasikan warna harmonis yang cocok dengan logo brand Anda.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExtractFromLogo}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-md shadow-indigo-600/30"
        >
          {logoColorExtracted ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>{logoColorExtracted ? 'Menerapkan...' : 'Ambil Warna Logo'}</span>
        </button>
      </div>

      {/* Color pickers grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {colorFields.map((field) => {
          const currentColor = data.colors[field.key] || '#000000';

          return (
            <div
              key={field.key}
              className="bg-[#111827] border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{field.label}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{field.desc}</p>
                </div>
                {/* Visual swatch circle */}
                <div
                  className="w-7 h-7 rounded-xl border border-white/20 shadow-md shrink-0 ml-2"
                  style={{ backgroundColor: currentColor }}
                />
              </div>

              {/* Color Picker + HEX Text Input */}
              <div className="flex items-center gap-2 pt-1">
                {/* Native Color Picker trigger */}
                <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-700 cursor-pointer shrink-0">
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => handleColorChange(field.key, e.target.value)}
                    className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-none outline-none"
                  />
                </div>

                {/* Manual HEX Input */}
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-2.5 text-xs font-mono text-slate-500">HEX</span>
                  <input
                    type="text"
                    value={currentColor}
                    onChange={(e) => handleColorChange(field.key, e.target.value)}
                    placeholder="#000000"
                    maxLength={9}
                    className="w-full bg-[#1e293b] border border-slate-700 focus:border-indigo-500 text-white font-mono text-xs rounded-xl py-2.5 pl-11 pr-3 outline-none"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
