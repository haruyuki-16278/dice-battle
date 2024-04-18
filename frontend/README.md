# dice-battle

Babylon.js で作成したサイコロを使ったゲームです。

## 動作環境

デバイスの動きを取得する API を利用します。
スマートフォンのようなモバイルデバイスで使用してください。

## 開発

pnpm を利用しています。

### Pages

GitHub Actions を利用して GitHub Pages にデプロイしています。
[pages](https://haruyuki-16278.github.io/dice-battle/)

### 開発サーバーの起動

https で開発サーバーを起動するため、`localhost.pen` 及び `localhost-key,pem` が必要です。
以下のコマンドで作成してください。

```sh
mkcert -install
mkcert localhost
```

```sh
pnpm dev
```

上記コマンドを実行すると `localhost:5173` からアクセス可能になります。
