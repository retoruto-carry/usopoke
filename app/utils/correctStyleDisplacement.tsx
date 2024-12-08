// html2canvasで画像化の際に文字が下にずれるのを防止 （多分tailwindのせいでズレてる）
// 参考: https://github.com/niklasvh/html2canvas/issues/2775#issuecomment-1316356991
export const correctStyleDisplacement = () => {
  const style = document.createElement('style')
  document.head.appendChild(style)

  style.sheet?.insertRule('body > div:last-child img { display: inline-block; }')

  return () => {
    style.remove() // 追加したスタイルを消す関数を返す
  }
}
