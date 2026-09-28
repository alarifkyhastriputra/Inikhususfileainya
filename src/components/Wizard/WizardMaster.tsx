import React, { useState, useEffect } from 'react';
import { UserProfile, WizardData, GeneratedWebsite } from '../../types';
import { WizardProgressBar } from './WizardProgressBar';
import { Step1Info } from './Step1Info';
import { Step2Type } from './Step2Type';
import { Step3Colors } from './Step3Colors';
import { Step4Palette } from './Step4Palette';
import { Step5Layout } from './Step5Layout';
import { Step6HeaderNavbar } from './Step6HeaderNavbar';
import { Step7Sections } from './Step7Sections';
import { Step8Content } from './Step8Content';
import { Step9Media } from './Step9Media';
import { Step10Features } from './Step10Features';
import { Step11Style } from './Step11Style';
import { Step12Typography } from './Step12Typography';
import { Step13Responsive } from './Step13Responsive';
import { Step14AIAssistant } from './Step14AIAssistant';
import { Step15Summary } from './Step15Summary';
import { GenerationLoader } from './GenerationLoader';
import { WebsiteStudio } from './WebsiteStudio';
import { TutorialsModal } from '../TutorialsModal';
import { saveGeneratedWebsite, deductUserCredits } from '../../lib/firebase';
import { 
  Sparkles, 
  History, 
  ShieldCheck, 
  LogOut, 
  Plus,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Coins,
  Youtube
} from 'lucide-react';

interface WizardMasterProps {
  user: UserProfile;
  onUpdateUser?: (updated: UserProfile) => void;
  onOpenAdmin: () => void;
  onOpenProjects: () => void;
  onLogout: () => void;
  loadedWebsite?: GeneratedWebsite | null;
  websites?: GeneratedWebsite[];
  onRefreshWebsites?: () => void;
}

const getStepTitles = (websiteType: string): string[] => {
  if (websiteType === 'Blog' || websiteType === 'Berita') {
    return [
      '1. Identitas Blog & Penulis',
      '2. Tipe & Format Blog',
      '3. Warna & Latar Baca',
      '4. Palet Warna Editorial',
      '5. Tata Letak Artikel',
      '6. Header & Topik Navigasi',
      '7. Bagian Halaman Blog',
      '8. Konten Sambutan & Bio',
      '9. Gambar & Artikel Blog',
      '10. Fitur Membaca & Interaksi',
      '11. Gaya Desain Editorial',
      '12. Tipografi Artikel',
      '13. Tampilan Responsif HP',
      '14. Asisten AI Blog',
      '15. Ringkasan & Generate',
    ];
  }
  if (websiteType === 'Portfolio') {
    return [
      '1. Profil Kreatif & Kontak',
      '2. Bidang Spesialisasi',
      '3. Aksen Warna Karya',
      '4. Palet Portofolio',
      '5. Layout Galeri Showcase',
      '6. Header & Navigasi Portofolio',
      '7. Bagian Portofolio',
      '8. Konten Profil & Bio',
      '9. Kelola Proyek & Galeri',
      '10. Fitur Showcase & Hire Me',
      '11. Gaya Desain Portofolio',
      '12. Tipografi Portofolio',
      '13. Responsif Showcase',
      '14. Asisten AI Portofolio',
      '15. Ringkasan & Generate',
    ];
  }
  if (websiteType === 'Restaurant') {
    return [
      '1. Identitas Resto & Kafe',
      '2. Konsep Usaha Kuliner',
      '3. Warna Nuansa Hangat',
      '4. Palet Warna Kuliner',
      '5. Tata Letak Menu Digital',
      '6. Header & Navigasi Resto',
      '7. Bagian Halaman Resto',
      '8. Narasi Rasa & Jam Buka',
      '9. Kelola Menu Makanan & Minuman',
      '10. Fitur Reservasi & Order WA',
      '11. Gaya Desain Resto',
      '12. Tipografi Kuliner',
      '13. Responsif Multi-Device',
      '14. Asisten AI Resto',
      '15. Ringkasan & Generate',
    ];
  }
  if (websiteType === 'Company Profile' || websiteType === 'Jasa' || websiteType === 'Agency') {
    return [
      '1. Profil Perusahaan & Legal',
      '2. Bidang Industri Bisnis',
      '3. Warna Identitas Korporat',
      '4. Palet Profesional',
      '5. Layout Profil Bisnis',
      '6. Header & Navigasi Layanan',
      '7. Bagian Perusahaan',
      '8. Visi Misi & Solusi',
      '9. Kelola Layanan & Solusi',
      '10. Fitur Konsultasi & Leads',
      '11. Gaya Desain Korporat',
      '12. Tipografi Profesional',
      '13. Responsif Bisnis',
      '14. Asisten AI Bisnis',
      '15. Ringkasan & Generate',
    ];
  }
  // Toko Online & General Default
  return [
    '1. Identitas Toko & WhatsApp',
    '2. Model & Jenis Toko',
    '3. Kustomisasi Warna Toko',
    '4. Palet Warna Harmonis',
    '5. Layout Katalog Toko',
    '6. Header & Navbar Toko',
    '7. Bagian Halaman Toko',
    '8. Konten Promo & Slogan',
    '9. Gambar & Katalog Produk',
    '10. Fitur Toko & Checkout',
    '11. Gaya & Sliders Toko',
    '12. Tipografi Toko',
    '13. Responsif Toko',
    '14. Asisten AI Toko',
    '15. Ringkasan & Generate',
  ];
};

const defaultWizardData: WizardData = {
  siteName: 'Vimos Apparel',
  siteDescription: 'Pusat belanja pakaian modern streetwear, kaos oversize, dan celana chino katun combed premium.',
  ownerBrand: 'Vimos Corp',
  category: 'Toko',
  whatsappNumber: '081234567890',
  websiteType: 'Toko Online',
  storeProducts: [
    {
      id: 'p_1',
      name: 'Kaos Polos Heavyweight 24s Black',
      price: '129.000',
      description: 'Katun combed 24s tebal tidak menerawang, jahitan rantai kuat.',
      imageUrl: 'https://i.imgur.com/8Km9tLL.jpg',
    },
    {
      id: 'p_2',
      name: 'Hoodie Fleece Street Noir',
      price: '249.000',
      description: 'Bahan fleece hangat dengan tali serut premium dan kantong kanguru.',
      imageUrl: 'https://i.imgur.com/V7RkJ3R.jpg',
    },
    {
      id: 'p_3',
      name: 'Celana Chino Slim Stretch Grey',
      price: '189.000',
      description: 'Katun twill stretch lentur nyaman dipakai harian kerja atau santai.',
      imageUrl: 'https://i.imgur.com/mG7P2sJ.jpg',
    }
  ],
  colors: {
    primary: '#4F46E5',
    secondary: '#06B6D4',
    background: '#0F172A',
    text: '#F8FAFC',
    button: '#4F46E5',
    accent: '#06B6D4',
  },
  paletteTheme: 'Indigo Modern',
  layout: {
    header: 'logo-left',
    navbar: 'horizontal',
    hero: 'text-left-img-right',
    content: 'grid',
    footer: '3-col',
  },
  headerNavbar: {
    logoType: 'text',
    logoText: 'VIMOS APPAREL',
    menuItems: ['Katalog', 'Promo Spesial', 'Tentang Kami', 'Testimoni', 'Kontak'],
    position: 'left',
  },
  sections: [
    { id: 'hero', name: 'Hero Banner', enabled: true, iconName: 'Sparkles' },
    { id: 'products', name: 'Katalog Produk / Layanan', enabled: true, iconName: 'ShoppingBag' },
    { id: 'about', name: 'Tentang Kami', enabled: true, iconName: 'Info' },
    { id: 'testimonials', name: 'Testimoni Pelanggan', enabled: true, iconName: 'Star' },
    { id: 'faq', name: 'Tanya Jawab (FAQ)', enabled: true, iconName: 'HelpCircle' },
    { id: 'contact', name: 'Formulir Kontak', enabled: true, iconName: 'Mail' },
    { id: 'footer', name: 'Footer & Informasi Kontak', enabled: true, iconName: 'Layout' },
  ],
  content: {
    headline: 'Gaya Modern, Kualitas Maksimal Setiap Hari',
    subheadline: 'Koleksi pakaian streetwear terbaru 2026 dengan bahan katun combed 24s adem, potongan rapi, dan diskon 20%.',
    ctaText: 'Belanja via WhatsApp',
    aboutUs: 'Vimos Apparel didirikan untuk menghadirkan tren fashion berkualitas premium dengan proses pemesanan praktis dan pengiriman kilat.',
    productServiceHeadline: 'Produk Terlaris Minggu Ini',
    faqSummary: 'Q: Bagaimana cara pemesanan? A: Klik tombol WhatsApp pada produk pilihan Anda, rincian produk otomatis terisi. Q: Berapa lama pengiriman? A: 1-3 hari kerja ke seluruh Indonesia.',
  },
  media: {
    logoUrl: '',
    heroImageUrl: 'https://i.imgur.com/492vOq5.jpg',
    bannerUrl: '',
    productImages: [],
    imagePosition: 'right',
  },
  features: [
    'WhatsApp Button',
    'Shopping Cart',
    'Product Filter',
    'FAQ Accordion',
    'Testimonials',
    'Dark Mode',
  ],
  designStyle: 'Modern',
  designSliders: {
    borderRadius: 16,
    shadow: 'medium',
    spacing: 'normal',
    animation: 'smooth',
  },
  typography: {
    fontFamily: 'Plus Jakarta Sans',
    headingSize: 'large',
    bodySize: 'normal',
    fontWeight: 'bold',
    lineHeight: 'normal',
  },
  responsive: {
    mobile: true,
    tablet: true,
    desktop: true,
  },
  specialRequest: 'Tampilkan badge garansi 100% original dan tombol pesan via WhatsApp yang mencolok.',
};

export const WizardMaster: React.FC<WizardMasterProps> = ({
  user,
  onUpdateUser,
  onOpenAdmin,
  onOpenProjects,
  onLogout,
  loadedWebsite,
  websites = [],
  onRefreshWebsites,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showTutorialsModal, setShowTutorialsModal] = useState(false);
  const [wizardData, setWizardData] = useState<WizardData>(defaultWizardData);

  // Studio / Generated State
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(loadedWebsite ? loadedWebsite.html : null);
  const [generatedTitle, setGeneratedTitle] = useState(loadedWebsite ? loadedWebsite.title : 'My Vimos Website');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStage, setGenStage] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const isSuperAdmin = user.role === 'admin';
  const hasEnoughCredits = isSuperAdmin || (user.credits ?? 0) >= 100;

  // Sync loaded website from History / Projects
  useEffect(() => {
    if (loadedWebsite && loadedWebsite.html) {
      setGeneratedHtml(loadedWebsite.html);
      setGeneratedTitle(loadedWebsite.title || 'My Vimos Website');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [loadedWebsite]);

  const updateData = (fields: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...fields }));
  };

  const handleNext = () => {
    if (currentStep < 15) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleResetToNew = () => {
    if (confirm('Mulai membuat website baru? Seluruh pengaturan akan dikembalikan ke langkah awal.')) {
      setWizardData(defaultWizardData);
      setGeneratedHtml(null);
      setCurrentStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStartGenerate = async () => {
    // 1. Validate credit balance
    if (!isSuperAdmin && (user.credits ?? 0) < 100) {
      setGenError(`Kredit Anda tidak mencukupi. Pembuatan website membutuhkan 100 Kredit (Sisa kredit Anda: ${user.credits ?? 0}). Silakan hubungi Administrator untuk menambah kredit.`);
      return;
    }

    setIsGenerating(true);
    setGenError(null);
    setElapsedSeconds(0);
    setGenStage('Menganalisis seluruh 15 konfigurasi website...');

    // Live elapsed timer
    const intervalTimer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    try {
      const res = await fetch('/api/generate-wizard-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...wizardData, authorEmail: user.email }),
      });

      const data = await res.json();
      clearInterval(intervalTimer);

      if (data.success && data.html) {
        setGenStage('Website berhasil dibuat!');
        const finalTitle = data.title || wizardData.siteName || 'Vimos Website';

        // 2. Deduct 100 credits from user account upon successful website creation
        try {
          const deductRes = await deductUserCredits(user.email, 100);
          if (deductRes.success && onUpdateUser) {
            onUpdateUser({ ...user, credits: deductRes.newCredits });
          }
        } catch (creditErr) {
          console.warn('Credit deduction warning:', creditErr);
        }

        // Auto-save to History
        try {
          await saveGeneratedWebsite({
            title: finalTitle,
            prompt: `${wizardData.siteName} (${wizardData.websiteType}) - ${wizardData.siteDescription}`,
            category: wizardData.category || 'Toko Online',
            style: wizardData.designStyle || 'Modern',
            html: data.html,
            authorId: user.uid,
            authorEmail: user.email,
          });
          if (onRefreshWebsites) {
            onRefreshWebsites();
          }
        } catch (saveErr) {
          console.warn('Auto-save error:', saveErr);
        }

        setTimeout(() => {
          setGeneratedHtml(data.html);
          setGeneratedTitle(finalTitle);
          setIsGenerating(false);
        }, 700);
      } else {
        setGenError(data.error || 'Server AI sedang sibuk. Silakan coba kembali.');
      }
    } catch (err: any) {
      clearInterval(intervalTimer);
      setGenError(err?.message || 'Terjadi masalah koneksi ke server AI.');
    }
  };

  const handleSaveToProjects = async () => {
    if (!generatedHtml) return;
    setIsSaving(true);
    try {
      await saveGeneratedWebsite({
        id: loadedWebsite?.id,
        title: generatedTitle,
        prompt: loadedWebsite?.prompt || `${wizardData.siteName} (${wizardData.websiteType}) - ${wizardData.siteDescription}`,
        category: wizardData.category || loadedWebsite?.category || 'Toko Online',
        style: wizardData.designStyle || loadedWebsite?.style || 'Modern',
        html: generatedHtml,
        authorId: user.uid,
        authorEmail: user.email,
      });
      if (onRefreshWebsites) onRefreshWebsites();
      alert('Website berhasil disimpan ke menu Riwayat Web!');
    } catch (err: any) {
      alert('Gagal menyimpan website: ' + (err?.message || 'Terjadi kesalahan'));
    } finally {
      setIsSaving(false);
    }
  };

  const stepTitles = getStepTitles(wizardData.websiteType);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-zinc-800 px-4 sm:px-6 py-2.5 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-black text-lg tracking-tighter shrink-0 shadow">
            v
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                vimos<span className="text-zinc-400">.ai</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-semibold">
                {wizardData.websiteType || 'Website'} • 15 Langkah
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 hidden sm:block -mt-0.5">
              Isi & sesuaikan setiap langkah • Generate di langkah terakhir
            </span>
          </div>
        </div>

        {/* Center Indicator */}
        {!generatedHtml && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-zinc-300 font-medium">
              Langkah {currentStep} dari 15: <strong className="text-white">{stepTitles[currentStep - 1]}</strong>
            </span>
          </div>
        )}

        {/* Right Nav */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Credit Balance Indicator */}
          <div 
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-white shadow-sm"
            title="Biaya pembuatan website: 100 Kredit per website"
          >
            <Coins className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="font-mono">{isSuperAdmin ? 'Unlimited' : `${user.credits ?? 0} Kredit`}</span>
          </div>

          {/* New Website Button */}
          {!generatedHtml && (
            <button
              type="button"
              onClick={handleResetToNew}
              className="hidden sm:flex px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold items-center gap-1 border border-zinc-800 transition cursor-pointer"
              title="Mulai Ulang dari Langkah 1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Mulai Ulang</span>
            </button>
          )}

          {/* Riwayat Pembuatan Web (History) */}
          <button
            onClick={onOpenProjects}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-xl border border-zinc-800 text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            title="Buka Riwayat Pembuatan Website"
          >
            <History className="w-4 h-4 text-zinc-400" />
            <span>Riwayat Web</span>
            {websites.length > 0 && (
              <span className="px-1.5 py-0.2 bg-white text-black rounded-full text-[10px] font-bold">
                {websites.length}
              </span>
            )}
          </button>

          {/* Tutorial YT Button */}
          <button
            onClick={() => setShowTutorialsModal(true)}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl border border-zinc-800 text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            title="Tonton Video Tutorial YouTube"
          >
            <Youtube className="w-4 h-4 text-zinc-400" />
            <span className="hidden sm:inline">Tutorial YT</span>
          </button>

          {/* Admin GUI for Super Admin */}
          {user.role === 'admin' && (
            <button
              onClick={onOpenAdmin}
              className="px-2.5 py-1.5 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin Dashboard</span>
            </button>
          )}

          {/* User info & Signout */}
          <div className="flex items-center gap-2 border-l border-zinc-800 pl-2">
            <button
              onClick={onLogout}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition cursor-pointer"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Render Website Studio if generated, else render 15-Step Wizard */}
      {generatedHtml ? (
        <WebsiteStudio
          htmlCode={generatedHtml}
          onUpdateHtml={(newHtml) => setGeneratedHtml(newHtml)}
          title={generatedTitle}
          onBackToWizard={() => setGeneratedHtml(null)}
          onSaveToProjects={handleSaveToProjects}
          isSaving={isSaving}
        />
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Top Progress Bar: 15 Langkah Lengkap */}
          <WizardProgressBar
            currentStep={currentStep}
            totalSteps={15}
            stepTitles={stepTitles}
            onStepClick={(stepIdx) => {
              setCurrentStep(stepIdx);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* Main Step Content Area */}
          <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 pb-32">
            {genError && (
              <div className="max-w-2xl mx-auto mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed">
                {genError}
              </div>
            )}

            {currentStep === 1 && <Step1Info data={wizardData} updateData={updateData} />}
            {currentStep === 2 && <Step2Type data={wizardData} updateData={updateData} />}
            {currentStep === 3 && <Step3Colors data={wizardData} updateData={updateData} />}
            {currentStep === 4 && <Step4Palette data={wizardData} updateData={updateData} />}
            {currentStep === 5 && <Step5Layout data={wizardData} updateData={updateData} />}
            {currentStep === 6 && <Step6HeaderNavbar data={wizardData} updateData={updateData} />}
            {currentStep === 7 && <Step7Sections data={wizardData} updateData={updateData} />}
            {currentStep === 8 && <Step8Content data={wizardData} updateData={updateData} />}
            {currentStep === 9 && <Step9Media data={wizardData} updateData={updateData} />}
            {currentStep === 10 && <Step10Features data={wizardData} updateData={updateData} />}
            {currentStep === 11 && <Step11Style data={wizardData} updateData={updateData} />}
            {currentStep === 12 && <Step12Typography data={wizardData} updateData={updateData} />}
            {currentStep === 13 && <Step13Responsive data={wizardData} updateData={updateData} />}
            {currentStep === 14 && <Step14AIAssistant data={wizardData} updateData={updateData} />}
            {currentStep === 15 && (
              <Step15Summary
                data={wizardData}
                onGoToStep={(stepNum) => {
                  setCurrentStep(stepNum);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onStartGenerate={handleStartGenerate}
                isGenerating={isGenerating}
                userCredits={user.credits ?? 0}
                isSuperAdmin={isSuperAdmin}
              />
            )}
          </main>

          {/* Bottom Fixed Navigation Actions Footer */}
          <footer className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-zinc-800 p-4 z-40 shadow-2xl">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="px-5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition disabled:opacity-30 disabled:hover:bg-zinc-900 cursor-pointer disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              <div className="flex flex-col items-center">
                <span className="text-xs text-white font-bold">
                  Langkah {currentStep} dari 15
                </span>
                <span className="text-[10px] text-zinc-400">
                  {currentStep < 15 
                    ? 'Selesaikan hingga Langkah 15 untuk membuat website' 
                    : 'Langkah terakhir: Biaya 100 Kredit per website'}
                </span>
              </div>

              {/* On Steps 1-14: Only "Lanjut" is available. Generate button is ONLY on Step 15! */}
              {currentStep < 15 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold flex items-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <span>Lanjut Langkah Berikutnya</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartGenerate}
                  disabled={isGenerating || !hasEnoughCredits}
                  className="px-7 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-xl transition transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGenerating ? 'Memproses Website...' : '✨ Buat Website (100 Kredit)'}</span>
                </button>
              )}
            </div>
          </footer>
        </div>
      )}

      {/* Generation Loader Modal */}
      {isGenerating && (
        <GenerationLoader
          currentStage={genStage}
          elapsedSeconds={elapsedSeconds}
          error={genError}
          onRetry={handleStartGenerate}
          onCancel={() => {
            setIsGenerating(false);
            setGenError(null);
          }}
        />
      )}

      {/* Tutorials Modal */}
      <TutorialsModal
        isOpen={showTutorialsModal}
        onClose={() => setShowTutorialsModal(false)}
      />
    </div>
  );
};
