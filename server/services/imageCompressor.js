// server/services/imageCompressor.js
import sharp from "sharp";

/**
 * Nén ảnh panorama xuống dưới ngưỡng byte nhất định (mặc định: 10MB)
 * - Chuyển sang JPEG progressive, quality giảm dần
 * - Resize nếu cần (giữ tỉ lệ)
 * - Giữ lại EXIF orientation
 */
export async function compressToUnder(buffer, maxBytes = 10 * 1024 * 1024) {
  try {
    // Use failOnError=false so slightly corrupt JPEGs don't crash processing
    let pipeline = sharp(buffer, { failOnError: false }).rotate();
    let meta = await pipeline.metadata();

    // Resize nếu quá lớn (8K đủ cho panorama)
    if (meta.width && meta.width > 8000) {
      pipeline = pipeline.resize({ width: 8000 });
    }

    // Giảm chất lượng dần cho đến khi < maxBytes
    let quality = 85;
    let width = meta.width || 8000;

    for (let i = 0; i < 8; i++) {
      const out = await pipeline
        .jpeg({ quality, mozjpeg: true, progressive: true })
        .toBuffer();

      if (out.length <= maxBytes) return out;

      // Giảm chất lượng, sau 3 lần thì giảm kích thước
      if (i < 3) {
        quality = Math.max(50, quality - 10);
      } else {
        width = Math.floor(width * 0.85);
        pipeline = sharp(buffer, { failOnError: false })
          .rotate()
          .resize({ width });
        quality = Math.max(50, quality - 5);
      }
    }

    // Nếu vẫn lớn hơn, trả về bản cuối cùng (đã giảm mạnh)
    return await sharp(buffer, { failOnError: false })
      .rotate()
      .resize({ width })
      .jpeg({ quality, mozjpeg: true, progressive: true })
      .toBuffer();
  } catch (err) {
    // Fallback: return original buffer so caller can continue / handle
    console.warn("compressToUnder fallback (returning original)", err?.message);
    return buffer;
  }
}
