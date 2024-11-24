import { Form } from "@remix-run/react";
import { useState } from "react";
import { Input } from "~/components/common/input";
import { Card3 } from "~/components/domain/card/card3/Card";
import { CardContent } from "~/components/domain/card_content/CardContent";


export default function Editor() {
  const DEFAULT_IMAGE_SRC = "https://tcg.pokemon.com/assets/img/global/tcg-card-back-2x.jpg"
  const [preview, setPreview] = useState(DEFAULT_IMAGE_SRC);
  const [name, setName] = useState("");
  const [hp, setHp] = useState("");
  const [moves, setMoves] = useState([{ name: "", damage: "", info: "" }, { name: "", damage: "", info: "" }]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form method="post" encType="multipart/form-data">
      <input type="file" name="image" onChange={handleImageChange} />
      <div className="flex flex-col gap-2 max-w-md">
        <Input type="text" name="hp" placeholder="HP" onChange={e => setHp(e.target.value)} value={hp} />
        <Input type="text" name="name" placeholder="名前" onChange={e => setName(e.target.value)} value={name} />
        <Input type="text" name="move1-name" placeholder="わざ1" onChange={e => setMoves(prev => [{ ...prev[0], name: e.target.value }, prev[1]])} value={moves[0].name} />
        <Input type="text" name="move1-damage" placeholder="ダメージ" onChange={e => setMoves(prev => [{ ...prev[0], damage: e.target.value }, prev[1]])} value={moves[0].damage} />
        <Input type="text" name="move1-info" placeholder="説明" onChange={e => setMoves(prev => [{ ...prev[0], info: e.target.value }, prev[1]])} value={moves[0].info} />
        <Input type="text" name="move2-name" placeholder="わざ2" onChange={e => setMoves(prev => [prev[0], { ...prev[1], name: e.target.value }])} value={moves[1].name} />
        <Input type="text" name="move2-damage" placeholder="ダメージ" onChange={e => setMoves(prev => [prev[0], { ...prev[1], damage: e.target.value }])} value={moves[1].damage} />
        <Input type="text" name="move2-info" placeholder="説明" onChange={e => setMoves(prev => [prev[0], { ...prev[1], info: e.target.value }])} value={moves[1].info} />
      </div>

      <div className="flex justify-center">
        <Card3 width={400}>
          <CardContent imageSrc={preview} hp={hp} name={name} moves={moves} />
        </Card3>
      </div>

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md mt-10">アップロード</button>

    </Form>
  )
}