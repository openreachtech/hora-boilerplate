# hora-boilerplate

`/hora` という Claude Code skill が仕様書からアプリケーションを実装する、テンプレートリポジトリです。

## コンセプト

このテンプレートから作るプロジェクトは、複数の git リポジトリが入れ子になった構成を取ります。外側のリポジトリ（このリポジトリ。`<myproject>-app` として clone する）が仕様書と `/hora` skill を持ち、アプリケーションの実装コードは持ちません。`/hora` が `renchan-boilerplate` と `furo-boilerplate-nuxt` から backend / frontend のリポジトリをその内側に clone し、仕様書を読んで実装します。

`/hora` は再入可能です。実行のたびに前回どこまで進んだかを判定し、続きから進めます。仕様書に決まっていないことがあれば、そこで止まって尋ねます。1回の実行でプロジェクトが完成する前提ではなく、何度でも開始・再開されることを前提にしています。

段ごとの詳細・全ての規則は [`.claude/skills/hora/SKILL.md`](./.claude/skills/hora/SKILL.md) にあります。この README は始め方だけを扱います。

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

[`references/spec-template.md`](./.claude/skills/hora/references/spec-template.md) を雛形に `specs/1.0.0/spec.md` を書く

### 3. `/hora` を実行する

`/hora` はボイラープレートを取得し、仕様書からタスクを抽出し、決まっていないことがあれば尋ね、実装し、機械的に検証します。答えが要るところで自ら止まるので、`specs/` を編集して `/hora` を再実行すれば続きが進みます。

## 継続的インテグレーション

`.github/workflows/` 配下のワークフローは、GitHub の `ubuntu-latest` ではなく `light` というラベルのセルフホストランナーで動きます。`<myproject>-app` は private リポジトリになることが多く、GitHub がホストするランナーだと実行のたびに課金されてしまうためです。**プルリクエストを送る前に、`light` ラベルを持つセルフホストランナーを自分で用意してください。** 用意しないと、これらのワークフローはキューされたまま実行されません。

用意できない場合は、`runs-on` を自分で書き換えず、`specs/<version>/spec.md` にその旨を記載してください。

## 使い方

```
第0段    ボイラープレートを取得し、案件用の値を埋める
第0.5段  clone した中身を実地に読む
第1段    仕様書からタスクを抽出・構造化
第1.5段  問診。仕様書に決まっていないことがあれば止まる
第2段    未完了タスクを実装
第3段    機械による検証（test / lint）
```

各段が実際に何をするかは [`.claude/skills/hora/SKILL.md`](./.claude/skills/hora/SKILL.md) を参照してください。

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
