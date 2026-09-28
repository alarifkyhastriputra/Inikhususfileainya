import React from 'react';
import { WizardData } from '../../types';
import { 
  Sparkles, 
  ArrowUp, 
  ArrowDown, 
  Check
} from 'lucide-react';

interface Step7Props {
  data: WizardData;
  updateData: (fields: Partial<WizardData>) => void;
}

export const Step7Sections: React.FC<Step7Props> = ({ data, updateData }) => {
  const { sections } = data;

  const toggleSection = (id: string) => {
    updateData({
      sections: sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    });
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newArr = [...sections];
    const temp = newArr[index - 1];
    newArr[index - 1] = newArr[index];
    newArr[index] = temp;
    updateData({ sections: newArr });
  };

  const moveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const newArr = [...sections];
    const temp = newArr[index + 1];
    newArr[index + 1] = newArr[index];
    newArr[index] = temp;
    updateData({ sections: newArr });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="text-center space-y-1.5 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Langkah 7: Pilih & Susun Bagian (Sections)</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Pilih & Urutkan Bagian Website</h2>
        <p className="text-xs text-zinc-400">
          Centang bagian yang ingin ditampilkan, dan gunakan tombol panah untuk mengatur urutan susunan website Anda.
        </p>
      </div>

      {/* Sections List */}
      <div className="space-y-2.5 bg-zinc-950 p-5 rounded-2xl border border-zinc-800 shadow-xl">
        {sections.map((item, idx) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
              item.enabled
                ? 'bg-zinc-900 border-zinc-700 text-white shadow-sm'
                : 'bg-zinc-950 border-zinc-900 text-zinc-600 opacity-60'
            }`}
          >
            {/* Toggle checkbox & name */}
            <div
              onClick={() => toggleSection(item.id)}
              className="flex items-center gap-3 cursor-pointer select-none flex-1"
            >
              <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center transition ${
                  item.enabled ? 'bg-white text-black shadow-md' : 'bg-zinc-800 border border-zinc-700'
                }`}
              >
                {item.enabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  {idx + 1}
                </span>
                <span className="text-sm font-semibold">{item.name}</span>
              </div>
            </div>

            {/* Reorder Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={idx === 0}
                onClick={() => moveUp(idx)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition disabled:opacity-30 disabled:hover:bg-zinc-800 cursor-pointer"
                title="Pindah ke Atas"
              >
                <ArrowUp className="w-4 h-4" />
              </button>

              <button
                type="button"
                disabled={idx === sections.length - 1}
                onClick={() => moveDown(idx)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition disabled:opacity-30 disabled:hover:bg-zinc-800 cursor-pointer"
                title="Pindah ke Bawah"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
