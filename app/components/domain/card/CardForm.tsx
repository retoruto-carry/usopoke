import { Form, Link, useParams } from "@remix-run/react";
import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { CardContent } from "~/components/domain/card_content/CardContent";
import { Input } from "~/components/common/Input";
import { Button } from "~/components/common/Button";
import { Checkbox } from "~/components/common/Checkbox";
import html2canvas from "html2canvas";
import { correctStyleDisplacement } from "~/utils/correctStyleDisplacement";
import { Card3 } from "./card3/Card";

const DEFAULT_IMAGE_SRC = "https://tcg.pokemon.com/assets/img/global/tcg-card-back-2x.jpg"
const CARD_WIDTH = 360;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

type FormInputs = {
  hp: string;
  name: string;
  move1: {
    name: string;
    damage: string;
    info: string;
  };
  move2: {
    name: string;
    damage: string;
    info: string;
  };
  showInGallery: boolean;
  agreeToTerms: boolean;
  image: File | null;
};

type Props = {
  onSubmit: (formData: FormData) => void;
};

export function CardForm({ onSubmit }: Props) {
  const params = useParams();
  const [preview, setPreview] = useState(DEFAULT_IMAGE_SRC);
  const [showMove2, setShowMove2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, watch, setValue, reset } = useForm<FormInputs>({
    mode: 'onChange',
    defaultValues: {
      hp: "",
      name: "",
      move1: { name: "", damage: "", info: "" },
      move2: { name: "", damage: "", info: "" },
      showInGallery: true,
      agreeToTerms: false,
      image: null,
    },
  });

  useEffect(() => {
    reset();
    setPreview(DEFAULT_IMAGE_SRC);
    setShowMove2(false);
  }, [params.id, reset]);

  const formValues = watch();

  const isFormValid = formValues.showInGallery ? formValues.agreeToTerms : true;

  const moves = [
    { name: formValues.move1.name, damage: formValues.move1.damage, info: formValues.move1.info },
    { name: formValues.move2.name, damage: formValues.move2.damage, info: formValues.move2.info }
  ];

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
  const captureRef = useRef<HTMLDivElement>(null);

  const generateCardImage = async (captureRef: React.RefObject<HTMLDivElement>): Promise<File> => {
    const removeStyle = correctStyleDisplacement();

    if (!captureRef.current) throw new Error("captureRef.current is null");

    const canvas = await html2canvas(captureRef.current, {
      useCORS: true,
      removeContainer: true,
      x: 0,
      y: 0,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      scrollX: 0,
      scrollY: 0,
      scale: 1,
    })

    removeStyle();

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to generate image blob'));
          return;
        }

        const fileName = `card-${Date.now()}.png`;
        const file = new File([blob], fileName, {
          type: 'image/png',
          lastModified: Date.now(),
        });
        resolve(file);
      }, 'image/png', 1.0);
    });
  };

  const createFormData = (imageFile: File, formValues: FormInputs): FormData => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('name', formValues.name);
    formData.append('hp', formValues.hp);
    formData.append('move1_name', formValues.move1.name);
    formData.append('move1_damage', formValues.move1.damage);
    formData.append('move1_info', formValues.move1.info);
    formData.append('move2_name', formValues.move2.name);
    formData.append('move2_damage', formValues.move2.damage);
    formData.append('move2_info', formValues.move2.info);
    formData.append('show_in_gallery', String(!!formValues.showInGallery));
    return formData;
  };

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const imageFile = await generateCardImage(captureRef);
      console.log('生成されたファイル:', {
        size: imageFile.size,
        type: imageFile.type,
        name: imageFile.name
      });

      const formData = createFormData(imageFile, formValues);
      onSubmit(formData);
    } catch (error) {
      console.error('カード画像の生成に失敗しました:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="fixed bottom-0 left-0 -translate-x-full bg-whte" ref={captureRef}>
        <div className="screen-shot" style={{ width: `${CARD_WIDTH}px`, height: `${CARD_HEIGHT}px` }}>
          <CardContent
            imageSrc={preview}
            hp={formValues.hp}
            name={formValues.name}
            moves={moves}
          />
        </div>
      </div>
      <div className="flex justify-center items-center mb-5">
        <div className="screen-shot" style={{ width: `${CARD_WIDTH}px`, height: `${CARD_HEIGHT}px` }}>
          <Card3 width={CARD_WIDTH}>
            <CardContent
              imageSrc={preview}
              hp={formValues.hp}
              name={formValues.name}
              moves={moves}
            />
          </Card3>
        </div>
      </div>
      <Form className="space-y-4 mt-8 bg-white p-4 " onSubmit={onSubmitHandler}>
        <div className="flex flex-row gap-3 items-center">
          <h3 className="flex-shrink-0 font-medium">画像</h3>
          <Input type="file" {...register("image", { onChange: handleImageChange })} required accept="image/png, image/jpeg, image/jpg" className="flex-1" />
        </div>

        <div className="flex flex-col gap-5 max-w-md">
          <div className="flex items-center gap-2">
            <Input type="text" {...register("name")} placeholder="名前" required className="flex-1" />
            <Input type="text" {...register("hp")} placeholder="HP" required className="w-24" />
          </div>

          <div className="space-y-2 p-2 border border-gray-200 ">
            <div className="flex items-center gap-2">
              <Input type="text" {...register("move1.name")} placeholder="わざの名前" required className="flex-1" />
              <Input type="text" {...register("move1.damage")} placeholder="ダメージ" required className="w-24" />
            </div>
            <Input type="text" {...register("move1.info")} placeholder="説明" required />
          </div>

          {!showMove2 && (
            <Button
              onClick={() => setShowMove2(true)}
              variant="outline"
            >
              ＋ わざを追加
            </Button>
          )}

          {showMove2 && (
            <div className="space-y-2 relative">
              <div className="space-y-2 p-2 border border-gray-200 rounded-md">
                <div className="flex items-center gap-2 relative">
                  <Input type="text" {...register("move2.name")} placeholder="わざの名前" required className="flex-1" />
                  <Input type="text" {...register("move2.damage")} placeholder="ダメージ" className="w-24" />
                </div>
                <Input type="text" {...register("move2.info")} placeholder="説明" />
                <div className="absolute -top-5 -right-4">
                  <Button
                    size={"sm"}
                    variant="outline"
                    className="bg-white h-7 w-7"
                    onClick={() => {
                      setShowMove2(false);
                      // わざ2のフィールドをリセット
                      setValue("move2", { name: "", damage: "", info: "" });
                    }}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showInGallery"
              onCheckedChange={(value) => setValue("showInGallery", !!value)}
              checked={formValues.showInGallery}
              {...register("showInGallery")}
            />
            <label htmlFor="showInGallery" className="text-md text-gray-700 cursor-pointer">「みんなが作ったカード」に出現させる</label>
          </div>

          <div className="ml-6">
            {formValues.showInGallery && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  onCheckedChange={(value) => setValue("agreeToTerms", !!value)}
                  checked={formValues.agreeToTerms}
                  {...register("agreeToTerms")}
                />
                <label htmlFor="agreeToTerms" className="text-md text-gray-700 cursor-pointer"><Link to="/terms" className="border-b border-gray-500 border-dotted" target="_blank">利用規約</Link>を守って投稿する</label>
              </div>
            )}
          </div>
        </div>

        <Button
          variant="default"
          size="lg"
          className="w-full"
          disabled={!isFormValid || isLoading}
          type="submit"
        >
          {isLoading ? "作成中..." : "完成"}
        </Button>
      </Form >
    </div >
  );
}
