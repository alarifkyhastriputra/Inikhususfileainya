import React, { useState } from 'react';
import { WizardData, StoreProduct, BlogPost, PortfolioProject, RestaurantMenuItem, ServiceItem } from '../../types';
import { 
  Image as ImageIcon, 
  Sparkles, 
  Check, 
  Link2, 
  Upload, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  BookOpen,
  Briefcase,
  UtensilsCrossed,
  Layers,
  RefreshCw,
  Clock,
  Tag,
  ExternalLink,
  HelpCircle,
  Sparkle
} from 'lucide-react';
import { ImgurImageInput } from '../ImgurImageInput';
import { normalizeImageUrl } from '../../lib/imageUtils';

interface Step9Props {
  data: WizardData;
  updateData: (fields: Partial<WizardData>) => void;
}

const positionOptions = [
  { id: 'right', label: 'Di Kanan (Samping Teks)', desc: 'Teks hero di kiri, gambar menawan di kanan' },
  { id: 'left', label: 'Di Kiri (Samping Teks)', desc: 'Gambar di kiri, teks hero di kanan' },
  { id: 'center', label: 'Di Tengah Simetris', desc: 'Gambar simetris di tengah halaman' },
  { id: 'background', label: 'Background Hero', desc: 'Gambar menjadi latar belakang dengan overlay halus' },
  { id: 'card', label: 'Di Dalam Kartu Modern', desc: 'Terbingkai elegan dalam kartu berbayang modern' },
];

export const Step9Media: React.FC<Step9Props> = ({ data, updateData }) => {
  const { 
    media, 
    websiteType,
    storeProducts = [], 
    blogPosts = [], 
    portfolioProjects = [], 
    restaurantMenu = [], 
    serviceItems = [] 
  } = data;

  const isBlog = websiteType === 'Blog' || websiteType === 'Berita';
  const isPortfolio = websiteType === 'Portfolio';
  const isRestaurant = websiteType === 'Restaurant';
  const isCompany = websiteType === 'Company Profile' || websiteType === 'Jasa' || websiteType === 'Agency';

  const [showImgurBannerInfo, setShowImgurBannerInfo] = useState(false);

  const updateMedia = <K extends keyof typeof media>(key: K, value: typeof media[K]) => {
    updateData({
      media: {
        ...media,
        [key]: value,
      },
    });
  };

  // 1. BLOG POSTS HANDLERS
  const handleAddBlogPost = () => {
    const newPost: BlogPost = {
      id: 'post_' + Date.now(),
      title: `Artikel Terbaru #${blogPosts.length + 1}`,
      category: data.category || 'Teknologi',
      readTime: '5 min read',
      excerpt: 'Ringkasan artikel menarik yang memberikan wawasan baru bagi para pembaca setia.',
      imageUrl: 'https://i.imgur.com/8QzXk5T.jpg',
    };
    updateData({ blogPosts: [...blogPosts, newPost] });
  };

  const handleUpdateBlogPost = (id: string, fields: Partial<BlogPost>) => {
    updateData({
      blogPosts: blogPosts.map((p) => (p.id === id ? { ...p, ...fields } : p)),
    });
  };

  const handleDeleteBlogPost = (id: string) => {
    if (blogPosts.length <= 1) {
      alert('Blog minimal harus memiliki 1 artikel.');
      return;
    }
    updateData({ blogPosts: blogPosts.filter((p) => p.id !== id) });
  };

  // 2. PORTFOLIO PROJECTS HANDLERS
  const handleAddProject = () => {
    const newProj: PortfolioProject = {
      id: 'proj_' + Date.now(),
      title: `Proyek Showcase #${portfolioProjects.length + 1}`,
      category: data.category || 'UI/UX Design',
      clientYear: 'Klien Terpilih • 2026',
      description: 'Hasil karya desain dan pengembangan dengan perhatian tinggi pada setiap detail estetika dan fungsi.',
      imageUrl: 'https://i.imgur.com/O6T5kH9.jpg',
    };
    updateData({ portfolioProjects: [...portfolioProjects, newProj] });
  };

  const handleUpdateProject = (id: string, fields: Partial<PortfolioProject>) => {
    updateData({
      portfolioProjects: portfolioProjects.map((p) => (p.id === id ? { ...p, ...fields } : p)),
    });
  };

  const handleDeleteProject = (id: string) => {
    if (portfolioProjects.length <= 1) {
      alert('Portofolio minimal harus memiliki 1 proyek.');
      return;
    }
    updateData({ portfolioProjects: portfolioProjects.filter((p) => p.id !== id) });
  };

  // 3. RESTAURANT MENU HANDLERS
  const handleAddMenuItem = () => {
    const newItem: RestaurantMenuItem = {
      id: 'menu_' + Date.now(),
      name: `Menu Spesial #${restaurantMenu.length + 1}`,
      category: 'Makanan Utama',
      price: '35.000',
      description: 'Dimasak dengan bahan pilihan segar dan resep rahasia yang menggugah selera.',
      imageUrl: 'https://i.imgur.com/n6Y1XkH.jpg',
    };
    updateData({ restaurantMenu: [...restaurantMenu, newItem] });
  };

  const handleUpdateMenuItem = (id: string, fields: Partial<RestaurantMenuItem>) => {
    updateData({
      restaurantMenu: restaurantMenu.map((m) => (m.id === id ? { ...m, ...fields } : m)),
    });
  };

  const handleDeleteMenuItem = (id: string) => {
    if (restaurantMenu.length <= 1) {
      alert('Restoran minimal harus memiliki 1 menu.');
      return;
    }
    updateData({ restaurantMenu: restaurantMenu.filter((m) => m.id !== id) });
  };

  // 4. STORE PRODUCTS HANDLERS (Default / Toko Online)
  const handleAddProduct = () => {
    const newProd: StoreProduct = {
      id: 'prod_' + Date.now(),
      name: `Produk Pilihan #${storeProducts.length + 1}`,
      price: '150.000',
      description: 'Kualitas terbaik, bahan premium dan siap kirim ke seluruh Indonesia.',
      imageUrl: 'https://i.imgur.com/8Km9tLL.jpg',
    };
    updateData({ storeProducts: [...storeProducts, newProd] });
  };

  const handleUpdateProduct = (id: string, fields: Partial<StoreProduct>) => {
    updateData({
      storeProducts: storeProducts.map((p) => (p.id === id ? { ...p, ...fields } : p)),
    });
  };

  const handleDeleteProduct = (id: string) => {
    if (storeProducts.length <= 1) {
      alert('Toko minimal harus memiliki 1 produk.');
      return;
    }
    updateData({ storeProducts: storeProducts.filter((p) => p.id !== id) });
  };

  // 5. SERVICES HANDLERS (Company / Jasa)
  const handleAddService = () => {
    const newServ: ServiceItem = {
      id: 'serv_' + Date.now(),
      name: `Layanan Unggulan #${(serviceItems || []).length + 1}`,
      category: 'Konsultasi & Solusi',
      price: 'Mulai Rp 500.000',
      description: 'Solusi profesional terpercaya dengan jaminan mutu dan pengerjaan tepat waktu.',
      imageUrl: 'https://i.imgur.com/W2yX7tK.jpg',
    };
    updateData({ serviceItems: [...(serviceItems || []), newServ] });
  };

  const handleUpdateService = (id: string, fields: Partial<ServiceItem>) => {
    updateData({
      serviceItems: (serviceItems || []).map((s) => (s.id === id ? { ...s, ...fields } : s)),
    });
  };

  const handleDeleteService = (id: string) => {
    if ((serviceItems || []).length <= 1) {
      alert('Minimal harus memiliki 1 item layanan.');
      return;
    }
    updateData({ serviceItems: (serviceItems || []).filter((s) => s.id !== id) });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-1.5 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>
            {isBlog ? 'Langkah 9: Foto Banner & Kelola Artikel Blog' :
             isPortfolio ? 'Langkah 9: Foto & Kelola Proyek Portofolio' :
             isRestaurant ? 'Langkah 9: Foto Suasana & Kelola Menu Resto' :
             isCompany ? 'Langkah 9: Banner & Kelola Layanan Bisnis' :
             'Langkah 9: Foto Banner & Katalog Produk'}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {isBlog ? 'Banner Blog & Foto Artikel (Dukungan Link Imgur)' :
           isPortfolio ? 'Banner & Galeri Showcase Karya (Dukungan Link Imgur)' :
           isRestaurant ? 'Suasana Resto & Daftar Menu (Dukungan Link Imgur)' :
           isCompany ? 'Banner Korporat & Layanan (Dukungan Link Imgur)' :
           'Foto Toko & Katalog Produk (Dukungan Link Imgur)'}
        </h2>
        <p className="text-xs text-slate-400">
          Upload file langsung atau masukkan <b>Link Imgur</b> (<code className="text-indigo-400 font-mono">https://i.imgur.com/...</code>) pada setiap foto produk dan banner.
        </p>
      </div>

      {/* Imgur Info Callout Card */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <span>Mendukung Upload & Edit Foto Via Link Imgur</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] border border-emerald-500/30">Auto Resolve</span>
            </h4>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
              Anda bisa paste link gambar dari <b>Imgur</b> (album/direct link), Unsplash, atau upload dari HP/laptop. Sistem otomatis mengoptimasi ukuran gambar.
            </p>
          </div>
        </div>

        <a
          href="https://imgur.com/upload"
          target="_blank"
          rel="noreferrer"
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow transition"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Buka Imgur.com</span>
        </a>
      </div>

      {/* Bagian 1: Banner Utama (Hero Image) */}
      <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-cyan-400" />
          <span>
            {isBlog ? 'Foto Banner Utama Blog (Featured Hero)' :
             isPortfolio ? 'Foto Profil / Banner Portofolio' :
             isRestaurant ? 'Foto Suasana / Ambience Kafe & Restoran' :
             'Foto Banner Utama (Hero Banner Image)'}
          </span>
        </h3>

        <ImgurImageInput
          value={media?.heroImageUrl || ''}
          onChange={(url) => updateMedia('heroImageUrl', url)}
          label="Link Foto Banner (Imgur / URL Langsung):"
          placeholder="https://i.imgur.com/abc1234.jpg atau upload..."
          aspectRatio="banner"
          itemTypeLabel="Banner Utama"
        />

        {/* Pilihan Posisi Gambar */}
        <div className="pt-3 border-t border-slate-800">
          <label className="block text-xs font-semibold text-slate-300 mb-2">Tata Letak Posisi Gambar Banner:</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {positionOptions.map((pos) => {
              const isSelected = media.imagePosition === pos.id;
              return (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => updateMedia('imagePosition', pos.id as any)}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold'
                      : 'bg-[#182238] border-slate-700/80 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs block">{pos.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bagian 2: DYNAMIC ITEM SHOWCASE BERDASARKAN TIPE */}

      {/* A. KHUSUS BLOG: KELOLA ARTIKEL */}
      {isBlog && (
        <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>Daftar Artikel & Postingan Blog ({blogPosts.length} Artikel)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Setiap artikel dapat diedit fotonya dengan link Imgur atau upload file.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddBlogPost}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Artikel</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {blogPosts.map((post, idx) => (
              <div key={post.id} className="bg-[#182238] border border-slate-700/80 rounded-2xl p-4 space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400">Artikel #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteBlogPost(post.id)}
                    className="p-1 text-slate-400 hover:text-rose-400 transition"
                    title="Hapus Artikel"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <ImgurImageInput
                  value={post.imageUrl}
                  onChange={(url) => handleUpdateBlogPost(post.id, { imageUrl: url })}
                  placeholder="Link Imgur cover artikel..."
                  aspectRatio="video"
                  itemTypeLabel={`Cover Artikel #${idx + 1}`}
                />

                <div className="space-y-2">
                  <input
                    type="text"
                    value={post.title}
                    onChange={(e) => handleUpdateBlogPost(post.id, { title: e.target.value })}
                    placeholder="Judul Artikel Blog"
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={post.category}
                      onChange={(e) => handleUpdateBlogPost(post.id, { category: e.target.value })}
                      placeholder="Topik / Kategori"
                      className="w-1/2 bg-[#0B0F19] border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-purple-300 outline-none"
                    />
                    <input
                      type="text"
                      value={post.readTime}
                      onChange={(e) => handleUpdateBlogPost(post.id, { readTime: e.target.value })}
                      placeholder="Waktu Baca (misal: 4 min)"
                      className="w-1/2 bg-[#0B0F19] border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-300 outline-none font-mono"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={post.excerpt}
                    onChange={(e) => handleUpdateBlogPost(post.id, { excerpt: e.target.value })}
                    placeholder="Cuplikan / ringkasan isi artikel..."
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 outline-none leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* B. KHUSUS PORTFOLIO: KELOLA PROYEK */}
      {isPortfolio && (
        <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-cyan-400" />
                <span>Daftar Proyek Portofolio ({portfolioProjects.length} Proyek)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Showcase karya Anda kepada calon klien dengan link foto Imgur atau upload langsung.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddProject}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Proyek</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolioProjects.map((proj, idx) => (
              <div key={proj.id} className="bg-[#182238] border border-slate-700/80 rounded-2xl p-4 space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400">Proyek #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(proj.id)}
                    className="p-1 text-slate-400 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <ImgurImageInput
                  value={proj.imageUrl}
                  onChange={(url) => handleUpdateProject(proj.id, { imageUrl: url })}
                  placeholder="Link Imgur foto proyek..."
                  aspectRatio="video"
                  itemTypeLabel={`Proyek #${idx + 1}`}
                />

                <div className="space-y-2">
                  <input
                    type="text"
                    value={proj.title}
                    onChange={(e) => handleUpdateProject(proj.id, { title: e.target.value })}
                    placeholder="Judul Proyek / Studi Kasus"
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={proj.category}
                      onChange={(e) => handleUpdateProject(proj.id, { category: e.target.value })}
                      placeholder="Kategori Proyek"
                      className="w-1/2 bg-[#0B0F19] border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-cyan-300 outline-none"
                    />
                    <input
                      type="text"
                      value={proj.clientYear || ''}
                      onChange={(e) => handleUpdateProject(proj.id, { clientYear: e.target.value })}
                      placeholder="Klien / Tahun"
                      className="w-1/2 bg-[#0B0F19] border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-300 outline-none font-mono"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={proj.description}
                    onChange={(e) => handleUpdateProject(proj.id, { description: e.target.value })}
                    placeholder="Deskripsi singkat proyek..."
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 outline-none leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* C. KHUSUS RESTORAN & KAFE: KELOLA MENU */}
      {isRestaurant && (
        <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-amber-400" />
                <span>Daftar Menu Hidangan & Minuman ({restaurantMenu.length} Menu)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload foto hidangan atau gunakan link Imgur langsung.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddMenuItem}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Menu</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {restaurantMenu.map((item, idx) => (
              <div key={item.id} className="bg-[#182238] border border-slate-700/80 rounded-2xl p-4 space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">Menu #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteMenuItem(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <ImgurImageInput
                  value={item.imageUrl}
                  onChange={(url) => handleUpdateMenuItem(item.id, { imageUrl: url })}
                  placeholder="Link Imgur foto hidangan..."
                  aspectRatio="square"
                  itemTypeLabel={`Menu #${idx + 1}`}
                />

                <div className="space-y-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateMenuItem(item.id, { name: e.target.value })}
                    placeholder="Nama Menu Makanan/Minuman"
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={item.category}
                      onChange={(e) => handleUpdateMenuItem(item.id, { category: e.target.value })}
                      className="w-1/2 bg-[#0B0F19] border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-amber-300 outline-none"
                    >
                      <option value="Makanan Utama">Makanan Utama</option>
                      <option value="Minuman Kopi">Minuman Kopi</option>
                      <option value="Minuman Segar">Minuman Segar</option>
                      <option value="Pastry / Camilan">Pastry / Camilan</option>
                      <option value="Dessert">Dessert</option>
                    </select>

                    <div className="w-1/2 flex items-center gap-1">
                      <span className="text-xs text-slate-400 font-bold">Rp</span>
                      <input
                        type="text"
                        value={item.price}
                        onChange={(e) => handleUpdateMenuItem(item.id, { price: e.target.value })}
                        placeholder="Harga"
                        className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-2 py-1 text-xs text-emerald-400 font-bold outline-none font-mono"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleUpdateMenuItem(item.id, { description: e.target.value })}
                    placeholder="Deskripsi cita rasa..."
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* D. KHUSUS TOKO ONLINE (DEFAULT): KELOLA PRODUK */}
      {!isBlog && !isPortfolio && !isRestaurant && (
        <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span>Katalog Produk Toko Online ({storeProducts.length} Produk)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Setiap foto produk dapat diedit dan diunggah menggunakan link <b>Imgur</b> atau upload gambar lokal.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddProduct}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Produk</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {storeProducts.map((prod, idx) => (
              <div key={prod.id} className="bg-[#182238] border border-slate-700/80 rounded-2xl p-4 space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400">Produk #{idx + 1}</span>
                    {prod.imageUrl?.includes('imgur.com') && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        Imgur
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(prod.id)}
                    className="p-1 text-slate-400 hover:text-rose-400 transition"
                    title="Hapus Produk"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Imgur Image Input Component */}
                <ImgurImageInput
                  value={prod.imageUrl}
                  onChange={(url) => handleUpdateProduct(prod.id, { imageUrl: url })}
                  placeholder="https://i.imgur.com/... atau paste link foto"
                  aspectRatio="square"
                  itemTypeLabel={`Foto Produk #${idx + 1}`}
                />

                <div className="space-y-2">
                  <input
                    type="text"
                    value={prod.name}
                    onChange={(e) => handleUpdateProduct(prod.id, { name: e.target.value })}
                    placeholder="Nama Produk"
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold outline-none"
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 font-bold">Rp</span>
                    <input
                      type="text"
                      value={prod.price}
                      onChange={(e) => handleUpdateProduct(prod.id, { price: e.target.value })}
                      placeholder="Harga (misal: 150.000)"
                      className="flex-1 bg-[#0B0F19] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-emerald-400 font-bold outline-none font-mono"
                    />
                  </div>
                  <input
                    type="text"
                    value={prod.description}
                    onChange={(e) => handleUpdateProduct(prod.id, { description: e.target.value })}
                    placeholder="Deskripsi singkat produk..."
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
