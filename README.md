# AIプロンプト作成代行サービス - セットアップガイド

このガイドを上から順に読んで作業すれば、すべて無料で公開できます。

\---

## 📋 システム構成の概要

```
顧客がWebサイトにアクセス
        ↓
index.html（GitHub Pages で公開）
        ↓（氏名・メール入力）
Stripe 決済ページ
        ↓（決済完了）
success.html
        ↓（自動でデータ送信）
Google Apps Script
        ↓               ↓
Google Sheets      自動返信メール
（顧客情報記録）    （Gmailから送信）
```

\---

## ✅ STEP 1: GitHub アカウント作成

> すでにアカウントをお持ちの方はスキップしてください。

1. [https://github.com](https://github.com) を開く
2. 右上の「**Sign up**」をクリック
3. メールアドレス・パスワード・ユーザー名を入力して登録
4. 届いた確認メールのリンクをクリックして認証完了

\---

## ✅ STEP 2: GitHub でリポジトリを作成してファイルをアップロード

1. GitHub にログインし、右上の「**＋**」→「**New repository**」をクリック
2. **Repository name（リポジトリ名）** に `prompt-service`（任意）を入力
3. **Public** を選択（GitHub Pages は Public でないと無料で使えません）
4. 「**Create repository**」をクリック

### ファイルをアップロードする

1. 作成したリポジトリの画面で「**uploading an existing file**」をクリック
2. 以下のファイルをすべてドラッグ＆ドロップ（`gas` フォルダは除く）

   * `index.html`
   * `success.html`
   * `style.css`
   * `script.js`
   * `README.md`
3. 下にある「**Commit changes**」ボタンをクリック

\---

## ✅ STEP 3: GitHub Pages でサイトを公開する

1. リポジトリのページで「**Settings**」タブをクリック
2. 左メニューの「**Pages**」をクリック
3. **Source** の「None」を「**main**」に変更し「**Save**」をクリック
4. 数分待つと、以下のURLでサイトが公開されます：

```
   https://（あなたのGitHubユーザー名）.github.io/prompt-service/
   ```

5. このURLをメモしておいてください（Stripeの設定で使います）

\---

## ✅ STEP 4: Stripe アカウント作成

> すでにアカウントをお持ちの方はスキップしてください。

1. [https://stripe.com/jp](https://stripe.com/jp) を開く
2. 「**今すぐ始める**」をクリック
3. メールアドレス・氏名・パスワードを入力して登録
4. メールアドレスを認証する
5. ビジネス情報（氏名・住所・電話番号）を入力する

> \*\*費用について\*\*: 初期費用・月額料金は無料です。決済が発生した場合のみ手数料（3.6%程度）がかかります。

\---

## ✅ STEP 5: Stripe で Payment Link を作成する

> Payment Link とは：決済ページへのURLです。コードを書かずに作れます。

1. Stripe ダッシュボードにログイン
2. 左メニューの「**Payment Links**」をクリック
3. 「**＋ 新規**」をクリック
4. 以下のように設定する：

|項目|設定値|
|-|-|
|商品名|プロンプト制作 Aプラン|
|価格|¥100,000|
|通貨|JPY（日本円）|

5. 「**リンクを作成**」をクリック
6. 作成された URL（`https://buy.stripe.com/...`）をコピーしてメモ

> ⚠️ \*\*テストモードと本番モードに注意\*\*: ダッシュボード右上に「テストモード」と表示されている場合、実際の決済はできません。本番運用の前に「本番環境を有効にする」を完了してください。

\---

## ✅ STEP 6: script.js の Payment Link URL を書き換える

1. GitHubリポジトリで `script.js` を開く
2. 右上の鉛筆アイコン（Edit）をクリック
3. 以下の部分を見つけて URL を差し替える：

   **変更前:**

   ```javascript
   const STRIPE\_PAYMENT\_LINK = 'https://buy.stripe.com/test\_xxxxxxxxx';
   ```

   **変更後（コピーした URL に置き換え）:**

   ```javascript
   const STRIPE\_PAYMENT\_LINK = 'https://buy.stripe.com/実際のURL';
   ```

4. 「**Commit changes**」をクリックして保存

   \---

   ## ✅ STEP 7: Google Sheets（スプレッドシート）を作成する

1. [https://sheets.google.com](https://sheets.google.com) を開く（Googleアカウントでログイン）
2. 「**新しいスプレッドシートを作成**」をクリック
3. スプレッドシート名を「**AIプロンプトサービス顧客管理**」に変更（任意）
4. シート名（左下のタブ）を「**Sheet1**」から「**customers**」に変更する

   * シートタブを右クリック →「名前を変更」→「customers」と入力 → Enterキー
5. 1行目にヘッダーを入力する（A1セルから順に）：

|A|B|C|D|E|F|
|-|-|-|-|-|-|
|Timestamp|Name|Email|Stripe Session ID|Plan|Points|

> ※ Google Apps Script が自動的に行を追加するので、以降は何もしなくて大丈夫です。

\---

## ✅ STEP 8: Google Apps Script を設定する

### Apps Script エディタを開く

1. 作成した Google Sheets を開く
2. メニューの「**拡張機能**」→「**Apps Script**」をクリック
3. 新しいタブで Apps Script エディタが開く

### コードを入力する

1. エディタに最初から入っているコード（`function myFunction() { }`）をすべて削除する
2. このプロジェクトの `gas/Code.gs` の内容をすべてコピーして貼り付ける
3. コード内の以下の部分を自分のメールアドレスに変更する：

   **変更前:**

   ```javascript
   const ADMIN\_EMAIL = 'your-email@example.com';
   ```

   **変更後（自分のGmailアドレスに置き換え）:**

   ```javascript
   const ADMIN\_EMAIL = '自分のgmail@gmail.com';
   ```

4. 左上のフロッピーディスクアイコン（または Ctrl+S）でプロジェクトを保存する

   ### 動作テストを実行する（デプロイ前の確認）

1. エディタ上部の関数名プルダウンで「**testDoPost**」を選択
2. 「▶ 実行」ボタンをクリック
3. 「承認が必要です」と表示されたら：

   * 「権限を確認」→「自分のGoogleアカウントを選択」
   * 「詳細」→「（安全ではないページ）に移動」→「許可」をクリック
4. 実行後、スプレッドシートに1行追加されていれば成功
5. 自分のGmailにテストメールが届いていることを確認する

   \---

   ## ✅ STEP 9: Google Apps Script をデプロイする（Web App として公開）

1. エディタ右上の「**デプロイ**」→「**新しいデプロイ**」をクリック
2. 「種類の選択」の右の歯車アイコンをクリック →「**ウェブアプリ**」を選択
3. 以下のように設定する：

|項目|設定値|
|-|-|
|説明|初回デプロイ（任意）|
|次のユーザーとして実行|**自分**|
|アクセスできるユーザー|**全員**|

> ⚠️「全員」にしないと、顧客からのデータが受け取れません。

4. 「**デプロイ**」をクリック
5. 「**アクセスを承認**」が表示されたら承認する
6. 「ウェブアプリ URL」をコピーしてメモする：

```
   https://script.google.com/macros/s/（長い文字列）/exec
   ```

\---

## ✅ STEP 10: success.html の GAS\_URL を書き換える

1. GitHubリポジトリで `success.html` を開く
2. 右上の鉛筆アイコン（Edit）をクリック
3. 以下の部分を見つけて URL を差し替える：

   **変更前:**

   ```javascript
   const GAS\_URL = 'https://script.google.com/macros/s/xxxxxxxxxx/exec';
   ```

   **変更後（Step 9 でコピーした URL に置き換え）:**

   ```javascript
   const GAS\_URL = 'https://script.google.com/macros/s/実際のURL/exec';
   ```

4. 「**Commit changes**」をクリックして保存

   \---

   ## ✅ STEP 11: 動作確認（本番テスト）

1. GitHub Pages のURL（`https://ユーザー名.github.io/prompt-service/`）を開く
2. 氏名とメールアドレスを入力して「Aプランを申し込む」をクリック
3. Stripe のテスト決済画面が開くことを確認

   **テスト用カード番号（本物のお金は引き落とされません）:**

   ```
   カード番号: 4242 4242 4242 4242
   有効期限:   任意の未来の日付（例: 12/34）
   CVC:        任意の3桁（例: 123）
   ```

4. 決済完了後、`success.html` が表示されることを確認
5. Google Sheets に顧客情報が追加されていることを確認
6. 自分のGmailに自動返信メールが届いていることを確認

   \---

   ## 📌 日常的な運用方法（A氏が行う作業）

   ### 入金を確認する

   → [Stripeダッシュボード](https://dashboard.stripe.com/) にログインして「支払い」タブを確認

   ### 顧客一覧を確認する

   → Google Sheets を開いて「customers」シートを確認

   ### 自動返信メールの文章を変更する

   → Apps Script エディタで `Code.gs` を開き、`sendAutoReplyEmail` 関数の `emailBody` を編集
→ 編集後、「デプロイ」→「デプロイを管理」→「編集」→「バージョンを新しいバージョンに」→「デプロイ」をクリック

   ### 商品価格を変更する

   → Stripeダッシュボード →「商品」→ 該当商品の価格を変更

   \---

   ## ❓ よくある質問

   **Q: サイトが表示されない**
→ GitHub Pages の設定が完了してから反映まで5〜10分かかることがあります。少し待ってからアクセスしてください。

   **Q: Stripe の決済後に success.html が表示されない**
→ Stripe Payment Link の「購入後の確認ページ」設定で、success.htmlのURLを指定してください。

* Stripeダッシュボード → Payment Links → 該当のリンク → 「設定を編集」→「確認ページ」→「カスタムページにリダイレクトする」→ success.htmlのURLを入力

  **Q: Google Sheets に記録されない**
→ GAS\_URL が正しく設定されているか確認してください。Apps Script のデプロイが「全員」になっているか確認してください。

  **Q: 自動返信メールが届かない**
→ 迷惑メールフォルダを確認してください。ADMIN\_EMAIL が正しいGmailアドレスになっているか確認してください。

  **Q: testDoPost を実行しても「承認が必要」が繰り返し表示される**
→ Googleアカウントの設定で「安全性の低いアプリのアクセス」を許可するか、一度ログアウトして再ログインしてから試してください。

  \---

  ## 📁 ファイル構成

  ```
project/
├── index.html      ← サービス紹介 \& 申し込みページ
├── success.html    ← 決済完了後のサンクスページ
├── style.css       ← デザイン（見た目）
├── script.js       ← フロントエンドの動作
├── README.md       ← このファイル
└── gas/
    └── Code.gs     ← Google Apps Script（バックエンド処理）
```

  \---

  ## 🔧 変更が必要な箇所まとめ

|ファイル|変更箇所|変更内容|
|-|-|-|
|`script.js`|`STRIPE\_PAYMENT\_LINK`|StripeのPayment Link URLに変更|
|`success.html`|`GAS\_URL`|GASのWeb App URLに変更|
|`gas/Code.gs`|`ADMIN\_EMAIL`|自分のGmailアドレスに変更|

\---

*このシステムはサーバー不要・PHP不要で動作します。日常的に触るのは Stripe ダッシュボードと Google Sheets のみです。*

