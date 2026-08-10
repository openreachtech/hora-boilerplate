# hora-boilerplate

`/hora` という Claude Code skill が仕様書からアプリケーションを実装する、テンプレートリポジトリです。

## コンセプト

このテンプレートから作るプロジェクトは、複数の git リポジトリが入れ子になった構成を取ります。外側のリポジトリ（このリポジトリ。`<myproject>-app` として clone する）が仕様書と `/hora` skill を持ち、アプリケーションの実装コードは持ちません。`/hora` が `renchan-boilerplate` と `furo-boilerplate-nuxt` から backend / frontend のリポジトリをその内側に clone し、仕様書を読んで実装します。

`/hora` は再入可能です。実行のたびに前回どこまで進んだかを判定し、続きから進めます。仕様書に決まっていないことがあれば、そこで止まって尋ねます。1回の実行でプロジェクトが完成する前提ではなく、何度でも開始・再開されることを前提にしています。

**進め方はレイヤ単位ではなく機能単位です。** 1つの機能を18のチェックポイント（仕様 → バックエンド → フロントエンド → 検収）で通し切ってから、次の機能に進みます。これが避けているのは「バックエンドを全部作り、フロントエンドを全部作り、最後にテストする」という順序です。その順序では、ある機能が動くかどうかが分かるのは全部書き終えた後になります。

各フェーズの詳細・全ての規則は [`.claude/skills/hora/SKILL.md`](./.claude/skills/hora/SKILL.md) にあります。この README は始め方だけを扱います。

## 始め方

### 1. `<myproject>-app` を作る

**推奨: このリポジトリを GitHub のテンプレートとして使う。** このリポジトリの GitHub ページで **Use this template → Create a new repository** を選び、新しいリポジトリ名を `<myproject>-app` にしてください。GitHub は単一の新規コミットで開始するので、このテンプレート自身のコミット履歴は引き継がれません。

**GitHub のテンプレート機能を使えない場合**は、clone した上で、何かを書き込む前に自分で履歴を捨ててください。

```sh
git clone https://github.com/openreachtech/hora-boilerplate.git <myproject>-app
cd <myproject>-app
rm -rf .git
git init
```

`specs/` を書く前に行ってください。リポジトリに自分のコミットができた後で `.git` を捨てると、それも一緒に失われます。

### 2. 仕様書を書く

[`spec-skeleton.md`](./.claude/skills/hora/references/spec-skeleton.md) を `specs/1.0.0/spec.md` にコピーして埋めてください。見出しと表のヘッダだけの空の仕様書です。

隣にある [`spec-template.md`](./.claude/skills/hora/references/spec-template.md) は書式の説明です。各節が何のためにあるか、どれが必須か、何があると `/hora` が止まって尋ねるかが書かれています。**説明はそちらを読み、埋めるのは前者**という分担です。

### 3. `/hora` を実行する

`/hora` はボイラープレートを取得し、対話しながら版の計画を立て、機能を1つずつ実装して検収します。答えが要るところで自ら止まります。プランナーはその場で尋ねますが、その場で答えられないものは `.hora/questions/` に書き出されるので、`specs/` を編集して `/hora` を再実行してください。

## 継続的インテグレーション

`.github/workflows/` 配下のワークフローは、GitHub の `ubuntu-latest` ではなく `light` というラベルのセルフホストランナーで動きます。`<myproject>-app` は private リポジトリになることが多く、GitHub がホストするランナーだと実行のたびに課金されてしまうためです。**プルリクエストを送る前に、`light` ラベルを持つセルフホストランナーを自分で用意してください。** 用意しないと、これらのワークフローはキューされたまま実行されません。

用意できない場合は、`runs-on` を自分で書き換えず、`specs/<version>/spec.md` にその旨を記載してください。

## 使い方

`/hora` はオーケストレーターです。実際の作業は4つの SKILL が行います。

| SKILL | 役割 | 実行単位 |
|---|---|---|
| [`/hora-setup`](./.claude/skills/hora-setup/SKILL.md) | 仕様書が宣言したボイラープレートを取得し、案件用の値を埋め、実地に読む | 版ごとに1回 |
| [`/hora-plan`](./.claude/skills/hora-plan/SKILL.md) | 版を確定し、対話しながら仕様を検証し、機能一覧を作る | 版ごとに1回 |
| [`/hora-build`](./.claude/skills/hora-build/SKILL.md) | 1つの機能を18のチェックポイントで通す | 機能ごとに1回 |
| [`/hora-accept`](./.claude/skills/hora-accept/SKILL.md) | その時点で実装済みの全機能に対して受入テストを実施する | 各機能の最終チェックポイント、および版全体の掃引 |

```
/hora-setup ──> /hora-plan ──┬─> /hora-build 機能A ─> /hora-accept ─┐
                             ├─> /hora-build 機能B ─> /hora-accept ─┤
                             └─> /hora-build 機能C ─> /hora-accept ─┴─> 全体掃引 ─> merge
```

18のチェックポイントは [`checkpoints.md`](./.claude/skills/hora-build/references/checkpoints.md) にあります。仕様、想定ユースケース、DB / API スキーマ、stub API、実装に必要なモジュール、actual API、worker、セキュリティ検証、そしてフロントエンド、最後に検収です。

**Hora Kit が持つのは「順序」と「関所」だけで、「やり方」は持ちません。** resolver / migration / コンポーネント / テストの書き方も、受入レビューが何を見るかも、すべて [`@openreachtech/ai-agent-skills`](https://github.com/openreachtech/ai-agent-skills) にあります。`/hora-setup` がこのリポジトリの `.claude/skills/` に配置します。

## コントリビューション

バグ報告・機能要望・コード貢献を歓迎します。

GitHub Issues からお気軽にご連絡ください。

```sh
git clone https://github.com/openreachtech/hora-boilerplate.git
cd hora-boilerplate
npm install
npm run lint
```

## ライセンス

本プロジェクトは Apache License 2.0 で公開されています。

詳細は [LICENSE ファイル](./LICENSE) を参照してください。

## 開発者

[Open Reach Tech Inc.](https://openreach.tech)

## 著作権

© 2026 Open Reach Tech Inc.
