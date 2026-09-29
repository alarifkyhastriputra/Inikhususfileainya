export type UserRole = 'admin' | 'member';
export type UserStatus = 'active' | 'pending' | 'suspended';

export interface UserProfile {
  uid: string;
  serialCode?: string;
  email: string;
  displayName: string;
  password?: string;
  photoURL?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  credits: number;
  lastLogin?: string;
}

export interface GeneratedWebsite {
  id: string;
  title: string;
  prompt: string;
  category: string;
  style: string;
  html: string;
  createdAt: string;
  authorId: string;
  authorEmail: string;
  views?: number;
  isPublic?: boolean;
}

export interface BackgroundMusicSettings {
  enabled: boolean;
  title: string;
  artist?: string;
  videoUrl: string; // YouTube or YouTube Music URL
  volume: number; // 0 - 100
  autoplay: boolean;
  loop: boolean;
}

export interface SystemSettings {
  requireApprovalForNewUsers: boolean;
  defaultCreditsPerUser: number;
  aiModel: string;
  systemNotice?: string;
  bgMusic?: BackgroundMusicSettings;
}

export interface GenerationTemplate {
  id: string;
  title: string;
  category: string;
  style: string;
  description: string;
  prompt: string;
  iconName: string;
}

export interface WizardColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  button: string;
  accent: string;
}

export interface WizardLayout {
  header: 'logo-left' | 'logo-center' | 'logo-menu' | 'header-large';
  navbar: 'horizontal' | 'hamburger' | 'floating' | 'sidebar';
  hero: 'text-left-img-right' | 'text-center' | 'large-image' | 'video-bg' | 'split';
  content: '1-col' | '2-col' | '3-col' | '4-col' | 'grid' | 'masonry';
  footer: 'simple' | '2-col' | '3-col' | '4-col' | 'footer-large';
}

export interface WizardHeaderNavbar {
  logoType: 'text' | 'upload' | 'ai-icon';
  logoText: string;
  logoUrl?: string;
  menuItems: string[];
  position: 'left' | 'center' | 'right';
}

export interface WizardSectionItem {
  id: string;
  name: string;
  enabled: boolean;
  iconName: string;
}

export interface WizardContent {
  headline: string;
  subheadline: string;
  ctaText: string;
  aboutUs: string;
  productServiceHeadline: string;
  faqSummary: string;
}

export interface WizardMedia {
  logoUrl: string;
  heroImageUrl: string;
  bannerUrl: string;
  productImages: string[];
  imagePosition: 'left' | 'right' | 'center' | 'background' | 'fullwidth' | 'card';
}

export interface WizardDesignSliders {
  borderRadius: number; // 0 to 30
  shadow: 'none' | 'soft' | 'medium' | 'strong';
  spacing: 'compact' | 'normal' | 'spacious';
  animation: 'none' | 'subtle' | 'smooth';
}

export interface WizardTypography {
  fontFamily: string;
  headingSize: 'normal' | 'large' | 'extra-large';
  bodySize: 'small' | 'normal' | 'medium';
  fontWeight: 'normal' | 'medium' | 'bold';
  lineHeight: 'tight' | 'normal' | 'relaxed';
}

export interface WizardResponsive {
  mobile: boolean;
  tablet: boolean;
  desktop: boolean;
}

export interface StoreProduct {
  id: string;
  name: string;
  price: string;
  description: string;
  imageUrl: string;
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  readTime: string;
  imageUrl: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  category: string;
  description: string;
  clientYear?: string;
  imageUrl: string;
}

export interface RestaurantMenuItem {
  id: string;
  name: string;
  category: string; // 'Makanan' | 'Minuman' | 'Camilan' | 'Dessert'
  price: string;
  description: string;
  imageUrl: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  price?: string;
  description: string;
  imageUrl?: string;
}

export interface WizardData {
  // Step 1: Info
  siteName: string;
  siteDescription: string;
  ownerBrand: string;
  category: string;
  authorName?: string; // Penulis untuk blog / personal
  whatsappNumber?: string; // Nomor HP WhatsApp untuk pemesanan chat toko / reservasi

  // Step 2: Jenis Website
  websiteType: string;

  // Step 3 & 4: Warna & Palet
  colors: WizardColors;
  paletteTheme: string;

  // Step 5: Layout
  layout: WizardLayout;

  // Step 6: Header & Navbar
  headerNavbar: WizardHeaderNavbar;

  // Step 7: Sections
  sections: WizardSectionItem[];

  // Step 8: Konten
  content: WizardContent;

  // Step 9: Gambar, Media & Katalog Item (Toko / Blog / Portfolio / Resto / Jasa)
  media: WizardMedia;
  storeProducts?: StoreProduct[]; // Untuk Toko Online
  blogPosts?: BlogPost[]; // Untuk Blog & Berita
  portfolioProjects?: PortfolioProject[]; // Untuk Portfolio
  restaurantMenu?: RestaurantMenuItem[]; // Untuk Restaurant / Kafe
  serviceItems?: ServiceItem[]; // Untuk Jasa / Company Profile

  // Step 10: Fitur Website
  features: string[];

  // Step 11: Gaya Desain
  designStyle: string;
  designSliders: WizardDesignSliders;

  // Step 12: Typography
  typography: WizardTypography;

  // Step 13: Responsive
  responsive: WizardResponsive;

  // Step 14: AI Special Request
  specialRequest: string;
}

export interface TutorialVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string; // YouTube, Vimeo, Loom, direct mp4, or embed URL
  thumbnailUrl?: string;
  category?: string; // e.g. "Toko Online", "Imgur & Upload Foto", "Dasar", "Checkout WhatsApp"
  duration?: string;
  createdAt: string;
  authorEmail?: string;
}


