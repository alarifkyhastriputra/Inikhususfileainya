import fs from 'fs';
import path from 'path';

export interface UserRecord {
  uid: string;
  serialCode?: string;
  email: string;
  displayName: string;
  password?: string;
  photoURL?: string;
  role: 'admin' | 'member';
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
  credits: number;
  lastLogin?: string;
}

export interface WebsiteRecord {
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

export interface SettingsRecord {
  requireApprovalForNewUsers: boolean;
  defaultCreditsPerUser: number;
  aiModel: string;
  systemNotice?: string;
}

export interface TutorialVideoRecord {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  category?: string;
  duration?: string;
  createdAt: string;
  authorEmail?: string;
}

export interface DatabaseSchema {
  users: UserRecord[];
  websites: WebsiteRecord[];
  settings: SettingsRecord;
  tutorials: TutorialVideoRecord[];
}

export const SUPER_ADMIN_EMAILS = [
  'nocteos67@gmail.com',
  'nocteos60@gmail.com',
  'hasbullahbeloh27@gmail.com'
];

export function isSuperAdminEmail(email?: string): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export function generateSerialCode(existingUsers: UserRecord[] = []): string {
  const existing = new Set(
    existingUsers
      .map(u => u.serialCode ? u.serialCode.toUpperCase() : '')
      .filter(Boolean)
  );

  let num = 1001;
  while (true) {
    const candidate = `VMS-${num}`;
    if (!existing.has(candidate)) {
      return candidate;
    }
    num++;
  }
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// In-memory cache for ultra-fast access
let dbCache: DatabaseSchema | null = null;

function seedSuperAdmins(): UserRecord[] {
  return SUPER_ADMIN_EMAILS.map((email, idx) => ({
    uid: `admin_${idx}_${email.replace(/[^a-z0-9]/g, '_')}`,
    serialCode: `VMS-000${idx + 1}`,
    email: email.toLowerCase(),
    displayName: `Super Admin (${email.split('@')[0]})`,
    password: 'admin',
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString(),
    credits: 999999,
    lastLogin: new Date().toISOString()
  }));
}

export function getDatabase(): DatabaseSchema {
  if (dbCache) {
    return dbCache;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed: DatabaseSchema = JSON.parse(raw);

      // Ensure super admins exist and have admin role
      const admins = seedSuperAdmins();
      admins.forEach(adm => {
        const found = parsed.users.find(u => u.email.toLowerCase() === adm.email.toLowerCase());
        if (!found) {
          parsed.users.push(adm);
        } else {
          found.role = 'admin';
          found.status = 'active';
          if (!found.password) found.password = 'admin';
          if (!found.serialCode) found.serialCode = adm.serialCode;
        }
      });

      // Ensure every user has a unique serialCode
      let modified = false;
      parsed.users.forEach((u, idx) => {
        if (!u.serialCode) {
          if (isSuperAdminEmail(u.email)) {
            u.serialCode = `VMS-000${idx + 1}`;
          } else {
            u.serialCode = generateSerialCode(parsed.users);
          }
          modified = true;
        }
      });

      if (modified) {
        saveDatabase(parsed);
      }

      if (!parsed.websites) parsed.websites = [];
      if (!parsed.tutorials || parsed.tutorials.length === 0) {
        parsed.tutorials = [
          {
            id: 'tut_1',
            title: 'Panduan Lengkap: Cara Membuat Toko Online Modern dengan vimos.ai',
            description: 'Pelajari 15 langkah mudah membuat toko online otomatis, menghubungkan tombol checkout WhatsApp, dan mengatur tata letak katalog produk.',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            category: 'Toko Online',
            duration: '05:30',
            createdAt: new Date().toISOString(),
            authorEmail: 'hasbullahbeloh27@gmail.com'
          },
          {
            id: 'tut_2',
            title: 'Cara Menggunakan & Upload Link Imgur untuk Foto Produk & Galeri',
            description: 'Tutorial upload gambar ke Imgur (gratis & cepat) lalu tempelkan tautannya ke vimos.ai untuk mengganti foto produk, portofolio, dan banner hero.',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            category: 'Upload Foto & Imgur',
            duration: '03:45',
            createdAt: new Date().toISOString(),
            authorEmail: 'hasbullahbeloh27@gmail.com'
          },
          {
            id: 'tut_3',
            title: 'Panduan Admin: Mengelola Member, Kode Seri, & Top-Up Kredit',
            description: 'Cara mudah admin mencari member dengan kode seri (VMS-XXXX), menambah saldo kredit, dan mereset password akun.',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            category: 'Admin Dashboard',
            duration: '04:15',
            createdAt: new Date().toISOString(),
            authorEmail: 'hasbullahbeloh27@gmail.com'
          }
        ];
        modified = true;
      }
      if (!parsed.settings) {
        parsed.settings = {
          requireApprovalForNewUsers: false,
          defaultCreditsPerUser: 100,
          aiModel: 'gemini-3.8-flash',
          systemNotice: 'Selamat datang di vimos.ai platform!'
        };
      }

      dbCache = parsed;
      return dbCache;
    }
  } catch (err) {
    console.error('[DB] Error reading database file:', err);
  }

  // Create initial schema
  const initialSchema: DatabaseSchema = {
    users: seedSuperAdmins(),
    websites: [],
    tutorials: [
      {
        id: 'tut_1',
        title: 'Panduan Lengkap: Cara Membuat Toko Online Modern dengan vimos.ai',
        description: 'Pelajari 15 langkah mudah membuat toko online otomatis, menghubungkan tombol checkout WhatsApp, dan mengatur tata letak katalog produk.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        category: 'Toko Online',
        duration: '05:30',
        createdAt: new Date().toISOString(),
        authorEmail: 'hasbullahbeloh27@gmail.com'
      },
      {
        id: 'tut_2',
        title: 'Cara Menggunakan & Upload Link Imgur untuk Foto Produk & Galeri',
        description: 'Tutorial upload gambar ke Imgur (gratis & cepat) lalu tempelkan tautannya ke vimos.ai untuk mengganti foto produk, portofolio, dan banner hero.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        category: 'Upload Foto & Imgur',
        duration: '03:45',
        createdAt: new Date().toISOString(),
        authorEmail: 'hasbullahbeloh27@gmail.com'
      },
      {
        id: 'tut_3',
        title: 'Panduan Admin: Mengelola Member, Kode Seri, & Top-Up Kredit',
        description: 'Cara mudah admin mencari member dengan kode seri (VMS-XXXX), menambah saldo kredit, dan mereset password akun.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        category: 'Admin Dashboard',
        duration: '04:15',
        createdAt: new Date().toISOString(),
        authorEmail: 'hasbullahbeloh27@gmail.com'
      }
    ],
    settings: {
      requireApprovalForNewUsers: false,
      defaultCreditsPerUser: 100,
      aiModel: 'gemini-3.8-flash',
      systemNotice: 'Selamat datang di vimos.ai platform!'
    }
  };

  saveDatabase(initialSchema);
  dbCache = initialSchema;
  return dbCache;
}

export function saveDatabase(data: DatabaseSchema): void {
  dbCache = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = DB_FILE + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('[DB] Error saving database file:', err);
  }
}
