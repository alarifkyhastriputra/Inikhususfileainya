import React, { useState, useEffect, useRef } from 'react';
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
  MessageSquare
} from 'lucide-react';
import JSZip from 'jszip';

interface WebsitePreviewProps {
  htmlCode: string;
  onUpdateHtml: (newHtml: string) => void;
  title: string;
  onSaveProject: () => void;
  onOpenRefine: () => void;
  isSaving?: boolean;
}

export const WebsitePreview: React.FC<WebsitePreviewProps> = ({
  htmlCode,
  onUpdateHtml,
  title,
  onSaveProject,
  onOpenRefine,
  isSaving = false
}) => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [editableCode, setEditableCode] = useState(htmlCode);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setEditableCode(htmlCode);
  }, [htmlCode]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(editableCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    zip.file('index.html', editableCode);
    zip.file('README.txt', `Generated with vimos.ai\nTitle: ${title}\nDate: ${new Date().toISOString()}`);
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_vimos.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const viewportWidths = {
    desktop: 'w-full max-w-full',
    tablet: 'w-[768px] max-w-full',
    mobile: 'w-[375px] max-w-full'
  };

  return (
    <div className="flex flex-col h-full bg-black rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl text-zinc-100 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Preview Control Bar */}
      <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Viewport Toggles */}
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
              viewport === 'desktop' ? 'bg-white text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
            title="Desktop View (100%)"
          >
            <Monitor className="w-4 h-4" />
            <span className="hidden sm:inline">Desktop</span>
          </button>

          <button
            onClick={() => setViewport('tablet')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
              viewport === 'tablet' ? 'bg-white text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
            title="Tablet View (768px)"
          >
            <Tablet className="w-4 h-4" />
            <span className="hidden sm:inline">Tablet</span>
          </button>

          <button
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
              viewport === 'mobile' ? 'bg-white text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
            title="Mobile View (375px)"
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* Center: Mode Switcher */}
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'preview' ? 'bg-white text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Visual Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'code' ? 'bg-white text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>HTML Code Editor</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenRefine}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-medium text-xs rounded-xl flex items-center gap-1.5 border border-zinc-800 transition cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-white" />
            <span>AI Edit</span>
          </button>

          <button
            onClick={onSaveProject}
            disabled={isSaving}
            className="px-3 py-1.5 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-black" />
            <span>{isSaving ? 'Saving...' : 'Save Site'}</span>
          </button>

          <button
            onClick={handleDownloadZip}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl border border-zinc-800 transition cursor-pointer"
            title="Download ZIP Package"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopyCode}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl border border-zinc-800 transition cursor-pointer"
            title="Copy HTML Code"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsFullscreen(true)}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl border border-zinc-800 transition cursor-pointer"
            title="Fullscreen Preview"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Main Workspace */}
      <div className="flex-1 bg-black relative flex justify-center items-center overflow-auto p-4">
        {activeTab === 'preview' ? (
          <div className={`h-full transition-all duration-300 ${viewportWidths[viewport]} bg-white rounded-xl overflow-hidden shadow-2xl relative border border-zinc-800`}>
            <iframe
              ref={iframeRef}
              srcDoc={editableCode}
              title={title}
              className="w-full h-full border-none"
              sandbox="allow-scripts allow-modals allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden font-mono text-xs text-zinc-200">
            <div className="p-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-2">
                <Code className="w-4 h-4 text-white" />
                <span>index.html</span>
              </span>
              <button
                onClick={() => onUpdateHtml(editableCode)}
                className="px-3 py-1 bg-white hover:bg-zinc-200 text-black font-sans text-xs font-bold rounded-lg flex items-center gap-1 transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 text-black" />
                <span>Apply Manual Edits</span>
              </button>
            </div>
            <textarea
              value={editableCode}
              onChange={(e) => setEditableCode(e.target.value)}
              className="w-full flex-1 p-4 bg-black text-zinc-100 font-mono text-xs outline-none resize-none leading-relaxed"
              spellCheck={false}
            />
          </div>
        )}
      </div>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animate-fadeIn">
          <div className="p-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-6">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Sparkles className="w-4 h-4 text-white" />
              <span>Fullscreen Preview: {title}</span>
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Exit Fullscreen
            </button>
          </div>
          <iframe
            srcDoc={editableCode}
            title={`${title}-fullscreen`}
            className="w-full flex-1 border-none bg-white"
            sandbox="allow-scripts allow-modals allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      )}

    </div>
  );
};
