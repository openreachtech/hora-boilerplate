<!-- English: [writing-style.md](./writing-style.md) — 片方を直したら、同じコミットでもう片方も直してください -->

# hora スキルの書き方

両 hora パッケージが配る全ファイル — skill も agent も — は、エージェントが動く前に実行時に読まれます。**8 文かけて述べた規則は、毎回 8 文ぶんの費用がかかります。**

この文書は、それらのファイルが従う文体です。書き方の話であって、規則の中身の話ではありません。

**ここで書かれるものではありません。** hora の skill と agent は [`hora-core`](https://github.com/openreachtech/hora-core) で、それらの委譲先である手順は、そのドメインのスキルパッケージ [`hora-skills-ort-core`](https://github.com/openreachtech/hora-skills-ort-core)・[`hora-skills-ort-renchan`](https://github.com/openreachtech/hora-skills-ort-renchan)・[`hora-skills-ort-furo`](https://github.com/openreachtech/hora-skills-ort-furo)・[`hora-skills-ort-support`](https://github.com/openreachtech/hora-skills-ort-support) で書かれます。このリポジトリはそれを `.claude/` に受け取るだけです。文体は方法論と同じ場所に置く、という理由でここにあります。

---

## 3つの規則

**1. 規則を述べる。失敗を物語らない。**

規則のあとに「破ったらどうなるか」を 2 段落続けても、規則は 1 つのままです。理由は、それがないと規則を正しく適用できない場合にだけ、1 節で残します。

```
✅ Match on what a description says, never on what a name sounds like.
❌ Match on what a description says, never on what a name sounds like. Two
   skills whose names differ by one word can serve different surfaces
   entirely, and a name that stops matching does not announce itself — the
   gate simply runs without its convention and reports a pass, which is the
   one kind of failure a gate must not have.
```

**2. 一度だけ書き、他は指す。**

規則ごとに所有ファイルを 1 つ決めます。他のファイルは 1 行の参照だけ置きます。これは、これらのファイルが手順について既に述べている規則です。自分たちの散文にも同じく適用します。

**3. 1 文 1 主張。**

2 つめの主張を繋ぐ em ダッシュは、そこで文を切ります。40 語が上限の目安です。

---

## 行レベルでの意味

| | |
|---|---|
| **太字** | 命令・禁止そのものだけ。1 節あたり 1〜2 個 |
| em ダッシュ | 1 文に 1 個まで。2 個目は文の切れ目 |
| 見出し | 6 語以内の名詞句。**他ファイルが引用している見出しは、引用側を直さずに変えない** |
| 相互参照 | 規則 1 つにつき 1 個、文末に置く |
| 否定 | 成り立つことを書く。1 文に否定 2 つを入れない |
| 箴言 | 1 文書に 1 つまで |
| `description:` | 2 文・40 語。何をするか、いつ動くか |

---

## 圧縮しないもの

完全一致で読まれるため、表現を良くすると壊れます。

- `checkpoints.md` の 18 チェックポイント見出し — `/hora-plan` が逐語コピーします
- `_plan.md` の節名: `## Features`, `## Features — adopted as built`, `## Not accepted`, `## Withdrawn`, `## Acceptance`
- 判定の語法: `reach: full`, `reach: scoped`, `passed over <n> of <m> features; <k> not accepted`, `version-criteria:`, `not-accepted:`
- アノテーション記法（`<!-- id: -->`, `<!-- built: -->`, `<!-- baseline: inventoried -->` ほか）と質問カテゴリ名
- 番号付き手順ブロック — 順序が内容そのものです
- `hora-build/SKILL.md` の生成ファイル用バナー
- frontmatter の `name:` と `tools:`

---

## 論拠の置き場所

`docs/` が、設計を人に説明する場所です（[architecture](./architecture.ja.md)、[skills](./skills.ja.md)、[adopting](./adopting.ja.md)）。実行時には誰も読まないので、論拠を置いても費用はかかりません。スキルファイルに置くと、毎回かかります。
