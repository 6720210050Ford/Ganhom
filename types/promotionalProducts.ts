export interface ProductItem {
  id: string;
  name: string;
  price: string;
  originalPrice: string;
  hasFromPrefix?: boolean;
  imageCrop?: {
    sx: number;
    sy: number;
    sWidth: number;
    sHeight: number;
  };
  customImageUrl?: string;
  linkHref?: string;
}

export interface FeaturedProduct {
  brand: string;
  model: string;
  modelHighlight?: string;
  modelSuffix?: string;
  badge?: string;
  tagline: string;
  specs: string[];
  price: string;
  originalPrice: string;
  hasFromPrefix?: boolean;
  btnText: string;
  btnHref: string;
  imageCrop?: {
    sx: number;
    sy: number;
    sWidth: number;
    sHeight: number;
  };
  customImageUrl?: string;
}

export interface TabData {
  id: string;
  name: string;
  featured: FeaturedProduct;
  items: ProductItem[];
}

export const DEFAULT_PROMOTIONAL_TABS: TabData[] = [
  {
    id: 'new',
    name: 'สินค้าใหม่',
    featured: {
      brand: 'REDMI',
      model: 'Note ',
      modelHighlight: '17',
      modelSuffix: ' Pro Max',
      badge: '5G',
      tagline: 'แบตแกร่งเต็ม MAX',
      specs: [
        'แบตเตอรี่ 10000mAh พร้อมไฮเปอร์ชาร์จ 100W',
        'ทนน้ำลึก 2 เมตร นาน 72 ชั่วโมง',
      ],
      price: '฿17,990.00',
      originalPrice: '฿21,599.00',
      hasFromPrefix: true,
      btnText: 'เรียนรู้เพิ่มเติม',
      btnHref: '/blog-spa?source=products',
      imageCrop: {
        sx: 4.1,
        sy: 22.0,
        sWidth: 43.3,
        sHeight: 35.8,
      },
    },
    items: [
      {
        id: 'redmi-17-5g',
        name: 'REDMI Note 17 5G',
        price: '฿11,999.00',
        originalPrice: '฿14,399.00',
        hasFromPrefix: true,
        imageCrop: {
          sx: 10.0,
          sy: 63.5,
          sWidth: 9.0,
          sHeight: 14.5,
        },
        linkHref: '/blog-spa?source=products',
      },
      {
        id: 'redmi-watch-6-lite',
        name: 'REDMI Watch 6 Lite',
        price: '฿1,999.00',
        originalPrice: '฿2,990.00',
        hasFromPrefix: false,
        imageCrop: {
          sx: 32.0,
          sy: 63.5,
          sWidth: 9.5,
          sHeight: 14.5,
        },
        linkHref: '/blog-spa?source=products',
      },
      {
        id: 'poco-f9-ultra',
        name: 'POCO F9 Ultra',
        price: '฿29,990.00',
        originalPrice: '฿31,990.00',
        hasFromPrefix: true,
        imageCrop: {
          sx: 54.8,
          sy: 63.5,
          sWidth: 9.0,
          sHeight: 14.5,
        },
        linkHref: '/blog-spa?source=products',
      },
      {
        id: 'poco-f9-pro',
        name: 'POCO F9 Pro',
        price: '฿25,990.00',
        originalPrice: '฿27,990.00',
        hasFromPrefix: true,
        imageCrop: {
          sx: 76.8,
          sy: 63.5,
          sWidth: 9.0,
          sHeight: 14.5,
        },
        linkHref: '/blog-spa?source=products',
      },
    ],
  },
  {
    id: 'lifestyle',
    name: 'ตอบโจทย์ทุกไลฟ์สไตล์',
    featured: {
      brand: 'XIAOMI',
      model: 'Buds 5 Pro',
      badge: 'Hi-Res',
      tagline: 'มิติเสียงคมชัด ตัดเสียงรบกวนขั้นสุด',
      specs: [
        'ระบบตัดเสียงรบกวนอัจฉริยะแบบ Hybrid Active Noise Cancellation',
        'แบตเตอรี่ใช้งานต่อเนื่องสูงสุดถึง 38 ชั่วโมง',
      ],
      price: '฿3,990.00',
      originalPrice: '฿4,990.00',
      hasFromPrefix: false,
      btnText: 'เรียนรู้เพิ่มเติม',
      btnHref: '/blog-spa?source=products',
      imageCrop: {
        sx: 4.1,
        sy: 22.0,
        sWidth: 43.3,
        sHeight: 35.8,
      },
    },
    items: [
      {
        id: 'smart-band-9',
        name: 'Xiaomi Smart Band 9',
        price: '฿1,490.00',
        originalPrice: '฿1,990.00',
        imageCrop: {
          sx: 32.0,
          sy: 63.5,
          sWidth: 9.5,
          sHeight: 14.5,
        },
        linkHref: '/blog-spa?source=products',
      },
      {
        id: 'sound-pocket',
        name: 'Xiaomi Sound Pocket',
        price: '฿699.00',
        originalPrice: '฿990.00',
        imageCrop: {
          sx: 10.0,
          sy: 63.5,
          sWidth: 9.0,
          sHeight: 14.5,
        },
        linkHref: '/blog-spa?source=products',
      },
      {
        id: 'scooter-4-pro',
        name: 'Electric Scooter 4 Pro',
        price: '฿18,990.00',
        originalPrice: '฿22,990.00',
        hasFromPrefix: true,
        imageCrop: {
          sx: 54.8,
          sy: 63.5,
          sWidth: 9.0,
          sHeight: 14.5,
        },
        linkHref: '/blog-spa?source=products',
      },
      {
        id: 'action-cam',
        name: 'Xiaomi Action Cam 4K',
        price: '฿4,590.00',
        originalPrice: '฿5,990.00',
        imageCrop: {
          sx: 76.8,
          sy: 63.5,
          sWidth: 9.0,
          sHeight: 14.5,
        },
        linkHref: '/blog-spa?source=products',
      },
    ],
  },
  {
    id: 'work',
    name: 'เสริมประสิทธิภาพการทำงาน',
    featured: {
      brand: 'XIAOMI',
      model: 'Pad 6S Pro 12.4',
      badge: '3K 144Hz',
      tagline: 'ปลดล็อกพลังการทำงานและสร้างสรรค์อย่างไร้ขีดจำกัด',
      specs: [
        'ชิปเซ็ต Snapdragon 8 Gen 2 ประสิทธิภาพสูงสุด',
        'หน้าจอ 3K 144Hz คมชัด พร้อมชาร์จไว 120W HyperCharge',
      ],
      price: '฿18,990.00',
      originalPrice: '฿21,990.00',
      hasFromPrefix: true,
      btnText: 'เรียนรู้เพิ่มเติม',
      btnHref: '/blog-spa?source=products',
      imageCrop: {
        sx: 4.1,
        sy: 22.0,
        sWidth: 43.3,
        sHeight: 35.8,
      },
    },
    items: [
      {
        id: 'curved-monitor',
        name: 'Curved Gaming Monitor 30"',
        price: '฿7,990.00',
        originalPrice: '฿9,990.00',
        imageCrop: {
          sx: 10.0,
          sy: 63.5,
          sWidth: 9.0,
          sHeight: 14.5,
        },
        linkHref: '/blog-spa?source=products',
      },
      {
        id: 'focus-pen',
        name: 'Xiaomi Focus Pen',
        price: '฿2,490.00',
        originalPrice: '฿2,990.00',
        imageCrop: {
          sx: 32.0,
          sy: 63.5,
          sWidth: 9.5,
          sHeight: 14.5,
        },
        linkHref: '/blog-spa?source=products',
      },
      {
        id: 'wireless-combo',
        name: 'Wireless Keyboard & Mouse',
        price: '฿890.00',
        originalPrice: '฿1,290.00',
        imageCrop: {
          sx: 54.8,
          sy: 63.5,
          sWidth: 9.0,
          sHeight: 14.5,
        },
        linkHref: '/blog-spa?source=products',
      },
      {
        id: 'gan-charger-120w',
        name: 'GaN Fast Charger 120W',
        price: '฿1,490.00',
        originalPrice: '฿1,890.00',
        imageCrop: {
          sx: 76.8,
          sy: 63.5,
          sWidth: 9.0,
          sHeight: 14.5,
        },
        linkHref: '/blog-spa?source=products',
      },
    ],
  },
  {
    id: 'smart-home',
    name: 'บ้านอัจฉริยะ',
    featured: {
      brand: 'MIJIA',
      model: 'Front Load Washer Dryer',
      modelSuffix: ' Pro',
      badge: '12.5kg',
      tagline: 'ครบทั้งซักและอบในเครื่องเดียว',
      specs: [
        'ซักสะอาด ถนอมผ้าพร้อมกำจัดไรฝุ่นล้ำลึก 99.9%',
        'รับประกันมอเตอร์ Direct Drive ทนทานนาน 12 ปี',
      ],
      price: '฿19,990.00',
      originalPrice: '฿29,970.00',
      btnText: 'เรียนรู้เพิ่มเติม',
      btnHref: '/blog-spa?source=products',
      customImageUrl: '/api/hero-image?id=3',
    },
    items: [
      {
        id: 'robot-vacuum-x20',
        name: 'Robot Vacuum X20+',
        price: '฿13,990.00',
        originalPrice: '฿17,990.00',
        hasFromPrefix: true,
        imageCrop: {
          sx: 10.0,
          sy: 63.5,
          sWidth: 9.0,
          sHeight: 14.5,
        },
        linkHref: '/blog-spa?source=products',
      },
      {
        id: 'air-purifier-4-pro',
        name: 'Smart Air Purifier 4 Pro',
        price: '฿6,990.00',
        originalPrice: '฿8,490.00',
        imageCrop: {
          sx: 32.0,
          sy: 63.5,
          sWidth: 9.5,
          sHeight: 14.5,
        },
        linkHref: '/blog-spa?source=products',
      },
      {
        id: 'smart-air-fryer',
        name: 'Smart Air Fryer 6.5L',
        price: '฿2,499.00',
        originalPrice: '฿3,290.00',
        imageCrop: {
          sx: 54.8,
          sy: 63.5,
          sWidth: 9.0,
          sHeight: 14.5,
        },
        linkHref: '/blog-spa?source=products',
      },
      {
        id: 'smart-camera-c400',
        name: 'Smart Camera C400 2.5K',
        price: '฿1,290.00',
        originalPrice: '฿1,690.00',
        imageCrop: {
          sx: 76.8,
          sy: 63.5,
          sWidth: 9.0,
          sHeight: 14.5,
        },
        linkHref: '/blog-spa?source=products',
      },
    ],
  },
];
