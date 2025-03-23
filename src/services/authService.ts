import { supabase } from "../lib/supabase";

export interface User {
  id: string;
  email: string;
  name: string;
}

export const authService = {
  async signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("ログインエラー:", error);
      throw error;
    }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("ログアウトエラー:", error);
      throw error;
    }
  },

  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      console.error("ユーザー取得エラー:", error);
      throw error;
    }
    return user;
  },

  async checkAuth() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) {
      console.error("セッション確認エラー:", error);
      throw error;
    }
    return session;
  },
};
