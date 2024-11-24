import { useEffect, useRef } from "react";
import "./card.css";
import { updateCardInteractive } from "./updateCardInteractive";

type CardProps = {
  imageSrc: string;
  width: number;
}

export const Card2 = ({ imageSrc, width }: CardProps) => {

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.addEventListener("pointermove", (e) => updateCardInteractive({ x: e.clientX, y: e.clientY, cardRef }));
  }, []);

  return (
    <>
      <div className="card_wrapper" ref={cardRef} style={{ width: `${width}px` }}>
        <img
          src={imageSrc}
          className="card"
          alt="card"
        />
        <div className="card color"></div>
        <div className="card highlight"></div>
      </div>
    </>
  );
};
