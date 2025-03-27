import { createClient, SupabaseClient } from '@supabase/supabase-js';

// シングルトンインスタンスを保持するための変数
let supabaseInstance: SupabaseClient | null = null;

/**
 * Supabaseクライアントのシングルトンインスタンスを取得する
 * @returns 初期化済みのSupabaseクライアントインスタンス
 */
const getSupabaseClient = () => {
  // すでにインスタンスが存在する場合はそれを返す
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  // 新しいインスタンスを作成
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  console.log('Supabase client initialized');
  return supabaseInstance;
};

// エクスポートする supabase クライアントはシングルトンインスタンスを取得する関数を使用
export const supabase = getSupabaseClient();