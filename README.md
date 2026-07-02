# School-Festival-2

客側モバイルオーダーのフロントエンドです。ユーザーはこのアプリを通じて、商品選択、予約時刻の指定、Square によるクレジットカード決済、注文内容と番号札の確認を行います。

バックエンドと店舗側フロントエンドは別リポジトリで管理されています。

## できること

- 商品とドリンクの選択
- 予約時刻の選択
- Square を使ったクレジットカード決済
- 注文結果と番号札の表示
- 売り切れ状態の反映

## 開発環境

- Node.js 18 以上を推奨
- npm
- Git

## セットアップ

```bash
npm ci
npm start
```

本番ビルドは以下です。

```bash
npm run build
```

テストは以下です。

```bash
npm test
```

## 環境変数

このアプリは Create React App の仕組みで、`REACT_APP_` で始まる環境変数を利用します。

### `.env.local`

ローカル開発用です。個人のマシンでのみ使う設定を書きます。

- `REACT_APP_SQUARE_ENV`
- `REACT_APP_SQUARE_APP_ID`
- `REACT_APP_SQUARE_LOCATION_ID`
- `REACT_APP_USE_MOCK_PAYMENT`
- `REACT_APP_USE_TEST_TIME`

開発中にテストモードを使う場合は、ここで `true` を設定します。

`REACT_APP_USE_MOCK_PAYMENT=true` の場合は、Square 設定の取得に失敗してもフロント側の
`SQUARE_FALLBACK_CONFIG` を使って継続します。これは開発・検証用の挙動です。

### `.env.production`

本番ビルド用です。公開環境で使う設定を書きます。

- `REACT_APP_SQUARE_ENV=PRODUCTION`
- `REACT_APP_SQUARE_APP_ID`
- `REACT_APP_SQUARE_LOCATION_ID`
- `REACT_APP_USE_MOCK_PAYMENT=false`
- `REACT_APP_USE_TEST_TIME=false`

本番ではテストモードを無効にしてください。

`REACT_APP_USE_MOCK_PAYMENT=false` の場合は、`/api/square/config` で Square 設定を取得
できないときに処理を継続しません。本番では fallback に逃がさず、設定取得失敗を明示
して止める設計です。

### 既定値

- `USE_MOCK_PAYMENT` と `USE_TEST_TIME` は、環境変数が未設定なら `false` です。
- Square 設定は `src/constants/config.js` で参照されます。

## 画面の流れ

1. 開始画面
2. メニュー選択
3. ドリンク選択
4. カート確認
5. 予約時刻選択
6. Square 決済
7. 決済結果
8. 番号札表示

## ディレクトリ構成の考え方

- `src/pages` は画面単位のコンポーネント
- `src/components` は再利用する UI 部品
- `src/hooks` は画面遷移や状態管理
- `src/features` は業務ロジック
- `src/services` は外部 API とのやり取り
- `src/utils` は汎用ユーティリティ
- `src/constants` は共通定数

## 運用上の注意

- 決済や注文の正本はバックエンドです。フロント側の Cookie は補助的な復元用です。
- 本番では `REACT_APP_USE_MOCK_PAYMENT` と `REACT_APP_USE_TEST_TIME` を必ず `false` にしてください。
- Square の公開設定値は環境変数で管理してください。
- Square 設定の取得は、mock モードではフロント fallback を許可し、real モードでは
	バックエンド取得失敗時に停止するようにしています。

## 補足

- 売り切れ情報はバックエンドの在庫 API から取得します。
- 予約時間の扱いはテスト時刻の有無で変わります。
- 既存のビルド成果物は配布用であり、通常の開発ではソースと切り分けて扱うのが望ましいです。
