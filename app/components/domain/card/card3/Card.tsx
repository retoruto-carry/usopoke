import { useEffect, useRef } from "react";
import { useSpring, animated, SpringValue, Interpolation } from "@react-spring/web";
import "./card.css";
import { updateCardInteractive } from "./updateCardInteractive";

type CardProps = {
  width: number;
  children: React.ReactNode;
}

// CSSプロパティの型定義を修正
type CustomCSSProperties = Omit<React.CSSProperties, 'transform'> & {
  transform: Interpolation<number, string>;
  '--ratiox': SpringValue<number>;
  '--ratioy': SpringValue<number>;
  '--mx': SpringValue<number> | Interpolation<number, string>;
  '--my': SpringValue<number> | Interpolation<number, string>;
  '--posx': SpringValue<number> | Interpolation<number, string>;
  '--posy': SpringValue<number> | Interpolation<number, string>;
  '--hyp': SpringValue<number>;
}

/**
 * ホログラムエフェクト付きカードコンポーネント
 * @param width カードの幅
 * @param children カードのコンテンツ
 */
export const Card3 = ({ width, children }: CardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isHovered = useRef(false);

  // アニメーションの初期態を設定
  const [springs, api] = useSpring(() => ({
    rotateX: 0,
    rotateY: 0,
    translateX: 0,
    translateY: 0,
    ratioX: 0.5,
    ratioY: 0.5,
    mx: 50,
    my: 50,
    posX: 50,
    posY: 50,
    hyp: 0,
    config: {
      mass: 1,
      tension: 170,
      friction: 20,
      clamp: false,
    }
  }));

  useEffect(() => {
    // マウス/タッチ移動時のハンドラー
    const handleMove = (e: TouchEvent | MouseEvent) => {
      if (!isHovered.current) return;

      const values = updateCardInteractive({
        x: 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX,
        y: 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY,
        cardRef
      });

      if (values) {
        // エフェクトの値を更新
        api.start({
          rotateX: values.rX,
          rotateY: values.rY,
          translateX: values.translateX,
          translateY: values.translateY,
          ratioX: values.ratioX,
          ratioY: values.ratioY,
          mx: values.mX,
          my: values.mY,
          posX: values.posX,
          posY: values.posY,
          hyp: values.hyp,
          config: {
            mass: 1,
            tension: 170,
            friction: 20,
          },
          immediate: false,
        });
      }
    };

    const handleEnter = () => {
      isHovered.current = true;
    };

    const handleLeave = () => {
      isHovered.current = false;
      api.start({
        rotateX: 0,
        rotateY: 0,
        translateX: 0,
        translateY: 0,
        ratioX: 0.5,
        ratioY: 0.5,
        mx: 50,
        my: 50,
        posX: 50,
        posY: 50,
        hyp: 0,
        config: {
          mass: 5,
          tension: 35,
          friction: 60,
          clamp: false,
        },
        immediate: false,
      });
    };

    const element = cardRef.current;
    if (element) {
      element.addEventListener("mouseenter", handleEnter);
      element.addEventListener("mousemove", handleMove);
      element.addEventListener("mouseleave", handleLeave);
      element.addEventListener("touchstart", handleEnter);
      element.addEventListener("touchmove", handleMove);
      element.addEventListener("touchend", handleLeave);
    }

    return () => {
      if (element) {
        element.removeEventListener("mouseenter", handleEnter);
        element.removeEventListener("mousemove", handleMove);
        element.removeEventListener("mouseleave", handleLeave);
        element.removeEventListener("touchstart", handleEnter);
        element.removeEventListener("touchmove", handleMove);
        element.removeEventListener("touchend", handleLeave);
      }
    };
  }, [api]);

  return (
    <div style={{ width: `${width}px`, height: `${width * 1.4}px` }}>
      <animated.div
        className="card_wrapper"
        ref={cardRef}
        style={{
          width: `${width}px`,
          height: `${width * 1.4}px`,
          transform: springs.rotateX.to(
            (rx, ry, tx, ty) => `perspective(500px) rotateX(${rx}deg) rotateY(${ry}deg) translateX(${tx}px) translateY(${ty}px)`
          ),
          '--ratiox': springs.ratioX,
          '--ratioy': springs.ratioY,
          '--mx': springs.mx.to(v => `${v}%`),
          '--my': springs.my.to(v => `${v}%`),
          '--posx': springs.posX.to(v => `${v}%`),
          '--posy': springs.posY.to(v => `${v}%`),
          '--hyp': springs.hyp,
        } as CustomCSSProperties}
      >
        <div className="card">{children}</div>
        <div className="card color"></div>
        <div className="card highlight"></div>
      </animated.div>
    </div>
  );
};
