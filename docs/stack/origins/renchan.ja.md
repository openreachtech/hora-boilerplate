<!-- English: [renchan.md](./renchan.md) — 片方を直したら、同じコミットでもう片方も直してください -->

# Origin `renchan` — backend リポジトリ

*[English](./renchan.md)*

宣言された origin が `renchan` の行についてリポジトリを作り初期化するために、`/hora-setup` が知る必要のあること。git の扱いそのもの — 最新タグの取得、履歴の破棄、リポジトリがどのブランチで始まるか — は kit 自身のもので、ここには書き直しません。

## どこから来るか

```
https://github.com/openreachtech/renchan-boilerplate.git
```

**最新タグを取得する。`main` の HEAD は決して取らない。** バージョンが管理の単位なので、リリースされた状態を取ります:

```bash
git ls-remote --tags --sort=-v:refname \
  https://github.com/openreachtech/renchan-boilerplate.git | head -5
```

boilerplate は `package.json` の `version` を `0.0.0` のままにし、本当のバージョンを git タグで管理しています。`release.yml` は導出したバージョンを、`package.json` に対してではなく、push 済みのタグに対して検査します。**バージョンを運ぶのはタグです。**

**リポジトリは現在プライベート**なので、人間が事前にクローンしておかない限り、非対話セッション自身の `git clone` は認証情報が無く失敗します。すでに存在するディレクトリは、どんな経緯であれ、取得済みとして扱われます。

### スタックの概観

実物の木を読む前の目安 — 規約の記述では**ありません**:

| | 主な依存 |
|---|---|
| backend | express / graphql-http / graphql-ws / @graphql-tools/* / sequelize / mariadb / ioredis / pm2 |

**ミドルウェアを使うのは backend だけです。** 横で動くものは [`../middleware.md`](../middleware.md) を見てください。

## 何を埋めるか

### `package.json` — `name` と `description`

boilerplate は `"name": "TODO: fulfill here ❌️"` の状態で届きます。

```json
{
  "name": "<myproject>-backend",
  "description": "<spec から書き起こした 1 行の説明>"
}
```

**`"version": "0.0.0"` と `"private": true` はそのまま残します。** バージョンはタグが運び、`private` は誤 publish を防ぎます。

### `.env.development`

boilerplate の `.env.development` は**キーのみ・値は空**で届きます。値は `docker-compose.development.yml`(下記)と CI(`test-with-mariadb.yml`)に一致させます:

```
DATABASE_NAME=development
DATABASE_USERNAME=user
DATABASE_PASSWORD=password
DATABASE_DIALECT=mysql
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
```

**実物の boilerplate が持ってくるキーに従うこと — 上記は目安です。** 同じ実行が compose ファイルと `.env.development` の両方を書くので、両者は構造的に一致が保証されます。

## 何を置くか

**boilerplate は起動スクリプト(`db:setup` / `db:seed:dev` / `db:refresh` / `dev`)を同梱していますが、docker / compose ファイルはありません — 足りないのはミドルウェアです。** 2 つのファイルを backend リポジトリ自身、その `.env.development` の隣に置きます。親には置きません: backend は独立したリポジトリで、誰かが単体でクローンし、親なしで作業するからです。

**すでに存在するファイルは決して上書きしない。** Hora Kit に採用されたリポジトリは、そのプロジェクトに調整された docker 一式を持っていることがとても多い。そのまま残し、どのプロファイルを提供しているかを読み、spec の手動確認表との差分を報告します。

### `docker.sh`

```bash
#!/bin/bash

# Bring the local middleware up or down for manual verification.
#
#   ./docker.sh start
#   ./docker.sh stop

COMPOSE_FILE='docker-compose.development.yml'
ENV_FILE='.env.development'

case "$1" in
  start)
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --wait
    ;;
  stop)
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down
    ;;
  *)
    echo 'Usage: ./docker.sh start|stop' >&2
    exit 1
    ;;
esac
```

動詞は `start` / `stop` で、Docker の `up` / `down` ではありません。`--wait` はヘルスチェックを待つので、直後の `db:refresh` が起動途中で失敗しません。

**`--env-file` は明示的に `.env.development` を指します。** Compose の既定は `.env` を読みますが、`.env` は本番以外で触りません。

`compose.yaml` という名前にはしません。**名前がツールを名乗ってはいけない** — 既存のファイルはどれも自分の名を名乗っています(`eslint.config.js` / `jest.config.js` / `pm2.config.cjs`)。npm script でもありません: `.sh` は `npm install` の前でも動きます。

### `docker-compose.development.yml` — 全部入り・既定はオフ(`profiles`)

必要なものが**すでに書かれている**状態にして、イメージ名・バージョン・環境変数を二度と調べ直さなくて済むようにします。**コメントアウトではなく `profiles`** を使います。

| | コメントアウト | `profiles` |
|---|---|---|
| YAML として検証される | ❌ | ✅ `docker compose config` が通る |
| 有効化 | ファイルを編集 | 環境変数かフラグ |
| 実行がすべきこと | 行を探してコメントを外す | `.env.development` に 1 行 |

```
既定(プロファイルなし)   mariadb / redis
profiles                  elasticsearch / kafka / qdrant / minio
```

**Redis は Job 規約が乗るキューの必須依存**([`../middleware.md`](../middleware.md))なので、Job のあるプロジェクトは落とせません。

**値は直接書き込む。`.env` を参照しない。** `.env` は gitignore されており、クローン直後には存在しないことが保証されているので、参照した値は空になります。ホストは localhost に、ポートは固定します。

**すべてのポートを `127.0.0.1` で公開する。** `'3306:3306'` はマシンの全インターフェースに bind するので、パスワードが `password` のデータベースが、ラップトップの繋がったネットワーク — カフェやコワーキングの LAN — から到達可能になります。`'127.0.0.1:3306:3306'` はこのマシンにだけ届き、アプリケーションもツーリングも CI もどのみち loopback で接続します。プロファイルで有効化するすべてのサービスにも同じことが言えます。

```yaml
services:
  mariadb:
    image: mariadb:10.5.12          # CI と同じバージョン
    ports:
      - '127.0.0.1:3306:3306'   # loopback のみ: 全インターフェースには決してしない
    environment:
      MYSQL_USER: user
      MYSQL_PASSWORD: password
      MYSQL_DATABASE: development   # ファイル名と NODE_ENV に一致。CI の実物とは混ざらない
      MYSQL_ROOT_PASSWORD: password
```

spec の手動確認セクションに書かれたバージョン、つまり CI の `test-with-mariadb.yml` と一致するものを使います。**ローカルで通って CI で落ちる事態を避けます。**

### `.env.development` の `COMPOSE_PROFILES`

どのプロファイルを有効にするかは spec の手動確認セクションから決めます。

```
COMPOSE_PROFILES=minio
```

オブジェクトストレージを使う → `minio` を有効化。検索基盤が「今回は導入しない」→ `elasticsearch` はオフのまま。

**`.env` には決して書かない。** `docker compose config` を実行して `COMPOSE_PROFILES` が効いていることを確認し、結果を報告します。効かない場合は、`docker.sh` をプロファイルを引数に取る形へ変えます。

### `npm install`

値を埋め終わったリポジトリで実行します。

**`@openreachtech/hora-ecosystem` はこのリポジトリの `package.json` には入れません。** 親の devDependencies に 1 エントリあれば十分 — どちら側を実装していてもカタログは親から読めます。このリポジトリは独立した git リポジトリで、単体のチェックアウトに親の `node_modules` はありません: **カタログは開発のための参照資料であって、プロダクトの依存ではありません。**

## その行へコピーするスキル

| スキル | コピーする理由 |
|---|---|
| `hor-bank-id` | このリポジトリ内で排他的な行 id プレフィックスを割り当てる。backend で直接作業するセッションから呼び出せ、安全に編集もできる必要がある — だから行自身の `.claude/skills/` に置く |

```bash
cp -r .claude/skills/hor-bank-id <myproject>-backend/.claude/skills/hor-bank-id
```

**既存のコピーは決して上書きしない** — コピー先が存在するならこのコピー自体を丸ごとスキップします。人間が自分の backend リポジトリの中でカスタマイズしているかもしれません。

## 届いたら何を読むか

木そのものが権威です — このハンドブックのどの記述も木を上書きしません。`CLAUDE.md` があればまずそれを読みます。その上で、最低限、次を掴みます:

```
ディレクトリ構成          何がどこに置かれるか
サーバーの分かれ方        複数サーバーがどう分離されているか。エントリポイントと pm2 設定
命名規約                  クラス・ファイル・テーブルがどう名付けられるか
テストの書かれ方          配置、命名、ヘルパー、モックのスタイル
既存の GraphQL スキーマ   SDL がどう書かれているか
登録のされ方              ディレクトリ走査で自動か、追記する集約ファイルがあるか
既存のモデル定義          sequelize がどう使われ、マイグレーションとどう対応するか
npm scripts               test / lint / db コマンドの名前
ローカル E2E 環境         同梱されているか(`e2e/docker/` スタックと up/seed/clean スクリプト)
```

**「登録のされ方」は特に注意に値します。** 登録がディレクトリ走査で自動なら、実装は自分のファイルを置くだけでよく、集約ファイル問題は丸ごと消えます。追記が必要なら、複数のチェックポイントが同じ 1 箇所を触ることになります。**確認する価値が最も高い項目です。**

## 上流にまだ無いもの

気づいたことは報告する。上流を書き換えることは決してしない。

| 無いもの | 代替 |
|---|---|
| `CLAUDE.md` | 代わりに木をその場で読む |
| `docker.sh` / `docker-compose.development.yml` | 上記のとおり、セットアップの実行が置く |

`CLAUDE.md` の正しい置き場所は boilerplate 自身のリポジトリです。**`CLAUDE.md` ができた後も、実物の木を読むことは残ります** — 実物はどんな仮定よりも優先されます。
