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



## 開発・運用

React Router 8（Framework Mode）を Cloudflare Workers 上で実行します。カード情報は D1、画像は非公開の R2 バケットに保存します。ログインは不要です。

Node.js 22.22 以降を利用してください。

```sh
npm ci
npm run typegen
npx wrangler d1 migrations apply DB --local
npm run dev
```

ローカルの D1・R2 は `.wrangler/state` に保存され、本番データとは分離されます。空のDBでは、カード作成時に「ランダムパックに投稿する」を選択すると抽選を試せます。

```sh
npm test
npm run lint
npm run typecheck
npm run build
npm run start
```

本番への反映は `npm run deploy` です。DBスキーマ変更がある場合は、互換性を確認したうえで先に `npx wrangler d1 migrations apply DB --remote` を実行します。`wrangler.toml` がバインディングとルーティングの管理元です。

### データの扱い

- ランダムパックへの投稿は初期状態ではオフです。
- ランダム対象カードは保持します。対象外カードは作成から14日でページ・画像・OGPを取得できなくなります。
- 日次Cron（03:00 JST）が期限切れカードと画像を最大100件ずつ削除します。途中失敗後も再実行できます。期限判定はアクセス時にも行います。
- 画像・OGPのキャッシュは公開カードで最大1年、対象外カードで保存期限までです。再取得・304応答でも期限を延長しません。
- DBはパラメータ付きクエリ、抽選は連続スロットのインデックス参照です。ギャラリーカードを管理操作で削除する場合は、スロットの連続性を維持する必要があります。
- 投稿はIPごとに5回/分、動的な読み取り・画像キャッシュ未命中は120回/分、OGPキャッシュ未命中は20回/分です。Workersのレート制限は拠点単位の近似値であり、全世界共通の課金上限ではありません。

移行の検証記録・バックアップ・切り戻し方針は [Cloudflare移行記録](docs/cloudflare-migration.md) を参照してください。
