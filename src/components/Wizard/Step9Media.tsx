import React, { useState } from 'react';
import { WizardData, StoreProduct, BlogPost, PortfolioProject, RestaurantMenuItem, ServiceItem } from '../../types';
import { 
  Image as ImageIcon, 
  Sparkles, 
  Check, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  BookOpen,
  Briefcase,
  UtensilsCrossed,
  ExternalLink
} from 'lucide-react';
import { ImgurImageInput } from '../ImgurImageInput';

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
      imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80',
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
      imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
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
      imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80',
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
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80',
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
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
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
    <div className="space-y-8 max-w-4xl mx-auto font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
      <div className="text-center space-y-1.5 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold">
          <ImageIcon className="w-3.5 h-3.5 text-white" />
          <span>
            {isBlog ? 'Langkah 9: Foto Banner & Kelola Artikel Blog' :
             isPortfolio ? 'Langkah 9: Foto & Kelola Proyek Portofolio' :
             isRestaurant ? 'Langkah 9: Foto Suasana & Kelola Menu Resto' :
             isCompany ? 'Langkah 9: Banner & Kelola Layanan Bisnis' :
             'Langkah 9: Foto Banner & Katalog Produk'}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {isBlog ? 'Banner Blog & Foto Artikel (Dukungan Link Imgur & Direct URL)' :
           isPortfolio ? 'Banner & Galeri Showcase Karya (Dukungan Link Imgur & Direct URL)' :
           isRestaurant ? 'Suasana Resto & Daftar Menu (Dukungan Link Imgur & Direct URL)' :
           isCompany ? 'Banner Korporat & Layanan (Dukungan Link Imgur & Direct URL)' :
           'Foto Toko & Katalog Produk (Dukungan Link Imgur & Direct URL)'}
        </h2>
        <p className="text-xs text-zinc-400">
          Upload file langsung atau masukkan <b>Link Imgur / Direct URL</b> (<code className="text-zinc-200 font-mono">https://i.imgur.com/...</code>) pada setiap foto produk dan banner.
        </p>
      </div>

      {/* Imgur Info Callout Card */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <span>Mendukung Upload Langsung & Link Imgur</span>
              <span className="px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-200 text-[10px] border border-zinc-700 font-mono">Direct Public Link</span>
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
              Foto yang Anda upload otomatis mendapatkan URL publik langsung (<code className="text-zinc-300 font-mono">/uploads/...</code>) dan dapat dibuka dari mana saja. Anda juga bisa menggunakan link Imgur atau Unsplash.
            </p>
          </div>
        </div>

        <a
          href="https://imgur.com/upload"
          target="_blank"
          rel="noreferrer"
          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow transition cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Buka Imgur.com</span>
        </a>
      </div>

      {/* Bagian 1: Banner Utama (Hero Image) */}
      <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 shadow-xl space-y-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-zinc-300" />
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
          label="Link Foto Banner (Imgur / Upload Langsung):"
          placeholder="https://i.imgur.com/abc1234.jpg atau upload..."
          aspectRatio="banner"
          itemTypeLabel="Banner Utama"
        />

        {/* Pilihan Posisi Gambar */}
        <div className="pt-3 border-t border-zinc-800">
          <label className="block text-xs font-semibold text-zinc-300 mb-2">Tata Letak Posisi Gambar Banner:</label>
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
                      ? 'bg-white text-black border-white font-bold shadow-md'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
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
        <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-zinc-300" />
                <span>Daftar Artikel & Postingan Blog ({blogPosts.length} Artikel)</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Setiap artikel dapat diedit fotonya dengan link Imgur atau upload file.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddBlogPost}
              className="px-3.5 py-2 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Artikel</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {blogPosts.map((post, idx) => (
              <div key={post.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200">Artikel #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteBlogPost(post.id)}
                    className="p-1 text-zinc-400 hover:text-white transition cursor-pointer"
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
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={post.category}
                      onChange={(e) => handleUpdateBlogPost(post.id, { category: e.target.value })}
                      placeholder="Topik / Kategori"
                      className="w-1/2 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-lg px-2 py-1 text-[11px] text-zinc-300 outline-none"
                    />
                    <input
                      type="text"
                      value={post.readTime}
                      onChange={(e) => handleUpdateBlogPost(post.id, { readTime: e.target.value })}
                      placeholder="Waktu Baca (misal: 4 min)"
                      className="w-1/2 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-lg px-2 py-1 text-[11px] text-zinc-300 outline-none font-mono"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={post.excerpt}
                    onChange={(e) => handleUpdateBlogPost(post.id, { excerpt: e.target.value })}
                    placeholder="Cuplikan / ringkasan isi artikel..."
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-300 outline-none leading-relaxed resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* B. KHUSUS PORTFOLIO: KELOLA PROYEK */}
      {isPortfolio && (
        <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-zinc-300" />
                <span>Daftar Proyek Portofolio ({portfolioProjects.length} Proyek)</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Showcase karya Anda kepada calon klien dengan link foto Imgur atau upload langsung.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddProject}
              className="px-3.5 py-2 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Proyek</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolioProjects.map((proj, idx) => (
              <div key={proj.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200">Proyek #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(proj.id)}
                    className="p-1 text-zinc-400 hover:text-white transition cursor-pointer"
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
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={proj.category}
                      onChange={(e) => handleUpdateProject(proj.id, { category: e.target.value })}
                      placeholder="Kategori Proyek"
                      className="w-1/2 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-lg px-2 py-1 text-[11px] text-zinc-300 outline-none"
                    />
                    <input
                      type="text"
                      value={proj.clientYear}
                      onChange={(e) => handleUpdateProject(proj.id, { clientYear: e.target.value })}
                      placeholder="Klien / Tahun"
                      className="w-1/2 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-lg px-2 py-1 text-[11px] text-zinc-400 outline-none font-mono"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={proj.description}
                    onChange={(e) => handleUpdateProject(proj.id, { description: e.target.value })}
                    placeholder="Deskripsi singkat hasil proyek..."
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-300 outline-none leading-relaxed resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* C. KHUSUS RESTAURANT: KELOLA MENU */}
      {isRestaurant && (
        <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-zinc-300" />
                <span>Daftar Menu Hidangan Resto & Kafe ({restaurantMenu.length} Menu)</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Kelola menu makanan, minuman, dan foto lezat untuk pengunjung.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddMenuItem}
              className="px-3.5 py-2 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Menu</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {restaurantMenu.map((menu, idx) => (
              <div key={menu.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200">Menu #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteMenuItem(menu.id)}
                    className="p-1 text-zinc-400 hover:text-white transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <ImgurImageInput
                  value={menu.imageUrl}
                  onChange={(url) => handleUpdateMenuItem(menu.id, { imageUrl: url })}
                  placeholder="Link Imgur foto makanan/minuman..."
                  aspectRatio="square"
                  itemTypeLabel={`Menu #${idx + 1}`}
                />

                <div className="space-y-2">
                  <input
                    type="text"
                    value={menu.name}
                    onChange={(e) => handleUpdateMenuItem(menu.id, { name: e.target.value })}
                    placeholder="Nama Menu Hidangan"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={menu.category}
                      onChange={(e) => handleUpdateMenuItem(menu.id, { category: e.target.value })}
                      placeholder="Kategori (Kopi / Makanan)"
                      className="w-1/2 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-lg px-2 py-1 text-[11px] text-zinc-300 outline-none"
                    />
                    <div className="w-1/2 relative">
                      <span className="absolute left-2.5 top-1 text-[11px] text-zinc-500">Rp</span>
                      <input
                        type="text"
                        value={menu.price}
                        onChange={(e) => handleUpdateMenuItem(menu.id, { price: e.target.value })}
                        placeholder="Harga (misal: 25.000)"
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-lg pl-8 pr-2 py-1 text-[11px] text-white outline-none font-mono font-bold"
                      />
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={menu.description}
                    onChange={(e) => handleUpdateMenuItem(menu.id, { description: e.target.value })}
                    placeholder="Komposisi / deskripsi rasa lezat..."
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-300 outline-none leading-relaxed resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* D. KHUSUS PERUSAHAAN / JASA: KELOLA LAYANAN */}
      {isCompany && (
        <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-zinc-300" />
                <span>Paket Layanan & Solusi Bisnis ({(serviceItems || []).length} Layanan)</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Tampilkan penawaran profesional dan tarif layanan perusahaan Anda.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddService}
              className="px-3.5 py-2 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Layanan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(serviceItems || []).map((serv, idx) => (
              <div key={serv.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200">Layanan #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteService(serv.id)}
                    className="p-1 text-zinc-400 hover:text-white transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={serv.name}
                    onChange={(e) => handleUpdateService(serv.id, { name: e.target.value })}
                    placeholder="Nama Layanan / Solusi"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={serv.category}
                      onChange={(e) => handleUpdateService(serv.id, { category: e.target.value })}
                      placeholder="Bidang / Kategori"
                      className="w-1/2 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-lg px-2 py-1 text-[11px] text-zinc-300 outline-none"
                    />
                    <input
                      type="text"
                      value={serv.price}
                      onChange={(e) => handleUpdateService(serv.id, { price: e.target.value })}
                      placeholder="Estimasi Harga"
                      className="w-1/2 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-lg px-2 py-1 text-[11px] text-white outline-none font-mono font-bold"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={serv.description}
                    onChange={(e) => handleUpdateService(serv.id, { description: e.target.value })}
                    placeholder="Rincian lingkup kerja layanan..."
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-300 outline-none leading-relaxed resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* E. DEFAULT: TOKO ONLINE & UMUM */}
      {!isBlog && !isPortfolio && !isRestaurant && !isCompany && (
        <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-zinc-300" />
                <span>Katalog Produk Toko ({storeProducts.length} Produk)</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Setiap produk dapat diganti fotonya dengan link Imgur, upload gambar, atau link langsung.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddProduct}
              className="px-3.5 py-2 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Produk</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {storeProducts.map((product, idx) => (
              <div key={product.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200">Produk #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-1 text-zinc-400 hover:text-white transition cursor-pointer"
                    title="Hapus Produk"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <ImgurImageInput
                  value={product.imageUrl}
                  onChange={(url) => handleUpdateProduct(product.id, { imageUrl: url })}
                  placeholder="Link Imgur foto produk..."
                  aspectRatio="square"
                  itemTypeLabel={`Produk #${idx + 1}`}
                />

                <div className="space-y-2">
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => handleUpdateProduct(product.id, { name: e.target.value })}
                    placeholder="Nama Produk"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold outline-none"
                  />
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-xs text-zinc-500">Rp</span>
                    <input
                      type="text"
                      value={product.price}
                      onChange={(e) => handleUpdateProduct(product.id, { price: e.target.value })}
                      placeholder="Harga (misal: 150.000)"
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white outline-none font-mono font-bold"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={product.description}
                    onChange={(e) => handleUpdateProduct(product.id, { description: e.target.value })}
                    placeholder="Deskripsi singkat produk..."
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-300 outline-none leading-relaxed resize-none"
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
