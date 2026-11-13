import { validateCardPng } from "./cardPng.server";
import type { CreateCardData } from '../types/card';

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const MAX_BODY_BYTES = MAX_UPLOAD_BYTES + 64 * 1024;

export class CardInputError extends Error {
  public status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}

// Read with a hard cap even when Content-Length is absent or dishonest.
async function boundedFormData(request: Request): Promise<FormData> {
  const length = Number(request.headers.get('content-length'));
  if (Number.isFinite(length) && length > MAX_BODY_BYTES) throw new CardInputError('画像のサイズが大きすぎます。', 413);
  if (!request.headers.get('content-type')?.startsWith('multipart/form-data;')) throw new CardInputError('フォームの形式が不正です。', 415);
  const reader = request.body?.getReader();
  if (!reader) throw new CardInputError('フォームが空です。');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (size > MAX_BODY_BYTES) { await reader.cancel(); throw new CardInputError('画像のサイズが大きすぎます。', 413); }
      chunks.push(next.value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return await new Response(bytes, { headers: { 'content-type': request.headers.get('content-type')! } }).formData(); }
  catch { throw new CardInputError('フォームの形式が不正です。'); }
}

export async function parseCardSubmission(request: Request): Promise<{data: CreateCardData; image: File}> {
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) throw new CardInputError('このサイトから送信してください。', 403);
  const form = await boundedFormData(request);
  const text = (key: string, max: number) => {
    const values = form.getAll(key);
    if (values.length !== 1 || typeof values[0] !== 'string' || values[0].length > max) throw new CardInputError('入力内容を確認してください。');
    return values[0];
  };
  const image = form.get('image');
  if (!(image instanceof File) || form.getAll('image').length !== 1 || image.size < 57 || image.size > MAX_UPLOAD_BYTES) throw new CardInputError('PNG画像を選択してください。', image instanceof File && image.size > MAX_UPLOAD_BYTES ? 413 : 400);
  const validImage = await validateCardPng(image);
  if (!validImage) throw new CardInputError('PNG画像の形式が不正です。');
  const gallery = text('show_in_gallery', 5);
  if (gallery !== 'true' && gallery !== 'false') throw new CardInputError('公開設定が不正です。');
  const twitter = text('twitter_username', 100).trim().replace(/^@/, '');
  if (twitter && !/^[A-Za-z0-9_]{1,15}$/.test(twitter)) throw new CardInputError('Xのユーザー名を確認してください。');
  return { image: validImage, data: {
    name: text('name', 200), hp: text('hp', 30),
    move1_name: text('move1_name', 200), move1_damage: text('move1_damage', 30), move1_info: text('move1_info', 4000),
    move2_name: text('move2_name', 200), move2_damage: text('move2_damage', 30), move2_info: text('move2_info', 4000),
    show_in_gallery: gallery === 'true', twitter_username: twitter || null,
  }};
}
