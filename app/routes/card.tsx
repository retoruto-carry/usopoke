import { Card } from "~/components/domain/card/card/Card";

export default function CardIndex() {
  const DEFAULT_IMAGE_SRC = "https://tcg.pokemon.com/assets/img/global/tcg-card-back-2x.jpg"

  return (
    <>
      <Card imageSrc={DEFAULT_IMAGE_SRC} />
    </>
  );
}