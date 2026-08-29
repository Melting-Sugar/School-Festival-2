このアプリケーションは今年度の学祭に向けver.2.0.への大幅なリファクタリングを実施しています。去年のプロダクトのコードをご覧になりたい方は、「old-ver-2026」ブランチをご覧ください。
アプリのデモ版：https://melting-sugar.github.io/School-Festival-2_ForExhibition/
アプリの全体像について解説している動画：https://youtu.be/9oQvhiEaNYs

# School-Festival-2

客側モバイルオーダーのフロントエンドです。ユーザーはこのアプリを通じて、商品選択、予約時刻の指定、決済(PaySys経由のクレジットカード/PayPay)、注文内容と番号札の確認を行います。

バックエンドと店舗側フロントエンドは別リポジトリ(`Shrssss/CDMTs-payment-application`)で管理されています。

## ⚠️⚠️⚠️ モックスイッチについて(本番公開前に必ず確認すること)

このアプリには3つのモックスイッチがあります。**本番環境では、以下を全て `false` にしてください。** 1つでもオンのままだと、決済・時刻・メニューのいずれかが実際のバックエンドに接続されず、モックの値で動作してしまいます。

| 環境変数 | オンの時の挙動 |
|---|---|
| `REACT_APP_USE_MOCK_PAYMENT` | カード・PayPayとも、バックエンドに一切接続せず決済成功画面まで到達できる(迂回策) |
| `REACT_APP_USE_MOCK_MENU` | メニュー(価格・商品名・画像)をバックエンドに一切接続せず、ハードコードされたモック値で表示する |
| `REACT_APP_USE_TEST_TIME` | 予約時刻の判定にテスト用の固定時刻を使う |

本番用の `.env.production` では、この3つとも `false` になっていることをデプロイ前に必ず確認してください。

## ⚠️ 決済まわりの現状(後任フロントエンド開発者向けの重要事項)

**`REACT_APP_USE_MOCK_PAYMENT` をオンにすると、カード・PayPayどちらも決済成功画面まで到達できますが、これは完全にモックによる迂回策です。バックエンドへの注文作成・決済実行といった実際のAPI接続は一切行っていません。** 画面遷移が完了しても、DBには何も記録されません。

- クレジットカード・PayPayともに、決済基盤を**Square から自社の「PaySys」へ移行する方針**が確定しています。
- **PaySysの実装(バックエンドとの実連携)は後任フロントエンド開発者が担当します。** 現時点ではモック画面(`src/hooks/useCardPaymentFlow.js`, `src/hooks/usePayPayPaymentFlow.js`)のみが実装されており、`USE_MOCK_PAYMENT` がオフの場合は明示的に「未実装」のエラーを返すだけです。
- **Square関連のコードは削除せず`src/legacy/square/`配下に隔離しています。** 参考にはなりますが、どこからもimportされていない未使用コードです。誤って復活させないよう注意してください。詳細は「Squareコードの隔離について」を参照してください。

## メニュー取得まわりの現状

メニュー(価格・商品名・画像)は `GET /api/items/get/allItems` でバックエンドから取得します(`src/hooks/useMenuItems.js`)。

- **`REACT_APP_USE_MOCK_MENU` がオンの場合、バックエンドへ一切接続せず、`src/constants/mocks/menuMock.js` のハードコードされた値のみでメニュー画面を表示します。** フロントエンドのみで(バックエンドを起動せずに)画面確認ができます。
- オフの場合、バックエンドから取得できなければ**メニュー画面に「メニューを取得できませんでした」と表示し、それ以上進めません**(ハードコード値へ黙って切り替えることはしません)。「再読み込み」ボタンで再取得できます。

## できること

- 商品とドリンクの選択
- 予約時刻の選択
- クレジットカード・PayPay決済(PaySys経由。**現状モックのみ**、実装は後任担当)
- 注文結果と番号札の表示
- 売り切れ状態の反映
- メニュー取得失敗時のエラー表示・再読み込み

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

- `REACT_APP_USE_MOCK_PAYMENT` ⚠️ モックスイッチ(本番ではfalse必須)
- `REACT_APP_USE_MOCK_MENU` ⚠️ モックスイッチ(本番ではfalse必須)
- `REACT_APP_USE_TEST_TIME` ⚠️ モックスイッチ(本番ではfalse必須)
- `REACT_APP_SQUARE_ENV` / `REACT_APP_SQUARE_APP_ID` / `REACT_APP_SQUARE_LOCATION_ID`(⚠️ 未使用。Square廃止に伴い`src/legacy/square/`の設定でのみ参照される)

開発中にモック動作を使う場合は、ここで `true` を設定します。

`REACT_APP_USE_MOCK_PAYMENT=true` を設定すると、決済画面(カード・PayPayとも)がPaySysのモックのみを通す状態になります。**バックエンドへの実際のAPI接続は行われません。**

`REACT_APP_USE_MOCK_MENU=true` を設定すると、メニュー画面がバックエンドへ接続せず、ハードコードされたモック値のみで表示されます。

`REACT_APP_USE_TEST_TIME=true` を設定すると、予約時刻の表示や判定をテスト用の固定時刻で動かします。

### `.env.production`

本番ビルド用です。公開環境で使う設定を書きます。

- `REACT_APP_USE_MOCK_PAYMENT=false`
- `REACT_APP_USE_MOCK_MENU=false`
- `REACT_APP_USE_TEST_TIME=false`

**本番では上記3つのモックスイッチを必ず全て `false` にしてください。** `USE_MOCK_PAYMENT=false` にしても、PaySysの実装が完了するまでは決済は「未実装」エラーになります(下記参照)。

### 既定値

- **`USE_MOCK_PAYMENT` / `USE_MOCK_MENU` / `USE_TEST_TIME` は、環境変数が未設定だと `true`(モックオン)になります。** `.env.production` に明示的に `false` を書かないと、本番ビルドでもモック動作になってしまうので注意してください。

## 画面の流れ

1. 開始画面
2. メニュー選択
3. ドリンク選択
4. カート確認
5. 予約時刻選択
6. 決済方法選択(クレジットカード / PayPay)
7. 決済画面(PaySys。現状モックのみ)
8. 決済結果
9. 番号札表示

## ディレクトリ構成の考え方

- `src/pages` は画面単位のコンポーネント
- `src/components` は再利用する UI 部品
- `src/hooks` は画面遷移や状態管理
- `src/features` は業務ロジック
- `src/services` は外部 API とのやり取り
- `src/utils` は汎用ユーティリティ
- `src/constants` は共通定数
- `src/legacy/square` は**未使用**。Square廃止に伴い隔離したコード(下記参照)

## Squareコードの隔離について

以前はSquareのクレジットカード決済を実装していましたが、決済基盤をPaySysへ一本化する方針により、Square関連のコードは`src/legacy/square/`配下へ移動し、**削除せず保管**しています。

- `src/legacy/square/hooks/usePaymentFlow.js`
- `src/legacy/square/components/PaymentBillingFields.jsx`
- `src/legacy/square/components/PaymentActionButton.jsx`
- `src/legacy/square/features/payment/paymentGateway.js`
- `src/legacy/square/features/payment/paymentScreen.js`
- `src/legacy/square/features/payment/paymentValidation.js`
- `src/legacy/square/services/squarePaymentService.js`
- `src/legacy/square/constants/mocks/cardPaymentMock.js`
- 対応するテスト(`src/legacy/square/__tests__/`)

各ファイルの冒頭に「⚠️ 未使用」のコメントがあります。**アクティブなコード(`src/legacy/square/`の外)からimportしないでください。** 将来Squareへの回帰や参考実装が必要になった場合のために残しています。`src/constants/config.js`の`SQUARE_*`定数、`src/services/apiService.js`の`getSquareConfig`/`chargeOrder`メソッドも同様に未使用としてコメントを付けていますが、削除はしていません。

## 運用上の注意

- 決済や注文の正本はバックエンドです。フロント側の localStorage は補助的な復元用です。
- **本番では `REACT_APP_USE_MOCK_PAYMENT` / `REACT_APP_USE_MOCK_MENU` / `REACT_APP_USE_TEST_TIME` を必ず全て `false` にしてください。** 未設定の場合はデフォルトで `true`(モックオン)になる点に注意してください。
- **PaySysの実バックエンド連携が完了するまでは、`USE_MOCK_PAYMENT=false` でも決済は完了しません**(明示的な未実装エラーになります)。

## 補足

- メニュー(価格・商品名・画像)と在庫状況はバックエンドの `GET /api/items/get/allItems` から取得します(`USE_MOCK_MENU=false` の場合)。
- 予約時間の扱いはテスト時刻の有無で変わります。
- 既存のビルド成果物は配布用であり、通常の開発ではソースと切り分けて扱うのが望ましいです。
- バックエンドへの要望・修正依頼は `docs/backend-requirements.md` を参照してください。
