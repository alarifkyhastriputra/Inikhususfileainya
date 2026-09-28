import React from 'react';
import { WizardData } from '../../types';
import { Sparkles, Sliders, Check } from 'lucide-react';

interface Step11Props {
  data: WizardData;
  updateData: (fields: Partial<WizardData>) => void;
}

const designStyles = [
  'Modern',
  'Minimalist',
  'Professional',
  'Elegant',
  'Luxury',
  'Futuristic',
  'Glassmorphism',
  'Dark Mode',
  'Colorful',
  'Corporate',
  'Gaming',
  'Retro',
  'Soft Pastel',
  'Monochrome',
];

export const Step11Style: React.FC<Step11Props> = ({ data, updateData }) => {
  const { designStyle, designSliders } = data;

  const updateSliders = <K extends keyof typeof designSliders>(
    key: K,
    val: typeof designSliders[K]
  ) => {
    updateData({
      designSliders: {
        ...designSliders,
        [key]: val,
      },
    });
  };

  const shadowStyles = {
    none: 'none',
    soft: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
    medium: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
    strong: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)',
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-1.5 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Langkah 11: Gaya Desain & Efek Visual
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Kustomisasi Gaya & Efek</h2>
        <p className="text-xs text-slate-400">
          Pilih tema estetika visual serta atur kelengkungan sudut (border radius), bayangan, dan animasi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Style Selection */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Pilih Gaya Estetika
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {designStyles.map((sty) => {
                const isSelected = designStyle === sty;
                return (
                  <button
                    key={sty}
                    type="button"
                    onClick={() => updateData({ designStyle: sty })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition text-left flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                        : 'bg-[#1e293b] text-slate-300 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <span className="truncate">{sty}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sliders */}
          <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 space-y-5">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Detail Slider Desain</span>
            </h3>

            {/* Border Radius */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Kelengkungan Sudut (Border Radius)</span>
                <span className="font-mono text-indigo-400">{designSliders.borderRadius}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                step={2}
                value={designSliders.borderRadius}
                onChange={(e) => updateSliders('borderRadius', Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>0px (Tajam)</span>
                <span>16px (Modern)</span>
                <span>30px (Sangat Bulat)</span>
              </div>
            </div>

            {/* Shadow Slider / Tabs */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Efek Bayangan (Shadow)</span>
                <span className="font-mono text-indigo-400 uppercase">{designSliders.shadow}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(['none', 'soft', 'medium', 'strong'] as const).map((sh) => (
                  <button
                    key={sh}
                    type="button"
                    onClick={() => updateSliders('shadow', sh)}
                    className={`py-2 text-[11px] font-semibold rounded-xl border capitalize transition ${
                      designSliders.shadow === sh
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-[#1e293b] text-slate-400 border-slate-700/80 hover:text-white'
                    }`}
                  >
                    {sh}
                  </button>
                ))}
              </div>
            </div>

            {/* Spacing */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Kerapatan Spasi (Spacing)</span>
                <span className="font-mono text-indigo-400 uppercase">{designSliders.spacing}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['compact', 'normal', 'spacious'] as const).map((sp) => (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => updateSliders('spacing', sp)}
                    className={`py-2 text-[11px] font-semibold rounded-xl border capitalize transition ${
                      designSliders.spacing === sp
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-[#1e293b] text-slate-400 border-slate-700/80 hover:text-white'
                    }`}
                  >
                    {sp}
                  </button>
                ))}
              </div>
            </div>

            {/* Animation */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Transisi Animasi (Animation)</span>
                <span className="font-mono text-indigo-400 uppercase">{designSliders.animation}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['none', 'subtle', 'smooth'] as const).map((an) => (
                  <button
                    key={an}
                    type="button"
                    onClick={() => updateSliders('animation', an)}
                    className={`py-2 text-[11px] font-semibold rounded-xl border capitalize transition ${
                      designSliders.animation === an
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-[#1e293b] text-slate-400 border-slate-700/80 hover:text-white'
                    }`}
                  >
                    {an}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Visual Preview of Slider & Style */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Live Preview Komponen
          </h3>

          <div
            className="p-6 bg-[#182238] border border-slate-700 text-white space-y-4 transition-all duration-300"
            style={{
              borderRadius: `${designSliders.borderRadius}px`,
              boxShadow: shadowStyles[designSliders.shadow],
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300">Gaya: {designStyle}</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono">
                R: {designSliders.borderRadius}px
              </span>
            </div>

            <h4 className="text-base font-bold leading-tight">
              Kartu Interaktif Desain
            </h4>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bentuk sudut elemen, bayangan, dan jarak spasi website Anda akan mengikuti konfigurasi ini.
            </p>

            <button
              type="button"
              className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold shadow-lg transition"
              style={{
                borderRadius: `${Math.max(4, designSliders.borderRadius - 4)}px`,
              }}
            >
              Contoh Tombol Interaktif
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
