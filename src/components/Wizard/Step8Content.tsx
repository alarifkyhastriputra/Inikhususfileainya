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
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center space-y-1.5 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Langkah 8: Isi Konten & Teks
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Tentukan Teks & Narasi</h2>
        <p className="text-xs text-slate-400">
          Masukkan judul, deskripsi, dan tombol Call to Action, atau gunakan asisten AI untuk menulis teks profesional secara otomatis.
        </p>
      </div>

      {/* AI Generate Content Banner */}
      <div className="bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900 border border-purple-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Buat Konten Otomatis dengan AI</h4>
            <p className="text-xs text-slate-400">
              AI akan membuatkan judul menarik, slogan persuasif, deskripsi bisnis, dan teks tombol CTA.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerateAIContent}
          disabled={loadingAI}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-lg shadow-purple-600/25 disabled:opacity-50"
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
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Konten berhasil dibuat oleh AI berdasarkan informasi bisnis Anda!</span>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4 bg-[#111827] p-6 rounded-2xl border border-slate-800 shadow-xl">
        {/* Judul Utama */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5">
            Judul Utama (Headline) *
          </label>
          <input
            type="text"
            required
            value={content.headline}
            onChange={(e) => updateContentField('headline', e.target.value)}
            placeholder="Contoh: Selamat Datang di Vimos Store"
            className="w-full bg-[#1e293b] border border-slate-700 focus:border-indigo-500 text-white rounded-xl py-2.5 px-4 text-sm outline-none"
          />
        </div>

        {/* Subjudul / Deskripsi */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5">
            Subjudul / Slogan Pendukung (Subheadline)
          </label>
          <textarea
            rows={2}
            value={content.subheadline}
            onChange={(e) => updateContentField('subheadline', e.target.value)}
            placeholder="Contoh: Temukan berbagai produk pilihan kami dengan kualitas terbaik dan promo menarik."
            className="w-full bg-[#1e293b] border border-slate-700 focus:border-indigo-500 text-white rounded-xl p-3 text-xs outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Tombol CTA */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5">
            Teks Tombol Aksi (CTA Button)
          </label>
          <input
            type="text"
            value={content.ctaText}
            onChange={(e) => updateContentField('ctaText', e.target.value)}
            placeholder="Contoh: Belanja Sekarang / Hubungi Kami / Mulai Gratis"
            className="w-full bg-[#1e293b] border border-slate-700 focus:border-indigo-500 text-white rounded-xl py-2.5 px-4 text-xs outline-none"
          />
        </div>

        {/* Cerita Tentang Kami */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5">
            Tentang Kami (About Us Summary)
          </label>
          <textarea
            rows={3}
            value={content.aboutUs}
            onChange={(e) => updateContentField('aboutUs', e.target.value)}
            placeholder="Ceritakan sejarah singkat atau komitmen perusahaan Anda..."
            className="w-full bg-[#1e293b] border border-slate-700 focus:border-indigo-500 text-white rounded-xl p-3 text-xs outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Judul Bagian Produk / Layanan */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5">
            Judul Bagian Produk / Layanan
          </label>
          <input
            type="text"
            value={content.productServiceHeadline}
            onChange={(e) => updateContentField('productServiceHeadline', e.target.value)}
            placeholder="Contoh: Produk Unggulan Minggu Ini"
            className="w-full bg-[#1e293b] border border-slate-700 focus:border-indigo-500 text-white rounded-xl py-2.5 px-4 text-xs outline-none"
          />
        </div>
      </div>
    </div>
  );
};
