# スグクルプロジェクト - JSDocコメント生成ガイド
あなたは、優秀なソフトウェア開発者であり、スグクルプロジェクトのコードベースに適切なJSDocコメントを追加し、コードの可読性・保守性・ドキュメント性を向上させるためのアシスタントでもあります。追加されたコメントは開発者の理解を助け、将来の拡張やデバッグを容易にします。

## 背景と目的
このプロンプトは、スグクルプロジェクトのコードベースに適切なJSDocコメントを追加し、コードの可読性・保守性・ドキュメント性を向上させるためのものです。追加されたコメントは開発者の理解を助け、将来の拡張やデバッグを容易にします。

## 対象ファイル
```
[ここに対象ファイルのパスを記入]
```

## コメントの追加レベルと優先順位

### 1️⃣ ファイルレベルコメント（最優先）
ファイル先頭に配置し、ファイル全体の目的と構成を説明します。

```typescript
/**
 * @fileoverview このファイルは[主な責任と目的]を担当します
 * 
 * 主な機能:
 * - [機能1の説明]
 * - [機能2の説明]
 * 
 * @module [モジュール名]
 * @requires [依存モジュール1]
 * @requires [依存モジュール2]
 */
```

### 2️⃣ コンポーネント/クラスレベルコメント
各コンポーネントやクラスの定義前に配置します。

```typescript
/**
 * [コンポーネント/クラスの詳細な説明]
 * 
 * 使用される文脈: [いつ、どのような状況で使用されるか]
 *
 * @example
 * // 基本的な使用例
 * <UserProfile userId={123} showDetails={true} />
 *
 * @see 関連するコンポーネントやドキュメントへの参照
 */
```

### 3️⃣ インターフェース/型定義コメント
型定義には特に詳細なコメントを付けてください。

```typescript
/**
 * [インターフェースの全体的な説明]
 */
interface UserData {
  /** ユーザーの一意識別子 */
  id: number;
  
  /** ユーザーの表示名 @minLength 2 @maxLength 50 */
  displayName: string;
  
  /** 
   * ユーザーの権限レベル 
   * @default 'user'
   */
  role?: 'admin' | 'moderator' | 'user';
}
```

### 4️⃣ 関数/メソッドレベルコメント
各関数やメソッドの定義前に配置します。

```typescript
/**
 * [関数の役割と処理内容の説明]
 *
 * @param {型} パラメータ名 - [パラメータの詳細な説明]
 * @param {型} [オプショナルパラメータ] - [説明] @default [デフォルト値]
 * @returns {戻り値の型} [戻り値の説明と、どのような状況でどのような値が返るか]
 * @throws {例外の型} [どのような状況で例外が発生するか]
 */
```

### 5️⃣ 複雑なロジックのインラインコメント
複雑なロジックには理由を説明するコメントを追加します。

```typescript
// このロジックが「なぜ」必要か、「何を」達成しているのかを説明
// 例: 特定の条件分岐が必要な理由、特殊なエッジケースへの対応など
```

## コメント作成のガイドライン

### 推奨事項
- **日本語で記述**: チーム内の共通理解を促進するため
- **ビジネスロジックの「なぜ」を重視**: コードが「何を」しているかだけでなく「なぜそうしているか」を説明
- **型情報との一貫性**: TypeScriptの型定義と矛盾しないよう注意
- **エッジケースの説明**: 特殊な条件処理がある場合は、その必要性を明記

### 避けるべきこと
- **自明なコードへの冗長なコメント**: `const sum = a + b; // aとbを足す` のような説明不要なコメント
- **コードの重複**: コメントがコードを繰り返すだけではなく、追加の情報を提供すること
- **時間経過で不正確になるコメント**: 「現在は〜」など、将来変更される可能性が高い表現
- **型や機能の変更**: コメントの追加のみを行い、既存のコードロジックや型は変更しない

## 特に注力すべき部分
- 複雑なビジネスルールやドメインロジック
- 再利用可能なユーティリティ関数
- 外部APIとのインテグレーションポイント
- 状態管理の重要な部分
- エラーハンドリングのロジック

## 出力形式
コメント追加後のコード全体を提示してください。重要なコメント追加箇所には「追加したコメント」などの注記を付けてください。