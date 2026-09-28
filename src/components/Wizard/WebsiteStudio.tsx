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
  Image as ImageIcon
} from 'lucide-react';
import JSZip from 'jszip';
import { WebsiteImageEditorModal } from '../WebsiteImageEditorModal';

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
  const [showImageEditorModal, setShowImageEditorModal] = useState(false);

  // AI Refine Chat State
  const [showAiChat, setShowAiChat] = useState(true);
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

  // Step 20: Download direct single HTML file "website.html"
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

  // Step 20: Download ZIP package
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

  // Step 20: Copy Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(editableCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Step 18: Edit dengan AI
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
    <div className="flex-1 flex flex-col h-[calc(100vh-62px)] bg-[#090D16] overflow-hidden">
      
      {/* Top Studio Control Bar */}
      <div className="px-4 py-2.5 bg-[#111827] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        
        {/* Left: Back & Title */}
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToWizard}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
            title="Kembali ke Wizard untuk Ubah Pengaturan"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:inline">Ubah Pengaturan</span>
          </button>

          <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block" />

          <div>
            <h3 className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs">{title}</h3>
            <span className="text-[10px] text-emerald-400 font-mono">1 File Standalone (HTML+CSS+JS)</span>
          </div>
        </div>

        {/* Center: Viewport & Mode Toggle */}
        <div className="flex items-center gap-2">
          {/* Viewport Toggles */}
          <div className="flex items-center gap-1 bg-[#1e293b] p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                viewport === 'desktop' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Desktop (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>

            <button
              onClick={() => setViewport('tablet')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                viewport === 'tablet' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Tablet (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>

            <button
              onClick={() => setViewport('mobile')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                viewport === 'mobile' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">HP</span>
            </button>
          </div>

          {/* Mode Switcher: Preview | Code */}
          <div className="flex items-center gap-1 bg-[#1e293b] p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'preview' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'code' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Code Editor</span>
            </button>
          </div>
        </div>

        {/* Right Actions: AI Chat toggle, Save, Download HTML, Copy */}
        <div className="flex items-center gap-2">
          {/* Ganti Foto & Link Imgur Button */}
          <button
            onClick={() => setShowImageEditorModal(true)}
            className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-indigo-500/40 transition shadow cursor-pointer"
            title="Kelola & Ganti Foto Produk / Banner dengan Link Imgur"
          >
            <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ganti Foto & Imgur</span>
          </button>

          {/* Toggle AI Chat button */}
          <button
            onClick={() => setShowAiChat(!showAiChat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer ${
              showAiChat
                ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Edit AI</span>
          </button>

          <button
            onClick={() => {
              onUpdateHtml(editableCode);
              onSaveToProjects();
            }}
            disabled={isSaving}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
            title="Simpan seluruh perubahan manual dan AI ke database website Anda"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Website'}</span>
          </button>

          {/* Direct Download website.html Button */}
          <button
            onClick={handleDownloadHtml}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition"
          >
            {downloadSuccess ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
            <span>Download HTML</span>
          </button>

          <button
            onClick={handleDownloadZip}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition"
            title="Download Paket ZIP"
          >
            <FileCode className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopyCode}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition"
            title="Salin Seluruh Kode HTML"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsFullscreen(true)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Studio Canvas & Drawer */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Visual Preview / Code Workspace */}
        <div className="flex-1 flex items-center justify-center p-3 overflow-auto bg-[#070B14]">
          {activeTab === 'preview' ? (
            <div
              className={`h-full transition-all duration-300 ${viewportWidths[viewport]} bg-white rounded-xl overflow-hidden shadow-2xl relative border border-slate-700`}
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
            <div className="w-full h-full flex flex-col bg-[#0F172A] rounded-xl border border-slate-800 overflow-hidden font-mono text-xs">
              <div className="p-3 bg-[#1e293b] border-b border-slate-800 flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-indigo-400" />
                  <span>index.html (Single File Standalone)</span>
                </span>

                <button
                  onClick={() => onUpdateHtml(editableCode)}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-sans text-xs font-semibold flex items-center gap-1 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Terapkan Perubahan Manual</span>
                </button>
              </div>

              <textarea
                value={editableCode}
                onChange={(e) => setEditableCode(e.target.value)}
                className="w-full flex-1 p-4 bg-[#090D16] text-emerald-400 font-mono text-xs outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>
          )}
        </div>

        {/* AI Chat Refinement Sidebar (Step 18) */}
        {showAiChat && (
          <div className="w-80 sm:w-96 bg-[#111827] border-l border-slate-800 flex flex-col z-20 shrink-0">
            {/* Chat Header */}
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-[#0B0F19]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Vimos AI Assistant</h4>
                  <p className="text-[10px] text-slate-400">Ketik permintaan untuk mengedit website</p>
                </div>
              </div>

              <button
                onClick={() => setShowAiChat(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
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
                      ? 'bg-indigo-600 text-white ml-auto'
                      : 'bg-[#1e293b] text-slate-200 border border-slate-700/60'
                  }`}
                >
                  {msg.text}
                </div>
              ))}

              {isRefining && (
                <div className="p-3 rounded-2xl bg-[#1e293b] border border-purple-500/40 text-purple-300 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Vimos AI sedang memperbarui website...</span>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div className="p-2.5 bg-[#0B0F19] border-t border-slate-800/80 flex flex-wrap gap-1.5">
              {[
                'Ganti foto produk dengan link Imgur',
                'Ganti warna tombol menjadi merah',
                'Buat header lebih kecil',
                'Tambahkan 3 produk baru',
                'Buat tampilannya lebih modern',
                'Pindahkan About ke bawah Products',
              ].map((chip, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendAiRefinement(undefined, chip)}
                  className="px-2 py-1 bg-[#1e293b] hover:bg-slate-800 text-[10px] text-slate-300 hover:text-white rounded-lg border border-slate-700 transition"
                >
                  + {chip}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendAiRefinement} className="p-3 bg-[#0B0F19] border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Contoh: Ganti warna tombol menjadi merah..."
                className="flex-1 bg-[#1e293b] border border-slate-700 text-white text-xs rounded-xl py-2 px-3 outline-none"
              />
              <button
                type="submit"
                disabled={isRefining || !chatInput.trim()}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>

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
          <div className="p-3 bg-[#111827] border-b border-slate-800 flex items-center justify-between px-6">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Fullscreen: {title}</span>
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition"
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
