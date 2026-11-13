import { useCallback, useEffect, useState } from "react";
import "./resultCardImage.css";

export function ResultCardImage({ src, width, onReady }: { src: string; width: number; onReady?: () => void }) {
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    if (status === "ready") onReady?.();
  }, [status, onReady]);

  const reveal = useCallback((image: HTMLImageElement) => {
    void image.decode().then(
      () => setStatus("ready"),
      () => setStatus(image.naturalWidth > 0 ? "ready" : "failed"),
    );
  }, []);

  const handleImageRef = useCallback((image: HTMLImageElement | null) => {
    // A cached image can finish loading before React attaches its load handler.
    if (image?.complete) {
      if (image.naturalWidth) reveal(image);
      else setStatus("failed");
    }
  }, [reveal]);

  return (
    <div className="result-card-image" data-state={status}>
      <img
        className="result-card-image__back"
        src="/images/back_of_card.png"
        alt=""
        width={width}
        height={width * 1.4}
      />
      <img
        className="result-card-image__front"
        src={src}
        alt="カード"
        width={width}
        height={width * 1.4}
        ref={handleImageRef}
        onLoad={(event) => reveal(event.currentTarget)}
        onError={() => setStatus("failed")}
      />
      {status === "failed" && (
        <span className="result-card-image__error" role="status">
          カード画像を読み込めませんでした
        </span>
      )}
    </div>
  );
}
