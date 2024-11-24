import { Form } from "@remix-run/react";
import { useState } from "react";
import { Card } from "../card/Card";
export const UploadCardImage = () => {
  const DEFAULT_IMAGE_SRC = "https://tcg.pokemon.com/assets/img/global/tcg-card-back-2x.jpg"
  const [preview, setPreview] = useState(DEFAULT_IMAGE_SRC);

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
      {preview && <Card imageSrc={preview} />}
      <button type="submit">アップロード</button>
    </Form>
  )
}