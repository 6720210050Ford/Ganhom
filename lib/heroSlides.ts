import fs from 'fs';
import path from 'path';

export interface SlideData {
  id: number;
  title?: string;
  titleSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  titleColor?: string;
  subtitle?: string;
  subtitleSize?: 'sm' | 'base' | 'lg' | 'xl';
  subtitleColor?: string;
  textColor?: string;
  subtitleAlign?: 'left' | 'center' | 'right';
  subtitlePosition?: 'top' | 'middle';
  linkText?: string;
  linkHref?: string;
  primaryBtnText?: string;
  primaryBtnHref?: string;
  secondaryBtnText?: string;
  secondaryBtnHref?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  alt: string;
  description?: string;
  themeMode?: 'light' | 'dark';
  isGraphicBanner?: boolean;
  linkOverlay?: string;
  imageOffsetY?: number;
  imageOffsetX?: number;
  imageZoom?: number;
  imageFit?: 'cover' | 'contain' | 'blur';
  imageBgColor?: string;
}

const DEFAULT_SLIDES: SlideData[] = [
  {
    id: 1,
    title: 'Model 3',
    subtitle: '1.99% อัตราดอกเบี้ยพิเศษนาน 4 ปี พร้อมฟรี ประกันภัยชั้น 1 ปีแรก',
    primaryBtnText: 'สั่งซื้อตอนนี้',
    primaryBtnHref: '/blog-spa?source=products',
    secondaryBtnText: 'เรียนรู้เพิ่มเติม',
    secondaryBtnHref: '/posts',
    imageUrl: '/api/hero-image?id=1',
    alt: 'Tesla Model 3',
  },
  {
    id: 2,
    imageUrl: '/api/hero-image?id=2',
    alt: 'ZAAP ON SALE',
    isGraphicBanner: true,
    linkOverlay: '/blog-spa?source=products',
  },
  {
    id: 3,
    imageUrl: '/api/hero-image?id=3',
    alt: 'Mijia Front Load Washer Dryer Pro 12.5kg',
    isGraphicBanner: true,
    linkOverlay: '/blog-spa?source=products',
  },
  {
    id: 4,
    title: 'Next-Gen Smart Home',
    subtitle: 'สัมผัสประสบการณ์เทคโนโลยีอัจฉริยะ เชื่อมต่อทุกอุปกรณ์อย่างไร้รอยต่อ',
    primaryBtnText: 'สำรวจนวัตกรรม',
    primaryBtnHref: '/calculator',
    secondaryBtnText: 'อ่านบทความ',
    secondaryBtnHref: '/posts',
    imageUrl: '/tesla-model3.png',
    alt: 'Smart Technology',
  },
  {
    id: 5,
    title: 'วรพล บัวแก้ว (ฟอร์ด)',
    primaryBtnText: 'อ่านบทความทั้งหมด',
    primaryBtnHref: '/posts',
    secondaryBtnText: 'ติดต่อเรา',
    secondaryBtnHref: '/contact',
    imageUrl: '/ford.jpg',
    alt: 'วรพล บัวแก้ว',
  },
];

const DATA_FILE = path.join(process.cwd(), 'data', 'hero-slides.json');

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_SLIDES, null, 2), 'utf-8');
  }
}

export function getHeroSlides(): SlideData[] {
  try {
    ensureDataFile();
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    if (!content || !content.trim()) return [];
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading hero slides:', err);
    return [];
  }
}

export function saveHeroSlides(slides: SlideData[]): boolean {
  try {
    ensureDataFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(slides, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving hero slides:', err);
    return false;
  }
}
