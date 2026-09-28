import React, { useState } from 'react';
import { GeneratedWebsite } from '../types';
import { deleteWebsite, saveGeneratedWebsite } from '../lib/firebase';
import { 
  History, 
  Trash2, 
  Download, 
  X, 
  Calendar, 
  Eye, 
  Search, 
  Sparkles,
  FileCode,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import JSZip from 'jszip';

interface MyProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  websites: GeneratedWebsite[];
  onSelectProject: (site: GeneratedWebsite) => void;
  onRefresh: () => void;
}

export const MyProjectsModal: React.FC<MyProjectsModalProps> = ({
  isOpen,
  onClose,
  websites,
  onSelectProject,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [previewSite, setPreviewSite] = useState<GeneratedWebsite | null>(null);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isSeeding, setIsSeeding] = useState(false);

  if (!isOpen) return null;

  const filteredWebsites = websites.filter((site) => 
    site.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (site.category && site.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    if (confirm(`Apakah Anda yakin ingin menghapus "${title}" dari riwayat?`)) {
      await deleteWebsite(id);
      if (previewSite?.id === id) setPreviewSite(null);
      onRefresh();
    }
  };

  const handleDownloadHtml = (e: React.MouseEvent, site: GeneratedWebsite) => {
    e.stopPropagation();
    const blob = new Blob([site.html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${site.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async (e: React.MouseEvent, site: GeneratedWebsite) => {
    e.stopPropagation();
    const zip = new JSZip();
    zip.file('index.html', site.html);
    zip.file('website.html', site.html);
    zip.file('README.txt', `Website dibuat dengan vimos.ai\nJudul: ${site.title}\nTanggal: ${site.createdAt}\nKategori: ${site.category || 'Toko Online'}`);
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${site.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_vimos.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenStudio = (site: GeneratedWebsite) => {
    onSelectProject(site);
    setPreviewSite(null);
    onClose();
  };

  const handleSeedExample = async () => {
    setIsSeeding(true);
    try {
      const sampleHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vimos Apparel - Modern Streetwear</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;700;800&display=swap" rel="stylesheet">
  <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
  <nav class="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white">V</div>
      <span class="font-extrabold text-xl tracking-tight text-white">Vimos<span class="text-indigo-400">Store</span></span>
    </div>
    <div class="flex items-center gap-4 text-xs font-semibold">
      <a href="#katalog" class="text-slate-300 hover:text-white">Katalog</a>
      <a href="#tentang" class="text-slate-300 hover:text-white">Tentang</a>
      <a href="https://wa.me/6281234567890?text=Halo%20VimosStore,%20saya%20tertarik%20dengan%20produk%20Anda" target="_blank" class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition">Order WhatsApp</a>
    </div>
  </nav>

  <header class="max-w-6xl mx-auto px-6 py-16 text-center">
    <span class="px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">Koleksi Terbaru 2026</span>
    <h1 class="text-4xl md:text-6xl font-black text-white mt-4 tracking-tight">Gaya Modern, Kualitas Maksimal</h1>
    <p class="text-slate-400 text-sm md:text-base max-w-xl mx-auto mt-4">Pakaian streetwear premium dengan bahan katun combed 24s adem dan potongan oversize nyaman untuk aktivitas harian.</p>
    <div class="mt-8 flex justify-center gap-3">
      <a href="#katalog" class="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition">Lihat Katalog</a>
      <a href="https://wa.me/6281234567890" target="_blank" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-sm transition">Konsultasi Ukuran</a>
    </div>
  </header>

  <section id="katalog" class="max-w-6xl mx-auto px-6 py-12">
    <h2 class="text-2xl font-bold text-white mb-8 text-center">Produk Terlaris Minggu Ini</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition">
        <img src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80" alt="Kaos" class="w-full h-64 object-cover">
        <div class="p-5">
          <span class="text-xs text-indigo-400 font-semibold">T-Shirt Oversize</span>
          <h3 class="text-base font-bold text-white mt-1">Kaos Polos Heavyweight Black</h3>
          <p class="text-slate-400 text-xs mt-1">Katun 24s gramasi tebal tidak menerawang, jahitan rantai rapi.</p>
          <div class="flex items-center justify-between mt-4">
            <span class="text-lg font-black text-white">Rp 129.000</span>
            <a href="https://wa.me/6281234567890?text=Halo%20VimosStore,%20saya%20mau%20order%20Kaos%20Polos%20Heavyweight%20Rp129.000" target="_blank" class="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg transition">Beli via WA</a>
          </div>
        </div>
      </div>

      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition">
        <img src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80" alt="Hoodie" class="w-full h-64 object-cover">
        <div class="p-5">
          <span class="text-xs text-indigo-400 font-semibold">Outerwear</span>
          <h3 class="text-base font-bold text-white mt-1">Hoodie Fleece Street Noir</h3>
          <p class="text-slate-400 text-xs mt-1">Bahan fleece tebal hangat dengan tali serut premium dan kantong kanguru.</p>
          <div class="flex items-center justify-between mt-4">
            <span class="text-lg font-black text-white">Rp 249.000</span>
            <a href="https://wa.me/6281234567890?text=Halo%20VimosStore,%20saya%20mau%20order%20Hoodie%20Fleece%20Rp249.000" target="_blank" class="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg transition">Beli via WA</a>
          </div>
        </div>
      </div>

      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition">
        <img src="https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80" alt="Chino" class="w-full h-64 object-cover">
        <div class="p-5">
          <span class="text-xs text-indigo-400 font-semibold">Pants</span>
          <h3 class="text-base font-bold text-white mt-1">Celana Chino Slim Stretch</h3>
          <p class="text-slate-400 text-xs mt-1">Katun twill stretch lentur nyaman dipakai harian kerja atau santai.</p>
          <div class="flex items-center justify-between mt-4">
            <span class="text-lg font-black text-white">Rp 189.000</span>
            <a href="https://wa.me/6281234567890?text=Halo%20VimosStore,%20saya%20mau%20order%20Celana%20Chino%20Slim%20Rp189.000" target="_blank" class="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg transition">Beli via WA</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <footer class="border-t border-slate-800 mt-20 py-8 text-center text-xs text-slate-500">
    <p>© 2026 VimosStore. Dibuat dengan vimos.ai Builder.</p>
  </footer>
</body>
</html>`;

      await saveGeneratedWebsite({
        title: 'Vimos Apparel - Modern Streetwear',
        prompt: 'Toko online pakaian modern streetwear dengan tombol checkout otomatis ke WhatsApp.',
        category: 'Toko Online',
        style: 'Modern Dark',
        html: sampleHtml,
        authorId: 'system_sample',
        authorEmail: 'putrikeren@gmail.com'
      });

      onRefresh();
    } catch (err: any) {
      alert('Gagal memuat contoh: ' + err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  const viewportWidths = {
    desktop: 'w-full max-w-full',
    tablet: 'w-[768px] max-w-full',
    mobile: 'w-[375px] max-w-full'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-5xl h-[90vh] bg-[#111827] border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0B0F19]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Riwayat Pembuatan Website</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
                  {websites.length} Website Tersimpan
                </span>
              </div>
              <p className="text-xs text-slate-400">Klik website apa saja untuk membuka & mengedit di Studio, melihat preview langsung, atau mengunduh kode.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="px-6 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan nama website / toko..."
              className="w-full bg-[#1e293b] border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {websites.length === 0 && (
              <button
                onClick={handleSeedExample}
                disabled={isSeeding}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSeeding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>+ Buat Contoh Web</span>
              </button>
            )}

            <button
              onClick={onRefresh}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              title="Segarkan data dari server"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Segarkan</span>
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredWebsites.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mx-auto flex items-center justify-center text-indigo-400">
                <History className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-200">
                  {searchTerm ? 'Tidak ada hasil yang cocok' : 'Belum ada website di riwayat'}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  {searchTerm 
                    ? 'Coba gunakan kata kunci pencarian yang lain.'
                    : 'Anda dapat membuat website baru melalui tombol di halaman utama atau klik tombol di bawah untuk membuat contoh website toko.'}
                </p>
              </div>

              {!searchTerm && (
                <button
                  onClick={handleSeedExample}
                  disabled={isSeeding}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl transition shadow-lg inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSeeding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Buat Contoh Website Toko Online Sekarang</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredWebsites.map((site) => {
                const dateObj = new Date(site.createdAt);
                const formattedDate = dateObj.toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={site.id}
                    onClick={() => handleOpenStudio(site)}
                    className="group relative bg-[#182238]/60 hover:bg-[#1e293b] border border-slate-700/80 hover:border-indigo-500 rounded-2xl p-5 cursor-pointer transition-all duration-200 shadow-lg flex flex-col justify-between space-y-4 hover:shadow-indigo-500/10 hover:shadow-2xl"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition flex items-center gap-1.5">
                            <span>{site.title}</span>
                          </h3>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{formattedDate} WIB</span>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold shrink-0">
                          {site.category || 'Toko Online'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 bg-[#0B0F19]/80 p-3 rounded-xl border border-slate-800 text-[11px] leading-relaxed">
                        {site.prompt || 'Website modern yang siap digunakan.'}
                      </p>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenStudio(site);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow cursor-pointer"
                        title="Buka dan edit website ini di Studio"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Buka di Studio</span>
                        <ArrowRight className="w-3 h-3 ml-0.5 group-hover:translate-x-0.5 transition" />
                      </button>

                      <div className="flex items-center gap-1.5">
                        {/* Live Modal Preview Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewSite(site);
                          }}
                          className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                          title="Lihat Preview Langsung"
                        >
                          <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="hidden sm:inline">Preview</span>
                        </button>

                        {/* Download HTML */}
                        <button
                          type="button"
                          onClick={(e) => handleDownloadHtml(e, site)}
                          className="p-2 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
                          title="Download File HTML (Standalone)"
                        >
                          <FileCode className="w-3.5 h-3.5" />
                        </button>

                        {/* Download ZIP */}
                        <button
                          type="button"
                          onClick={(e) => handleDownloadZip(e, site)}
                          className="p-2 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
                          title="Download ZIP"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, site.id, site.title)}
                          className="p-2 bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
                          title="Hapus dari Riwayat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Interactive In-Modal Preview Dialog */}
        {previewSite && (
          <div className="absolute inset-0 z-50 bg-[#0B0F19] flex flex-col animate-fadeIn">
            {/* Preview Dialog Topbar */}
            <div className="p-3.5 bg-[#111827] border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewSite(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Kembali ke Daftar Riwayat"
                >
                  <X className="w-4 h-4" />
                </button>
                <div>
                  <h4 className="text-xs font-bold text-white truncate max-w-xs">{previewSite.title}</h4>
                  <span className="text-[10px] text-emerald-400 font-mono">Live Interactive Preview</span>
                </div>
              </div>

              {/* Viewport switchers */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPreviewViewport('desktop')}
                  className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                    previewViewport === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Desktop (100%)"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('tablet')}
                  className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                    previewViewport === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Tablet (768px)"
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tablet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('mobile')}
                  className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                    previewViewport === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="HP (375px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">HP</span>
                </button>
              </div>

              {/* Action: Open in Studio */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleDownloadHtml(e, previewSite)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1 transition cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Download HTML</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenStudio(previewSite)}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Buka di Studio</span>
                </button>
              </div>
            </div>

            {/* Preview Iframe Container */}
            <div className="flex-1 bg-[#090D16] p-4 flex items-center justify-center overflow-hidden">
              <div className={`h-full transition-all duration-300 bg-white rounded-xl overflow-hidden shadow-2xl ${viewportWidths[previewViewport]}`}>
                <iframe
                  srcDoc={previewSite.html}
                  title={previewSite.title}
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-modals allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
