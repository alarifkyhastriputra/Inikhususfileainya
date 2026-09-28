import React, { useState } from 'react';
import { WizardData } from '../../types';
import { Smartphone, Tablet, Monitor, Check, Sparkles } from 'lucide-react';

interface Step13Props {
  data: WizardData;
  updateData: (fields: Partial<WizardData>) => void;
}

export const Step13Responsive: React.FC<Step13Props> = ({ data, updateData }) => {
  const { responsive } = data;
  const [activePreviewMode, setActivePreviewMode] = useState<'mobile' | 'desktop'>('desktop');

  const toggleDevice = (key: keyof typeof responsive) => {
    updateData({
      responsive: {
        ...responsive,
        [key]: !responsive[key],
      },
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-1.5 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Langkah 13: Optimasi Responsive
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Kesiapan Tampilan Semua Perangkat</h2>
        <p className="text-xs text-slate-400">
          Website Anda otomatis disesuaikan secara dinamis agar terlihat sempurna di HP, tablet, maupun layar komputer.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { key: 'mobile' as const, label: 'Smartphone / HP', icon: Smartphone, desc: 'Tata letak vertikal responsif, tombol ramah jempol' },
          { key: 'tablet' as const, label: 'Tablet & iPad', icon: Tablet, desc: 'Grid 2 kolom fleksibel untuk layar ukuran medium' },
          { key: 'desktop' as const, label: 'Laptop & Desktop', icon: Monitor, desc: 'Tampilan penuh resolusi tinggi dengan navigasi lebar' },
        ].map((item) => {
          const Icon = item.icon;
          const isEnabled = responsive[item.key];

          return (
            <div
              key={item.key}
              onClick={() => toggleDevice(item.key)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                isEnabled
                  ? 'bg-indigo-900/30 border-indigo-500 shadow-md shadow-indigo-600/20 text-white'
                  : 'bg-[#111827] border-slate-800 text-slate-400 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isEnabled ? 'bg-indigo-600 text-white' : 'bg-[#1e293b] text-slate-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition ${
                      isEnabled ? 'bg-indigo-500 text-white' : 'border border-slate-700 bg-slate-800'
                    }`}
                  >
                    {isEnabled && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
                <h4 className="text-xs font-bold">{item.label}</h4>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Responsive Preview Simulator */}
      <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Simulasi Tampilan
          </h3>

          <div className="flex items-center gap-1 bg-[#1e293b] p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setActivePreviewMode('desktop')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activePreviewMode === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePreviewMode('mobile')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activePreviewMode === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile HP</span>
            </button>
          </div>
        </div>

        {/* Visual Frame */}
        <div className="flex justify-center p-4 bg-[#090D16] rounded-xl border border-slate-800/80">
          <div
            className={`transition-all duration-300 p-4 rounded-xl border border-slate-700 bg-[#1e293b] ${
              activePreviewMode === 'mobile' ? 'w-[320px]' : 'w-full'
            }`}
          >
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-700 text-xs">
              <span className="font-bold text-white truncate">{data.siteName || 'Vimos Store'}</span>
              <span className="text-[10px] text-indigo-400 font-mono">
                {activePreviewMode === 'mobile' ? '375 x 812' : '100% Fluid'}
              </span>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-700/60 rounded w-3/4"></div>
              <div className="h-3 bg-slate-700/40 rounded w-full"></div>
              <div className="h-3 bg-slate-700/40 rounded w-5/6"></div>
              <div className="h-7 bg-indigo-600 rounded-lg w-1/2 mt-2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
