<!-- English: [artifacts.md](./artifacts.md) — 片方を直したら、同じコミットでもう片方も直してください -->

# API 種別ごとに何が生み出されるか

spec はすべての操作の種別 — `query` / `mutation` / `subscription` / REST — を明記し、種別は決して推測されません。ビルドのチェックポイントはその値で分岐します。**それぞれの値が各レイヤーで実際に何を生み出すかは、このスタックの答えであり、ここにあります。** それらを*どう書くか*は、装備されたスキルと実物の木のものです。

## サーバーの消費者が読む契約

消費者が別の場所にいるサーバーごとに 1 つの契約ファイルを `.hora/contracts/<version>/` に置きます:

| サーバーのプロトコル | 契約ファイル |
|---|---|
| GraphQL | SDL。`<server>.graphql` として |
| REST | ルート表 — method、path、renderer、リクエストとレスポンスの形 — を `<server>.md` として |

唯一の消費者が同じリポジトリにいるサーバー(worker)に契約ファイルは要りません。

## スキーマ設計で

| 種別 | 設計されるもの |
|---|---|
| GraphQL query | その操作の SDL |
| GraphQL mutation | その操作の SDL |
| GraphQL subscription | SDL に加え、subscription resolver のスキーマ側半分 |
| REST | renderer のルートとバージョン |

**型インターフェースと定数はスキーマ設計に属します。** `types/resolvers/` 配下の `.d.ts` や enum 的な定数は、型として表現されたスキーマです — 実物の実装が存在する前に、スタブがすでに両方を必要とします。

## 実物の実装で

| 種別 | 実装されるもの |
|---|---|
| GraphQL query | query resolver |
| GraphQL mutation | mutation resolver |
| GraphQL subscription | subscription resolver |
| REST | renderer そのもの |

## frontend の API クライアントで

| 種別 | 作られるもの |
|---|---|
| GraphQL query / mutation | GraphQL operation client |
| GraphQL subscription | GraphQL operation client の subscription 側 |
| REST | RESTful client |

## frontend の共有ロジック

**Furo は OOP です: 共有ロジックはクラスであり、関数でも composable でもありません。** 複数のコンポーネントやページが使うロジックは、アプリの modules フォルダ配下のクラスとして存在します。
