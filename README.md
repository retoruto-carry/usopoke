# うそポケ画像メーカー

[サイトURL](https://usopoke.asonde.me/)

Qiitaの解説記事
[【個人開発】嘘のポケポケのカードを作れるサービスを作った【コード全公開】 \#cloudflare \- Qiita](https://qiita.com/retoruto_carry/items/66725ea6fdd899d8f210)

リリースツイート
https://x.com/retoruto_carry/status/1796123557090517067

# これは何？

## 使い方

画像を選んで...

![usopoke_2_2 (1).gif](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/156690/308e847e-ae2d-835a-4c55-9bf3193e1d7c.gif)


テキストを自由に入力！

![usopoke_2_25.gif](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/156690/3170e331-13a3-e326-ee44-f353d16845b7.gif)


完成！

画像をDLしたり、シェアしよう！

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/156690/5e7a6f1b-3396-609e-c634-3374709ea800.png)


![image](https://github.com/user-attachments/assets/be2c9739-ea7c-482f-8700-728bbf412551)


## ランダムパック

「みんなが作ったカード」をパックとしてランダムに引くことができます!!

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/156690/41e7440b-424f-5cee-3cd1-562c6594996b.png)


![usopoke_random.gif](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/156690/099448ca-6f51-189a-43d7-ffa3b4c51cd5.gif)

いろんな人がいろんなカードを作っていて面白いです！

↓カードを作ったり、パックを引いて遊んでみてください！！

[うそポケ画像メーカー](https://usopoke.asonde.me/)



# Welcome to Remix + Cloudflare!

- 📖 [Remix docs](https://remix.run/docs)
- 📖 [Remix Cloudflare docs](https://remix.run/guides/vite#cloudflare)

# 事前準備
```
# supabase cli をインストール
brew install supabase/tap/supabase
supabase login
```

## Development

Run the dev server:

```sh
npm run dev
```

To run Wrangler:

```sh
npm run build
npm run start
```

## Typegen

Generate types for your Cloudflare bindings in `wrangler.toml`:

```sh
npm run typegen
```

You will need to rerun typegen whenever you make changes to `wrangler.toml`.

## Deployment

First, build your app for production:

```sh
npm run build
```

Then, deploy your app to Cloudflare Pages:

```sh
npm run deploy
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever css framework you prefer. See the [Vite docs on css](https://vitejs.dev/guide/features.html#css) for more information.
