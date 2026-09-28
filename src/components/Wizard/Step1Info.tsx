import React from 'react';
import { WizardData } from '../../types';
import { Building2, User, FileText, Tag, Sparkles, BookOpen, UserCheck, UtensilsCrossed, PhoneCall } from 'lucide-react';

interface Step1Props {
  data: WizardData;
  updateData: (fields: Partial<WizardData>) => void;
}

const CATEGORIES_BY_TYPE: Record<string, string[]> = {
  'Blog': ['Teknologi', 'Lifestyle', 'Kuliner & Resep', 'Wisata / Travel', 'Finansial & Bisnis', 'Edukasi / Tutorial', 'Opini & Catatan'],
  'Berita': ['Nasional', 'Teknologi', 'Bisnis & Ekonomi', 'Olahraga', 'Hiburan', 'Gaya Hidup', 'Internasional'],
  'Portfolio': ['UI/UX Design', 'Web Development', 'Fotografi & Video', 'Desain Grafis / Brand', 'Arsitektur', 'Ilustrasi', 'Kepengarangan'],
  'Restaurant': ['Kedai Kopi & Kafe', 'Restoran Nusantara', 'Bakery & Kue', 'Western / Bistro', 'Fast Food', 'Catering', 'Minuman Kekinian'],
  'Company Profile': ['Teknologi / IT', 'Agensi Kreatif', 'Konsultan & Legal', 'Konstruksi / Properti', 'Manufaktur & Logistik', 'Kesehatan', 'Keuangan'],
  'Toko Online': ['Fashion & Pakaian', 'Elektronik & Gadget', 'Makanan & Snack', 'Kecantikan & Skincare', 'Aksesoris & Sepatu', 'Perlengkapan Rumah', 'Hobi & Olahraga'],
};

export const Step1Info: React.FC<Step1Props> = ({ data, updateData }) => {
  const isBlog = data.websiteType === 'Blog' || data.websiteType === 'Berita';
  const isPortfolio = data.websiteType === 'Portfolio';
  const isRestaurant = data.websiteType === 'Restaurant';
  const isCompany = data.websiteType === 'Company Profile' || data.websiteType === 'Agency' || data.websiteType === 'Jasa';

  const relevantCategories = CATEGORIES_BY_TYPE[data.websiteType] || CATEGORIES_BY_TYPE['Toko Online'];

  return (
    <div className="space-y-6 max-w-2xl mx-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="text-center space-y-1.5 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Langkah 1: Identitas & Informasi {data.websiteType || 'Website'}</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {isBlog ? 'Identitas Blog & Penulis' :
           isPortfolio ? 'Profil & Spesialisasi Portofolio' :
           isRestaurant ? 'Identitas Resto, Kafe & Kuliner' :
           isCompany ? 'Profil Perusahaan & Bisnis' :
           'Informasi Dasar Toko Online'}
        </h2>
        <p className="text-xs text-zinc-400">
          {isBlog ? 'Atur nama blog, topik utama, dan profil penulis Anda.' :
           isPortfolio ? 'Tuliskan nama Anda, keahlian utama, dan bio singkat untuk memikat calon klien.' :
           isRestaurant ? 'Atur nama tempat kuliner, konsep hidangan, dan nomor reservasi meja.' :
           isCompany ? 'Lengkapi profil resmi perusahaan, bidang usaha, dan kontak legal.' :
           'Masukkan nama toko, deskripsi jualan, dan nomor WhatsApp pemesanan.'}
        </p>
      </div>

      <div className="space-y-4 bg-zinc-950 p-6 rounded-2xl border border-zinc-800 shadow-xl">
        {/* Nama Website / Toko / Blog / Portfolio */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
            {isBlog ? <BookOpen className="w-4 h-4 text-zinc-400" /> :
             isPortfolio ? <UserCheck className="w-4 h-4 text-zinc-400" /> :
             isRestaurant ? <UtensilsCrossed className="w-4 h-4 text-zinc-400" /> :
             <Building2 className="w-4 h-4 text-zinc-400" />}
            <span>
              {isBlog ? 'Nama Blog / Publikasi *' :
               isPortfolio ? 'Nama Anda / Studio Kreatif *' :
               isRestaurant ? 'Nama Restoran / Kafe *' :
               isCompany ? 'Nama Perusahaan / Bisnis *' :
               'Nama Website / Toko *'}
            </span>
          </label>
          <input
            type="text"
            required
            value={data.siteName}
            onChange={(e) => updateData({ siteName: e.target.value })}
            placeholder={
              isBlog ? 'Contoh: TechVerse ID / Catatan Kembara' :
              isPortfolio ? 'Contoh: Hasbullah Design Studio' :
              isRestaurant ? 'Contoh: Kopi Senja & Eatery' :
              isCompany ? 'Contoh: PT Nexus Digital Solusindo' :
              'Contoh: Vimos Apparel Store'
            }
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 text-white rounded-xl py-3 px-4 text-sm outline-none transition"
          />
          <p className="text-[11px] text-zinc-500 mt-1">Nama ini akan menjadi judul utama website Anda.</p>
        </div>

        {/* Khusus Blog: Nama Penulis */}
        {isBlog && (
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-zinc-400" />
              <span>Nama Penulis / Editor Blog</span>
            </label>
            <input
              type="text"
              value={data.authorName || ''}
              onChange={(e) => updateData({ authorName: e.target.value })}
              placeholder="Contoh: Hasbullah Beloh / Redaksi Vimos"
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 text-white rounded-xl py-3 px-4 text-sm outline-none transition"
            />
          </div>
        )}

        {/* Deskripsi Singkat */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-zinc-400" />
            <span>
              {isBlog ? 'Slogan & Topik Pembahasan Blog *' :
               isPortfolio ? 'Bio Singkat & Keahlian Profesional *' :
               isRestaurant ? 'Konsep Kuliner & Suasana Resto *' :
               isCompany ? 'Visi Misi & Profil Perusahaan *' :
               'Deskripsi Singkat Toko *'}
            </span>
          </label>
          <textarea
            required
            rows={3}
            value={data.siteDescription}
            onChange={(e) => updateData({ siteDescription: e.target.value })}
            placeholder={
              isBlog ? 'Contoh: Membahas tutorial coding modern, perkembangan teknologi kecerdasan buatan, dan tips produktivitas kerja remote.' :
              isPortfolio ? 'Contoh: Senior UI/UX Designer & Frontend Developer dengan pengalaman 5 tahun membangun produk digital kelas dunia.' :
              isRestaurant ? 'Contoh: Menyajikan kopi arabika pegunungan segar dan aneka menu hidangan khas Nusantara dengan suasana hangat dan nyaman.' :
              isCompany ? 'Contoh: Perusahaan konsultan transformasi digital yang membantu akselerasi pertumbuhan bisnis dan korporasi.' :
              'Contoh: Toko online streetwear modern dengan bahan katun combed 24s premium dan jahitan rapi untuk kenyamanan harian.'
            }
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 text-white rounded-xl p-3 text-sm outline-none transition resize-none leading-relaxed"
          />
        </div>

        {/* Nama Pemilik / Brand (Kecuali Blog) */}
        {!isBlog && (
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-zinc-400" />
              <span>
                {isPortfolio ? 'Gelar / Jabatan Profesional' :
                 isRestaurant ? 'Nama Pemilik / Chef' :
                 'Nama Pemilik / Brand Resmi'}
              </span>
            </label>
            <input
              type="text"
              value={data.ownerBrand}
              onChange={(e) => updateData({ ownerBrand: e.target.value })}
              placeholder={
                isPortfolio ? 'Contoh: Lead Product Designer' :
                isRestaurant ? 'Contoh: Chef Hasbullah' :
                'Contoh: Vimos Corp / PT Vimos Digital'
              }
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 text-white rounded-xl py-3 px-4 text-sm outline-none transition"
            />
          </div>
        )}

        {/* Nomor WhatsApp / Kontak */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-zinc-300" />
              <span>
                {isBlog ? 'Nomor WhatsApp Redaksi / Kontak Kerjasama' :
                 isPortfolio ? 'Nomor WhatsApp Tawaran Pekerjaan / Hire Me *' :
                 isRestaurant ? 'Nomor WhatsApp Reservasi Meja & Order *' :
                 isCompany ? 'Nomor WhatsApp Layanan Pelanggan / Sales *' :
                 'Nomor WhatsApp Toko (Untuk Pemesanan) *'}
              </span>
            </span>
            <span className="text-[10px] text-zinc-200 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800 font-mono">
              Auto Direct WhatsApp
            </span>
          </label>
          <input
            type="tel"
            value={data.whatsappNumber || ''}
            onChange={(e) => updateData({ whatsappNumber: e.target.value })}
            placeholder="Contoh: 081234567890 atau 6281234567890"
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 text-white rounded-xl py-3 px-4 text-sm outline-none transition font-mono"
          />
          <p className="text-[11px] text-zinc-400 mt-1">
            {isBlog ? 'Tombol kontak di blog akan menghubungkan pembaca langsung ke nomor ini.' :
             isPortfolio ? 'Calon klien dapat langsung mengklik tombol "Hire Me" untuk chat WhatsApp dengan Anda!' :
             isRestaurant ? 'Pelanggan dapat memesan meja dan konfirmasi reservasi via WhatsApp.' :
             'Tombol checkout belanja akan otomatis mengirimkan rincian pesanan ke nomor ini.'}
          </p>
        </div>

        {/* Kategori Spesifik */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-2 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-zinc-400" />
            <span>
              {isBlog ? 'Topik / Niche Utama Blog' :
               isPortfolio ? 'Fokus Bidang Portofolio' :
               isRestaurant ? 'Kategori Usaha Kuliner' :
               isCompany ? 'Sektor Industri Bisnis' :
               'Kategori Produk Toko'}
            </span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {relevantCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => updateData({ category: cat })}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition text-center cursor-pointer ${
                  data.category === cat
                    ? 'bg-white text-black border-white shadow-sm font-bold'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
