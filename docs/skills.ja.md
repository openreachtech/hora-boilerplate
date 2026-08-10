<!-- English: [skills.md](./skills.md) — 片方を直したら、同じコミットでもう片方も直してください -->

# Hora Kit が乗っているスキル群

Hora Kit が持っているのは順序と関所です。**手順と合否基準はすべて別の場所** — [`@openreachtech/ai-agent-skills`](https://github.com/openreachtech/ai-agent-skills) パッケージにあります。

このドキュメントはその境界の話です。なぜ在るのか、スキルはどうやってセッションに届くのか、どう参照するのか、無かったときどうなるのか。

---

## なぜ Hora Kit は手順を持たないのか

同じ規約を書いた文書が2つあれば、必ず食い違います。**問題は「いつ」と「誰かが気づくか」だけです。**

```
ai-agent-skills   「stub resolver は server/graphql/resolvers/<audience>/stub/ に置く」
                       │
                       │  パッケージが更新される。パスが変わる。
                       ▼
Hora Kit          「stub resolver は server/graphql/resolvers/<audience>/stub/ に置く」
                       ↑
                  そのまま、自信満々のまま、間違いになる
```

**写しは、自分が古くなったことを知らせません。** 書かれた日と寸分違わず権威ある文面のままで、それに従ったエージェントは**自信をもって間違った場所に**成果物を置きます。

したがって Hora Kit の規則は絶対です。

> **`ai-agent-skills` のスキルが既に持っている手順・規約・合否基準を、hora skill 側に書いてはならない。名前で委譲すること。**

これは `/hora-setup` が boilerplate に対して既に採っている考え方と同じです：**実物を読め。今そう書いてあることを焼き込むな。** ここでの実物はパッケージです。

### それぞれが所有するもの

| | 所有するもの | 例 |
|---|---|---|
| **Hora Kit** | 何がいつ起きるか。次に進む前に何が真でなければならないか | *「関所4は、この機能が足す全操作にスキーマ準拠の stub が存在したら通過」* |
| **`ai-agent-skills`** | どうやるか。何をもって「ちゃんとできた」か | *「stub は `stub/{queries,mutations}/` に置き、スキーマを写し、DB アクセスを持たず、実装 resolver とクラス名を共有する」* |

**2つの文は重なりません。** それが判定基準です — Hora Kit のある行が、パッケージと突き合わせて「食い違っている」と判定できてしまうなら、その行は Hora Kit にあるべきではありません。

---

## スキルがセッションに届くまで

Claude Code がスキルを見つけるのは、セッション自身の `.claude/skills/` だけです。パッケージのスキルは `node_modules/` にあり、そこはその場所ではありません。**コピーする手順が無ければ、パッケージが配るものは全部見えないままです。**

`/hora-setup` がそのコピーを実行します。

```bash
.claude/skills/hora-setup/scripts/equip-skills.sh
```

```
node_modules/@openreachtech/ai-agent-skills/dist/skills/<skill>/
                          │  そのままコピー。改名も書き換えもしない
                          ▼
                 .claude/skills/<skill>/
```

- **`/hora-setup` のたびに走ります。** 前回以降にパッケージが更新されている可能性があるためです。ただのコピーなので再実行は安全です
- **リポジトリの clone を待ちません。** `ai-agent-skills` はこのリポジトリ自身の devDependency なので、ここで `npm install` が済んでいれば使えます
- **コピーは gitignore 済み**（`.claude/skills/backend-*/`, `frontend-*/`, `core-*/`）。生成物であって、ここで書いたものではありません。履歴に入るべきものは何もありません

---

## 名前にはハッシュが付く。接頭辞で照合する

パッケージは各スキルを、末尾に内容ハッシュを持つディレクトリ名で配ります。

```
backend-renchan-stub-api-1c0186b5eae9
frontend-acceptance-review-1340e28a90b1
core-requirement-definition-92eb3e22b2cd
```

`equip-skills.sh` はその名前をそのままコピーするので、呼び出せるスキル名にもハッシュが付きます。

**ハッシュはパッケージ更新で変わり、接頭辞は変わりません。** そのため Hora Kit 内の参照はすべて接頭辞で書かれ、`.claude/skills/` を列挙してそれで始まる唯一の項目を取ることで解決されます。

```
Hora Kit の記述    backend-renchan-stub-api
解決先             backend-renchan-stub-api-1c0186b5eae9
```

**ハッシュ付きのフルネームをどこにも書かないでください。** 次のリリースまでは正しく、その後は黙って間違いになります。

### 接頭辞が既に面を教えている

| 接頭辞 | 対象 | だいたいの中身 |
|---|---|---|
| `backend-renchan-*` | バックエンドリポジトリ | renchan の規約 — モデル、resolver、worker、migration |
| `frontend-*` | フロントエンドリポジトリ | furo/Nuxt の規約 — コンポーネント、CSS、クライアント、UI/UX、検収 |
| `core-*` | どちらでも | 言語レベルの規約、git、テスト、ドキュメント、要件定義 |

作業中の行にどれが当たるかは、中身を読む前に名前だけで分かります。

---

## パッケージが覆っている範囲

**これは見取り図であって、目録ではありません。** 権威ある一覧は、配備後の `.claude/skills/` が持っているものです。

```bash
ls .claude/skills/ | grep -E '^(backend|frontend|core)-'
```

そして「関所 → 委譲するスキル」の権威ある対応は [`checkpoints.md`](../.claude/skills/hora-build/references/checkpoints.md) です。**意図的にここには再掲しません** — あの表の2つ目の写しは、まさにこのドキュメント全体が扱っている食い違いそのものになります。

### `backend-renchan-*`

| 領域 | 覆う範囲 |
|---|---|
| **データベース** | 論理設計、migration、model、seeder、名前付き subquery |
| **GraphQL** | SDL と audience ごとのスキーマ、サーバーエンジン、query / mutation / subscription resolver、入力バリデータ、共有コンテナ `Share`、**stub resolver** |
| **REST** | `server/restfulapi/` 配下の renderer アーキテクチャ |
| **実行配置** | その処理がリクエスト経路か、post-worker か、バックグラウンドジョブかを決め、実装する |
| **型と定数** | `.d.ts` 宣言ファイルと、定数の2ファイル規約 |
| **外部連携** | 外部 HTTP/REST API クライアント |
| **設計パターン** | `else-if` の連鎖を置き換える strategy の三点セット |
| **AI 機能** | エージェント構造とループ、複数 LLM プロバイダ、light RAG、プロンプト文書ストア |
| **セキュリティ** | リポジトリ全体の read-only 監査。指摘を出すだけで何も直さない |
| **テスト** | テストの置き場所、実行順の保証、ローカル E2E コンテナ群 |

### `frontend-*`

| 領域 | 覆う範囲 |
|---|---|
| **フレームワーク** | Nuxt/Furo の構造、環境変数、context パターン、クラスとしてのユーティリティモジュール |
| **コンポーネント** | ボタン、ダイアログ、テーブル、セレクト、タブ、トースト、ステッパー、エディタほか多数。加えて**作ってはいけないもの** |
| **スタイル** | CSS 規約、レイヤー、単位、カスタムプロパティ、プロパティ順、`z-index`、余白、アニメーション |
| **API クライアント** | GraphQL の操作と生成型。RESTful クライアントの三点セット |
| **エラー処理** | バックエンドのエラーコードを利用者向けメッセージに写像する |
| **UI/UX** | プロジェクト context ファイル、構造的に正しい UI の生成、既存出力の監査 |
| **検収** | **受入レビュー**と、恒久的な E2E シナリオ仕様 |

### `core-*`

| 領域 | 覆う範囲 |
|---|---|
| **コーディング規約** | クラス、メンバー、宣言、モジュール、命名、スコープ、文、非同期、エラー、コメント、JSDoc、契約 |
| **要件定義** | 粗い依頼を、検証可能な要件定義書に変える |
| **進捗** | 実装中の状態を、見えるかつ正直に保つ |
| **テスト** | Jest の書き方と、**テストを弱めずに**スイートを緑にすること |
| **git** | コミット規約 |
| **ドキュメント** | README、ドキュメント、ライセンス、スキル自身の更新 |

---

## Hora Kit が最も強く寄りかかっているもの

4つは名前で覚える価値があります。それぞれの周りに関所が1つ建っているからです。

| スキル | 関所 | なぜ設計を形づくっているか |
|---|---|---|
| `backend-renchan-stub-api` | **4** | フロントエンドゲートが本物の API を待たない理由。stub は実装 resolver とクラス名・interface を共有するので、関所16 は書き直しではなくエンドポイントの切り替えになる |
| `backend-renchan-security-audit` | **8** | 設計上 read-only。だからこの関所は**書き込みツールを持たない verifier エージェント**で走る。見つけることと直すことは別の行為 |
| `backend-renchan-build-e2e-test-environment` | **17** | これ無しに検収は成立しない。だから 18 の中の一手順ではなく、独立した関所になっている |
| `frontend-acceptance-review` | **18** | 検収の合否基準はすべてここにある。`/hora-accept` が足すのは対象範囲・順序・記録だけ |

`core-requirement-definition`、`frontend-uiux-context`、`core-test-execution` がそれに次ぎます。1つ目は関所1を支え、2つ目は UI 生成器と UI 監査の両方が読む context ファイルを作り、3つ目は「落ちているスイート」がテストを緩めることで直されない理由です。

---

## スキルが見つからないとき

接頭辞が何にも解決しないことがあります — パッケージが改名した、削除した、あるいはまだ配備されていない。

**そう言って、それ無しで続けてください。推測で代用しないでください。**

| | 理由 |
|---|---|
| 見つからなかったスキル | **名前を挙げて報告する。** 規約無しで走った関所は、何とも突き合わせていない成果物を生んでいます |
| 欠けた手順をその場で作る | **駄目です。** それは写し問題を、元より雑に、新規に作り直す行為です |
| `/hora-setup` | 配備時点で「後の関所が探して見つけられないもの」を報告します。必要になった瞬間より、その時点で知る方が良いためです |
| `/hora-accept` | その実行の記録に欠落として残します。**手順が欠けた実行は「注釈付きの合格」ではありません** — 部分的な実行であり、記録がそう言わなければなりません |

---

## 次に読むもの

| | |
|---|---|
| 権威ある「関所 → スキル」対応 | [`checkpoints.md`](../.claude/skills/hora-build/references/checkpoints.md) |
| 境界の規則としての記述 | [`structure.md`](../.claude/skills/hora/references/structure.md) の "The division of labor" |
| なぜこの設計なのか | [`architecture.ja.md`](./architecture.ja.md) |
| 各コマンドが何をしているか | [`commands.ja.md`](./commands.ja.md) |
