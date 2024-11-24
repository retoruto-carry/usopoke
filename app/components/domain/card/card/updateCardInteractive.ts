import { RefObject } from "react";

export const updateCardInteractive = ({ x, y, cardRef }: { x: number; y: number, cardRef: RefObject<HTMLDivElement> }) => {
  const BOUNDS = cardRef.current?.getBoundingClientRect();
  const pointerX = x - (BOUNDS?.x ?? 0);
  const pointerY = y - (BOUNDS?.y ?? 0);
  const ratioX = pointerX / (BOUNDS?.width ?? 0);
  const ratioY = pointerY / (BOUNDS?.height ?? 0);
  cardRef.current?.style.setProperty("--ratiox", ratioX.toString());
  cardRef.current?.style.setProperty('--ratioy', ratioY.toString())

  const mX = ratioX * 100
  const mY = ratioY * 100
  cardRef.current?.style.setProperty('--mx', `${mX}%`)
  cardRef.current?.style.setProperty('--my', `${mY}%`)

  const rX = (ratioX - 0.5) * -30
  const rY = (ratioY - 0.5) * 50
  cardRef.current?.style.setProperty('--rx', `${rX}deg`)
  cardRef.current?.style.setProperty('--ry', `${rY}deg`)

  const posX = 50 + (ratioX - 0.5) * 28
  const posY = 50 + (ratioY - 0.5) * 28
  cardRef.current?.style.setProperty('--pos', `${posX}% ${posY}%`)
  cardRef.current?.style.setProperty('--posx', `${posX}%`)
  cardRef.current?.style.setProperty('--posy', `${posY}%`)

  const hyp = Math.sqrt(Math.pow(ratioX - 0.5, 2) + Math.pow(ratioY - 0.5, 2)) * 10 / 7;
  cardRef.current?.style.setProperty('--hyp', hyp.toString())
  }