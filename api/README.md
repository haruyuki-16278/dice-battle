# dice-battle-api

AWS API Gateway を利用した API です。  
<https://github.com/denoland/deno-lambda> を利用して、lambda 関数を Deno/TypeScript で実装しています。

## 設計

API は以下のように用意します

- room
  - GET: マッチ待機中のルーム一覧を取得
  - POST: ルームを作成する
  - PUT: ルームに参加する
  - DELETE: ルームを削除する
- room?roomId=:roomId
  - GET: ホスト中のルームの状態を取得
- game
  - PUT: ルームのゲーム状態の更新を投稿する
