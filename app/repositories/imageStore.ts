export interface ImageStore {
  uploadCardImage(image: File): Promise<string>;
}
