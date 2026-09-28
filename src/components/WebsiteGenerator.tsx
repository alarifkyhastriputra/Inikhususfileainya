import React, { useState, useEffect } from 'react';
import { UserProfile, GeneratedWebsite, GenerationTemplate } from '../types';
import { WebsitePreview } from './WebsitePreview';
import { saveGeneratedWebsite, getUserWebsites } from '../lib/firebase';
import { 
  Sparkles, 
  Wand2, 
  Layout, 
  Palette, 
  Layers, 
  Send, 
  RefreshCw, 
  Bot, 
  ChevronRight, 
  FolderOpen, 
  ShieldCheck, 
  LogOut, 
  Coins, 
  Zap, 
  ShoppingBag, 
  Briefcase, 
  Utensils, 
  Smartphone, 
  LayoutGrid, 
  X,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';

interface WebsiteGeneratorProps {
  user: UserProfile;
  onOpenAdmin: () => void;
  onOpenProjects: () => void;
  onLogout: () => void;
}

export const WebsiteGenerator: React.FC<WebsiteGeneratorProps> = ({
  user,
  onOpenAdmin,
  onOpenProjects,
  onLogout
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('SaaS / AI');
  const [selectedStyle, setSelectedStyle] = useState('Modern Tech Dark');
  const [customReqs, setCustomReqs] = useState('');
  
  const [templates, setTemplates] = useState<GenerationTemplate[]>([]);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [generatedTitle, setGeneratedTitle] = useState('My AI Website');
  
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refinement Sidebar State
  const [showRefineSidebar, setShowRefineSidebar] = useState(false);
  const [refinePrompt, setRefinePrompt] = useState('');
  const [refining, setRefining] = useState(false);
  const [refineHistory, setRefineHistory] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      if (data.templates) {
        setTemplates(data.templates);
      }
    } catch (e) {
      console.warn('Failed to fetch templates:', e);
    }
  };

  const handleSelectTemplate = (template: GenerationTemplate) => {
    setPrompt(template.prompt);
    setSelectedCategory(template.category);
    setSelectedStyle(template.style);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setGenerating(true);
    setError(null);
    setGenStep('Analyzing prompt requirements...');

    const steps = [
      'Designing modern page layout grid...',
      'Applying Tailwind CSS classes and typography...',
      'Injecting interactive JavaScript & animations...',
      'Finalizing preview assets...'
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        setGenStep(steps[stepIdx]);
        stepIdx++;
      }
    }, 1200);

    try {
      const res = await fetch('/api/generate-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style: selectedStyle,
          category: selectedCategory,
          customRequirements: customReqs
        })
      });

      const data = await res.json();
      clearInterval(interval);

      if (data.success && data.html) {
        setGeneratedHtml(data.html);
        setGeneratedTitle(data.title || 'Generated Website');
        setRefineHistory([
          { role: 'ai', text: `Website generated successfully for "${prompt.substring(0, 60)}..."! Use the AI chat to refine sections or colors.` }
        ]);
      } else {
        setError(data.error || 'Failed to generate website.');
      }
    } catch (err: any) {
      clearInterval(interval);
      console.error('Generation error:', err);
      setError(err?.message || 'Network error while contacting AI builder.');
    } finally {
      setGenerating(false);
    }
  };

  const handleRefineWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinePrompt.trim() || !generatedHtml) return;

    const userText = refinePrompt;
    setRefinePrompt('');
    setRefining(true);
    setRefineHistory(prev => [...prev, { role: 'user', text: userText }]);

    try {
      const res = await fetch('/api/refine-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentHtml: generatedHtml,
          refinementPrompt: userText
        })
      });

      const data = await res.json();
      if (data.success && data.html) {
        setGeneratedHtml(data.html);
        setRefineHistory(prev => [
          ...prev, 
          { role: 'ai', text: `Updated website with: "${userText}". Check the live preview!` }
        ]);
      } else {
        setRefineHistory(prev => [
          ...prev,
          { role: 'ai', text: 'Sorry, failed to refine code: ' + (data.error || 'Unknown error') }
        ]);
      }
    } catch (err: any) {
      console.error('Refine error:', err);
      setRefineHistory(prev => [
        ...prev,
        { role: 'ai', text: 'Error refining website: ' + err.message }
      ]);
    } finally {
      setRefining(false);
    }
  };

  const handleSaveSite = async () => {
    if (!generatedHtml) return;
    setSaving(true);
    try {
      await saveGeneratedWebsite({
        title: generatedTitle,
        prompt,
        category: selectedCategory,
        style: selectedStyle,
        html: generatedHtml,
        authorId: user.uid,
        authorEmail: user.email
      });
      alert('Website saved successfully to My Projects!');
    } catch (err: any) {
      alert('Failed to save website: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const categories = ['SaaS / AI', 'E-Commerce', 'Portfolio', 'Restaurant', 'Mobile App', 'Agency', 'Event / Landing'];
  const styles = ['Modern Tech Dark', 'Luxury Minimal', 'Cyberpunk Neon', 'Warm Elegant', 'Creative Gradient', 'Clean Corporate'];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Platform Header */}
      <header className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center text-indigo-400 font-black text-lg tracking-tighter">
              v
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">vimos<span className="text-indigo-400">.ai</span></span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-semibold uppercase">
                AI Web Builder
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block -mt-0.5">Customer-Specific AI Web Generator</span>
          </div>
        </div>

        {/* Right Nav */}
        <div className="flex items-center gap-3">
          {/* Credits Counter */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1e293b]/70 border border-slate-700/80 text-xs font-medium text-slate-300">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{user.role === 'admin' ? 'Unlimited Credits' : `${user.credits} Credits`}</span>
          </div>

          {/* My Projects */}
          <button
            onClick={onOpenProjects}
            className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl border border-slate-700/80 text-xs font-semibold flex items-center gap-2 transition"
          >
            <FolderOpen className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Saved Sites</span>
          </button>

          {/* Admin GUI Trigger for Super Admin */}
          {user.role === 'admin' && (
            <button
              onClick={onOpenAdmin}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500/20 to-indigo-500/20 hover:from-amber-500/30 hover:to-indigo-500/30 text-amber-300 rounded-xl border border-amber-500/40 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/10 transition"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Admin GUI</span>
            </button>
          )}

          {/* User Profile */}
          <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
            <div className="text-right hidden md:block">
              <div className="text-xs font-semibold text-white leading-tight">{user.displayName}</div>
              <div className="text-[10px] text-slate-400 font-mono">{user.email}</div>
            </div>

            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* LEFT PANEL: Generation Controls & Templates */}
        <div className={`w-full ${generatedHtml ? 'lg:w-[420px] xl:w-[460px] border-r border-slate-800' : 'max-w-4xl mx-auto'} p-6 overflow-y-auto space-y-6 transition-all duration-300`}>
          
          {/* Welcome / Header Banner if no website generated yet */}
          {!generatedHtml && (
            <div className="text-center my-6 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Build any custom website instantly
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                What website do you want <br className="hidden sm:block" />
                to build with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">vimos.ai</span>?
              </h1>
              <p className="text-sm text-slate-400 max-w-lg mx-auto">
                Describe your business or website idea. vimos.ai generates clean, responsive, modern HTML & Tailwind CSS code matching your exact brief.
              </p>
            </div>
          )}

          {/* Prompt Form */}
          <form onSubmit={handleGenerate} className="bg-[#111827] border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Describe Your Website</span>
              </label>
              
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Build a high-converting landing page for a coffee shop in Jakarta named 'Kopi Senja'. Include a menu grid, online table booking, customer reviews, dark warm aesthetic, and contact form."
                rows={4}
                className="w-full bg-[#1e293b] border border-slate-700 focus:border-indigo-500 text-white rounded-2xl p-4 text-xs placeholder:text-slate-500 outline-none leading-relaxed transition resize-none"
                required
              />
            </div>

            {/* Category Selectors */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-indigo-400" />
                <span>Category</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                      selectedCategory === cat 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold' 
                        : 'bg-[#1e293b] text-slate-400 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Theme Selectors */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                <span>Style & Aesthetics</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {styles.map((sty) => (
                  <button
                    key={sty}
                    type="button"
                    onClick={() => setSelectedStyle(sty)}
                    className={`p-2.5 rounded-xl text-xs text-left font-medium transition flex items-center gap-2 ${
                      selectedStyle === sty 
                        ? 'bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border border-indigo-500 text-white font-semibold' 
                        : 'bg-[#1e293b] text-slate-400 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${selectedStyle === sty ? 'bg-indigo-400 animate-ping' : 'bg-slate-600'}`} />
                    <span className="truncate">{sty}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={generating || !prompt.trim()}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold rounded-2xl text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {generating ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>{genStep || 'Generating Website with AI...'}</span>
                </div>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{generatedHtml ? 'Re-Generate Website' : 'Generate Website with AI'}</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Starter Templates */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Or Start with Preset Ideas</span>
            </h3>

            <div className="grid grid-cols-1 gap-2.5">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  className="p-3.5 rounded-2xl bg-[#111827] hover:bg-[#1e293b] border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition group flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition truncate">
                        {tpl.title}
                      </h4>
                      <span className="text-[10px] text-slate-500 uppercase">{tpl.category}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{tpl.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: Live Website Workspace */}
        {generatedHtml && (
          <div className="flex-1 h-full p-4 flex flex-col min-w-0 overflow-hidden relative">
            
            <WebsitePreview
              htmlCode={generatedHtml}
              onUpdateHtml={(newHtml) => setGeneratedHtml(newHtml)}
              title={generatedTitle}
              onSaveProject={handleSaveSite}
              onOpenRefine={() => setShowRefineSidebar(true)}
              isSaving={saving}
            />

            {/* AI Refinement Drawer Sidebar Overlay */}
            {showRefineSidebar && (
              <div className="absolute top-4 right-4 bottom-4 w-80 sm:w-96 bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl flex flex-col z-30 animate-slideLeft overflow-hidden">
                
                {/* Refine Header */}
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0B0F19]">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">AI Website Assistant</h4>
                      <p className="text-[10px] text-slate-400">Iterate and refine website design</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRefineSidebar(false)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Refine History */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs">
                  {refineHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl max-w-[85%] ${
                        item.role === 'user'
                          ? 'bg-indigo-600 text-white ml-auto'
                          : 'bg-[#1e293b] text-slate-200 border border-slate-700/60'
                      }`}
                    >
                      {item.text}
                    </div>
                  ))}
                  {refining && (
                    <div className="p-3 rounded-xl bg-[#1e293b] text-indigo-400 border border-slate-700/60 flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating website HTML...</span>
                    </div>
                  )}
                </div>

                {/* Quick refinement suggestions */}
                <div className="p-2.5 bg-[#0B0F19] border-t border-slate-800/80 flex flex-wrap gap-1.5">
                  {[
                    'Add customer testimonials carousel',
                    'Make header navbar sticky',
                    'Add pricing monthly/yearly toggle',
                    'Translate all text to Indonesian'
                  ].map((chip, i) => (
                    <button
                      key={i}
                      onClick={() => setRefinePrompt(chip)}
                      className="px-2 py-1 rounded-lg bg-[#1e293b] hover:bg-slate-800 text-[10px] text-slate-300 transition border border-slate-700"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>

                {/* Refine Input Form */}
                <form onSubmit={handleRefineWebsite} className="p-3 bg-[#0B0F19] border-t border-slate-800 flex items-center gap-2">
                  <input
                    type="text"
                    value={refinePrompt}
                    onChange={(e) => setRefinePrompt(e.target.value)}
                    placeholder="Ask AI to edit website..."
                    className="flex-1 bg-[#1e293b] border border-slate-700 text-white text-xs rounded-xl py-2 px-3 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={refining || !refinePrompt.trim()}
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

              </div>
            )}

          </div>
        )}

      </main>

    </div>
  );
};
