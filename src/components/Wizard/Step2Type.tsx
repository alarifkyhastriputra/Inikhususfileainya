import React from 'react';
import { WizardData } from '../../types';
import { 
  ShoppingBag, 
  FileEdit, 
  UserCheck, 
  Building, 
  UtensilsCrossed, 
  Smartphone, 
  Newspaper, 
  Palette, 
  Briefcase, 
  Sparkles,
  Check
} from 'lucide-react';

interface Step2Props {
  data: WizardData;
  updateData: (fields: Partial<WizardData>) => void;
}

const websiteTypes = [
  { 
    id: 'Toko Online', 
    label: 'Toko Online', 
    icon: ShoppingBag, 
    desc: 'Katalog produk toko, keranjang belanja, checkout otomatis ke WhatsApp',
    badge: 'E-Commerce',
    defaultData: {
      category: 'Fashion & Pakaian',
      paletteTheme: 'Indigo Modern',
      headerNavbar: {
        logoType: 'text',
        logoText: 'VIMOS STORE',
        menuItems: ['Katalog', 'Promo Spesial', 'Tentang Kami', 'Cara Order', 'Kontak'],
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
        aboutUs: 'Didirikan untuk menghadirkan tren fashion berkualitas premium dengan pemesanan praktis dan pengiriman kilat.',
        productServiceHeadline: 'Produk Terlaris Minggu Ini',
        faqSummary: 'Q: Bagaimana cara pemesanan? A: Klik tombol WhatsApp pada produk pilihan Anda, rincian otomatis terisi.',
      },
      media: {
        logoUrl: '',
        heroImageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
        bannerUrl: '',
        productImages: [],
        imagePosition: 'right',
      },
      features: ['WhatsApp Button', 'Shopping Cart', 'Product Filter', 'FAQ Accordion', 'Testimonials', 'Dark Mode'],
    }
  },
  { 
    id: 'Blog', 
    label: 'Blog & Media Artikel', 
    icon: FileEdit, 
    desc: 'Publikasi artikel, topik trending, estimasi waktu baca, newsletter & bio penulis',
    badge: 'Editorial & Artikel',
    defaultData: {
      category: 'Teknologi',
      paletteTheme: 'Editorial Navy',
      colors: {
        primary: '#2563EB',
        secondary: '#0284C7',
        background: '#0F172A',
        text: '#F8FAFC',
        button: '#2563EB',
        accent: '#38BDF8',
      },
      headerNavbar: {
        logoType: 'text',
        logoText: 'TECHVERSE BLOG',
        menuItems: ['Artikel Terbaru', 'Tips & Tutorial', 'Kategori Topik', 'Tentang Penulis', 'Kontak'],
        position: 'left',
      },
      sections: [
        { id: 'hero', name: 'Artikel Pilihan Utama (Featured)', enabled: true, iconName: 'Sparkles' },
        { id: 'articles', name: 'Daftar Artikel Terbaru', enabled: true, iconName: 'BookOpen' },
        { id: 'trending', name: 'Topik Trending & Populer', enabled: true, iconName: 'TrendingUp' },
        { id: 'author', name: 'Profil & Bio Penulis', enabled: true, iconName: 'User' },
        { id: 'newsletter', name: 'Newsletter Langganan Email', enabled: true, iconName: 'Mail' },
        { id: 'footer', name: 'Footer Blog & Hak Cipta', enabled: true, iconName: 'Layout' },
      ],
      content: {
        headline: 'Wawasan Terkini Seputar Teknologi & Kreativitas',
        subheadline: 'Kumpulan artikel mendalam, panduan praktis, dan ulasan perkembangan AI terkini untuk memperluas perspektif Anda.',
        ctaText: 'Baca Artikel Terbaru',
        aboutUs: 'Ditulis oleh praktisi industri yang berdedikasi membagikan pengetahuan berkualitas kepada komunitas teknologi.',
        productServiceHeadline: 'Tulisan & Opini Terbaru',
        faqSummary: 'Q: Apakah saya bisa berlangganan newsletter mingguan? A: Masukkan email Anda pada kolom di bawah untuk mendapatkan update rutin.',
      },
      media: {
        logoUrl: '',
        heroImageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80',
        bannerUrl: '',
        productImages: [],
        imagePosition: 'right',
      },
      blogPosts: [
        {
          id: 'b_1',
          title: 'Panduan Memulai Desain Web Modern 2026: Tren & Framework',
          category: 'Teknologi',
          excerpt: 'Eksplorasi teknik desain web responsif generasi terbaru dengan Tailwind CSS dan arsitektur komponen modern.',
          readTime: '4 min read',
          imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'b_2',
          title: '10 Kebiasaan Produktivitas Kerja Remote yang Jarang Diketahui',
          category: 'Lifestyle',
          excerpt: 'Cara menjaga fokus dan keseimbangan hidup saat bekerja dari rumah tanpa merasa cepat lelah atau burnout.',
          readTime: '6 min read',
          imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'b_3',
          title: 'Bagaimana AI Mengubah Cara Kita Menulis dan Berpikir Kritis',
          category: 'Opini',
          excerpt: 'Analisis mendalam mengenai peran kecerdasan buatan sebagai rekan berpikir kreatif di era serba digital.',
          readTime: '5 min read',
          imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
        }
      ],
      features: ['Search', 'Dark Mode', 'Social Media', 'Back To Top'],
      typography: {
        fontFamily: 'Plus Jakarta Sans',
        headingSize: 'large',
        bodySize: 'normal',
        fontWeight: 'bold',
        lineHeight: 'relaxed',
      }
    }
  },
  { 
    id: 'Portfolio', 
    label: 'Portofolio Kreatif', 
    icon: UserCheck, 
    desc: 'Showcase karya, keahlian/skills, ulasan klien & tombol Hire Me via WhatsApp',
    badge: 'Personal / Showcase',
    defaultData: {
      category: 'UI/UX Design',
      paletteTheme: 'Dark Obsidian',
      colors: {
        primary: '#6366F1',
        secondary: '#06B6D4',
        background: '#090D16',
        text: '#FFFFFF',
        button: '#4F46E5',
        accent: '#6366F1',
      },
      headerNavbar: {
        logoType: 'text',
        logoText: 'STUDIO PORTOFOLIO',
        menuItems: ['Galeri Karya', 'Tentang Saya', 'Keahlian', 'Testimoni', 'Hire Me'],
        position: 'left',
      },
      sections: [
        { id: 'hero', name: 'Hero Perkenalan Diri', enabled: true, iconName: 'Sparkles' },
        { id: 'portfolio', name: 'Galeri Hasil Karya (Showcase)', enabled: true, iconName: 'Image' },
        { id: 'skills', name: 'Keahlian & Tools yang Digunakan', enabled: true, iconName: 'Sliders' },
        { id: 'testimonials', name: 'Ulasan / Testimoni Klien', enabled: true, iconName: 'Star' },
        { id: 'contact', name: 'Formulir Kontak / Hire Me', enabled: true, iconName: 'Mail' },
        { id: 'footer', name: 'Footer Portofolio', enabled: true, iconName: 'Layout' },
      ],
      content: {
        headline: 'Mewujudkan Ide Menjadi Produk Digital Berkesan',
        subheadline: 'Desainer UI/UX & Frontend Developer yang berfokus menciptakan pengalaman digital elegan, intuitif, dan bernilai bisnis tinggi.',
        ctaText: 'Lihat Hasil Karya',
        aboutUs: 'Dengan pengalaman lebih dari 5 tahun, saya telah berkolaborasi dengan startup hingga perusahaan ternama untuk merancang solusi digital inovatif.',
        productServiceHeadline: 'Proyek Pilihan Terbaru',
        faqSummary: 'Q: Apakah menerima proyek freelance atau kontrak? A: Ya, saya terbuka untuk peluang proyek baru maupun kolaborasi jangka panjang.',
      },
      media: {
        logoUrl: '',
        heroImageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
        bannerUrl: '',
        productImages: [],
        imagePosition: 'right',
      },
      portfolioProjects: [
        {
          id: 'p_1',
          title: 'Redesain Aplikasi Mobile FinTech PayQuick',
          category: 'Mobile App / UI/UX',
          clientYear: 'FinTech Startup • 2026',
          description: 'Meningkatkan tingkat konversi transfer hingga 35% dengan alur antarmuka yang lebih bersih dan intuitif.',
          imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'p_2',
          title: 'Branding & Website E-Commerce Artisan Goods',
          category: 'Web Design & Brand Identity',
          clientYear: 'Artisan Goods Co • 2025',
          description: 'Membangun identitas visual mewah dengan katalog produk berkinerja cepat dan responsif di semua perangkat.',
          imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'p_3',
          title: 'Sistem Desain Dashboard Analitik Korporat',
          category: 'Design System / SaaS',
          clientYear: 'Global Analytics • 2025',
          description: 'Membuat kumpulan komponen UI modular yang mempercepat waktu pengiriman fitur tim engineering sebesar 50%.',
          imageUrl: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&auto=format&fit=crop&q=80',
        }
      ],
      features: ['WhatsApp Button', 'Gallery', 'Contact Form', 'Dark Mode'],
    }
  },
  { 
    id: 'Restaurant', 
    label: 'Restaurant & Kafe', 
    icon: UtensilsCrossed, 
    desc: 'Menu hidangan makanan/minuman, foto kuliner aesthetic & reservasi meja via WhatsApp',
    badge: 'Kuliner & Kafe',
    defaultData: {
      category: 'Kedai Kopi & Kafe',
      paletteTheme: 'Amber Warm',
      colors: {
        primary: '#D97706',
        secondary: '#F59E0B',
        background: '#1A1612',
        text: '#FFFBEB',
        button: '#D97706',
        accent: '#FBBF24',
      },
      headerNavbar: {
        logoType: 'text',
        logoText: 'KOPI SENJA',
        menuItems: ['Daftar Menu', 'Cerita Rasa', 'Reservasi Meja', 'Lokasi & Jam Buka'],
        position: 'center',
      },
      sections: [
        { id: 'hero', name: 'Hero Suasana Resto & Kafe', enabled: true, iconName: 'Sparkles' },
        { id: 'menu', name: 'Menu Pilihan Rekomendasi Chef', enabled: true, iconName: 'Utensils' },
        { id: 'story', name: 'Filosofi & Bahan Segar Pilihan', enabled: true, iconName: 'Heart' },
        { id: 'reviews', name: 'Ulasan Pengunjung Setia', enabled: true, iconName: 'Star' },
        { id: 'location', name: 'Lokasi & Jam Operasional Buka', enabled: true, iconName: 'MapPin' },
        { id: 'footer', name: 'Footer Restoran & Kontak', enabled: true, iconName: 'Layout' },
      ],
      content: {
        headline: 'Secangkir Ketenangan & Cita Rasa Istimewa',
        subheadline: 'Biji kopi pilihan Nusantara yang disangrai segar berpadu dengan hidangan lezat dalam suasana santai dan hangat.',
        ctaText: 'Reservasi Meja via WhatsApp',
        aboutUs: 'Didirikan untuk menyajikan pengalaman kuliner autentik yang mempertemukan kehangatan rasa dan momen berharga bersama orang tersayang.',
        productServiceHeadline: 'Menu Andalan Pilihan Tamu',
        faqSummary: 'Q: Apakah tersedia area smoking dan Wi-Fi cepat? A: Ya, kami memiliki area indoor ber-AC dan outdoor ramah merokok dengan Wi-Fi 100 Mbps.',
      },
      media: {
        logoUrl: '',
        heroImageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80',
        bannerUrl: '',
        productImages: [],
        imagePosition: 'center',
      },
      restaurantMenu: [
        {
          id: 'm_1',
          name: 'Kopi Susu Gula Aren Asli',
          category: 'Minuman Kopi',
          price: '22.000',
          description: 'Espresso blend, susu segar creamy, dan lelehan gula aren organik wangi.',
          imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'm_2',
          name: 'Nasi Goreng Wagyu Sambal Matah',
          category: 'Makanan Utama',
          price: '48.000',
          description: 'Nasi goreng bumbu rempah dengan potongan daging wagyu empuk dan sambal matah Bali segar.',
          imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'm_3',
          name: 'Croissant Butter Belgia Cokelat',
          category: 'Pastry / Camilan',
          price: '26.000',
          description: 'Pastry renyah butter Prancis dengan isian cokelat Belgia lumer.',
          imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80',
        }
      ],
      features: ['WhatsApp Button', 'Product Filter', 'FAQ Accordion', 'Dark Mode'],
    }
  },
  { 
    id: 'Company Profile', 
    label: 'Company Profile & Bisnis', 
    icon: Building, 
    desc: 'Profil resmi perusahaan, paket layanan bisnis, kredibilitas klien & form konsultasi',
    badge: 'Korporat / Bisnis',
    defaultData: {
      category: 'Teknologi / IT',
      paletteTheme: 'Modern Indigo',
      colors: {
        primary: '#4F46E5',
        secondary: '#06B6D4',
        background: '#0F172A',
        text: '#F8FAFC',
        button: '#4F46E5',
        accent: '#06B6D4',
      },
      headerNavbar: {
        logoType: 'text',
        logoText: 'PT NEXUS DIGITAL',
        menuItems: ['Layanan', 'Studi Kasus', 'Tentang Perusahaan', 'Klien Kami', 'Kontak'],
        position: 'left',
      },
      sections: [
        { id: 'hero', name: 'Hero Visi & Solusi Perusahaan', enabled: true, iconName: 'Sparkles' },
        { id: 'services', name: 'Paket Layanan & Solusi Bisnis', enabled: true, iconName: 'Briefcase' },
        { id: 'stats', name: 'Statistik Pencapaian & Prestasi', enabled: true, iconName: 'TrendingUp' },
        { id: 'clients', name: 'Mitra & Klien yang Mempercayai Kami', enabled: true, iconName: 'Users' },
        { id: 'contact', name: 'Formulir Penawaran & Konsultasi', enabled: true, iconName: 'Mail' },
        { id: 'footer', name: 'Footer Legal & Alamat Kantor', enabled: true, iconName: 'Layout' },
      ],
      content: {
        headline: 'Solusi Digital Terpercaya untuk Pertumbuhan Bisnis Anda',
        subheadline: 'Kami membantu perusahaan mentransformasi operasional dan meningkatkan daya saing melalui teknologi cerdas dan strategi terukur.',
        ctaText: 'Konsultasi Gratis Sekarang',
        aboutUs: 'Berdiri sejak 2018, kami telah mendampingi lebih dari 200+ perusahaan di Indonesia mencapai efisiensi maksimal dan pertumbuhan eksponensial.',
        productServiceHeadline: 'Layanan Profesional Unggulan Kami',
        faqSummary: 'Q: Bagaimana proses konsultasi awal? A: Kami menyediakan sesi konsultasi gratis 30 menit untuk memetakan kebutuhan spesifik bisnis Anda.',
      },
      media: {
        logoUrl: '',
        heroImageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
        bannerUrl: '',
        productImages: [],
        imagePosition: 'right',
      },
      serviceItems: [
        {
          id: 's_1',
          name: 'Transformasi & Pengembangan Web Enterprise',
          category: 'Software & Web',
          price: 'Mulai Rp 15 Juta',
          description: 'Pembangunan website dan aplikasi web dengan keamanan tinggi, skalabilitas awan, dan performa optimal.',
        },
        {
          id: 's_2',
          name: 'Digital Marketing & Growth Strategy',
          category: 'Marketing',
          price: 'Mulai Rp 8 Juta / Bulan',
          description: 'Strategi pemasaran terpadu meliputi SEO, Google Ads, dan kampanye media sosial berorientasi hasil konversi.',
        },
        {
          id: 's_3',
          name: 'Konsultasi Keamanan & Infrastruktur Cloud',
          category: 'Cloud & IT Security',
          price: 'Sesuai Lingkup Kerja',
          description: 'Audit keamanan sistem dan implementasi arsitektur cloud terproteksi standar internasional.',
        }
      ],
      features: ['Contact Form', 'WhatsApp Button', 'FAQ Accordion', 'Dark Mode'],
    }
  },
  { 
    id: 'Landing Page', 
    label: 'Landing Page Produk', 
    icon: Smartphone, 
    desc: 'Satu halaman fokus konversi tinggi dengan tombol CTA menonjol untuk 1 produk unggulan',
    badge: 'Konversi Tinggi',
    defaultData: {
      category: 'Fashion & Pakaian',
      paletteTheme: 'Indigo Modern',
      headerNavbar: {
        logoType: 'text',
        logoText: 'VIMOS EXCLUSIVE',
        menuItems: ['Keunggulan', 'Spesifikasi', 'Testimoni', 'Pesan via WA'],
        position: 'left',
      },
      sections: [
        { id: 'hero', name: 'Hero Penawaran Spesial', enabled: true, iconName: 'Sparkles' },
        { id: 'features', name: 'Keunggulan & Manfaat Utama', enabled: true, iconName: 'CheckCircle' },
        { id: 'product', name: 'Spesifikasi Produk Unggulan', enabled: true, iconName: 'Box' },
        { id: 'testimonials', name: 'Bukti & Testimoni Pelanggan', enabled: true, iconName: 'Star' },
        { id: 'cta', name: 'Tombol Pemesanan Khusus Diskon', enabled: true, iconName: 'ShoppingBag' },
        { id: 'footer', name: 'Footer Garansi & Bantuan', enabled: true, iconName: 'Layout' },
      ],
      content: {
        headline: 'Revolusi Kenyamanan Berpakaian Setiap Hari',
        subheadline: 'Dapatkan kaos heavyweight premium dengan potongan oversize sempurna. Diskon 40% khusus 50 pembeli pertama hari ini!',
        ctaText: 'Klaim Diskon via WhatsApp',
        aboutUs: 'Dibuat dengan dedikasi tinggi menggunakan katun organik combed 24s yang tidak mudah kusut dan adem dipakai seharian.',
        productServiceHeadline: 'Detail Spesifikasi & Kualitas Produk',
        faqSummary: 'Q: Apakah ada garansi ukuran tidak pas? A: Garansi tukar size gratis tanpa biaya tambahan!',
      },
      features: ['WhatsApp Button', 'Popup', 'FAQ Accordion', 'Dark Mode'],
    }
  },
  { 
    id: 'Berita', 
    label: 'Portal Berita & Warta', 
    icon: Newspaper, 
    desc: 'Tata letak portal berita modern dengan kategori berita aktual dan kolom opini',
    badge: 'Media Berita',
    defaultData: {
      category: 'Berita',
      paletteTheme: 'Modern Indigo',
      headerNavbar: {
        logoType: 'text',
        logoText: 'WARTA KITA',
        menuItems: ['Terkini', 'Ekonomi', 'Teknologi', 'Gaya Hidup', 'Opini'],
        position: 'left',
      },
      sections: [
        { id: 'hero', name: 'Berita Utama Hari Ini (Headline)', enabled: true, iconName: 'Sparkles' },
        { id: 'latest', name: 'Kabar Berita Terkini', enabled: true, iconName: 'Newspaper' },
        { id: 'popular', name: 'Paling Banyak Dibaca', enabled: true, iconName: 'Flame' },
        { id: 'footer', name: 'Footer Redaksi & Pedoman Media', enabled: true, iconName: 'Layout' },
      ],
      features: ['Search', 'Dark Mode', 'Social Media', 'Back To Top'],
    }
  },
  { 
    id: 'Agency', 
    label: 'Creative & Digital Agency', 
    icon: Palette, 
    desc: 'Studi kasus desain kreatif, visual dinamis, portofolio karya & tawaran kerjasama',
    badge: 'Kreatif',
    defaultData: {
      category: 'Agensi Kreatif',
      paletteTheme: 'Dark Obsidian',
      headerNavbar: {
        logoType: 'text',
        logoText: 'CREATIVE LAB',
        menuItems: ['Karya Kami', 'Layanan', 'Pendekatan', 'Klien', 'Kontak'],
        position: 'left',
      },
      sections: [
        { id: 'hero', name: 'Hero Pernyataan Kreatif', enabled: true, iconName: 'Sparkles' },
        { id: 'showcase', name: 'Studi Kasus Proyek Pilihan', enabled: true, iconName: 'Image' },
        { id: 'services', name: 'Layanan Desain & Branding', enabled: true, iconName: 'Palette' },
        { id: 'contact', name: 'Mulai Proyek Bersama Kami', enabled: true, iconName: 'Mail' },
        { id: 'footer', name: 'Footer Agency', enabled: true, iconName: 'Layout' },
      ],
      features: ['WhatsApp Button', 'Gallery', 'Contact Form', 'Dark Mode'],
    }
  },
  { 
    id: 'Jasa', 
    label: 'Penyedia Jasa Profesional', 
    icon: Briefcase, 
    desc: 'Katalog jasa, daftar paket harga, testimoni klien & pemesanan jasa via WhatsApp',
    badge: 'Jasa Layanan',
    defaultData: {
      category: 'Jasa',
      paletteTheme: 'Modern Indigo',
      headerNavbar: {
        logoType: 'text',
        logoText: 'LAYANAN AHLI',
        menuItems: ['Paket Jasa', 'Cara Kerja', 'Testimoni', 'FAQ', 'Hubungi Kami'],
        position: 'left',
      },
      features: ['WhatsApp Button', 'Contact Form', 'FAQ Accordion', 'Testimonials'],
    }
  },
];

export const Step2Type: React.FC<Step2Props> = ({ data, updateData }) => {
  const handleSelectType = (selectedType: typeof websiteTypes[0]) => {
    // Merge existing siteName/description with archetype-specific settings
    const archetypeDefaults = selectedType.defaultData || {};

    updateData({
      websiteType: selectedType.id,
      category: archetypeDefaults.category || data.category,
      headerNavbar: (archetypeDefaults as any).headerNavbar 
        ? { 
            ...(archetypeDefaults as any).headerNavbar, 
            logoText: data.siteName ? data.siteName.toUpperCase() : (archetypeDefaults as any).headerNavbar.logoText 
          } 
        : data.headerNavbar,
      sections: (archetypeDefaults as any).sections || data.sections,
      content: (archetypeDefaults as any).content 
        ? {
            ...data.content,
            ...(archetypeDefaults as any).content,
            headline: (archetypeDefaults as any).content.headline || data.content.headline,
          }
        : data.content,
      media: (archetypeDefaults as any).media 
        ? {
            ...data.media,
            heroImageUrl: (archetypeDefaults as any).media.heroImageUrl || data.media.heroImageUrl,
          }
        : data.media,
      features: (archetypeDefaults as any).features || data.features,
      // Archetype-specific item arrays
      ...(selectedType.id === 'Blog' || selectedType.id === 'Berita' 
        ? { blogPosts: (archetypeDefaults as any).blogPosts || [] }
        : {}),
      ...(selectedType.id === 'Portfolio'
        ? { portfolioProjects: (archetypeDefaults as any).portfolioProjects || [] }
        : {}),
      ...(selectedType.id === 'Restaurant'
        ? { restaurantMenu: (archetypeDefaults as any).restaurantMenu || [] }
        : {}),
      ...(selectedType.id === 'Company Profile' || selectedType.id === 'Jasa'
        ? { serviceItems: (archetypeDefaults as any).serviceItems || [] }
        : {}),
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="text-center space-y-1.5 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Langkah 2: Model & Jenis Website</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Pilih Jenis Website Anda</h2>
        <p className="text-xs text-zinc-400 max-w-xl mx-auto">
          Setiap jenis website (Toko Online, Blog, Portofolio, Kafe/Restoran, Company Profile) akan memiliki langkah-langkah, katalog item, dan fitur yang <strong>disesuaikan secara khusus</strong> untuk kebutuhan Anda!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {websiteTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = data.websiteType === type.id;

          return (
            <div
              key={type.id}
              onClick={() => handleSelectType(type)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 relative group flex items-start gap-3.5 ${
                isSelected
                  ? 'bg-zinc-900 border-white shadow-xl ring-1 ring-white/20'
                  : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition ${
                  isSelected
                    ? 'bg-white text-black shadow font-bold'
                    : 'bg-zinc-900 text-zinc-400 group-hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h3 className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                    {type.label}
                  </h3>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                <span className="inline-block px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-bold mb-1.5">
                  {type.badge}
                </span>

                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                  {type.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
