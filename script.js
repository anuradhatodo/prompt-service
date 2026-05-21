/**
 * script.js
 * AIプロンプト作成代行サービス - メインスクリプト
 *
 * 役割:
 *   1. フォームバリデーション
 *   2. 入力内容を localStorage に保存
 *   3. Stripe Payment Link へリダイレクト
 */

// ========================================
// 設定値（必要に応じて変更してください）
// ========================================

/**
 * Stripe Payment Link URL
 * Stripe ダッシュボードで作成した Payment Link に差し替えてください。
 * 例: 'https://buy.stripe.com/test_abc123xyz'
 */
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_xxxxxxxxx';

// ========================================
// DOM が読み込まれたあとに処理を開始
// ========================================
document.addEventListener('DOMContentLoaded', function () {

  // フォーム要素を取得
  const form       = document.getElementById('apply-form');
  const nameInput  = document.getElementById('customer-name');
  const emailInput = document.getElementById('customer-email');
  const submitBtn  = document.getElementById('submit-btn');

  // エラー表示用要素
  const nameError  = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');

  // フォームが存在しない場合は処理をスキップ
  if (!form) return;

  // ----------------------------------------
  // リアルタイムバリデーション（入力時）
  // ----------------------------------------
  nameInput.addEventListener('input', function () {
    validateName(this.value);
  });

  emailInput.addEventListener('input', function () {
    validateEmail(this.value);
  });

  // ----------------------------------------
  // フォーム送信時の処理
  // ----------------------------------------
  form.addEventListener('submit', function (e) {
    // デフォルトのフォーム送信を無効化
    e.preventDefault();

    const name  = nameInput.value.trim();
    const email = emailInput.value.trim();

    // バリデーションを実行
    const isNameValid  = validateName(name);
    const isEmailValid = validateEmail(email);

    // バリデーションが通らない場合は処理を中断
    if (!isNameValid || !isEmailValid) {
      // 最初のエラーフィールドにフォーカス
      if (!isNameValid) {
        nameInput.focus();
      } else {
        emailInput.focus();
      }
      return;
    }

    // ----------------------------------------
    // localStorage に顧客情報を保存
    // success.html で読み込んで GAS へ送信するために使用
    // ----------------------------------------
    const customerData = {
      name:   name,
      email:  email,
      plan:   'Aプラン',
      points: 100,
      savedAt: new Date().toISOString() // 保存日時（デバッグ用）
    };

    try {
      localStorage.setItem('customerData', JSON.stringify(customerData));
    } catch (error) {
      // localStorage が使えない場合（プライベートブラウザ等）でも続行
      console.warn('localStorage への保存に失敗しました:', error);
    }

    // ----------------------------------------
    // ボタンを送信中の状態に変更（二重送信防止）
    // ----------------------------------------
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Stripeへ移動中...';

    // ----------------------------------------
    // Stripe Payment Link へリダイレクト
    // 少し待ってから遷移（UX向上のため）
    // ----------------------------------------
    setTimeout(function () {
      window.location.href = STRIPE_PAYMENT_LINK;
    }, 600);
  });

  // ========================================
  // バリデーション関数
  // ========================================

  /**
   * 氏名のバリデーション
   * @param {string} value - 入力値
   * @returns {boolean} - バリデーション結果
   */
  function validateName(value) {
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      showError(nameInput, nameError, 'お名前を入力してください');
      return false;
    }

    if (trimmed.length < 2) {
      showError(nameInput, nameError, 'お名前は2文字以上で入力してください');
      return false;
    }

    if (trimmed.length > 50) {
      showError(nameInput, nameError, 'お名前は50文字以内で入力してください');
      return false;
    }

    clearError(nameInput, nameError);
    return true;
  }

  /**
   * メールアドレスのバリデーション
   * @param {string} value - 入力値
   * @returns {boolean} - バリデーション結果
   */
  function validateEmail(value) {
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      showError(emailInput, emailError, 'メールアドレスを入力してください');
      return false;
    }

    // 基本的なメール形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      showError(emailInput, emailError, '正しいメールアドレスの形式で入力してください');
      return false;
    }

    clearError(emailInput, emailError);
    return true;
  }

  /**
   * エラーを表示する
   * @param {HTMLElement} inputEl  - 入力要素
   * @param {HTMLElement} errorEl  - エラー表示要素
   * @param {string}      message  - エラーメッセージ
   */
  function showError(inputEl, errorEl, message) {
    inputEl.style.borderColor = 'var(--color-error)';
    errorEl.textContent = message;
    errorEl.classList.add('is-visible');
  }

  /**
   * エラーを消去する
   * @param {HTMLElement} inputEl - 入力要素
   * @param {HTMLElement} errorEl - エラー表示要素
   */
  function clearError(inputEl, errorEl) {
    inputEl.style.borderColor = '';
    errorEl.textContent = '';
    errorEl.classList.remove('is-visible');
  }

});
