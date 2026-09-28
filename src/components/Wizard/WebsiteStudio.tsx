import React, { useState, useRef, useEffect } from 'react';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Code, 
  Eye, 
  Download, 
  Copy, 
  Maximize2, 
  Check, 
  Sparkles, 
  Save, 
  RotateCcw,
  Bot,
  Send,
  RefreshCw,
  FolderOpen,
  ArrowLeft,
  X,
  FileCode,
  Image as ImageIcon,
  Edit3,
  Plus,
  Type,
  Search,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import JSZip from 'jszip';
import { WebsiteImageEditorModal } from '../WebsiteImageEditorModal';
import { ManualContentEditorModal } from '../ManualContentEditorModal';

interface WebsiteStudioProps {
  htmlCode: string;
  onUpdateHtml: (newHtml: string) => void;
  title: string;
  onBackToWizard: () => void;
  onSaveToProjects: () => void;
  isSaving?: boolean;
}

export const WebsiteStudio: React.FC<WebsiteStudioProps> = ({
  htmlCode,
  onUpdateHtml,
  title,
  onBackToWizard,
  onSaveToProjects,
  isSaving = false,
}) => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [editableCode, setEditableCode] = useState(htmlCode);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  
  // Modals
  const [showImageEditorModal, setShowImageEditorModal] = useState(false);
  const [showManualEditorModal, setShowManualEditorModal] = useState(false);

  // Inline Direct Text Editing State
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [inlineSaveSuccess, setInlineSaveSuccess] = useState(false);

  // Code Search & Replace State
  const [showSearchReplace, setShowSearchReplace] = useState(false);
  const [searchWord, setSearchWord] = useState('');
  const [replaceWord, setReplaceWord] = useState('');

  // AI Refine Chat State
  const [showAiChat, setShowAiChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([
    {
      role: 'ai',
      text: `Website Anda telah selesai dibuat! Anda bisa meminta saya untuk mengubah warna tombol, menambahkan teks, menyusun ulang posisi, atau mempercantik tampilan.`,
    },
  ]);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setEditableCode(htmlCode);
  }, [htmlCode]);

  // Enable / disable contenteditable in iframe when isInlineEditing toggles
  useEffect(() => {
    if (activeTab !== 'preview' || !iframeRef.current) return;
    try {
      const doc = iframeRef.current.contentDocument;
      if (doc && doc.body) {
        if (isInlineEditing) {
          doc.body.contentEditable = 'true';
          doc.body.style.cursor = 'text';
          doc.designMode = 'on';
        } else {
          doc.body.contentEditable = 'false';
          doc.body.style.cursor = 'default';
          doc.designMode = 'off';
        }
      }
    } catch {}
  }, [isInlineEditing, activeTab, editableCode]);

  // Save changes from direct inline text edit
  const handleSaveInlineTextEdit = () => {
    if (!iframeRef.current) return;
    try {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.body.contentEditable = 'false';
        doc.designMode = 'off';
        const updatedHtml = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
        setEditableCode(updatedHtml);
        onUpdateHtml(updatedHtml);
        setIsInlineEditing(false);
        setInlineSaveSuccess(true);
        setTimeout(() => setInlineSaveSuccess(false), 2500);
      }
    } catch {
      setIsInlineEditing(false);
    }
  };

  // Download direct single HTML file "website.html"
  const handleDownloadHtml = () => {
    const blob = new Blob([editableCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'website.html';
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  // Download ZIP package
  const handleDownloadZip = async () => {
    const zip = new JSZip();
    zip.file('index.html', editableCode);
    zip.file('website.html', editableCode);
    zip.file('README.txt', `Website dibuat dengan Vimos.ai\nJudul: ${title}\nTanggal: ${new Date().toLocaleString('id-ID')}\nBuka file website.html langsung di browser Anda.`);
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_vimos.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(editableCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Insert Quick Snippet into Code Editor
  const handleInsertSnippet = (snippetType: string) => {
    let snippetHtml = '';

    if (snippetType === 'product') {
      snippetHtml = `
<!-- Kartu Produk Tambahan -->
<div class="product-item bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl group">
  <div class="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-950 mb-3.5">
    <img src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80" alt="Produk Baru" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
    <span class="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-white text-black text-[10px] font-bold">Baru</span>
  </div>
  <div class="space-y-1.5 flex-1 flex flex-col justify-between">
    <div>
      <h4 class="text-sm font-bold text-white">Nama Produk Tambahan</h4>
      <p class="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mt-1">Bahan premium berkualitas tinggi dengan desain modern.</p>
    </div>
    <div class="pt-3 border-t border-zinc-800 flex items-center justify-between mt-3">
      <span class="text-sm font-extrabold text-white font-mono">Rp 175.000</span>
      <a href="https://wa.me/6281234567890?text=Halo%20saya%20ingin%20pesan%20produk%20ini" target="_blank" rel="noreferrer" class="px-3 py-1.5 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-xl transition">
        Beli
      </a>
    </div>
  </div>
</div>`;
    } else if (snippetType === 'banner') {
      snippetHtml = `
<!-- Banner Promo Spesial -->
<section class="py-12 px-4 bg-zinc-950 border-y border-zinc-800 my-8">
  <div class="max-w-4xl mx-auto text-center space-y-4 p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl">
    <span class="px-3 py-1 rounded-full bg-white text-black text-xs font-bold">🔥 PROMO TERBATAS</span>
    <h3 class="text-2xl sm:text-3xl font-extrabold text-white">Dapatkan Penawaran Spesial Hari Ini</h3>
    <p class="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">Hubungi kami via WhatsApp untuk mendapatkan potongan harga eksklusif.</p>
    <a href="https://wa.me/6281234567890?text=Halo%20klaim%20diskon" target="_blank" rel="noreferrer" class="inline-block px-6 py-3 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-xl shadow transition">
      Klaim Promo via WhatsApp
    </a>
  </div>
</section>`;
    } else if (snippetType === 'testimonial') {
      snippetHtml = `
<!-- Kartu Testimoni Tambahan -->
<div class="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
  <div class="text-amber-400 text-sm">★★★★★</div>
  <p class="text-xs text-zinc-300 leading-relaxed">"Pelayanan luar biasa, produk sangat berkualitas dan proses pemesanan via WhatsApp sangat praktis!"</p>
  <div class="text-xs font-bold text-white">— Pelanggan Puas <span class="text-zinc-500 font-normal">(Indonesia)</span></div>
</div>`;
    } else if (snippetType === 'faq') {
      snippetHtml = `
<!-- FAQ Accordion Tambahan -->
<details class="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 cursor-pointer group">
  <summary class="text-xs font-bold text-white flex justify-between items-center select-none">
    <span>Pertanyaan Baru yang Ditambahkan?</span>
    <span class="text-zinc-500 group-open:rotate-180 transition">▼</span>
  </summary>
  <p class="text-xs text-zinc-400 mt-2.5 leading-relaxed pt-2 border-t border-zinc-800/80">
    Jawaban penjelasan detail untuk mempermudah calon pembeli memahami produk Anda.
  </p>
</details>`;
    } else if (snippetType === 'wa_button') {
      snippetHtml = `
<!-- Tombol WhatsApp Mengambang -->
<a href="https://wa.me/6281234567890?text=Halo%20saya%20tertarik" target="_blank" rel="noreferrer" class="fixed bottom-6 right-6 z-40 px-4 py-3 bg-white text-black font-bold text-xs rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 transition">
  <span>💬 Chat WhatsApp</span>
</a>`;
    }

    let updated = editableCode;
    if (updated.includes('<footer')) {
      updated = updated.replace('<footer', `${snippetHtml}\n\n<footer`);
    } else if (updated.includes('</body>')) {
      updated = updated.replace('</body>', `${snippetHtml}\n</body>`);
    } else {
      updated += snippetHtml;
    }

    setEditableCode(updated);
    onUpdateHtml(updated);
  };

  // Search & Replace within code
  const handleExecuteReplace = () => {
    if (!searchWord) return;
    const escaped = searchWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'g');
    const updated = editableCode.replace(regex, replaceWord);
    setEditableCode(updated);
    onUpdateHtml(updated);
    setShowSearchReplace(false);
  };

  // Edit dengan AI
  const handleSendAiRefinement = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const promptToSend = (customPrompt || chatInput).trim();
    if (!promptToSend || isRefining) return;

    setChatInput('');
    setIsRefining(true);
    setChatMessages((prev) => [...prev, { role: 'user', text: promptToSend }]);

    try {
      const res = await fetch('/api/refine-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentHtml: editableCode,
          refinementPrompt: promptToSend,
        }),
      });

      const resData = await res.json();
      if (resData.success && resData.html) {
        onUpdateHtml(resData.html);
        setEditableCode(resData.html);
        setChatMessages((prev) => [
          ...prev,
          { role: 'ai', text: `Perubahan berhasil diterapkan: "${promptToSend}". Cek preview langsung!` },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { role: 'ai', text: `Maaf, gagal memproses perubahan: ${resData.error || 'Terjadi kendala jaringan'}` },
        ]);
      }
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'ai', text: `Terjadi error: ${err?.message || 'Gagal menghubungi server'}` },
      ]);
    } finally {
      setIsRefining(false);
    }
  };

  const viewportWidths = {
    desktop: 'w-full max-w-full',
    tablet: 'w-[768px] max-w-full',
    mobile: 'w-[375px] max-w-full',
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-62px)] bg-black text-zinc-100 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Studio Control Bar */}
      <div className="px-3 sm:px-4 py-2.5 bg-zinc-950 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        
        {/* Left: Back & Title */}
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToWizard}
            className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Kembali ke Wizard 15 Langkah untuk Ubah Pengaturan"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:inline">Wizard (15 Langkah)</span>
          </button>

          <div className="h-5 w-px bg-zinc-800 mx-1 hidden sm:block" />

          <div>
            <h3 className="text-xs font-bold text-white truncate max-w-[150px] sm:max-w-xs">{title}</h3>
            <span className="text-[10px] text-zinc-400 font-mono">1 File Standalone (HTML+CSS+JS)</span>
          </div>
        </div>

        {/* Center: Viewport & Mode Toggle */}
        <div className="flex items-center gap-2">
          {/* Viewport Toggles */}
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
                viewport === 'desktop' ? 'bg-white text-black shadow-sm font-bold' : 'text-zinc-400 hover:text-white'
              }`}
              title="Desktop (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>

            <button
              onClick={() => setViewport('tablet')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
                viewport === 'tablet' ? 'bg-white text-black shadow-sm font-bold' : 'text-zinc-400 hover:text-white'
              }`}
              title="Tablet (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>

            <button
              onClick={() => setViewport('mobile')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
                viewport === 'mobile' ? 'bg-white text-black shadow-sm font-bold' : 'text-zinc-400 hover:text-white'
              }`}
              title="Mobile (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">HP</span>
            </button>
          </div>

          {/* Mode Switcher: Preview | Code */}
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => {
                setActiveTab('preview');
                setIsInlineEditing(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'preview' ? 'bg-white text-black shadow-sm font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('code');
                setIsInlineEditing(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'code' ? 'bg-white text-black shadow-sm font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Code Editor</span>
            </button>
          </div>
        </div>

        {/* Right Actions: Manual Edit, Image Edit, Inline Edit, AI Chat toggle, Save, Download */}
        <div className="flex items-center gap-2">
          {/* 1. BUTTON: EDIT MANUAL & TAMBAH KONTEN */}
          <button
            onClick={() => setShowManualEditorModal(true)}
            className="px-3 py-1.5 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow transition cursor-pointer"
            title="Buka Menu Edit Manual: Tambah Produk Baru, Tambah Section, Ubah Teks & Kontak"
          >
            <Edit3 className="w-3.5 h-3.5 text-black" />
            <span>Edit Manual & Tambah</span>
          </button>

          {/* 2. BUTTON: INLINE TEXT EDIT TOGGLE (Preview Only) */}
          {activeTab === 'preview' && (
            <button
              onClick={() => setIsInlineEditing(!isInlineEditing)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                isInlineEditing
                  ? 'bg-zinc-900 text-white border-white ring-1 ring-white'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white'
              }`}
              title="Klik teks apa saja di website untuk mengeditnya secara langsung"
            >
              <Type className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isInlineEditing ? 'Mode Edit Aktif' : 'Edit Teks Langsung'}</span>
            </button>
          )}

          {/* 3. BUTTON: GANTI FOTO & IMGUR */}
          <button
            onClick={() => setShowImageEditorModal(true)}
            className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-zinc-800 transition shadow-sm cursor-pointer"
            title="Kelola & Ganti Foto Produk / Banner dengan Link Imgur"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Ganti Foto</span>
          </button>

          {/* 4. BUTTON: TOGGLE AI CHAT */}
          <button
            onClick={() => setShowAiChat(!showAiChat)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer ${
              showAiChat
                ? 'bg-zinc-800 text-white border-zinc-600 shadow'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Edit AI</span>
          </button>

          {/* 5. BUTTON: SIMPAN WEBSITE */}
          <button
            onClick={() => {
              onUpdateHtml(editableCode);
              onSaveToProjects();
            }}
            disabled={isSaving}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            title="Simpan seluruh perubahan manual dan AI ke database website Anda"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isSaving ? 'Menyimpan...' : 'Simpan'}</span>
          </button>

          {/* 6. BUTTON: DOWNLOAD HTML */}
          <button
            onClick={handleDownloadHtml}
            className="p-1.5 sm:px-3 sm:py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-zinc-800 transition cursor-pointer"
            title="Download Single File website.html"
          >
            {downloadSuccess ? <Check className="w-3.5 h-3.5 text-white" /> : <Download className="w-3.5 h-3.5 text-white" />}
            <span className="hidden md:inline">Download HTML</span>
          </button>

          <button
            onClick={handleDownloadZip}
            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl border border-zinc-800 transition cursor-pointer"
            title="Download Paket ZIP"
          >
            <FileCode className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopyCode}
            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl border border-zinc-800 transition cursor-pointer"
            title="Salin Seluruh Kode HTML"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsFullscreen(true)}
            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl border border-zinc-800 transition cursor-pointer"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inline Direct Text Editing Floating Toolbar (when active) */}
      {isInlineEditing && (
        <div className="bg-zinc-900 border-b border-zinc-700 px-4 py-2 flex items-center justify-between text-xs text-zinc-200 animate-fadeIn shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span><strong>Mode Edit Teks Langsung Aktif:</strong> Silakan klik teks, judul, harga atau paragraf mana saja di bawah dan ketik perubahan Anda.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsInlineEditing(false)}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs transition cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleSaveInlineTextEdit}
              className="px-4 py-1 bg-white hover:bg-zinc-200 text-black font-bold rounded-lg text-xs shadow flex items-center gap-1 transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Hasil Edit Teks</span>
            </button>
          </div>
        </div>
      )}

      {inlineSaveSuccess && (
        <div className="bg-zinc-900 border-b border-zinc-700 px-4 py-1.5 text-center text-xs text-white flex items-center justify-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>Perubahan teks langsung berhasil disimpan ke kode website!</span>
        </div>
      )}

      {/* Main Studio Canvas & Drawer */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Visual Preview / Code Workspace */}
        <div className="flex-1 flex items-center justify-center p-3 overflow-auto bg-black">
          {activeTab === 'preview' ? (
            <div
              className={`h-full transition-all duration-300 ${viewportWidths[viewport]} bg-white rounded-xl overflow-hidden shadow-2xl relative border border-zinc-800`}
            >
              <iframe
                ref={iframeRef}
                srcDoc={editableCode}
                title={title}
                className="w-full h-full border-none"
                sandbox="allow-scripts allow-modals allow-same-origin allow-forms"
              />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden font-mono text-xs">
              
              {/* Code Editor Header & Quick Snippets Toolbar */}
              <div className="p-2.5 bg-zinc-900 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-zinc-300">
                <span className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-white" />
                  <span>index.html (Single File Standalone)</span>
                </span>

                {/* Quick Snippet Inserters */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-zinc-400 font-sans font-semibold mr-1">Sisipkan Cepat:</span>
                  <button
                    type="button"
                    onClick={() => handleInsertSnippet('product')}
                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg font-sans text-[11px] font-semibold border border-zinc-700 transition cursor-pointer"
                  >
                    + Produk
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertSnippet('banner')}
                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg font-sans text-[11px] font-semibold border border-zinc-700 transition cursor-pointer"
                  >
                    + Banner Promo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertSnippet('testimonial')}
                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg font-sans text-[11px] font-semibold border border-zinc-700 transition cursor-pointer"
                  >
                    + Testimoni
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertSnippet('faq')}
                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg font-sans text-[11px] font-semibold border border-zinc-700 transition cursor-pointer"
                  >
                    + FAQ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertSnippet('wa_button')}
                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg font-sans text-[11px] font-semibold border border-zinc-700 transition cursor-pointer"
                  >
                    + Tombol WA
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSearchReplace(!showSearchReplace)}
                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg font-sans text-[11px] font-semibold border border-zinc-700 transition cursor-pointer"
                  >
                    <Search className="w-3 h-3 inline mr-1" />
                    Cari & Ganti
                  </button>
                  <button
                    onClick={() => onUpdateHtml(editableCode)}
                    className="px-3 py-1 bg-white hover:bg-zinc-200 text-black rounded-lg font-sans text-xs font-bold flex items-center gap-1 transition cursor-pointer ml-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-black" />
                    <span>Terapkan Kode</span>
                  </button>
                </div>
              </div>

              {/* Find & Replace Bar */}
              {showSearchReplace && (
                <div className="p-2 bg-zinc-900/90 border-b border-zinc-800 flex items-center gap-2 text-xs font-sans animate-fadeIn">
                  <input
                    type="text"
                    value={searchWord}
                    onChange={(e) => setSearchWord(e.target.value)}
                    placeholder="Kata yang dicari..."
                    className="bg-black border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white outline-none w-48"
                  />
                  <span className="text-zinc-500">ganti dengan</span>
                  <input
                    type="text"
                    value={replaceWord}
                    onChange={(e) => setReplaceWord(e.target.value)}
                    placeholder="Kata pengganti..."
                    className="bg-black border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white outline-none w-48"
                  />
                  <button
                    type="button"
                    onClick={handleExecuteReplace}
                    className="px-3 py-1 bg-white text-black hover:bg-zinc-200 rounded-lg font-bold text-xs cursor-pointer"
                  >
                    Ganti Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSearchReplace(false)}
                    className="p-1 text-zinc-400 hover:text-white cursor-pointer ml-auto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <textarea
                value={editableCode}
                onChange={(e) => setEditableCode(e.target.value)}
                className="w-full flex-1 p-4 bg-black text-zinc-100 font-mono text-xs outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>
          )}
        </div>

        {/* AI Chat Refinement Sidebar (Step 18) */}
        {showAiChat && (
          <div className="w-80 sm:w-96 bg-zinc-950 border-l border-zinc-800 flex flex-col z-20 shrink-0">
            {/* Chat Header */}
            <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between bg-black">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Vimos AI Assistant</h4>
                  <p className="text-[10px] text-zinc-400">Ketik permintaan untuk mengedit website</p>
                </div>
              </div>

              <button
                onClick={() => setShowAiChat(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat History Messages */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs font-sans">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl max-w-[90%] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-white text-black font-medium ml-auto'
                      : 'bg-zinc-900 text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {msg.text}
                </div>
              ))}

              {isRefining && (
                <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-700 text-zinc-200 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Vimos AI sedang memperbarui website...</span>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div className="p-2.5 bg-black border-t border-zinc-800/80 flex flex-wrap gap-1.5">
              {[
                'Tambahkan 3 produk baru',
                'Ganti foto produk dengan link Imgur',
                'Ganti warna tombol menjadi hitam putih',
                'Buat header lebih minimalis',
                'Tambahkan section FAQ pertanyaan',
                'Pindahkan About ke bawah Products',
              ].map((chip, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendAiRefinement(undefined, chip)}
                  className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-[10px] text-zinc-300 hover:text-white rounded-lg border border-zinc-800 transition cursor-pointer"
                >
                  + {chip}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendAiRefinement} className="p-3 bg-black border-t border-zinc-800 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Contoh: Tambahkan 2 produk baru dan diskon 20%..."
                className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 text-white text-xs rounded-xl py-2 px-3 outline-none"
              />
              <button
                type="submit"
                disabled={isRefining || !chatInput.trim()}
                className="p-2 bg-white hover:bg-zinc-200 text-black rounded-xl disabled:opacity-50 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Manual Content & Structure Editor Modal */}
      <ManualContentEditorModal
        isOpen={showManualEditorModal}
        onClose={() => setShowManualEditorModal(false)}
        htmlCode={editableCode}
        onSaveHtml={(newHtml) => {
          setEditableCode(newHtml);
          onUpdateHtml(newHtml);
        }}
        siteTitle={title}
      />

      {/* Website Image Editor & Imgur Modal */}
      <WebsiteImageEditorModal
        isOpen={showImageEditorModal}
        onClose={() => setShowImageEditorModal(false)}
        htmlCode={editableCode}
        onSaveHtml={(newHtml) => {
          setEditableCode(newHtml);
          onUpdateHtml(newHtml);
        }}
      />

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animate-fadeIn">
          <div className="p-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-6">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Sparkles className="w-4 h-4 text-white" />
              <span>Fullscreen: {title}</span>
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Tutup Fullscreen
            </button>
          </div>
          <iframe
            srcDoc={editableCode}
            title={`${title}-fullscreen`}
            className="w-full flex-1 border-none bg-white"
            sandbox="allow-scripts allow-modals allow-same-origin allow-forms"
          />
        </div>
      )}
    </div>
  );
};
