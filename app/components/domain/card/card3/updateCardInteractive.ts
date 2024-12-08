import { RefObject } from "react";

/**
 * カードのインタラクティブな動作を計算する関数
 * @param x マウスまたはタッチのX座標
 * @param y マウスまたはタッチのY座標
 * @param cardRef カード要素のRef
 * @returns 計算された各種エフェクトの値
 */
export const updateCardInteractive = ({ 
  x, 
  y, 
  cardRef 
}: { 
  x: number; 
  y: number;
  cardRef: RefObject<HTMLDivElement>;
}) => {
  const BOUNDS = cardRef.current?.getBoundingClientRect();
  if (!BOUNDS) return null;

  // カード内でのポインターの相対位置を計算
  const pointerX = x - BOUNDS.x;
  const pointerY = y - BOUNDS.y;
  
  // 0-1の範囲での相対位置を計算
  const ratioX = pointerX / BOUNDS.width;
  const ratioY = pointerY / BOUNDS.height;

  // ハイライトエフェクトの位置（パーセント）
  const mX = ratioX * 100;
  const mY = ratioY * 100;

  // 3D回転の角度を計算（中心からの距離に基づく）
  const rX = (ratioY - 0.5) * 120;  // X軸回転（上下の傾き）をさらに大きく
  const rY = (ratioX - 0.5) * 100;  // Y軸回転（左右の傾き）も大きく
  
  // 移動量（現在は使用していない）
  const translateX = 0;
  const translateY = 0;

  // ホログラムエフェクトの位置
  const posX = 50 + (ratioX - 0.5) * 28;
  const posY = 50 + (ratioY - 0.5) * 28;

  // カーソルと中心点との距離（輝度計算に使用）
  const hyp = Math.sqrt(Math.pow(ratioX - 0.5, 2) + Math.pow(ratioY - 0.5, 2)) * 10 / 7;

  return {
    rX, rY,
    translateX, translateY,
    ratioX, ratioY,
    mX, mY,
    posX, posY,
    hyp,
  };
};