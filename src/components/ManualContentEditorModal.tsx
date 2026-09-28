import React, { useState, useEffect } from 'react';
import { 
  Edit3, 
  Plus, 
  Trash2, 
  X, 
  Check, 
  Sparkles, 
  ShoppingBag, 
  Layers, 
  Type, 
  Image as ImageIcon, 
  PhoneCall, 
  Code, 
  HelpCircle, 
  Star, 
  Mail, 
  MessageCircle,
  Copy,
  Layout,
  ExternalLink,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  Save,
  Tag
} from 'lucide-react';
import { ImgurImageInput } from './ImgurImageInput';

interface ManualContentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlCode: string;
  onSaveHtml: (newHtml: string) => void;
  siteTitle?: string;
}

interface ParsedProduct {
  id: string;
  fullHtmlChunk: string;
  name: string;
  price: string;
  imageUrl: string;
  description: string;
  badge?: string;
}

export const ManualContentEditorModal: React.FC<ManualContentEditorModalProps> = ({
  isOpen,
  onClose,
  htmlCode,
  onSaveHtml,
  siteTitle = 'Website'
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'text' | 'sections' | 'mobile_optim' | 'custom_html'>('products');
  
  // Detected Products State
  const [products, setProducts] = useState<ParsedProduct[]>([]);

  // Add New Product State
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('150.000');
  const [newItemDesc, setNewItemDesc] = useState('Bahan katun combed 24s premium lembut, adem dan nyaman digunakan sehari-hari.');
  const [newItemImage, setNewItemImage] = useState('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80');
  const [newItemBadge, setNewItemBadge] = useState('Terbaru');

  // Basic Text Fields extracted from HTML
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [brandName, setBrandName] = useState('');

  // Custom HTML snippet
  const [customHtmlSnippet, setCustomHtmlSnippet] = useState('');
  const [customPosition, setCustomPosition] = useState<'before_footer' | 'after_hero' | 'at_end'>('before_footer');

  // Save feedback state
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Parse HTML and extract existing products and text fields
  useEffect(() => {
    if (!isOpen || !htmlCode) return;

    // 1. Extract headline
    const h1Match = htmlCode.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) {
      setHeadline(h1Match[1].replace(/<[^>]+>/g, '').trim());
    }

    // 2. Extract brand name
    const titleMatch = htmlCode.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch) {
      setBrandName(titleMatch[1].split('|')[0].trim());
    }

    // 3. Extract WhatsApp number
    const waMatch = htmlCode.match(/wa\.me\/([0-9]+)/i);
    if (waMatch) {
      setWhatsappNumber(waMatch[1]);
    }

    // 4. Extract subheadline
    const pMatches = Array.from(htmlCode.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi));
    if (pMatches.length > 0) {
      const cleanP = pMatches[0][1].replace(/<[^>]+>/g, '').trim();
      if (cleanP.length > 15) setSubheadline(cleanP);
    }

    // 5. Detect and parse individual products / items
    const detected: ParsedProduct[] = [];
    
    // Pattern A: Elements with class containing product / card
    const cardRegex = /<(?:div|article)[^>]*class="[^"]*(?:product-item|card|group)[^"]*"[^>]*>([\s\S]*?)<\/(?:div|article)>/gi;
    let match: RegExpExecArray | null;
    let pIdx = 1;

    // Try finding structured items
    while ((match = cardRegex.exec(htmlCode)) !== null) {
      const chunk = match[0];
      
      // Check if this chunk has an img and a title/price
      const imgMatch = chunk.match(/src=["']([^"']+)["']/i);
      const titleMatch = chunk.match(/<(?:h3|h4|h5)[^>]*>([\s\S]*?)<\/(?:h3|h4|h5)>/i);
      const priceMatch = chunk.match(/Rp\s*([0-9.,]+)/i) || chunk.match(/([0-9.,]+\s*(?:K|k|rb|Juta|jt))/i);
      const descMatch = chunk.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
      const badgeMatch = chunk.match(/<(?:span|div)[^>]*class="[^"]*(?:badge|rounded-full)[^"]*"[^>]*>([\s\S]*?)<\/(?:span|div)>/i);

      if (imgMatch && titleMatch) {
        const pName = titleMatch[1].replace(/<[^>]+>/g, '').trim();
        const pPrice = priceMatch ? priceMatch[1].replace(/[^0-9.,]/g, '') : '150.000';
        const pDesc = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : '';
        const pBadge = badgeMatch ? badgeMatch[1].replace(/<[^>]+>/g, '').trim() : 'Pilihan';

        detected.push({
          id: `prod_${pIdx}`,
          fullHtmlChunk: chunk,
          name: pName,
          price: pPrice,
          imageUrl: imgMatch[1],
          description: pDesc,
          badge: pBadge,
        });
        pIdx++;
      }
    }

    // Fallback: If no structured cards detected with Pattern A, detect by product image + heading
    if (detected.length === 0) {
      const imgTags = Array.from(htmlCode.matchAll(/<img[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi));
      imgTags.slice(1).forEach((img, i) => {
        detected.push({
          id: `prod_auto_${i + 1}`,
          fullHtmlChunk: '',
          name: img[2] || `Produk #${i + 1}`,
          price: '150.000',
          imageUrl: img[1],
          description: 'Kualitas terbaik dengan bahan premium.',
          badge: 'Best Seller',
        });
      });
    }

    setProducts(detected);
  }, [isOpen, htmlCode]);

  if (!isOpen) return null;

  // 1. UPDATE EXISTING PRODUCT
  const handleUpdateProduct = (id: string, updatedField: Partial<ParsedProduct>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedField } : p));
  };

  // 2. DELETE EXISTING PRODUCT
  const handleDeleteProduct = (id: string) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;

    if (!confirm(`Apakah Anda yakin ingin menghapus produk "${prod.name}"?`)) return;

    let updatedHtml = htmlCode;
    if (prod.fullHtmlChunk) {
      updatedHtml = updatedHtml.replace(prod.fullHtmlChunk, '');
    } else if (prod.name) {
      // Find and remove block containing this product name
      const nameEscaped = prod.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const blockRegex = new RegExp(`<div[^>]*>[^<]*<[^>]*>[\\s\\S]*?${nameEscaped}[\\s\\S]*?<\\/div>`, 'i');
      updatedHtml = updatedHtml.replace(blockRegex, '');
    }

    setProducts(prev => prev.filter(p => p.id !== id));
    onSaveHtml(updatedHtml);
    setSuccessMessage('Produk berhasil dihapus dari website!');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // 3. SAVE ALL EDITED PRODUCTS TO HTML
  const handleSaveAllProducts = () => {
    let updatedHtml = htmlCode;

    products.forEach(p => {
      if (p.fullHtmlChunk) {
        // Build replacement card HTML
        const waTarget = whatsappNumber.replace(/[^0-9]/g, '') || '6281234567890';
        const waMsg = encodeURIComponent(`Halo, saya ingin pesan: ${p.name} (Rp ${p.price})`);

        const newCard = `
        <div class="product-item bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl group">
          <div class="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-950 mb-3.5">
            <img src="${p.imageUrl}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
            <span class="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-white text-black text-[10px] font-bold shadow-md">${p.badge || 'Terlaris'}</span>
          </div>
          <div class="space-y-1.5 flex-1 flex flex-col justify-between">
            <div>
              <h4 class="text-sm font-bold text-white group-hover:text-zinc-200 transition">${p.name}</h4>
              <p class="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mt-1">${p.description}</p>
            </div>
            <div class="pt-3 border-t border-zinc-800/80 flex items-center justify-between mt-3">
              <span class="text-sm font-extrabold text-white font-mono">Rp ${p.price}</span>
              <a href="https://wa.me/${waTarget}?text=${waMsg}" target="_blank" rel="noreferrer" class="px-3.5 py-1.5 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-xl flex items-center gap-1 shadow transition">
                <span>Beli</span>
              </a>
            </div>
          </div>
        </div>`;

        updatedHtml = updatedHtml.replace(p.fullHtmlChunk, newCard);
      }
    });

    onSaveHtml(updatedHtml);
    setSuccessMessage('Seluruh perubahan produk berhasil disimpan ke website!');
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  // 4. ADD NEW PRODUCT TO HTML
  const handleAddNewProduct = () => {
    if (!newItemName.trim()) {
      alert('Nama produk tidak boleh kosong.');
      return;
    }

    const cleanPrice = newItemPrice.trim() || '150.000';
    const cleanDesc = newItemDesc.trim() || 'Kualitas premium pilihan terbaik.';
    const cleanImg = newItemImage.trim() || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80';
    const cleanBadge = newItemBadge.trim() || 'Terbaru';
    const waTarget = whatsappNumber.replace(/[^0-9]/g, '') || '6281234567890';
    const waMsg = encodeURIComponent(`Halo, saya ingin pesan: ${newItemName} (Rp ${cleanPrice})`);

    const newCardHtml = `
    <!-- Produk Baru: ${newItemName} -->
    <div class="product-item bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl group">
      <div class="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-950 mb-3.5">
        <img src="${cleanImg}" alt="${newItemName}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
        <span class="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-white text-black text-[10px] font-bold shadow-md">${cleanBadge}</span>
      </div>
      <div class="space-y-1.5 flex-1 flex flex-col justify-between">
        <div>
          <h4 class="text-sm font-bold text-white group-hover:text-zinc-200 transition">${newItemName}</h4>
          <p class="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mt-1">${cleanDesc}</p>
        </div>
        <div class="pt-3 border-t border-zinc-800/80 flex items-center justify-between mt-3">
          <span class="text-sm font-extrabold text-white font-mono">Rp ${cleanPrice}</span>
          <a href="https://wa.me/${waTarget}?text=${waMsg}" target="_blank" rel="noreferrer" class="px-3.5 py-1.5 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-xl flex items-center gap-1 shadow transition">
            <span>Beli</span>
          </a>
        </div>
      </div>
    </div>`;

    let updatedHtml = htmlCode;

    // Find grid container
    const gridRegexes = [
      /<div[^>]*class="[^"]*(?:grid-cols-[1-4]|product-grid)[^"]*"[^>]*>/i,
      /<section[^>]*id="(?:products|katalog|catalog|menu|portfolio|services)"[^>]*>[\s\S]*?<div[^>]*class="[^"]*grid[^"]*"[^>]*>/i,
    ];

    let inserted = false;
    for (const regex of gridRegexes) {
      const match = updatedHtml.match(regex);
      if (match && match.index !== undefined) {
        const insertPos = match.index + match[0].length;
        updatedHtml = updatedHtml.slice(0, insertPos) + '\n' + newCardHtml + '\n' + updatedHtml.slice(insertPos);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      if (updatedHtml.includes('</main>')) {
        updatedHtml = updatedHtml.replace('</main>', `\n<section class="max-w-6xl mx-auto px-4 py-12"><div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">${newCardHtml}</div></section>\n</main>`);
      } else if (updatedHtml.includes('</body>')) {
        updatedHtml = updatedHtml.replace('</body>', `\n<section class="max-w-6xl mx-auto px-4 py-12"><div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">${newCardHtml}</div></section>\n</body>`);
      }
    }

    // Append to local state list
    setProducts(prev => [
      ...prev,
      {
        id: `prod_new_${Date.now()}`,
        fullHtmlChunk: newCardHtml,
        name: newItemName,
        price: cleanPrice,
        imageUrl: cleanImg,
        description: cleanDesc,
        badge: cleanBadge,
      }
    ]);

    onSaveHtml(updatedHtml);
    setNewItemName('');
    setShowAddProductForm(false);
    setSuccessMessage('Produk baru berhasil ditambahkan ke katalog website!');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // 5. APPLY TEXT & CONTACT EDITS
  const handleApplyTextEdits = () => {
    let updated = htmlCode;

    if (headline.trim()) {
      const h1Regex = /(<h1[^>]*>)([\s\S]*?)(<\/h1>)/i;
      if (h1Regex.test(updated)) {
        updated = updated.replace(h1Regex, `$1${headline.trim()}$3`);
      }
    }

    if (whatsappNumber.trim()) {
      const cleanWa = whatsappNumber.replace(/[^0-9]/g, '');
      updated = updated.replace(/wa\.me\/[0-9]+/gi, `wa.me/${cleanWa}`);
    }

    onSaveHtml(updated);
    setSuccessMessage('Teks judul dan nomor WhatsApp berhasil diperbarui!');
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  // 6. APPLY MOBILE RESPONSIVE OPTIMIZATION
  const handleApplyMobileOptimization = () => {
    let updated = htmlCode;

    // 1. Ensure viewport meta tag exists
    if (!updated.includes('name="viewport"')) {
      updated = updated.replace('<head>', '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">');
    }

    // 2. Add Mobile Bottom Floating Quick Bar (WhatsApp + Checkout)
    const waTarget = whatsappNumber.replace(/[^0-9]/g, '') || '6281234567890';
    const mobileBottomBarHtml = `
    <!-- Mobile Floating Quick Bar -->
    <div class="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-t border-zinc-800 p-3 flex items-center justify-between gap-2 shadow-2xl">
      <a href="tel:${waTarget}" class="flex-1 py-2.5 px-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-center text-zinc-200 flex items-center justify-center gap-1.5">
        <span>📞 Kontak</span>
      </a>
      <a href="https://wa.me/${waTarget}?text=${encodeURIComponent('Halo, saya ingin memesan dari website!')}" target="_blank" rel="noreferrer" class="flex-1 py-2.5 px-3 bg-white text-black font-extrabold rounded-xl text-xs text-center flex items-center justify-center gap-1.5 shadow-lg">
        <span>💬 Order WhatsApp</span>
      </a>
    </div>`;

    if (!updated.includes('Mobile Floating Quick Bar')) {
      if (updated.includes('</body>')) {
        updated = updated.replace('</body>', `${mobileBottomBarHtml}\n</body>`);
      }
    }

    // 3. Make sure all containers have mobile padding
    updated = updated.replace(/class="([^"]*max-w-[^"]*)"/g, (match, classes) => {
      if (!classes.includes('px-4')) {
        return `class="${classes} px-4"`;
      }
      return match;
    });

    onSaveHtml(updated);
    setSuccessMessage('Optimasi responsif mobile (Viewport + Mobile Bar) berhasil diterapkan!');
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  // 7. ADD PRESET SECTIONS
  const handleAddPresetSection = (sectionType: string) => {
    let sectionHtml = '';
    const waTarget = whatsappNumber.replace(/[^0-9]/g, '') || '6281234567890';

    if (sectionType === 'promo') {
      sectionHtml = `
      <!-- Section Promo Tambahan -->
      <section class="py-10 sm:py-14 px-4 bg-zinc-950 border-y border-zinc-800 my-8">
        <div class="max-w-5xl mx-auto text-center space-y-4 p-6 sm:p-10 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl">
          <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-black text-xs font-bold">
            🔥 PROMO SPESIAL HARI INI
          </span>
          <h3 class="text-2xl sm:text-3xl font-extrabold text-white">Diskon 25% Khusus Pesanan Online</h3>
          <p class="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Dapatkan potongan harga langsung untuk setiap pembelian produk pilihan minggu ini.
          </p>
          <div class="pt-2">
            <a href="https://wa.me/${waTarget}?text=${encodeURIComponent('Halo, saya ingin klaim diskon promo 25%!')}" target="_blank" rel="noreferrer" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs sm:text-sm shadow-xl transition">
              <span>Klaim Diskon via WhatsApp</span>
            </a>
          </div>
        </div>
      </section>`;
    } else if (sectionType === 'testimonials') {
      sectionHtml = `
      <!-- Section Testimoni Tambahan -->
      <section class="py-10 sm:py-14 px-4 max-w-6xl mx-auto my-8">
        <div class="text-center mb-8 space-y-1.5">
          <span class="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">Ulasan Pelanggan</span>
          <h3 class="text-2xl font-bold text-white">Apa Kata Pelanggan Kami?</h3>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div class="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div class="flex text-amber-400">★★★★★</div>
            <p class="text-xs text-zinc-300 leading-relaxed">"Kualitas produk sangat memuaskan, bahan nyaman, respon admin di WhatsApp sangat cepat!"</p>
            <div class="text-xs font-bold text-white">— Dimas Pratama <span class="text-zinc-500 font-normal">(Jakarta)</span></div>
          </div>
          <div class="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div class="flex text-amber-400">★★★★★</div>
            <p class="text-xs text-zinc-300 leading-relaxed">"Pengiriman tepat waktu dan packing sangat rapi. Pasti langganan belanja di sini lagi."</p>
            <div class="text-xs font-bold text-white">— Sarah Amelia <span class="text-zinc-500 font-normal">(Surabaya)</span></div>
          </div>
          <div class="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div class="flex text-amber-400">★★★★★</div>
            <p class="text-xs text-zinc-300 leading-relaxed">"Sangat recommended! Sesuai dengan foto dan deskripsi yang ada di website."</p>
            <div class="text-xs font-bold text-white">— Budi Santoso <span class="text-zinc-500 font-normal">(Bandung)</span></div>
          </div>
        </div>
      </section>`;
    } else if (sectionType === 'faq') {
      sectionHtml = `
      <!-- Section FAQ Tambahan -->
      <section class="py-10 sm:py-14 px-4 max-w-4xl mx-auto my-8">
        <div class="text-center mb-8 space-y-1.5">
          <span class="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">Tanya Jawab</span>
          <h3 class="text-2xl font-bold text-white">Pertanyaan Sering Diajukan (FAQ)</h3>
        </div>
        <div class="space-y-3">
          <details class="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 cursor-pointer group">
            <summary class="text-xs font-bold text-white flex justify-between items-center select-none">
              <span>Bagaimana cara memesan produk?</span>
              <span class="text-zinc-500 group-open:rotate-180 transition">▼</span>
            </summary>
            <p class="text-xs text-zinc-400 mt-2.5 leading-relaxed pt-2 border-t border-zinc-800/80">
              Klik tombol WhatsApp pada produk pilihan Anda, rincian pesanan otomatis terisi dan langsung terhubung dengan admin kami.
            </p>
          </details>
          <details class="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 cursor-pointer group">
            <summary class="text-xs font-bold text-white flex justify-between items-center select-none">
              <span>Apakah bisa kirim ke seluruh wilayah Indonesia?</span>
              <span class="text-zinc-500 group-open:rotate-180 transition">▼</span>
            </summary>
            <p class="text-xs text-zinc-400 mt-2.5 leading-relaxed pt-2 border-t border-zinc-800/80">
              Ya, kami bekerja sama dengan berbagai ekspedisi terpercaya (JNE, J&T, SiCepat) untuk pengiriman aman ke seluruh Nusantara.
            </p>
          </details>
        </div>
      </section>`;
    }

    let updated = htmlCode;
    if (updated.includes('<footer')) {
      updated = updated.replace('<footer', `${sectionHtml}\n\n<footer`);
    } else if (updated.includes('</main>')) {
      updated = updated.replace('</main>', `${sectionHtml}\n</main>`);
    } else if (updated.includes('</body>')) {
      updated = updated.replace('</body>', `${sectionHtml}\n</body>`);
    }

    onSaveHtml(updated);
    setSuccessMessage('Section baru berhasil disisipkan ke halaman!');
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-5xl h-[92vh] bg-black border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100">
        
        {/* Toast Alert */}
        {savedSuccess && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border text-xs font-bold bg-white text-black border-white animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-black" />
            <span>{successMessage || 'Perubahan berhasil disimpan!'}</span>
          </div>
        )}

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Kelola Produk & Konten Website</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-200 border border-zinc-800 text-[10px] font-mono font-bold">
                  {products.length} Produk Terdeteksi
                </span>
              </div>
              <p className="text-xs text-zinc-400">Edit produk yang ada, tambah produk baru, atau optimalkan responsif mobile</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 pt-3 bg-zinc-950 border-b border-zinc-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition shrink-0 cursor-pointer ${
              activeTab === 'products'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>1. Edit & Tambah Produk ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mobile_optim')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition shrink-0 cursor-pointer ${
              activeTab === 'mobile_optim'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Smartphone className="w-4 h-4 text-white" />
            <span>2. Optimasi Responsif Mobile (HP)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition shrink-0 cursor-pointer ${
              activeTab === 'text'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>3. Edit Judul & Kontak WA</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sections')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition shrink-0 cursor-pointer ${
              activeTab === 'sections'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>4. + Tambah Section Baru</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-black space-y-6">
          
          {/* TAB 1: PRODUCT MANAGER (EDIT + ADD + DELETE) */}
          {activeTab === 'products' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Top Action Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                <div>
                  <h4 className="text-sm font-bold text-white">Daftar Produk di Website</h4>
                  <p className="text-xs text-zinc-400">Anda dapat mengedit nama, harga, foto, atau menghapus dan menambah produk baru.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddProductForm(!showAddProductForm)}
                    className="px-4 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-xl flex items-center gap-1.5 shadow transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-black" />
                    <span>{showAddProductForm ? 'Tutup Form' : '+ Tambah Produk Baru'}</span>
                  </button>

                  {products.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSaveAllProducts}
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow transition cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Simpan Perubahan Produk</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Form Tambah Produk Baru (Collapsible) */}
              {showAddProductForm && (
                <div className="p-5 bg-zinc-950 border border-white/20 rounded-2xl space-y-4 shadow-2xl animate-fadeIn ring-1 ring-white/10">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <span className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                      <Plus className="w-4 h-4 text-white" />
                      <span>Form Tambah Produk Baru</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddProductForm(false)}
                      className="text-zinc-500 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Nama Produk *</label>
                      <input
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="Contoh: Kaos Heavyweight Cotton Combed"
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Harga (Rupiah)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-xs text-zinc-500">Rp</span>
                        <input
                          type="text"
                          value={newItemPrice}
                          onChange={(e) => setNewItemPrice(e.target.value)}
                          placeholder="150.000"
                          className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono font-bold outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Badge / Tag Label</label>
                      <input
                        type="text"
                        value={newItemBadge}
                        onChange={(e) => setNewItemBadge(e.target.value)}
                        placeholder="Best Seller / Diskon 20%"
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Deskripsi Singkat Produk</label>
                      <input
                        type="text"
                        value={newItemDesc}
                        onChange={(e) => setNewItemDesc(e.target.value)}
                        placeholder="Kualitas jahitan rapi, bahan premium adem..."
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                      />
                    </div>
                  </div>

                  <ImgurImageInput
                    value={newItemImage}
                    onChange={(url) => setNewItemImage(url)}
                    label="Foto Produk (Link Imgur / Upload Langsung)"
                    placeholder="https://i.imgur.com/... atau upload"
                    aspectRatio="square"
                    itemTypeLabel="Foto Produk Baru"
                  />

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddProductForm(false)}
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold transition"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleAddNewProduct}
                      className="px-5 py-2 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-black" />
                      <span>Tambahkan ke Katalog</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Grid of Existing Detected Products to Edit */}
              {products.length === 0 ? (
                <div className="text-center py-16 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
                  <ShoppingBag className="w-10 h-10 mx-auto opacity-40 text-zinc-400" />
                  <span className="text-xs text-zinc-400 block">Belum ada produk yang terdeteksi di dalam kode HTML.</span>
                  <button
                    type="button"
                    onClick={() => setShowAddProductForm(true)}
                    className="px-4 py-2 bg-white text-black font-bold rounded-xl text-xs shadow inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Tambah Produk Pertama</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((p, idx) => (
                    <div
                      key={p.id}
                      className="p-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-2xl space-y-3 transition shadow-lg relative group"
                    >
                      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Produk #{idx + 1}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1 text-zinc-400 hover:text-white transition cursor-pointer"
                          title="Hapus Produk Ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Nama Produk</label>
                          <input
                            type="text"
                            value={p.name}
                            onChange={(e) => handleUpdateProduct(p.id, { name: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Harga (Rp)</label>
                            <input
                              type="text"
                              value={p.price}
                              onChange={(e) => handleUpdateProduct(p.id, { price: e.target.value })}
                              className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-lg px-2.5 py-1 text-xs text-white font-mono font-bold outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Badge / Label</label>
                            <input
                              type="text"
                              value={p.badge || ''}
                              onChange={(e) => handleUpdateProduct(p.id, { badge: e.target.value })}
                              placeholder="Best Seller"
                              className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-lg px-2.5 py-1 text-xs text-zinc-300 outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-400 mb-0.5">Deskripsi</label>
                          <textarea
                            rows={2}
                            value={p.description}
                            onChange={(e) => handleUpdateProduct(p.id, { description: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-300 outline-none resize-none leading-relaxed"
                          />
                        </div>

                        <ImgurImageInput
                          value={p.imageUrl}
                          onChange={(url) => handleUpdateProduct(p.id, { imageUrl: url })}
                          label="Foto Produk (Link Imgur / Upload)"
                          placeholder="https://i.imgur.com/... atau upload"
                          aspectRatio="square"
                          itemTypeLabel={`Produk #${idx + 1}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RESPONSIVE MOBILE OPTIMIZATION */}
          {activeTab === 'mobile_optim' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-3xl space-y-4 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white mx-auto">
                  <Smartphone className="w-6 h-6" />
                </div>

                <div className="text-center space-y-1">
                  <h4 className="text-base font-bold text-white">Optimasi Responsif Layar HP (Mobile)</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto">
                    Menjamin tampilan website Anda otomatis rapi di semua jenis HP, tulisan nyaman dibaca, tombol ramah jempol, dan menyisipkan bilah bawah cepat (Mobile Quick Bar).
                  </p>
                </div>

                <div className="space-y-2.5 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 text-xs">
                  <div className="flex items-center gap-2.5 text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                    <span>Viewport View Fluid 100% untuk smartphone & tablet</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                    <span>Grid Produk otomatis 1 kolom di HP & 3 kolom di desktop</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                    <span>Bilah Pesan WhatsApp Mengambang di bagian bawah HP</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                    <span>Tombol berukuran minimal 44px agar mudah disentuh jempol</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplyMobileOptimization}
                  className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs sm:text-sm rounded-xl shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Terapkan Optimasi Mobile Sekarang</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: EDIT TEXT & HEADLINES */}
          {activeTab === 'text' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4 shadow-xl">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Type className="w-4 h-4 text-white" />
                  <span>Ubah Teks Judul & Kontak WhatsApp</span>
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Judul Utama Website (Headline H1)
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Contoh: Belanja Pakaian Streetwear Modern"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Nomor WhatsApp Pemesanan (Auto Direct Checkout)
                  </label>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="Contoh: 081234567890 atau 6281234567890"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Seluruh tautan WhatsApp pada tombol beli/order akan otomatis diarahkan ke nomor ini.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleApplyTextEdits}
                    className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-black" />
                    <span>Terapkan Perubahan Teks</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADD SECTIONS */}
          {activeTab === 'sections' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="text-center mb-2">
                <h4 className="text-sm font-bold text-white">Pilih Bagian (Section) Tambahan</h4>
                <p className="text-xs text-zinc-400">Klik untuk menyisipkan section responsif siap pakai ke dalam halaman website Anda</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  {
                    id: 'promo',
                    title: '🔥 Banner Promo & Diskon Spesial',
                    desc: 'Kotak promosi khusus dengan tombol klaim diskon via WhatsApp.',
                  },
                  {
                    id: 'testimonials',
                    title: '⭐ Testimoni & Ulasan Pelanggan',
                    desc: 'Grid 3 testimoni pelanggan untuk meningkatkan kepercayaan pembeli.',
                  },
                  {
                    id: 'faq',
                    title: '❓ Tanya Jawab (FAQ Accordion)',
                    desc: 'Daftar pertanyaan umum interaktif yang bisa diklik buka/tutup.',
                  },
                ].map((sec) => (
                  <div
                    key={sec.id}
                    className="p-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-600 rounded-2xl space-y-3 flex flex-col justify-between transition group"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-white group-hover:text-zinc-200 transition">{sec.title}</h5>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{sec.desc}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddPresetSection(sec.id)}
                      className="w-full py-2 bg-zinc-900 hover:bg-white hover:text-black text-white text-xs font-bold rounded-xl border border-zinc-800 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Sisipkan Section Ini</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs text-zinc-400">
          <span>Semua penambahan dan pengeditan produk otomatis tersimpan ke kode website.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 rounded-xl font-semibold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
