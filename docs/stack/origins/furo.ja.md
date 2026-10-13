<!-- English: [furo.md](./furo.md) — 片方を直したら、同じコミットでもう片方も直してください -->

# Origin `furo` — frontend リポジトリ

*[English](./furo.md)*

宣言された origin が `furo` の行についてリポジトリを作り初期化するために、`/hora-setup` が知る必要のあること。git の扱いそのもの — 最新タグの取得、履歴の破棄、リポジトリがどのブランチで始まるか — は kit 自身のもので、ここには書き直しません。

## どこから来るか

```
https://github.com/openreachtech/furo-boilerplate-nuxt.git
```

**最新タグを取得する。`main` の HEAD は決して取らない** — [`renchan.md`](./renchan.ja.md) と同じ規則、同じ理由です: バージョンを運ぶのはタグです。

**取得するのはタグの木で、クローンは決してしない** — これも [`renchan.md`](./renchan.ja.md) と同じで、理由も同じです:

```bash
curl -fsSL https://codeload.github.com/openreachtech/furo-boilerplate-nuxt/tar.gz/refs/tags/<tag> \
  | tar -xz --strip-components 1 -C <dir>
```

**リポジトリは公開されている**ので、認証情報なしで取得できます。すでに存在するディレクトリは、どんな経緯であれ、取得済みとして扱われます。

**origin が `furo` の行はしばしば複数あります。** 1 リポジトリが持てる Nuxt アプリは 1 つなので、リポジトリは画面のグループごとに分かれます — 宣言された行ごとに 1 つ取得します。

### スタックの概観

実物の木を読む前の目安 — 規約の記述では**ありません**:

| | 主な依存 |
|---|---|
| frontend | nuxt / vue / @openreachtech/furo-nuxt / core-js |

**frontend は DB クライアントも Redis クライアントも持ちません。** ミドルウェアを使わないので、[`../middleware.md`](../middleware.ja.md) の表のものは横で動かず、docker ファイルも置きません。

## backend への届き方

**furo の client は、どの request も `multipart/form-data` で送ります** — GraphQL も RESTful API も、ファイルを添えるかどうかにかかわらず同じです。`@openreachtech/furo` は本文を `FormData` で組み、GraphQL の operation は JSON にして `operations` の欄に入れます。なので、呼ばれる backend は、upload に限らず、すべての operation で multipart を受け付ける必要があります（[`renchan.md`](./renchan.ja.md) の「frontend が前提にしていること」）。

**この frontend のために backend を呼んで確かめるときも、同じ送り方で送ります。** JSON で書いた request は、furo の client が届かない backend にも届いてしまいます。

## 何を埋めるか

### `package.json` — `name` と `description`

boilerplate は backend と同じプレースホルダーの状態で届きます。

```json
{
  "name": "<myproject>-frontend-<purpose>",
  "description": "<spec から書き起こした 1 行の説明>"
}
```

**`"version": "0.0.0"` と `"private": true` はそのまま残します。**

### `.furo-env.development` のエンドポイント

boilerplate は、エンドポイントのキーを 3 つ持つ `.furo-env.example` を同梱しています:

```
ENDPOINT_URL = http://localhost:3900/graphql-customer
WEBSOCKET_URL = ws://localhost:3900/graphql-customer

RENCHAN_RESTFUL_API_BASE_URL = http://localhost:8001
```

**`.furo-env.example` を `.furo-env.development` にコピーし、各キーをこの row が呼ぶ backend のサーバーに向けます。** frontend は env ファイルを `NODE_ENV` で選び、その既定は development なので、ローカルの実行が読むのは `.furo-env.development` です。`.furo-env` は本番用のファイルで、ローカルの値の置き場ではありません。手を付けずに残します。`.furo-env.development` がすでにあれば、そのままにします。

| キー | 値 |
|---|---|
| `ENDPOINT_URL` | spec のサーバー表で `consumer` がこの row を指す GraphQL サーバーの `http://localhost:<port><path>` |
| `WEBSOCKET_URL` | `ENDPOINT_URL` と同じホスト・ポート・パスで、スキームを `ws` にしたもの |
| `RENCHAN_RESTFUL_API_BASE_URL` | `consumer` がこの row を指す RESTful API サーバーの `http://localhost:<port>`。そのようなサーバーが無ければ、同梱の値のままにします |

**ポートとパスは、backend の row の木そのものから読みます。このハンドブックからは読みません。** どのサーバーがどのポートで待ち受けるかは backend のサーバーのエントリポイントに、各 GraphQL サーバーのパスはそのエンジンに書かれています（[`renchan.md`](./renchan.ja.md) の「届いたら何を読むか」の「サーバーの分かれ方」）。同梱の値は backend の boilerplate のサーバーの 1 つに合わせてあるので、ほかのサーバーを呼ぶ row には別の値が要ります。

**このファイルは、backend の row がディスクに届いてから埋めます。** レイアウトがこの row を backend の row より先に挙げているなら、同じ実行の中で、backend の row を取ってきた後にこの row へ戻ります。`consumer` がこの row を指す GraphQL サーバーが 1 つも無いか 2 つ以上あるときは、**止めて尋ねます。**ファイルが持つ `ENDPOINT_URL` は 1 つなので、1 つの row が呼ぶ GraphQL サーバーは 1 つです。

**値のコミットにはこのファイルを含めません。** boilerplate は `.furo-env.development` を除外している（下記）ので、`git add` はこのパスを受け付けず、値はマシンの上に留まります。

### どの env ファイルをコミットするか

**frontend は、開発用の値をコミットしません — backend とは違います。** `furo-boilerplate-nuxt` は `.furo-env` と `.furo-env.development` を除外し、追跡するのはテンプレートの `.furo-env.example` と、テスト用の `.furo-env.test` だけです。boilerplate が持ってくる分け方のままにします。frontend の開発用の値はマシンの上に留まり、backend のローカルの値はコミットされます（[`renchan.md`](./renchan.ja.md) の「どの env ファイルをコミットするか」）。

### `npm install`

値を埋め終わったリポジトリで実行します。backend と同様、**`@openreachtech/hora-ecosystem` はこのリポジトリの `package.json` には入れません** — カタログは親の devDependency で、プロダクトの依存ではなく参照資料です。

## 何を置くか

何も置きません。frontend はミドルウェアを使わず、それ以外に必要なものは boilerplate がすべて同梱しています。

## 届いたら何を読むか

木そのものが権威です — このハンドブックのどの記述も木を上書きしません。`CLAUDE.md` があればまずそれを読みます。その上で、最低限、次を掴みます:

```
ディレクトリ構成          ページ・コンポーネント・モジュールがどこに置かれるか
命名規約                  コンポーネント・クラス・ファイルがどう名付けられるか
テストの書かれ方          配置、命名、ヘルパー、モックのスタイル
コンポーネントライブラリ  どのコンポーネントが既にあり、どう組み立てられるか
コンテキストパターン      状態がどう共有され、画面がどう API クライアントに届くか
登録のされ方              ページ・ルート・ロケールのエントリがどう有効になるか —
                          ディレクトリ走査で自動か、追記するファイルがあるか
npm scripts               dev / test / lint コマンドの名前
```

**「登録のされ方」は backend と同じだけ注意に値します** — 自動登録なら集約ファイル問題は丸ごと消え、追記が必要なら複数のチェックポイントが同じ 1 箇所を触ります。

## 環境に何が要るか

| 要るもの | 確認 — 何も変えない | 満たすコマンド |
|---|---|---|
| Playwright が起動する browser build | `node -e "process.exit(require('fs').existsSync(require('playwright').chromium.executablePath()) ? 0 : 1)"` | `npm run e2e:browser` |

**sweep の live pass は、headless の Playwright でこの frontend を操作します。** browser build がなければまったく走れず、受け入れは `lacked-environment` で止まります。環境が立ち上がらないときと同じです。

**`npm run e2e:browser` は、プロジェクトの外に書き込みます。** Chromium を、マシン全体で共有する cache に、マシンにつき 1 回取得するので、書き込みをプロジェクトの中に限るガードに拒まれることがあります。だから、許可できる人がいるうちに、早めに流します。

## 上流にまだ無いもの

気づいたことは報告する。上流を書き換えることは決してしない。

| 無いもの | 代替 |
|---|---|
| `CLAUDE.md` | 代わりに木をその場で読む |

`CLAUDE.md` の正しい置き場所は boilerplate 自身のリポジトリです。**`CLAUDE.md` ができた後も、実物の木を読むことは残ります** — 実物はどんな仮定よりも優先されます。
