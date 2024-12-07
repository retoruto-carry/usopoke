import { useEffect, useRef } from "react";
import "./card.css";
import { updateCardInteractive } from "./updateCardInteractive";

type CardProps = {
  width: number;
  children: React.ReactNode;
}

export const Card3 = ({ width, children }: CardProps) => {

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.addEventListener("pointermove", (e) => updateCardInteractive({ x: e.clientX, y: e.clientY, cardRef }));
  }, []);

  return (
    <>
      <div style={{ width: `${width}px`, height: `${width * 1.4}px` }}>
        <div className="card_wrapper" ref={cardRef} style={{ width: `${width}px`, height: `${width * 1.4}px` }}>
          <div className="card">
            {children}
          </div>
          <div className="card color"></div>
          <div className="card highlight"></div>
        </div>
      </div>
    </>
  );
};
