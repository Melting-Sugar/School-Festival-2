# フロントエンド仕様書(後任フロントエンド開発者向け)

作成日: 2026-08-30(コード品質改善Step A〜H反映により更新)
作成者: 前任フロントエンド担当・伊知川滉太

## 1. このドキュメントについて

`School-Festival-2`(客側モバイルオーダーのフロントエンド)を引き継ぐ後任フロントエンド開発者向けに、コードだけでは伝わりにくい**設計判断の理由・経緯・既知の懸念事項**をまとめたものです。README.mdが「今どう動くか」を説明するのに対し、このドキュメントは「なぜそうなっているか」「何が終わっていて何が終わっていないか」を中心に書いています。

**前提として先に読んでおくもの**:
- [README.md](../README.md) — セットアップ、モックスイッチ、環境変数、ディレクトリ構成の基本
- [docs/backend-requirements.md](./backend-requirements.md) — バックエンド(`Shrssss/CDMTs-payment-application`、別リポジトリ・別担当者)への未対応の依頼事項一覧。**フロントの既知の懸念事項の多くは、実体としてはこのファイルに書かれているバックエンド側のTODOです**

**担当分界**: このリポジトリのフロントエンドのみが担当範囲です。バックエンドのコードは一切変更していません(触る権限がないという意味ではなく、変更が必要な場合は`docs/backend-requirements.md`に指示書として書き、バックエンド担当者に依頼する運用にしていました)。この運用は今後も踏襲することを推奨します。

## 2. アプリの全体像

客がスマホ等のブラウザから、学祭の屋台(角煮料理)を注文するためのアプリです。画面遷移は以下の一本道(タイトル画面以外は「戻る」も可能):

```
タイトル → メニュー選択 → ドリンク選択 → カート確認 → 予約時刻選択
  → 決済方法選択(カード/PayPay) → 決済画面 → 決済結果 → 番号札表示
```

店舗側(調理・受け渡し・在庫管理・モニター)の画面は**別リポジトリ**(`Shrssss/CDMTs-payment-application`の`static/js`配下、`cooking.js`/`handover.js`/`monitor.js`/`stock.js`)にあり、`School-Festival-2`には含まれません。ただしこれらは2026年8月のバックエンド大規模リファクタに追従できておらず、現状動作していない可能性が高いです(`docs/backend-requirements.md` 1番参照)。

## 3. ビルドツール・技術スタック

2026-08-30に **Create React App → Vite + TypeScript** へ移行しました(このリポジトリのStep 4)。詳細な使い方はREADME.mdの「ビルドツールについて」を参照してください。ここでは判断理由のみ補足します。

- **TypeScript化した理由**: 単純に型安全性のため。`strict: true`で全面移行しています。
- **Vite化した理由**: react-scripts(CRA)は事実上メンテナンスモードで、TypeScriptの新しいバージョンとの相性問題(peer dependency)も出ていたため、移行タイミングでビルドツールごと入れ替えました。
- **テストはJestのまま(Vitestへ移行していない)**: 既存テストが`jest.resetModules()` + 動的`require()`を多用しており(モック切り替えのテストパターン)、Vitestの`vi.resetModules()`は挙動やタイミングの細部がJestと異なるため、書き換えるとテストの意味が変わってしまうリスクがあると判断しました。`babel-jest`で妥協し、Vite本体のビルド・devサーバーとは完全に独立させています。
- **`import.meta.env.VITE_X`とJestの共存**: `babel-plugin-transform-vite-meta-env`により、Jest実行時は`import.meta.env.VITE_X`が`process.env.VITE_X`に変換されます。同じソースコードが両方の実行環境で動きます。テストで環境変数を差し替えたい場合は`process.env.VITE_X = "..."`をセットしてください(`src/__tests__/useMenuItems.test.js`が実例)。
- **`babel.config.cjs`の`overrides`に注意**: `@babel/preset-react`(JSX構文)は`.ts`ファイルには適用していません。理由は、`.ts`の総称アロー関数(`<T>(x) => ...`のような書き方)がJSXの開始タグと誤認識されてパースエラーになるためです。**新しく`.ts`ファイルを追加する際にJSXを書く必要が出てきたら、拡張子を`.tsx`にしてください**(`.ts`のままJSXを書くとJestが壊れます)。
- **ESLintが実際に機能する状態です**(`npm run lint`)。`eslint.config.js`(flat config)で、`src/legacy/square/`は対象外にしています。`eslint-plugin-react-hooks`はv7の既定(React Compiler向けの厳格な純粋性ルール一式)をそのまま使わず、`rules-of-hooks`/`exhaustive-deps`の2ルールだけを有効化しています(理由はファイル内コメント参照。React Compilerを使う予定がないため)。
- **CI(`.github/workflows/ci.yml`)がpush/PR時に`lint`→`jest`→`build`を自動実行します。**

## 4. 状態管理の考え方(`useAppFlow`)

画面全体の状態は[`src/hooks/useAppFlow.ts`](../src/hooks/useAppFlow.ts)の`useReducer`(内部の`screenState`)に集約しています。Reduxのような外部ライブラリは使わず、素の`useReducer`で足りる規模だと判断した設計です。

- `state.step`: 現在の画面(`Step`型、[`src/constants/steps.ts`](../src/constants/steps.ts)の`STEPS`定数の値)。`STEPS_ARRAY`の並び順が画面遷移の順序そのものです。`NEXT`/`PREV`アクションは配列のインデックスを前後させるだけなので、**画面を追加・入れ替えたい場合は`STEPS`と`STEPS_ARRAY`の順序を変えるだけで基本的に対応できます**。
- `state.cart`: `Record<number, number>`(商品ID/ドリンク種別ID → 個数)。詳細は次章。
- どの画面でフッター(次へ/戻るボタン)を出すか、次へボタンを無効化する条件、ボタンの文言は[`src/constants/stepRules.ts`](../src/constants/stepRules.ts)の`STEP_RULES`に集約しています。画面ごとの分岐を`Footer.tsx`や各ページに書き散らさず、ここ一箇所に定義を寄せているのが設計意図です。
- `selectedTime`(予約時刻、`"HH:mm"`または ISO文字列)は`useAppFlow`とは別の`useState`で管理しています(`state`に含めていない)。カートの状態とライフサイクルが違う(予約時刻はTimeページでしか変わらない)ための意図的な分離です。

## 5. カート状態とドリンク割り振りの考え方(重要)

**旧設計(現在は廃止済み)**: 以前は「セットID + ドリンクオフセット」でIDを合成する`getDrinkBreakdownId`方式で、カートが「セット(40)を1個、コーラ入りセット(41)を1個」のように**内訳IDを実商品として持つ**設計でした。これはバックエンドの商品登録API(`itemId`をクライアント指定できない)と噛み合わず、実在しない内訳IDを送ると注文作成失敗や決済時のNullPointerExceptionを引き起こす問題がありました(詳細経緯は`docs/backend-requirements.md` 5番)。

**現在の設計**: 商品ID(`itemId`)とドリンク種別ID(`drinkId`)を**合成しない**。カートは常に「カテゴリ別の生の個数」と「ドリンク種別ごとの合計数」を別々に持つだけです([`src/constants/items.ts`](../src/constants/items.ts)の`CART_INITIAL`)。

- カテゴリID: `10`(角煮単品) `20`(角煮大盛り単品) `30`(ドリンク単品) `40`(角煮ドリンクセット) `50`(角煮ドリンクセット大盛り)
- ドリンク種別ID: `91`(コーラ) `92`(オレンジ) `93`(サイダー) `94`(烏龍茶)
- どのセットにどのドリンクを割り振るか(例: セット2個のうちコーラ1個・オレンジ1個、という紐付け)は**計算しない**。バックエンドに送るのは「セット(40)を2個」「コーラ(91)を1個・オレンジ(92)を1個」という生データのみで、紐付け計算はバックエンド側に一本化する方針です(`docs/backend-requirements.md` 5番で依頼中、**未実装**)。

このため:
- [`src/utils/orderUtils.ts`](../src/utils/orderUtils.ts)の`buildOrderItems()`が、カートから`{items: [{itemId, quantity}], drinkCounts: {drinkId: count}}`という送信用の形に変換します。バックエンドへの送信フォーマットはこれで固定です。
- [`src/features/order/cartOrganizer.ts`](../src/features/order/cartOrganizer.ts)の`organizeCart()`(旧: 割り振り計算ロジック)は**現在どこからも呼ばれていません**。削除はせず、割り振りアルゴリズムの参考実装として残してあります(バックエンド担当者が同等ロジックを実装する際の参考、または将来フロント側で再度必要になった場合のため)。
- [`src/components/Order.tsx`](../src/components/Order.tsx)(カート確認画面・番号札画面で使う表示コンポーネント)は、紐付けをしない前提で「商品(価格あり)」と「選んだドリンク(価格なし、種別ごとの合計数のみ)」を**別々の独立したリスト**として表示します。合計金額もカテゴリ商品の価格のみで計算し、ドリンクは加算しません(ドリンク自体に価格はない)。
- ドリンク選択画面の「あと◯個」表示は、選んだセット数の合計とドリンク種別の選択合計数の差分([`src/hooks/useOrderSummary.ts`](../src/hooks/useOrderSummary.ts)の`calculateDifferenceOfDrinks`)で出しています。次へボタンが押せるのはこの差分が0のときだけです(`stepRules.ts`)。

**新しい商品カテゴリを追加する場合**: `items.ts`の`PRODUCT_CATEGORIES`/`PRODUCT_CATEGORY_IDS`/`CART_INITIAL`、`MenuPage.tsx`の表示、バックエンドの商品マスタへの登録、が最低限必要です。ドリンク種別を増やす場合は`DRINK_TYPE_IDS`と`DrinkPage.tsx`。**商品IDは`PRODUCT_CATEGORIES.PORK_SINGLE`のように必ず名前付き定数経由で参照してください**(`40`のような生の数字を直接書かない)。以前`MenuPage.tsx`/`DrinkPage.tsx`/`soldoutPolicy.ts`が生数値を直書きしていて、ビジネスロジック層とのズレの温床になっていたため、全て`PRODUCT_CATEGORIES`経由に統一済みです。1商品あたりの上限個数も`items.ts`の`MAX_ITEM_QUANTITY`に定数化してあります。

## 6. 決済(PaySys)の現状 — 最重要

**経緯**: 元々はSquareでクレジットカード決済を実装していましたが、決済基盤を自社の「PaySys」へ一本化する方針が確定し、Squareは完全廃止しました。**PaySysの実バックエンド連携は未実装**で、後任フロントエンド開発者(＝このドキュメントの読者)が担当する想定です。前任(私)が作ったのは**モック画面のみ**です。

- [`src/hooks/useCardPaymentFlow.ts`](../src/hooks/useCardPaymentFlow.ts) / [`src/hooks/usePayPayPaymentFlow.ts`](../src/hooks/usePayPayPaymentFlow.ts): カード・PayPayそれぞれの決済フックです。中身はどちらも[`src/hooks/useMockPaymentFlow.ts`](../src/hooks/useMockPaymentFlow.ts)(共通実装)を呼ぶ薄いラッパーで、決済手段ごとに違う値(モック注文ID・未実装時のエラー文言)だけを渡しています(以前は2ファイルにほぼ同じ実装が重複していたのを統合したもの)。**実際にロジックを直す・拡張する際は`useMockPaymentFlow.ts`を編集してください。**
  - `USE_MOCK_PAYMENT`がオン(既定値`true`) → [`src/constants/mocks/paysysCardMock.ts`](../src/constants/mocks/paysysCardMock.ts) / [`paypayPaymentMock.ts`](../src/constants/mocks/paypayPaymentMock.ts)の決め打ち値で即座に成功扱いにし、`orderSnapshot`(localStorage)へ保存して`paymentResult`画面へ遷移します。**バックエンドへの通信は一切発生しません。**
  - オフ → 現状は`error: "クレジットカード決済(PaySys)は未実装です。後任担当者が実装予定です。"`という明示的なエラーを返すだけです。ここを実装するのが後任の主タスクです。
- [`src/features/payment/paymentSession.ts`](../src/features/payment/paymentSession.ts)の`createPaymentOrder()`は、**現在どの画面からも呼ばれていません**。決済手段(Square/PayPay/PaySys)に依存しない汎用の「注文作成→決済」の骨組みとして書いてあり、PaySys実装時の出発点として使える設計にしてあります。以前、Square実装時に「決済画面に入った瞬間(画面表示のタイミング)に`createOrder`を呼んでいたため、カートに戻って再度決済画面に入ると注文が重複作成される・リロードすると孤立注文が残る」という問題にハマったことがあり、この関数は**その反省を踏まえて「カード情報のトークン化が成功し、実際に課金する直前」に`createOrder`を呼ぶ設計**にしてあります。**PaySysを実装する際は、この設計(課金直前に`createOrder`を呼ぶ)を踏襲することを強く推奨します。**
- `apiService.ts`の`Api.createOrder()`は、バックエンドの`POST /api/orders/set`をそのまま呼べる状態まで実装済みです(モックオフ時に使われる想定)。PaySys用の決済実行API(`Api.chargeOrder`相当)はまだ存在しません。**Square用の`Api.chargeOrder`(Square SDKのsourceIdを使う契約)は`src/legacy/square/`に隔離済みで、PaySysにはそのまま使えません**(PaySys側のAPI契約はバックエンド担当者と別途合意が必要)。

### Squareコードの隔離について
`src/legacy/square/`配下に、削除せず保管してあります(詳細はREADME.mdの該当セクション参照)。**参考にはなりますが、どこからもimportされていない未使用コードです。** TypeScript移行の対象外としており、`.js`/`.jsx`のままです。Square自体に戻す予定がない限り、基本的に触る必要はありません。

## 7. メニュー・在庫(売り切れ)の現状

- [`src/hooks/useMenuItems.ts`](../src/hooks/useMenuItems.ts)が`GET /api/items/get/allItems`から価格・商品名・画像パス・在庫状況を取得します。`menu`画面に入るたびに再取得します。
- `USE_MOCK_MENU`がオン(既定値`true`) → バックエンドへ一切接続せず[`menuMock.ts`](../src/constants/mocks/menuMock.ts)の固定値のみで表示します。
- オフでバックエンド取得に失敗 → **ハードコード値へ黙ってフォールバックせず**、「メニューを取得できませんでした」+再読み込みボタンを表示します(実装時にサイレントフォールバックにしないよう注意した箇所です)。
- [`src/features/soldout/soldoutPolicy.ts`](../src/features/soldout/soldoutPolicy.ts)の`applySoldoutRules()`が、単品(10/20)が売り切れなら対応するセット(40/50)も自動的に売り切れ扱いにする、ドリンク種別が全部売り切れならドリンク単品(30)・両セットも売り切れ扱いにする、という連動ルールを適用します。バックエンドからは商品単位の`available`しか返ってこない前提で、セット⇔単品の連動はフロント側で計算しています。

## 8. 予約時刻・テスト時刻

- [`src/features/reservation/reservationSchedule.ts`](../src/features/reservation/reservationSchedule.ts)の`generateTimeOptions()`が、現在時刻+10分(`START_OFFSET_MINUTES`)から5分刻み(`INTERVAL_MINUTES`)で、17:10(`LAST_ORDER_HOUR`/`LAST_ORDER_MINUTE`)より前までの候補を生成します。設定値はすべて[`src/constants/config.ts`](../src/constants/config.ts)の`RESERVATION_CONFIG`に集約されています。
- **17:10ちょうどは「受付終了」扱いです**(ユーザー確認済みの業務ルール)。この判定は同ファイルの共有関数`isPastLastOrderTime()`に一本化されており、予約時刻の候補生成と、注文確定ボタンの無効化判定([`src/constants/stepRules.ts`](../src/constants/stepRules.ts))の両方がこの1関数を参照します。**締切時刻の判定ロジックを新しく書き足す必要が出てきても、この関数を再利用してください。別の場所に独自の`>`/`>=`比較を書き足すと、以前あったような「候補には出るのに確定ボタンは押せない」という矛盾が再発します。**
- `USE_TEST_TIME`がオン(既定値`true`)のとき、`App.tsx`が実時刻の代わりに`TEST_DATE`(`config.ts`、2025-09-22 12:00固定、起動からの経過時間を加算して進む)を基準にします。学祭の開催時間帯(9:00〜17:10)の外でも「営業時間中」として一連の画面遷移を試せるようにするためのテスト用スイッチです。**本番では必ずオフにしてください**(README・コード双方に警告コメントあり)。
- **重要な制約(要注意)**: `USE_TEST_TIME`が影響するのは「現在時刻」の**時・分**だけです。予約時刻の選択肢(`TimeSelect`)は内部で`"HH:mm"`という時刻のみの文字列としてやり取りされ([`generateTimeOptions`](../src/features/reservation/reservationSchedule.ts)の戻り値、`useAppFlow`の`selectedTime`)、選択後に[`parseReservedToDate()`](../src/utils/orderUtils.ts)がこの文字列をDateへ戻す際は`new Date()`(**実際の壁時計の現在日付**)の年月日に時分だけを上書きする実装になっています。そのため、`USE_TEST_TIME=true`でテスト用の時刻(2025-09-22)を使っていても、**実際に保存・表示される予約日時(`displayReserved`、番号札画面等)の年月日は常に実行時の本物の今日の日付になります**(時・分だけがテスト時刻ベース)。当日受け取りの運用なので実害はありませんが、日付をまたぐ挙動や年月日の一致を前提にしたテスト・実装を書く際は注意してください。

## 9. 「注文を確認する」機能とlocalStorage

決済成功後、`orderSnapshot`([`src/features/order/orderSnapshot.ts`](../src/features/order/orderSnapshot.ts))としてlocalStorageに`{orderId, itemsCart, reservedAtIso, displayReserved, ...}`を保存します。タイトル画面の「注文番号を確認する」ボタンから、[`src/hooks/useOrderSnapshotRestore.ts`](../src/hooks/useOrderSnapshotRestore.ts)がこれを読み出し、`numberTag`画面へ直接遷移できます。予約時刻から1時間(`ORDER_SNAPSHOT_CONFIG.RESERVATION_VALID_DURATION_MS`)経過すると自動的に無効扱いになり消去されます。

**これは暫定実装です。** 本来は「バックエンドが注文作成時にランダムなトークンを発行し、フロントはそのトークンだけをCookieに保存、注文内容は`GET /api/orders/get/byToken/{token}`のようなAPIで都度取得する」設計に置き換える予定でした(`docs/backend-requirements.md` 6番)が、**バックエンド側のトークンAPIが未実装のため、localStorageへの暫定保存のまま止まっています**。同一ブラウザでしか動作しない・ブラウザデータを消すと消える、という制約はタイトル画面の注意書きに明記済みですが、後任がバックエンドと合わせてトークン方式へ移行する場合、置き換え先はこのファイル一式です。

## 10. 既知の懸念事項(未解決、優先度が高い順)

以下はいずれも**バックエンド側の対応が必要**で、フロント側だけでは解決できないものです。詳細と提案する解決策は`docs/backend-requirements.md`に記載済みなので、バックエンド担当者との会話の出発点にしてください。

1. **PaySysの実装そのものが存在しない**(本ドキュメント6章、最優先)。
2. **`updatePaymentStatus`/`createPayment`のIDOR脆弱性**: `orderId`を知っていれば誰でも他人の注文の支払い状態を書き換えられる。トークンによる本人確認が必要(`docs/backend-requirements.md` 2〜3番)。
3. **ドリンク割り振りロジックのバックエンド実装が未着手**: 現状`items`と`drinkCounts`を送っても、バックエンドはこれを無視するだけです(本ドキュメント5章)。
4. **注文照会用トークンAPIが未実装**: 本ドキュメント9章参照。
5. **管理画面(`cooking.js`等)がバックエンドの2026年8月リファクタに追従していない**: フロント(このリポジトリ)には影響しませんが、店舗運営に直結するため優先度が高いとバックエンド側に伝えてあります。
6. **`OrderResponse`に`paymentStatus`が含まれていない**: 「未決済の注文は調理キューに出さない」業務ルールが機能しない可能性。
7. **予約時刻の営業時間内チェックがフロントのみ**: 最終受付時刻(17:10)の制御は現状フロントの画面表示・ボタン無効化だけで行っており、`POST /api/orders/set`はサーバー側で検証していません。フロントを経由せず直接APIを叩けば、営業時間外の予約も普通に作成できてしまいます(`docs/backend-requirements.md` 10番で依頼済み)。

## 11. テストを書く・動かす際の注意

- `npx jest` で全テスト実行(現在19 suites / 67 tests)。個別実行は`npx jest <ファイル名の一部>`。
- 既存テストの多くが「`jest.resetModules()`してから`require()`し直す」ことで、モックスイッチ(`USE_MOCK_PAYMENT`等)違いの挙動をテストするパターンを使っています(例: [`src/__tests__/useMenuItems.test.js`](../src/__tests__/useMenuItems.test.js)、[`src/__tests__/useMockPaymentFlow.test.js`](../src/__tests__/useMockPaymentFlow.test.js))。このパターンを踏襲する場合、Reactやreact-dom/clientも`jest.resetModules()`の後に**改めて`require()`し直す**必要があります(モジュールインスタンスの不一致で`useState`が壊れる問題に一度ハマったため)。
- `src/__tests__/`配下と`src/legacy/square/__tests__/`配下は、TypeScript移行の対象外として`.test.js`のままにしてあります(本ドキュメント3章のJest継続方針と合わせた判断)。新規テストを`.test.ts`で書くこと自体は問題ありません(Jestの`testMatch`は両方受け付けます)。
- `apiService.test.js`(アクティブな方)は`createOrder`/`fetchAllItems`/`fetchOrder`など実運用メソッドのテストです。Square専用の`getSquareConfig`のテストは[`src/legacy/square/__tests__/getSquareConfig.test.js`](../src/legacy/square/__tests__/getSquareConfig.test.js)に分けてあります。**新しいAPIメソッドを追加したら、この使い分けを踏襲してテストを書いてください**(廃止済みメソッドのテストとアクティブなメソッドのテストが同じファイルに混在すると、見た目のカバレッジが実態とズレます)。
- `npm run lint`でESLintが実行できます。CI(`.github/workflows/ci.yml`)がpush/PR時に自動でlint→test→buildを実行します。

## 12. すぐに手を付けるとしたら(後任へのおすすめ順)

1. `docs/backend-requirements.md`をバックエンド担当者と一緒に読み合わせ、実装状況を確認する
2. PaySysのAPI契約(エンドポイント・リクエスト/レスポンス形状)をバックエンド担当者と合意する
3. `useMockPaymentFlow.ts`のモックオフ分岐を実装(`paymentSession.ts`の`createPaymentOrder()`を出発点にする)。カード・PayPayとも同じ共通フックなので、1箇所直せば両方に反映されます
4. localStorage方式(本ドキュメント9章)をトークン方式へ置き換え(バックエンドのトークンAPI次第)
5. 本番公開前に、`.env.production`の3つのモックスイッチ(`VITE_USE_MOCK_PAYMENT`/`VITE_USE_MOCK_MENU`/`VITE_USE_TEST_TIME`)が全て`false`になっていることを必ず確認する

## 13. 想定外のエラーへの備え

[`src/components/ErrorBoundary.tsx`](../src/components/ErrorBoundary.tsx)が`App.tsx`で`<AppScreenRenderer>`をラップしています。画面本体(メニュー〜決済〜番号札)のどこかで想定外の例外が起きても、白画面ではなく「エラーが発生しました」+再読み込みボタンのフォールバックUIが表示されます(ヘッダーはラップの外なので表示され続けます)。**新しいページ・コンポーネントを追加する際も、このラップの内側(`<AppScreenRenderer>`経由)に置けば自動的にカバーされます。**
