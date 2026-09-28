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
    <div className="space-y-6 max-w-4xl mx-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="text-center space-y-1.5 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold">
          <Type className="w-3.5 h-3.5 text-white" />
          <span>Langkah 12: Tipografi & Karakter Huruf</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Pilih Font & Ukuran Teks</h2>
        <p className="text-xs text-zinc-400">
          Pilih jenis font yang sesuai dengan persona brand Anda dan atur ukuran teksnya.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls */}
        <div className="lg:col-span-7 space-y-4">
          {/* Font Family Selection */}
          <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Pilihan Font Family
            </h3>
            <div className="space-y-2">
              {fontFamilies.map((font) => {
                const isSelected = typography.fontFamily === font.id;

                return (
                  <div
                    key={font.id}
                    onClick={() => updateTypo('fontFamily', font.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-zinc-900 border-white text-white shadow-md ring-1 ring-white/20'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold" style={{ fontFamily: font.id }}>
                        {font.label}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{font.desc}</div>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center shrink-0 ml-2">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sizing & Weight */}
          <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Ukuran & Ketebalan
            </h3>

            {/* Heading Size */}
            <div>
              <span className="block text-xs font-semibold text-zinc-300 mb-1.5">Ukuran Heading</span>
              <div className="grid grid-cols-3 gap-2">
                {(['normal', 'large', 'extra-large'] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => updateTypo('headingSize', sz)}
                    className={`py-2 text-xs font-semibold rounded-xl border capitalize transition cursor-pointer ${
                      typography.headingSize === sz
                        ? 'bg-white text-black border-white font-bold shadow'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Weight */}
            <div>
              <span className="block text-xs font-semibold text-zinc-300 mb-1.5">Ketebalan Font (Weight)</span>
              <div className="grid grid-cols-3 gap-2">
                {(['normal', 'medium', 'bold'] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => updateTypo('fontWeight', w)}
                    className={`py-2 text-xs font-semibold rounded-xl border capitalize transition cursor-pointer ${
                      typography.fontWeight === w
                        ? 'bg-white text-black border-white font-bold shadow'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
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
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Live Preview Tipografi
          </h3>

          <div
            className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl text-white space-y-3 shadow-2xl"
            style={{ fontFamily: typography.fontFamily }}
          >
            <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
              {typography.fontFamily} • {typography.fontWeight}
            </div>

            <h4
              className={`leading-tight text-white ${
                typography.headingSize === 'extra-large'
                  ? 'text-2xl font-black'
                  : typography.headingSize === 'large'
                  ? 'text-xl font-bold'
                  : 'text-base font-semibold'
              }`}
            >
              Kekuatan Desain Visual Yang Menawan
            </h4>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Teks paragraf ini mewakili bagaimana pesan bisnis Anda akan dibaca oleh pengunjung website di berbagai perangkat.
            </p>

            <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-500 font-mono">
              Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz 1234567890
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
