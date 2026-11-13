import type { ImageStore } from "./imageStore";

const imagePathPrefix = "/card-images/";

export function isCardImageKey(key: string): boolean {
  return /^public\/[a-zA-Z0-9_-]+(?:\.png)?$/.test(key);
}

export function cardImagePath(key: string): string {
  return imagePathPrefix + encodeURIComponent(key);
}

export function cardImageKeyFromPath(pathname: string): string | null {
  if (!pathname.startsWith(imagePathPrefix)) return null;

  try {
    const key = decodeURIComponent(pathname.slice(imagePathPrefix.length));
    return isCardImageKey(key) ? key : null;
  } catch {
    return null;
  }
}

export function createR2ImageStore(bucket: R2Bucket): ImageStore {
  return {
    async uploadCardImage(image) {
      const key = `public/${crypto.randomUUID()}.png`;
      const object = await bucket.put(key, image, {
        onlyIf: new Headers({ "If-None-Match": "*" }),
        httpMetadata: { contentType: "image/png" },
      });

      if (!object) throw new Error("画像のアップロードに失敗しました");

      return cardImagePath(key);
    },
  };
}
