import { inflateSync } from "node:zlib";

const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
const crcTable = Uint32Array.from({ length: 256 }, (_, byte) => {
  let crc = byte;
  for (let bit = 0; bit < 8; bit++) {
    crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return crc;
});

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export async function validateCardPng(image: File): Promise<File | null> {
  if (image.type !== "image/png") return null;

  const bytes = new Uint8Array(await image.arrayBuffer());
  if (bytes.length < 57 || pngSignature.some((byte, index) => bytes[index] !== byte)) return null;

  const view = new DataView(bytes.buffer);
  // Canvas produces non-interlaced 8-bit RGB or RGBA PNGs.
  if (view.getUint32(8) !== 13 || bytes[24] !== 8 ||
      (bytes[25] !== 2 && bytes[25] !== 6) || bytes[26] || bytes[27] || bytes[28]) return null;

  const width = view.getUint32(16);
  const height = view.getUint32(20);
  if (!width || !height || width > 4096 || height > 4096 || width * height > 8_000_000) return null;

  const compressed = new Uint8Array(bytes.length);
  let compressedSize = 0;
  let offset = pngSignature.length;
  let chunkCount = 0;
  let sawImageData = false;
  let endedImageData = false;
  let unchangedStart = 0;
  const sanitized: Uint8Array<ArrayBuffer>[] = [];

  while (offset + 12 <= bytes.length) {
    if (++chunkCount > 4096) return null;
    const size = view.getUint32(offset);
    const start = offset + 8;
    const end = start + size;
    if (end + 4 > bytes.length) return null;

    const type = String.fromCharCode(...bytes.subarray(offset + 4, start));
    let keepChunk = true;
    if (offset === pngSignature.length) {
      if (type !== "IHDR") return null;
    } else if (type === "IDAT") {
      if (endedImageData) return null;
      sawImageData = true;
      compressed.set(bytes.subarray(start, end), compressedSize);
      compressedSize += size;
    } else if (type === "IEND") {
      if (size !== 0 || end + 4 !== bytes.length || compressedSize === 0) return null;
    } else {
      if (!/^[a-z][A-Za-z][A-Z][A-Za-z]$/.test(type)) return null;
      if (sawImageData) endedImageData = true;
      // Canvas may include color profiles or Exif. Strip ancillary chunks so
      // image decoders receive only the validated header and pixel data.
      keepChunk = false;
    }

    if (crc32(bytes.subarray(offset + 4, end)) !== view.getUint32(end)) return null;
    if (!keepChunk) {
      if (unchangedStart < offset) sanitized.push(bytes.subarray(unchangedStart, offset));
      unchangedStart = end + 4;
    }
    offset = end + 4;

    if (type === "IEND") {
      const rowSize = width * (bytes[25] === 6 ? 4 : 3) + 1;
      if (!validScanlines(compressed.subarray(0, compressedSize), rowSize, height)) return null;
      if (unchangedStart === 0) return image;
      sanitized.push(bytes.subarray(unchangedStart));
      return new File(sanitized, image.name, { type: "image/png" });
    }
  }

  return null;
}

function validScanlines(
  compressed: Uint8Array<ArrayBuffer>,
  rowSize: number,
  height: number,
): boolean {
  const expectedSize = rowSize * height;

  try {
    // The Node 22 declarations omit the documented result shape for info: true.
    const result: unknown = inflateSync(compressed, { maxOutputLength: expectedSize, info: true });
    if (typeof result !== "object" || result === null || !("buffer" in result) || !("engine" in result)) return false;
    const { buffer, engine } = result;
    if (!(buffer instanceof Uint8Array) || buffer.length !== expectedSize) return false;
    if (typeof engine !== "object" || engine === null ||
        !("bytesWritten" in engine) || engine.bytesWritten !== compressed.length) return false;

    for (let row = 0; row < height; row++) {
      if (buffer[row * rowSize] > 4) return false;
    }
    return true;
  } catch {
    return false;
  }
}
