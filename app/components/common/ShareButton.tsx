const isIos = () => /iPhone|iPad|iPod/i.test(navigator.userAgent);
const isAndroid = () => /Android/i.test(navigator.userAgent);
const isMobile = () => isIos() || isAndroid();

/**
 * 画像付きのWebShare APIの利用可否を判定する関数
 * @returns {Promise<boolean>} - 画像付きのWebShare APIが利用可能かどうか
 */
const isWebShareApiWithFilesAvailable = async () => {
  if (!navigator.share) return false;
  try {
    const file = new File([], 'dummy.png', { type: 'image/png' });
    return navigator.canShare && navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
};

export const ShareButton = ({ imageUrl, text }: { imageUrl?: string, text: string }) => {
  const handleShare = async () => {
    // iOSまたはAndroidの環境で、画像付きのWebShare APIが使える場合
    if (isMobile() && imageUrl && await isWebShareApiWithFilesAvailable()) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'share.png', { type: 'image/png' });

        await navigator.share({
          text: text,
          files: [file],
        });
        return
      } catch {
        // Web Share API での共有が失敗した場合は、intentリンクにフォールバック
      }
    }

    // PCの場合はintentリンクを使ってTwitterで共有
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  };

  return (
    <button
      onClick={handleShare}
      className="w-full bg-black text-white hover:bg-gray-800 py-2 rounded-md flex items-center justify-center gap-2 font-bold"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
      <span className="text-lg">シェアする</span>
    </button>
  );
};
