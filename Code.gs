/**
 * Code.gs
 * Google Apps Script - AIプロンプト作成代行サービス
 *
 * 機能:
 *   1. success.html からの POST リクエストを受け取る
 *   2. Google Sheets（customers シート）に顧客情報を記録
 *   3. 顧客へ自動返信メールを送信
 *   4. JSON レスポンスを返す
 *
 * デプロイ設定:
 *   - 実行するユーザー: 自分
 *   - アクセスできるユーザー: 全員（匿名ユーザーを含む）
 */

// ========================================
// 設定値（必ず変更してください）
// ========================================

/** Google Sheets のシート名 */
const SHEET_NAME = 'customers';

/**
 * 管理者のメールアドレス
 * ここを自分のGmailアドレスに変更してください。
 * 顧客への自動返信メールはこのアドレスから送信されます。
 */
const ADMIN_EMAIL = 'your-email@example.com';

// ========================================
// メイン処理: POST リクエストを受け取る
// ========================================

/**
 * doPost - HTTP POST リクエストのハンドラ
 *
 * success.html から以下の JSON が送られてきます:
 * {
 *   "name":   "山田太郎",
 *   "email":  "test@example.com",
 *   "plan":   "Aプラン",
 *   "points": 100
 * }
 *
 * @param {Object} e - イベントオブジェクト（リクエスト情報を含む）
 * @returns {ContentService.TextOutput} - JSON レスポンス
 */
function doPost(e) {

  // CORS ヘッダーを許可（クロスオリジンリクエスト対応）
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    // ----------------------------------------
    // Step 1: リクエストボディを JSON としてパース
    // ----------------------------------------
    const requestBody = e.postData ? e.postData.contents : '{}';
    const data = JSON.parse(requestBody);

    // 必須フィールドの確認
    const name   = data.name   || '（名前未入力）';
    const email  = data.email  || '（メール未入力）';
    const plan   = data.plan   || 'Aプラン';
    const points = data.points || 100;

    // ----------------------------------------
    // Step 2: Google Sheets に顧客情報を記録
    // ----------------------------------------
    recordToSheet(name, email, plan, points);

    // ----------------------------------------
    // Step 3: 顧客へ自動返信メールを送信
    // ----------------------------------------
    if (email && email !== '（メール未入力）') {
      sendAutoReplyEmail(name, email, plan, points);
    }

    // ----------------------------------------
    // Step 4: 成功レスポンスを返す
    // ----------------------------------------
    output.setContent(JSON.stringify({
      status:  'success',
      message: '記録・メール送信が完了しました',
      name:    name,
      email:   email,
      plan:    plan,
      points:  points
    }));

  } catch (error) {
    // エラーが発生した場合はエラーレスポンスを返す
    console.error('doPost エラー:', error);

    output.setContent(JSON.stringify({
      status:  'error',
      message: error.toString()
    }));
  }

  return output;
}

// ========================================
// Google Sheets への記録
// ========================================

/**
 * recordToSheet - Google Sheets に顧客情報を1行追加する
 *
 * シート構成（1行目はヘッダー）:
 * | Timestamp | Name | Email | Stripe Session ID | Plan | Points |
 *
 * @param {string} name   - 顧客氏名
 * @param {string} email  - 顧客メールアドレス
 * @param {string} plan   - 申し込みプラン名
 * @param {number} points - 付与ポイント数
 */
function recordToSheet(name, email, plan, points) {

  // アクティブなスプレッドシートを取得
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 指定したシートを取得（なければ新規作成）
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);

    // ヘッダー行を追加（初回のみ）
    sheet.appendRow([
      'Timestamp',
      'Name',
      'Email',
      'Stripe Session ID',
      'Plan',
      'Points'
    ]);

    // ヘッダー行のスタイルを設定
    const headerRange = sheet.getRange(1, 1, 1, 6);
    headerRange.setBackground('#1a1a2e');
    headerRange.setFontColor('#c9a84c');
    headerRange.setFontWeight('bold');
  }

  // 現在日時を取得
  const timestamp = new Date();

  // 1行追加
  // Stripe Session ID は現時点では空欄（将来的に Webhook で記録可能）
  sheet.appendRow([
    timestamp,            // タイムスタンプ
    name,                 // 顧客氏名
    email,                // メールアドレス
    '',                   // Stripe Session ID（今回は空欄）
    plan,                 // プラン名
    points                // 付与ポイント
  ]);

  console.log('スプレッドシートへの記録完了:', name, email);
}

// ========================================
// 自動返信メール送信
// ========================================

/**
 * sendAutoReplyEmail - 顧客へ自動返信メールを送信する
 *
 * ※ 本文を変更したい場合はこの関数内の emailBody を編集してください。
 *
 * @param {string} name   - 顧客氏名
 * @param {string} email  - 顧客メールアドレス（送信先）
 * @param {string} plan   - 申し込みプラン名
 * @param {number} points - 付与ポイント数
 */
function sendAutoReplyEmail(name, email, plan, points) {

  // ----------------------------------------
  // メールの件名
  // ※ 変更したい場合はここを編集してください
  // ----------------------------------------
  const emailSubject = 'お申し込みありがとうございます';

  // ----------------------------------------
  // メール本文
  // ※ 変更したい場合はここを編集してください
  // ※ {{name}} はお客様の名前に自動で置き換えられます
  // ----------------------------------------
  const emailBody = `${name} 様

このたびは ${plan} にお申し込みいただきありがとうございます。

${points}ポイントを付与いたしました。

24時間以内にご連絡いたします。

ご不明な点がございましたら、このメールにご返信ください。

よろしくお願いいたします。

──────────────────────
AIプロンプト作成代行サービス
メール: ${ADMIN_EMAIL}
──────────────────────`;

  // ----------------------------------------
  // メール送信
  // Gmail アカウントから送信されます
  // ----------------------------------------
  MailApp.sendEmail({
    to:      email,           // 送信先（顧客のメールアドレス）
    subject: emailSubject,    // 件名
    body:    emailBody,       // 本文
    replyTo: ADMIN_EMAIL      // 返信先（管理者のメールアドレス）
  });

  console.log('自動返信メール送信完了:', email);
}

// ========================================
// GET リクエストのハンドラ（動作確認用）
// ========================================

/**
 * doGet - HTTP GET リクエストのハンドラ
 * ブラウザから Web App URL に直接アクセスした場合に動作確認できます。
 *
 * @returns {ContentService.TextOutput} - 動作確認用メッセージ
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status:  'ok',
      message: 'AIプロンプト作成代行サービス GAS は正常に動作しています',
      time:    new Date().toString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ========================================
// テスト用関数（デプロイ前に動作確認）
// ========================================

/**
 * testDoPost - ローカルテスト用関数
 * Apps Script エディタから直接実行して動作確認できます。
 * デプロイ前に必ずこちらで動作確認してください。
 */
function testDoPost() {
  // テストデータを作成
  const testEvent = {
    postData: {
      contents: JSON.stringify({
        name:   'テスト太郎',
        email:  ADMIN_EMAIL, // テスト時は管理者メールアドレスへ送信
        plan:   'Aプラン',
        points: 100
      })
    }
  };

  // doPost を実行
  const result = doPost(testEvent);

  // 結果をログに表示
  console.log('テスト結果:', result.getContent());
  Logger.log('テスト結果: ' + result.getContent());
}
