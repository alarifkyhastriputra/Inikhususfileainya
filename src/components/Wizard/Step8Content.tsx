import React, { useState } from 'react';
import { WizardData } from '../../types';
import { Sparkles, Wand2, RefreshCw, CheckCircle2 } from 'lucide-react';

interface Step8Props {
  data: WizardData;
  updateData: (fields: Partial<WizardData>) => void;
}

export const Step8Content: React.FC<Step8Props> = ({ data, updateData }) => {
  const { content } = data;
  const [loadingAI, setLoadingAI] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  const updateContentField = <K extends keyof typeof content>(key: K, value: typeof content[K]) => {
    updateData({
      content: {
        ...content,
        [key]: value,
      },
    });
  };

  const handleGenerateAIContent = async () => {
    setLoadingAI(true);
    try {
      const res = await fetch('/api/ai-suggest-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName: data.siteName,
          siteDescription: data.siteDescription,
          websiteType: data.websiteType,
          category: data.category,
        }),
      });

      const resData = await res.json();
      if (resData.success && resData.content) {
        updateData({
          content: {
            ...content,
            headline: resData.content.headline || content.headline,
            subheadline: resData.content.subheadline || content.subheadline,
            ctaText: resData.content.ctaText || content.ctaText,
            aboutUs: resData.content.aboutUs || content.aboutUs,
            productServiceHeadline: resData.content.productServiceHeadline || content.productServiceHeadline,
            faqSummary: resData.content.faqSummary || content.faqSummary,
          },
        });
        setSuccessToast(true);
        setTimeout(() => setSuccessToast(false), 3000);
      }
    } catch (e) {
      console.error('AI Content generation error:', e);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="text-center space-y-1.5 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Langkah 8: Isi Konten & Teks</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Tentukan Teks & Narasi</h2>
        <p className="text-xs text-zinc-400">
          Masukkan judul, deskripsi, dan tombol Call to Action, atau gunakan asisten AI untuk menulis teks profesional secara otomatis.
        </p>
      </div>

      {/* AI Generate Content Banner */}
      <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white shrink-0">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Buat Konten Otomatis dengan AI</h4>
            <p className="text-xs text-zinc-400">
              AI akan membuatkan judul menarik, slogan persuasif, deskripsi bisnis, dan teks tombol CTA.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerateAIContent}
          disabled={loadingAI}
          className="px-4 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow disabled:opacity-50 cursor-pointer"
        >
          {loadingAI ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Menulis Teks AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>✨ Buat Konten dengan AI</span>
            </>
          )}
        </button>
      </div>

      {successToast && (
        <div className="p-3 bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
          <span>Konten berhasil dibuat oleh AI berdasarkan informasi bisnis Anda!</span>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4 bg-zinc-950 p-6 rounded-2xl border border-zinc-800 shadow-xl">
        {/* Judul Utama */}
        <div>
          <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
            Judul Utama (Headline) *
          </label>
          <input
            type="text"
            required
            value={content.headline}
            onChange={(e) => updateContentField('headline', e.target.value)}
            placeholder="Contoh: Selamat Datang di Vimos Store"
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 text-white rounded-xl py-2.5 px-4 text-sm outline-none transition"
          />
        </div>

        {/* Subjudul / Deskripsi */}
        <div>
          <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
            Subjudul / Slogan Pendukung (Subheadline)
          </label>
          <textarea
            rows={2}
            value={content.subheadline}
            onChange={(e) => updateContentField('subheadline', e.target.value)}
            placeholder="Contoh: Temukan berbagai produk pilihan kami dengan kualitas terbaik dan promo menarik."
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 text-white rounded-xl p-3 text-xs outline-none resize-none leading-relaxed transition"
          />
        </div>

        {/* Tombol CTA */}
        <div>
          <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
            Teks Tombol Aksi (CTA Button)
          </label>
          <input
            type="text"
            value={content.ctaText}
            onChange={(e) => updateContentField('ctaText', e.target.value)}
            placeholder="Contoh: Belanja Sekarang / Hubungi Kami / Mulai Gratis"
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 text-white rounded-xl py-2.5 px-4 text-xs outline-none transition"
          />
        </div>

        {/* Cerita Tentang Kami */}
        <div>
          <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
            Tentang Kami (About Us Summary)
          </label>
          <textarea
            rows={3}
            value={content.aboutUs}
            onChange={(e) => updateContentField('aboutUs', e.target.value)}
            placeholder="Ceritakan sejarah singkat atau komitmen perusahaan Anda..."
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 text-white rounded-xl p-3 text-xs outline-none resize-none leading-relaxed transition"
          />
        </div>

        {/* Judul Bagian Produk / Layanan */}
        <div>
          <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
            Judul Bagian Produk / Layanan
          </label>
          <input
            type="text"
            value={content.productServiceHeadline}
            onChange={(e) => updateContentField('productServiceHeadline', e.target.value)}
            placeholder="Contoh: Produk Unggulan Minggu Ini"
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 text-white rounded-xl py-2.5 px-4 text-xs outline-none transition"
          />
        </div>
      </div>
    </div>
  );
};
