import { Card2 } from "~/components/domain/card/card2/Card";

export default function CardIndex() {
  const DEFAULT_IMAGE_SRC = "https://tcg.pokemon.com/assets/img/global/tcg-card-back-2x.jpg"

  return (
    <>
      <Card2 imageSrc={DEFAULT_IMAGE_SRC} width={400} />
    </>
  );
}