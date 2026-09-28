import React from 'react';
import { WizardData } from '../../types';
import { Sparkles, Type, Check } from 'lucide-react';

interface Step12Props {
  data: WizardData;
  updateData: (fields: Partial<WizardData>) => void;
}

const fontFamilies = [
  { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans (Minimal Modern)', desc: 'Sangat bersih, elegan & mudah dibaca di mobile' },
  { id: 'Inter', label: 'Inter (Modern Tech)', desc: 'Standar emas produk SaaS dan startup digital' },
  { id: 'Playfair Display', label: 'Playfair Display (Classic Luxury)', desc: 'Kesan mewah, anggun, cocok untuk fashion / bistro' },
  { id: 'Poppins', label: 'Poppins (Rounded Friendly)', desc: 'Sudut melingkar, ramah, cocok untuk toko online' },
  { id: 'Roboto', label: 'Roboto (Professional Corporate)', desc: 'Tegas, resmi, sangat cocok untuk profil perusahaan' },
];

export const Step12Typography: React.FC<Step12Props> = ({ data, updateData }) => {
  const { typography } = data;

  const updateTypo = <K extends keyof typeof typography>(key: K, val: typeof typography[K]) => {
    updateData({
      typography: {
        ...typography,
        [key]: val,
      },
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-1.5 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Type className="w-3.5 h-3.5" />
          Langkah 12: Tipografi & Karakter Huruf
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Pilih Font & Ukuran Teks</h2>
        <p className="text-xs text-slate-400">
          Pilih jenis font yang sesuai dengan persona brand Anda dan atur ukuran teksnya.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls */}
        <div className="lg:col-span-7 space-y-4">
          {/* Font Family Selection */}
          <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Pilihan Font Family
            </h3>
            <div className="space-y-2">
              {fontFamilies.map((font) => {
                const isSelected = typography.fontFamily === font.id;

                return (
                  <div
                    key={font.id}
                    onClick={() => updateTypo('fontFamily', font.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm'
                        : 'bg-[#1e293b] border-slate-700/80 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold" style={{ fontFamily: font.id }}>
                        {font.label}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{font.desc}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0 ml-2" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sizing & Weight */}
          <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Ukuran & Ketebalan
            </h3>

            {/* Heading Size */}
            <div>
              <span className="block text-xs font-semibold text-slate-300 mb-1.5">Ukuran Heading</span>
              <div className="grid grid-cols-3 gap-2">
                {(['normal', 'large', 'extra-large'] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => updateTypo('headingSize', sz)}
                    className={`py-2 text-xs font-semibold rounded-xl border capitalize transition ${
                      typography.headingSize === sz
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-[#1e293b] text-slate-400 border-slate-700/80 hover:text-white'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Weight */}
            <div>
              <span className="block text-xs font-semibold text-slate-300 mb-1.5">Ketebalan Font (Weight)</span>
              <div className="grid grid-cols-3 gap-2">
                {(['normal', 'medium', 'bold'] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => updateTypo('fontWeight', w)}
                    className={`py-2 text-xs font-semibold rounded-xl border capitalize transition ${
                      typography.fontWeight === w
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-[#1e293b] text-slate-400 border-slate-700/80 hover:text-white'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Font Sample Preview */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Live Preview Tipografi
          </h3>

          <div
            className="p-6 bg-[#182238] border border-slate-700 rounded-2xl text-white space-y-3"
            style={{ fontFamily: typography.fontFamily }}
          >
            <div className="text-[10px] text-indigo-400 font-mono uppercase tracking-wider">
              {typography.fontFamily} • {typography.fontWeight}
            </div>

            <h4
              className={`leading-tight ${
                typography.headingSize === 'extra-large'
                  ? 'text-2xl font-black'
                  : typography.headingSize === 'large'
                  ? 'text-xl font-bold'
                  : 'text-base font-semibold'
              }`}
            >
              Kekuatan Desain Visual Yang Menawan
            </h4>

            <p className="text-xs text-slate-300 leading-relaxed">
              Teks paragraf ini mewakili bagaimana pesan bisnis Anda akan dibaca oleh pengunjung website di berbagai perangkat.
            </p>

            <div className="pt-2 border-t border-slate-700/60 text-[11px] text-slate-400">
              Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz 1234567890
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
