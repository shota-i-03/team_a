# スグクルプロジェクト エラー処理ガイドライン

このドキュメントは、プロジェクト全体で一貫したエラー処理を実装するためのガイドラインを定義します。

## 基本原則

- すべてのエラーは適切にキャッチし、ユーザーに意味のあるフィードバックを提供する
- 開発者向けの詳細なエラーログとユーザー向けのシンプルなメッセージを分離する
- 予測可能なエラーには専用の処理を実装する
- 予期しないエラーも適切に処理し、ユーザー体験を損なわない

## エラー処理パターン

### try/catch パターン

すべての非同期処理と潜在的にエラーを投げる可能性のある処理には、try/catch ブロックを使用します。

```typescript
try {
  await apiClient.getData();
} catch (err) {
  // エラー処理
  if (err instanceof SpecificError) {
    // 特定のエラータイプに対する処理
  } else {
    // 一般的なエラー処理
    console.error('予期しないエラーが発生しました:', err);
  }
} finally {
  // クリーンアップ処理（常に実行される）
}
```

### カスタムエラークラス

特定の種類のエラーを識別し、適切に処理するためにカスタムエラークラスを使用します。

```typescript
// カスタムエラークラスの定義
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 使用例
try {
  // APIリクエスト
} catch (err) {
  if (err instanceof ApiError) {
    if (err.statusCode === 401) {
      // 認証エラー処理
    } else if (err.statusCode === 403) {
      // 権限エラー処理
    }
  } else {
    // その他のエラー
  }
}
```

### エラーマッピング

Supabaseなどの外部サービスから返されるエラーを、アプリケーション固有のエラーに変換します。

```typescript
// Supabaseエラーのマッピング
export function mapSupabaseError(error: any): string {
  if (!error) return '不明なエラーが発生しました';
  
  const message = error.message || '';
  
  // 認証関連エラー
  if (message.includes('Invalid login credentials')) {
    return 'メールアドレスまたはパスワードが正しくありません';
  }
  
  if (message.includes('Email not confirmed')) {
    return 'メールアドレスが確認されていません。受信トレイを確認してください';
  }
  
  // レート制限エラー
  if (message.includes('For security purposes, you can only request this after')) {
    const match = message.match(/after (\d+) seconds/);
    const seconds = match ? match[1] : '数分';
    return `セキュリティのため、${seconds}秒後に再試行してください`;
  }
  
  // その他のエラー
  return '処理中にエラーが発生しました: ' + message;
}
```

## UIでのエラー表示

### エラーコンポーネント

エラーメッセージを一貫した方法で表示するためのコンポーネントを作成します。

```tsx
export const ErrorMessage: React.FC<{ 
  error: string | null; 
  className?: string;
}> = ({ error, className }) => {
  if (!error) return null;
  
  return (
    <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
      <div className="flex">
        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
        <p className="text-sm text-red-600">{error}</p>
      </div>
    </div>
  );
};
```

### フォームエラーの表示

フォーム入力に関連するエラーは、関連する入力フィールドの近くに表示します。

```tsx
<div>
  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
    メールアドレス
  </label>
  <input
    id="email"
    name="email"
    type="email"
    className={`mt-1 block w-full rounded-md ${
      errors.email ? 'border-red-300' : 'border-gray-300'
    }`}
    value={email}
    onChange={handleChange}
  />
  {errors.email && (
    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
  )}
</div>
```

## エラーログ記録

### 環境に応じたログレベル

環境に応じて適切なログレベルを使用します。

```typescript
// 環境に応じたログ出力
export function logError(error: unknown, context?: string): void {
  const isProd = import.meta.env.PROD;
  const prefix = context ? `[${context}] ` : '';
  
  if (isProd) {
    // 本番環境ではエラーのみをログ出力
    console.error(`${prefix}Error:`, error);
  } else {
    // 開発環境では詳細情報をログ出力
    console.group(`${prefix}Error Details`);
    console.error('Error:', error);
    console.info('State at error:', { /* 現在の状態情報 */ });
    console.groupEnd();
  }
}
```

### センシティブ情報の保護

ログにセンシティブ情報が含まれないようにします。

```typescript
// 安全なログ出力
export function sanitizeDataForLogging(data: any): any {
  if (!data) return data;
  
  const sensitiveFields = ['password', 'token', 'credit_card', 'secret'];
  
  if (typeof data === 'object' && data !== null) {
    const sanitized = { ...data };
    
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }
  
  return data;
}
```

## Supabaseに特化したエラー処理

Supabaseから返されるエラーは特定のパターンがあるため、専用の処理を実装します。

```typescript
// Supabase認証エラー処理
export async function signInWithEmail(email: string, password: string): Promise<User | null> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      // Supabaseエラーをマッピング
      const userMessage = mapSupabaseError(error);
      throw new AuthError(userMessage, error.message);
    }
    
    return data.user;
  } catch (err) {
    if (err instanceof AuthError) {
      // 既に処理済みのエラー
      throw err;
    }
    
    // 予期しないエラー
    console.error('サインイン処理中のエラー:', err);
    throw new AuthError('ログイン処理中に予期しないエラーが発生しました', String(err));
  }
}
```

## グローバルエラーハンドリング

予期しないエラーをキャッチするためのグローバルエラーハンドリングを実装します。

```tsx
// エラーバウンダリコンポーネント
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // エラー追跡サービスに送信するコードをここに追加
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
```

## レート制限エラーの処理

LINE認証やAPI呼び出しでは、レート制限エラーが発生する可能性があります。これらには特別な処理を実装します。

```typescript
// レート制限エラーの処理
export function handleRateLimitError(error: any): {
  isRateLimit: boolean;
  waitTime: number;
  message: string;
} {
  const defaultResponse = {
    isRateLimit: false,
    waitTime: 0,
    message: ''
  };
  
  if (!error || typeof error.message !== 'string') {
    return defaultResponse;
  }
  
  // "For security purposes, you can only request this after X seconds"
  const rateLimitMatch = error.message.match(/after (\d+) seconds/i);
  
  if (rateLimitMatch && rateLimitMatch[1]) {
    const waitTime = parseInt(rateLimitMatch[1], 10);
    return {
      isRateLimit: true,
      waitTime,
      message: `セキュリティのため、${waitTime}秒後に再試行してください`
    };
  }
  
  return defaultResponse;
}
```

---

これらのガイドラインを一貫して適用することで、エラー処理が予測可能で信頼性の高いものになり、ユーザー体験とデバッグ可能性が向上します。
