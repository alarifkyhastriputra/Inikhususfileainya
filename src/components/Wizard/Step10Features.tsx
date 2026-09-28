import React from 'react';
import { WizardData } from '../../types';
import { 
  Sparkles, 
  Search, 
  LogIn, 
  UserPlus, 
  ShoppingCart, 
  Filter, 
  Mail, 
  MessageCircle, 
  Moon, 
  Languages, 
  Image, 
  HelpCircle, 
  Sliders, 
  Bell, 
  MoveUp, 
  Share2,
  Check
} from 'lucide-react';

interface Step10Props {
  data: WizardData;
  updateData: (fields: Partial<WizardData>) => void;
}

const availableFeatures = [
  { id: 'Shopping Cart', label: 'Shopping Cart', icon: ShoppingCart, desc: 'Keranjang belanja interaktif dengan popup ringkasan' },
  { id: 'Product Filter', label: 'Product Filter', icon: Filter, desc: 'Filter kategori produk dengan tombol badge interaktif' },
  { id: 'WhatsApp Button', label: 'Tombol WhatsApp', icon: MessageCircle, desc: 'Tombol chat mengambang yang langsung membuka WhatsApp' },
  { id: 'Contact Form', label: 'Form Kontak', icon: Mail, desc: 'Formulir pesan interaktif dengan notifikasi kirim' },
  { id: 'Search', label: 'Pencarian (Search)', icon: Search, desc: 'Kotak pencarian konten instan di navbar' },
  { id: 'FAQ Accordion', label: 'FAQ Accordion', icon: HelpCircle, desc: 'Tanya jawab interaktif yang bisa diklik buka/tutup' },
  { id: 'Dark Mode', label: 'Dark / Light Mode', icon: Moon, desc: 'Tombol pengubah mode gelap dan terang' },
  { id: 'Login', label: 'Login Modal', icon: LogIn, desc: 'Jendela popup masuk untuk anggota / pembeli' },
  { id: 'Register', label: 'Register Modal', icon: UserPlus, desc: 'Jendela pendaftaran akun pengguna baru' },
  { id: 'Language Switcher', label: 'Pilihan Bahasa', icon: Languages, desc: 'Pilihan tombol ganti bahasa (ID / EN)' },
  { id: 'Gallery', label: 'Galeri Foto Populer', icon: Image, desc: 'Grid foto portofolio / produk beranimasi hover' },
  { id: 'Slider', label: 'Slider / Carousel', icon: Sliders, desc: 'Banner geser otomatis yang interaktif' },
  { id: 'Popup', label: 'Promo Modal Popup', icon: Bell, desc: 'Popup penawaran diskon atau sambutan' },
  { id: 'Back To Top', label: 'Tombol Back To Top', icon: MoveUp, desc: 'Tombol melayang kembali ke atas halaman saat scroll' },
  { id: 'Scroll Animation', label: 'Animasi Scroll', icon: Sparkles, desc: 'Efek transisi halus ketika halaman digulir' },
  { id: 'Social Media', label: 'Ikon Media Sosial', icon: Share2, desc: 'Tautan Instagram, Facebook, TikTok, YouTube' },
];

export const Step10Features: React.FC<Step10Props> = ({ data, updateData }) => {
  const { features } = data;

  const toggleFeature = (id: string) => {
    if (features.includes(id)) {
      updateData({ features: features.filter((f) => f !== id) });
    } else {
      updateData({ features: [...features, id] });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="text-center space-y-1.5 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Langkah 10: Fitur & Interaktivitas</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Pilih Fitur Otomatis Website</h2>
        <p className="text-xs text-zinc-400">
          Semua fitur yang Anda pilih akan diintegrasikan dengan JavaScript interaktif siap pakai.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {availableFeatures.map((feat) => {
          const Icon = feat.icon;
          const isSelected = features.includes(feat.id);

          return (
            <div
              key={feat.id}
              onClick={() => toggleFeature(feat.id)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-zinc-900 border-white shadow-xl ring-1 ring-white/20'
                  : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                      isSelected ? 'bg-white text-black font-bold' : 'bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition ${
                      isSelected ? 'bg-white text-black font-bold' : 'border border-zinc-700 bg-zinc-900'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <h4 className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                  {feat.label}
                </h4>
              </div>

              <p className="text-[10px] text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                {feat.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
