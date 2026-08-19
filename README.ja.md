# hora-boilerplate

`/hora` という Claude Code skill が仕様書からアプリケーションを実装する、テンプレートリポジトリです。

## コンセプト

このテンプレートから作るプロジェクトは、複数の git リポジトリが入れ子になった構成を取ります。外側のリポジトリ（このリポジトリ。`<myproject>-app` として clone する）が仕様書と `/hora` skill を持ち、アプリケーションの実装コードは持ちません。`/hora` が `renchan-boilerplate` と `furo-boilerplate-nuxt` から backend / frontend のリポジトリをその内側に clone し、仕様書を読んで実装します。

`/hora` は再入可能です。実行のたびに前回どこまで進んだかを判定し、続きから進めます。仕様書に決まっていないことがあれば、そこで止まって尋ねます。1回の実行でプロジェクトが完成する前提ではなく、何度でも開始・再開されることを前提にしています。

**進め方はレイヤ単位ではなく機能単位です。** 1つの機能を18のチェックポイント（仕様 → バックエンド → フロントエンド → 検収）で通し切ってから、次の機能に進みます。これが避けているのは「バックエンドを全部作り、フロントエンドを全部作り、最後にテストする」という順序です。その順序では、ある機能が動くかどうかが分かるのは全部書き終えた後になります。

この README は始め方だけを扱います。**ドキュメントは [`docs/`](./docs/) にあります** — タスク実行アーキテクチャ、各コマンドの解説、利用しているスキルの解説、そして既存プロジェクトへの適用方法です。

## 始め方

**新規ではなく、既存の renchan / furo プロジェクトに適用する場合**は [`docs/adopting.ja.md`](./docs/adopting.ja.md) へ。手順1から異なり、最初に決めるのは「実装と仕様のどちらが正か」です — **`as-built`** は今動いているものを版として固定し、質問は数個と検収掃引1回で済みます。**`to-spec`** は作りかけのコードを仕様まで届かせます。

### 0. 必要なもの

| | |
|---|---|
| **Claude Code** | skill はここで動きます |
| **Node と npm** | このリポジトリ自身の `npm install` 用。これがスキルを配置します。両 hora パッケージが宣言する下限に合わせ、Node 20 以降 |
| **ボイラープレートへのアクセス権** | `renchan-boilerplate` と `furo-boilerplate-nuxt` は現在 private で、非対話セッションには認証を通す端末がありません。**認証情報を設定するか、`/hora` を走らせる前にご自身で clone しておいてください** — 既にあるディレクトリは、そのまま扱って先に進みます |
| **CI 用のランナー** | プルリクエストを送る前だけ。既定は `light` ラベルのセルフホストランナーで、GitHub がホストするランナーに切り替える場合は自分で書き換えます。[継続的インテグレーション](#継続的インテグレーション)を参照 |

### 1. `<myproject>-app` を作る

**推奨: このリポジトリを GitHub のテンプレートとして使う。** このリポジトリの GitHub ページで **Use this template → Create a new repository** を選び、新しいリポジトリ名を `<myproject>-app` にしてください。GitHub は単一の新規コミットで開始するので、このテンプレート自身のコミット履歴は引き継がれません。

**GitHub のテンプレート機能を使えない場合**は、clone した上で、何かを書き込む前に自分で履歴を捨ててください。

```sh
git clone https://github.com/openreachtech/hora-boilerplate.git <myproject>-app
cd <myproject>-app
rm -rf .git
git init
npm install
```

`specs/` を書く前に行ってください。リポジトリに自分のコミットができた後で `.git` を捨てると、それも一緒に失われます。

**どちらの経路でも、`/hora` の前に新しいリポジトリで `npm install` を実行してください。実行しなければ、走らせる `/hora` がそもそも存在しません。** このリポジトリは skill も agent も自分では持ちません。`/hora` とそれが指揮する5つの skill は [`@openreachtech/hora`](https://github.com/openreachtech/hora-core) から、それらが委譲する手順は [`@openreachtech/hora-skills`](https://github.com/openreachtech/hora-skills) から来て、`postinstall` フックが両方を `.claude/` に配置します。clone 直後の `.claude/` は、それが走るまで空です。

3つ目のパッケージ `@openreachtech/hora-ecosystem` は、関所5が「新しく書く前に」確認するカタログです。どこにも配置されず、npm が置いた場所で読まれます。

### 2. 仕様書を書く

```
/hora-spec
```

**`/hora-spec` が対話しながら書きます。** ステージ0で既にあるものを読み、空の仕様書をコピーし、7つのステージを順に進めます — まず想定ユースケース、次にこの版が載せるものと載せないもの、数値（非機能要件）、DB と API の設計、画面、セキュリティ、そして全体レビューです。**各節は書き込む前に全文を提示し、承認されてから書き込みます。** AI 自身が考えた内容は「提案」として明示されます。

**すでに動くコードがあるプロジェクトでは、それを口述させられることはありません。** ステージ0がリポジトリと、あなたが指し示した文書を読み、そこに現れているものを草案に起こし、訂正できる形で返します — **「こう読み取りました。合っていますか」という確認としてであって、AI が決めた要件としてではありません。** 読んでも決まらないもの — その機能が誰のためか、本来誰がその操作を呼べるべきか、どこまでが完成か — は、材料を並べた上で何も推奨せずに尋ねられます。回答は可能な限り選択肢として提示されるので、**書き起こすより直すほうがはるかに多くなります。**

**既存の文書がある場合は、実行前に入れておいてください。** 仕様**そのもの**（要件定義、API リファレンス）は `specs/1.0.0/sources/` へ、仕様を**説明するだけ**のもの（モックアップ、図、古い設計書）は `specs/1.0.0/annex/` へ。どちらも空で同梱済みで、必須ではありません。ステージ0 はファイルごとに尋ねる代わりに、その区別を確認します。詳細は [`docs/adopting.ja.md`](./docs/adopting.ja.md) の手順2 にあります。

**あるのが「欲しいもの」だけなら、それを `specs/1.0.0/request/` に置いてください** — メール、チケット、箇条書き1ページ、あなたの言葉のままで結構です。ステージ0 がこの版の議題として読み、7つのステージが節に起こして、1節ずつ承認を取ります。これも空で同梱済みで、中身がそれ自体で仕様テキストになることはなく、`/hora-plan` は読みません。

手で書く方法も引き続き使えます。同じ書式の同じ文書になります。

```sh
cp specs/skeleton/spec.md specs/1.0.0/spec.md
```

[`specs/skeleton/spec.md`](./specs/skeleton/spec.md) は見出しと表のヘッダだけの空の仕様書です。`specs/skeleton/` は版ではないので、`/hora` が版として読むことはありません。

[`spec-format.md`](./.claude/skills/hora/references/spec-format.md) は書式の説明です。各節が何のためにあるか、どれが必須か、何があると `/hora` が止まって尋ねるかが書かれています。**説明はそちらを読み、埋めるのは前者**という分担です。

### 3. `/hora` を実行する

`/hora` は、その版の仕様書がまだ無ければ先に `/hora-spec` を動かし、続いてボイラープレートを取得し、対話しながら版の計画を立て、機能を1つずつ実装して検収します。答えが要るところで自ら止まります。プランナーはその場で尋ねますが、その場で答えられないものは `.hora/questions/` に書き出されるので、`specs/` を編集して `/hora` を再実行してください。

**通常の利用で打つコマンドは `/hora` だけです。** 各時点で何をしているのか、他の skill を直接呼びたい場合については [`docs/commands.ja.md`](./docs/commands.ja.md) を参照してください。

### 推奨：仕様は対話で、実装は自動執行で

**`/hora-spec` は付き添う価値があります。** 7つのステージはすべて対話で、各節は全文を提示してから承認を得て書き込み、AI 自身の提案が入るのもここです。仕様書が「機能名の一覧」で終わらなくなるのはこの段階であり、ここで注いだ注意が、18の関所が後で建てる土台になります。

**`/hora` 以降は、付きっきりにならずに走らせて構いません。** ボイラープレートの取得、計画、機能を関所に通すこと、検収の実行に、見張りは要りません。それが安全なのは設計のためです — **答えが要る実行は、決めずに止まります。** 対話の関所は人と決着をつけるために在り、サブエージェントに渡されることは決してありません。

| | |
|---|---|
| `/hora-spec` | **付き添う。** 7ステージの対話、節ごとの承認 |
| `/hora-plan` | **質問には付き添う。** 仕様が未決のまま残した所を尋ね、承認された1編集ずつ書く |
| `/hora-setup` / `/hora-build` / `/hora-accept` | **走らせておく。** やったことを報告し、必要になれば止まります |

**「自動執行」は「最後まで無人」ではありません。** その場で誰も答えられない質問は `.hora/questions/` に書き出され、答えるには `specs/` を編集して `/hora` を再実行します。それは失敗ではなく、通常の進み方です。

## 継続的インテグレーション

**`.github/workflows/` 配下のワークフローは、既定では GitHub の `ubuntu-latest` ではなく `light` というラベルのセルフホストランナーで動きます。** `<myproject>-app` は private リポジトリになることが多く、GitHub がホストするランナーだと実行のたびに課金されてしまうためです。プルリクエストを送る前に、`light` ラベルを持つセルフホストランナーを用意してください。用意しないと、これらのワークフローはキューされたまま実行されません。

**GitHub がホストするランナーを使うのも、支持された選択です。そして、それを決めるのはあなたです。** その場合は3つのワークフロー（`lint.yml` / `main-guard.yml` / `release.yml`）の `runs-on` を自分で書き換えてください。

```yaml
    runs-on: [self-hosted, light]   # 既定
    runs-on: ubuntu-latest          # GitHub ホスト。private リポジトリでは実行ごとに課金される
```

そして、その決定を `specs/<version>/spec.md` に記載してください。全員が — そして以後の `/hora` の実行が — ワークフローのファイルから推し量るのではなく、同じ記述を読むためです。

## 使い方

`/hora` はオーケストレーターです。実際の作業は5つの SKILL が行います。

| SKILL | 役割 | 実行単位 |
|---|---|---|
| [`/hora-spec`](./.claude/skills/hora-spec/SKILL.md) | 既にあるものを読んだ上で、版の仕様書を対話しながら7つのステージで書く。1節ずつ承認を取って書き込む | 版ごとに1回 |
| [`/hora-setup`](./.claude/skills/hora-setup/SKILL.md) | 仕様書が宣言したボイラープレートを取得し、案件用の値を埋め、実地に読む | 版ごとに1回 |
| [`/hora-plan`](./.claude/skills/hora-plan/SKILL.md) | 版を確定し、対話しながら仕様を検証し、機能一覧を作る | 版ごとに1回 |
| [`/hora-build`](./.claude/skills/hora-build/SKILL.md) | 1つの機能を18のチェックポイントで通す | 機能ごとに1回 |
| [`/hora-accept`](./.claude/skills/hora-accept/SKILL.md) | その時点で実装済みの全機能に対して受入テストを実施する | 各機能の最終チェックポイント、および版全体の掃引 |

```
/hora-spec ─> /hora-setup ─> /hora-plan ──┬─> /hora-build 機能A ─> /hora-accept ─┐
                                          ├─> /hora-build 機能B ─> /hora-accept ─┤
                                          └─> /hora-build 機能C ─> /hora-accept ─┴─> 全体掃引 ─> merge
```

ステージ0と7つの仕様ステージは [`stages.md`](./.claude/skills/hora-spec/references/stages.md) に、ステージ0が何を読んでよいかは [`investigation.md`](./.claude/skills/hora-spec/references/investigation.md) に、人への尋ね方は [`asking.md`](./.claude/skills/hora/references/asking.md) に、そこで適用される考え方 — ユースケースから始めること、1つの版に機能を詰め込みすぎないこと、ロールで切るかエンドポイントで切るか、同期処理か Worker か、認可を操作ごとに明記すること — は [`principles.md`](./.claude/skills/hora-spec/references/principles.md) にあります。

### 版を出した後に機能を足す

**ここまではすべて1つの版の話です。2つ目の版は、仕様書が差分になるだけで、同じ5つの SKILL を回します。**

```sh
mkdir -p specs/1.1.0/request
$EDITOR specs/1.1.0/request/csv-export.md   # 欲しいものを、自分の言葉で
```

```
/hora-spec       そこから specs/1.1.0/spec.md を起こす — 差分なので、
                 文書情報と新しい機能だけ。他は書かない
/hora            あとはいつもどおり
```

**`specs/1.1.0/spec.md` は 1.0.0 に対する差分です。** この版が変える節だけを書き、それ以外は「書かないこと」によって引き継がれ、**1.0.0 は決して書き換えません**。**空のスケルトンはコピーしません** — 機能を1つ足すだけの文書に、空の見出しが20個並ぶことになるからです。

**ステージは、既に出したものへの同意を取り直しません。** この版が触らない節を持つステージは**引き継ぎ**として通過します — 直前の版の答えを、その文言のまま提示し、確認を取ります。**ステージ6と7だけは、あなたが足すものについて決して引き継ぎません** — 新しい操作は必ず「誰が呼べるか」を述べ、全体レビューは差分ではなく解決後の文書を読みます。

**その前に、そもそも新しい版が要るかを決めてください。** 境界は変更の大きさではなく、**その版がリリース済みかどうか**です。`git tag -l '1.0.0'` が空なら `specs/1.0.0/` を直接編集してよく、版番号も変わりません。リリース済みなら手を触れず、次の版を始めます。新しい版番号の決め方を含む手順全体は [`docs/commands.ja.md`](./docs/commands.ja.md) にあります。

18のチェックポイントは [`checkpoints.md`](./.claude/skills/hora-build/references/checkpoints.md) にあります。仕様、想定ユースケース、DB / API スキーマ、stub API、実装に必要なモジュール、actual API、worker、セキュリティ検証、そしてフロントエンド、最後に検収です。

**Hora Kit が持つのは「順序」と「関所」だけで、「やり方」は持ちません。** resolver / migration / コンポーネント / テストの書き方も、受入レビューが何を見るかも、すべて [`@openreachtech/hora-skills`](https://github.com/openreachtech/hora-skills) にあります。`npm install` がこのリポジトリの `.claude/skills/` に配置します。詳しくは [`docs/skills.ja.md`](./docs/skills.ja.md) を参照してください。

## ドキュメント

| | |
|---|---|
| [`docs/architecture.ja.md`](./docs/architecture.ja.md) | **タスク実行アーキテクチャ。** 2部構成、図つき。`/hora`：4つの層、何がどこで動くか、状態モデル、再入可能性、git モデル、なぜ直列なのか。`/hora-spec`：既にあるものを読むこと、7つのステージ、なぜその全部が対話なのか、承認の仕組み |
| [`docs/commands.ja.md`](./docs/commands.ja.md) | **各コマンドの解説。** 読むもの / 書くもの / 止まる条件 / 単独実行。加えて実際のセッションの見え方 |
| [`docs/skills.ja.md`](./docs/skills.ja.md) | **利用しているスキルの解説。** なぜ Hora Kit は手順を持たないのか、スキルはどう配られるのか、パッケージが覆う範囲 |
| [`docs/adopting.ja.md`](./docs/adopting.ja.md) | **既存プロジェクトへの適用。** 動くコードを持つ renchan バックエンドと furo フロントエンドに被せる |
| [`about-boilerplate.md`](./about-boilerplate.md) | **このテンプレート自身の版の記録** — プロジェクトがどの hora-boilerplate から始まったか。製品の版ではありません。製品の版は git タグが持ちます |

規則そのものは、それを所有する skill 側にあります：[`hora/SKILL.md`](./.claude/skills/hora/SKILL.md)、[`structure.md`](./.claude/skills/hora/references/structure.md)、[`commits.md`](./.claude/skills/hora/references/commits.md)、[`done-criteria.md`](./.claude/skills/hora/references/done-criteria.md)、[`spec-format.md`](./.claude/skills/hora/references/spec-format.md)、[`stages.md`](./.claude/skills/hora-spec/references/stages.md)、[`principles.md`](./.claude/skills/hora-spec/references/principles.md)、[`checkpoints.md`](./.claude/skills/hora-build/references/checkpoints.md)。

## コントリビューション

バグ報告・機能要望・コード貢献を歓迎します。

GitHub Issues からお気軽にご連絡ください。

```sh
git clone https://github.com/openreachtech/hora-boilerplate.git
cd hora-boilerplate
npm install
npm run lint
```

**`docs/` 配下は全てペアです** — `x.md` と `x.ja.md`。片方を直したら、同じコミットでもう片方も直してください。同じことを言う文書が2つあれば、片方だけ更新された瞬間に食い違い、しかも古い方も権威ある文面のままです。

**`.claude/` 配下の skill は英語のみです。** 読み手が言語を選ぶ文書ではなく、Claude Code が読む文書だからです。

## ライセンス

本プロジェクトは Apache License 2.0 で公開されています。

詳細は [LICENSE ファイル](./LICENSE) を参照してください。

## 開発者

[Open Reach Tech Inc.](https://openreach.tech)

## 著作権

© 2026 Open Reach Tech Inc.
