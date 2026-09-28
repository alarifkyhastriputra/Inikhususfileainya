import React from 'react';
import { WizardData } from '../../types';
import { Sparkles, MessageSquare, Bot, Plus } from 'lucide-react';

interface Step14Props {
  data: WizardData;
  updateData: (fields: Partial<WizardData>) => void;
}

const samplePrompts = [
  'Buat website terlihat sangat premium, modern, dan bernilai tinggi.',
  'Buat tombol Call to Action berukuran lebih besar dan nyaman diklik di layar HP.',
  'Tambahkan efek animasi halus ketika pengunjung melakukan scroll halaman.',
  'Buat kartu produk memiliki efek bayangan melayang saat kursor diarahkan (hover).',
  'Sertakan nomor kontak WhatsApp di tombol aksi agar pelanggan langsung terhubung.',
  'Gunakan nuansa bahasa yang ramah, sopan, dan persuasif.',
];

export const Step14AIAssistant: React.FC<Step14Props> = ({ data, updateData }) => {
  const handleAddSample = (text: string) => {
    if (data.specialRequest.includes(text)) return;
    const updated = data.specialRequest
      ? `${data.specialRequest}\n- ${text}`
      : `- ${text}`;
    updateData({ specialRequest: updated });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center space-y-1.5 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Bot className="w-3.5 h-3.5" />
          Langkah 14: Asisten AI & Permintaan Khusus
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Ada Permintaan Khusus?</h2>
        <p className="text-xs text-slate-400">
          Sampaikan keinginan spesifik Anda. Vimos AI akan menggabungkan permintaan ini dengan seluruh pengaturan sebelumnya.
        </p>
      </div>

      <div className="space-y-4 bg-[#111827] p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>Instruksi Khusus untuk AI</span>
          </label>
          <textarea
            rows={5}
            value={data.specialRequest}
            onChange={(e) => updateData({ specialRequest: e.target.value })}
            placeholder="Contoh: Buat tampilan terlihat mewah seperti brand Apple, tambahkan badge 'Diskon 30%' di hero section, dan pastikan warna tombol sangat kontras..."
            className="w-full bg-[#1e293b] border border-slate-700 focus:border-indigo-500 text-white rounded-xl p-4 text-xs outline-none leading-relaxed transition resize-none"
          />
        </div>

        {/* Quick Suggestion Chips */}
        <div>
          <span className="block text-xs font-semibold text-slate-400 mb-2">
            Klik untuk menambahkan rekomendasi cepat:
          </span>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddSample(prompt)}
                className="px-3 py-1.5 rounded-xl bg-[#1e293b] hover:bg-indigo-600/30 text-[11px] text-slate-300 hover:text-white border border-slate-700/80 hover:border-indigo-500/40 transition text-left flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3 text-indigo-400 shrink-0" />
                <span>{prompt}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
