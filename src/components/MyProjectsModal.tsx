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
  currentUserEmail?: string;
}

export const MyProjectsModal: React.FC<MyProjectsModalProps> = ({
  isOpen,
  onClose,
  websites,
  onSelectProject,
  onRefresh,
  currentUserEmail = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [previewSite, setPreviewSite] = useState<GeneratedWebsite | null>(null);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isSeeding, setIsSeeding] = useState(false);

  if (!isOpen) return null;

  const normUserEmail = currentUserEmail.trim().toLowerCase();

  // Strictly filter by current user email to avoid history bleeding into other users
  const userWebsites = normUserEmail 
    ? websites.filter(s => (s.authorEmail || '').trim().toLowerCase() === normUserEmail)
    : websites;

  const filteredWebsites = userWebsites.filter((site) => 
    site.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (site.category && site.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    if (confirm(`Apakah Anda yakin ingin menghapus "${title}" dari riwayat?`)) {
      await deleteWebsite(id, normUserEmail);
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
  <title>Vimos Apparel - Streetwear</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>body{font-family:'Plus Jakarta Sans',sans-serif;}</style>
</head>
<body class="bg-black text-zinc-100 min-h-screen">
  <nav class="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 rounded-lg bg-white text-black font-black flex items-center justify-center">V</div>
      <span class="font-extrabold text-xl text-white">Vimos<span class="text-zinc-400">Store</span></span>
    </div>
    <div class="flex items-center gap-4 text-xs font-semibold">
      <a href="#katalog" class="text-zinc-300 hover:text-white">Katalog</a>
      <a href="https://wa.me/6281234567890?text=Halo%20VimosStore,%20saya%20tertarik%20dengan%20produk%20Anda" target="_blank" class="px-4 py-2 bg-white text-black font-bold rounded-xl transition">Order WhatsApp</a>
    </div>
  </nav>

  <header class="max-w-6xl mx-auto px-6 py-16 text-center">
    <span class="px-3.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider">Koleksi 2026</span>
    <h1 class="text-4xl md:text-6xl font-black text-white mt-4 tracking-tight">Gaya Modern, Kualitas Maksimal</h1>
    <p class="text-zinc-400 text-sm md:text-base max-w-xl mx-auto mt-4">Pakaian streetwear premium dengan katun combed 24s potongan rapi dan nyaman.</p>
    <div class="mt-8 flex justify-center gap-3">
      <a href="#katalog" class="px-6 py-3 bg-white text-black font-bold rounded-xl text-sm transition">Lihat Katalog</a>
      <a href="https://wa.me/6281234567890" target="_blank" class="px-6 py-3 bg-zinc-900 text-zinc-200 border border-zinc-800 font-bold rounded-xl text-sm transition">Konsultasi Ukuran</a>
    </div>
  </header>

  <section id="katalog" class="max-w-6xl mx-auto px-6 py-12">
    <h2 class="text-2xl font-bold text-white mb-8 text-center">Produk Terlaris Minggu Ini</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
        <img src="https://i.imgur.com/8Km9tLL.jpg" alt="Kaos" class="w-full h-64 object-cover">
        <div class="p-5">
          <span class="text-xs text-zinc-400 font-semibold">T-Shirt Oversize</span>
          <h3 class="text-base font-bold text-white mt-1">Kaos Heavyweight Black</h3>
          <div class="flex items-center justify-between mt-4">
            <span class="text-lg font-black text-white">Rp 129.000</span>
            <a href="https://wa.me/6281234567890?text=Halo%20VimosStore,%20saya%20mau%20order%20Kaos" target="_blank" class="px-3.5 py-1.5 bg-white text-black font-bold text-xs rounded-lg transition">Beli via WA</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <footer class="border-t border-zinc-800 mt-20 py-8 text-center text-xs text-zinc-500">
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
        authorEmail: normUserEmail || 'member@vimos.ai'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-5xl h-[90vh] bg-black border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white shadow">
              <History className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Riwayat Pembuatan Website</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800 text-xs font-bold font-mono">
                  {filteredWebsites.length} Website Tersimpan
                </span>
              </div>
              <p className="text-xs text-zinc-400">Website yang tersimpan terisolasi khusus untuk akun Anda ({normUserEmail || 'Akun Anda'})</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="px-6 py-3 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan nama website / niche..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {filteredWebsites.length === 0 && (
              <button
                onClick={handleSeedExample}
                disabled={isSeeding}
                className="px-3.5 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSeeding ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" /> : <Sparkles className="w-3.5 h-3.5 text-black" />}
                <span>+ Buat Contoh Web</span>
              </button>
            )}

            <button
              onClick={onRefresh}
              className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              title="Segarkan data dari server"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Segarkan</span>
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-6 bg-black">
          {filteredWebsites.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center text-zinc-400">
                <History className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-200">
                  {searchTerm ? 'Tidak ada hasil yang cocok' : 'Belum ada website di riwayat'}
                </h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
                  {searchTerm 
                    ? 'Coba gunakan kata kunci pencarian yang lain.'
                    : 'Website yang telah Anda generate akan muncul di sini. Anda juga bisa mencoba membuat contoh web toko.'}
                </p>
              </div>

              {!searchTerm && (
                <button
                  onClick={handleSeedExample}
                  disabled={isSeeding}
                  className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-xl transition shadow inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSeeding ? <RefreshCw className="w-4 h-4 animate-spin text-black" /> : <Sparkles className="w-4 h-4 text-black" />}
                  <span>Buat Contoh Website Toko Sekarang</span>
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
                    className="group relative bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 cursor-pointer transition shadow-lg flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-bold text-white text-base group-hover:text-zinc-200 transition flex items-center gap-1.5">
                            <span>{site.title}</span>
                          </h3>
                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-1">
                            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{formattedDate} WIB</span>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-bold shrink-0">
                          {site.category || 'Toko Online'}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400 line-clamp-2 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80 text-[11px] leading-relaxed">
                        {site.prompt || 'Website modern yang siap digunakan.'}
                      </p>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenStudio(site);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold flex items-center gap-1.5 transition shadow cursor-pointer"
                        title="Buka dan edit website ini di Studio"
                      >
                        <Eye className="w-3.5 h-3.5 text-black" />
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
                          className="px-2.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                          title="Lihat Preview Langsung"
                        >
                          <Monitor className="w-3.5 h-3.5 text-zinc-300" />
                          <span className="hidden sm:inline">Preview</span>
                        </button>

                        {/* Download HTML */}
                        <button
                          type="button"
                          onClick={(e) => handleDownloadHtml(e, site)}
                          className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-xl transition cursor-pointer"
                          title="Download File HTML (Standalone)"
                        >
                          <FileCode className="w-3.5 h-3.5" />
                        </button>

                        {/* Download ZIP */}
                        <button
                          type="button"
                          onClick={(e) => handleDownloadZip(e, site)}
                          className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-xl transition cursor-pointer"
                          title="Download ZIP"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, site.id, site.title)}
                          className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-xl transition cursor-pointer"
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
          <div className="absolute inset-0 z-50 bg-black flex flex-col animate-fadeIn">
            {/* Preview Dialog Topbar */}
            <div className="p-3.5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewSite(null)}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer"
                  title="Kembali ke Daftar Riwayat"
                >
                  <X className="w-4 h-4" />
                </button>
                <div>
                  <h4 className="text-xs font-bold text-white truncate max-w-xs">{previewSite.title}</h4>
                  <span className="text-[10px] text-zinc-400 font-mono">Live Interactive Preview</span>
                </div>
              </div>

              {/* Viewport switchers */}
              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setPreviewViewport('desktop')}
                  className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                    previewViewport === 'desktop' ? 'bg-white text-black font-bold shadow' : 'text-zinc-400 hover:text-white'
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
                    previewViewport === 'tablet' ? 'bg-white text-black font-bold shadow' : 'text-zinc-400 hover:text-white'
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
                    previewViewport === 'mobile' ? 'bg-white text-black font-bold shadow' : 'text-zinc-400 hover:text-white'
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
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-semibold rounded-xl flex items-center gap-1 transition cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 text-zinc-300" />
                  <span className="hidden sm:inline">Download HTML</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenStudio(previewSite)}
                  className="px-4 py-1.5 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-black" />
                  <span>Buka di Studio</span>
                </button>
              </div>
            </div>

            {/* Preview Iframe Container */}
            <div className="flex-1 bg-black p-4 flex items-center justify-center overflow-hidden">
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
