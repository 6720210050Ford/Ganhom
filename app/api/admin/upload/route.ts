import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Supported mime types for images
const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'image/gif': '.gif',
  'image/avif': '.avif',
};

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'ไม่พบไฟล์รูปภาพที่อัปโหลด' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'ขนาดไฟล์เกินขีดจำกัด (สูงสุดไม่เกิน 15MB)' },
        { status: 400 }
      );
    }

    const mimeType = file.type.toLowerCase();
    let ext = ALLOWED_MIME_TYPES[mimeType];

    // Fallback extension detection from original file name
    if (!ext && file.name) {
      const match = file.name.match(/\.(png|jpe?g|webp|svg|gif|avif)$/i);
      if (match) {
        ext = `.${match[1].toLowerCase()}`;
        if (ext === '.jpeg') ext = '.jpg';
      }
    }

    if (!ext) {
      return NextResponse.json(
        {
          error:
            'รูปแบบไฟล์ไม่ถูกต้อง รองรับเฉพาะไฟล์รูปภาพนามสกุล: .png, .jpg, .jpeg, .webp, .svg, .gif, .avif',
        },
        { status: 400 }
      );
    }

    // Ensure uploads directory exists in public folder
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate clean safe filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const sanitizedBase = file.name
      ? path
          .basename(file.name, path.extname(file.name))
          .replace(/[^a-zA-Z0-9_-]/g, '')
          .substring(0, 20)
      : 'slide';
    const filename = `slide_${timestamp}_${sanitizedBase || randomStr}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    // Write file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      ok: true,
      url: publicUrl,
      filename,
      size: file.size,
      mimeType,
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json(
      { error: err?.message || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fileParam = searchParams.get('url') || searchParams.get('file') || searchParams.get('filename') || '';
    const cleanFilename = path.basename(fileParam);

    if (!cleanFilename) {
      return NextResponse.json({ error: 'Missing file parameter' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'public', 'uploads', cleanFilename);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const buf = fs.readFileSync(filePath);
    let width = 0;
    let height = 0;

    // Check PNG signature: 0x89 'P' 'N' 'G'
    if (buf.length >= 24 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
      width = buf.readUInt32BE(16);
      height = buf.readUInt32BE(20);
    }
    // Check WebP
    else if (buf.length >= 30 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
      const type = buf.toString('ascii', 12, 16);
      if (type === 'VP8X' && buf.length >= 30) {
        width = 1 + buf.readUIntLE(24, 3);
        height = 1 + buf.readUIntLE(27, 3);
      } else if (type === 'VP8 ' && buf.length >= 30) {
        width = buf.readUInt16LE(26) & 0x3fff;
        height = buf.readUInt16LE(28) & 0x3fff;
      }
    }
    // Check JPEG SOF0/SOF2 marker
    else if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
      let offset = 2;
      while (offset < buf.length) {
        if (buf[offset] !== 0xff) break;
        const marker = buf[offset + 1];
        const length = buf.readUInt16BE(offset + 2);
        if (marker === 0xc0 || marker === 0xc2) {
          height = buf.readUInt16BE(offset + 5);
          width = buf.readUInt16BE(offset + 7);
          break;
        }
        offset += 2 + length;
      }
    }

    return NextResponse.json({
      filename: cleanFilename,
      width,
      height,
      aspectRatio: height > 0 ? Number((width / height).toFixed(3)) : 0,
      sizeBytes: buf.length,
      sizeKB: Number((buf.length / 1024).toFixed(1)),
      sizeMB: Number((buf.length / (1024 * 1024)).toFixed(2)),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error inspecting image' }, { status: 500 });
  }
}
