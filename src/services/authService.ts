import { supabase } from "../lib/supabase";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
);

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
        redirectTo: `${window.location.origin}/auth-callback`,
        // ハッシュフラグメントを処理できるようにqueryParamsを追加
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
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

  async deleteAccount() {
    const user = await this.getCurrentUser();
    if (!user) throw new Error("ユーザーが見つかりません");

    // 1. ユーザーのデータを削除
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", user.id);
    if (profileError) throw profileError;

    const { error: surveyError } = await supabase
      .from("survey_responses")
      .delete()
      .eq("user_id", user.id);
    if (surveyError) throw surveyError;

    const { error: commentError } = await supabase
      .from("personality_comments")
      .delete()
      .eq("user_id", user.id);
    if (commentError) throw commentError;

    const { error: groupMemberError } = await supabase
      .from("group_members")
      .delete()
      .eq("user_id", user.id);
    if (groupMemberError) throw groupMemberError;

    // 2. ユーザーが作成したグループを削除
    const { data: createdGroups, error: groupsError } = await supabase
      .from("groups")
      .select("group_id")
      .eq("created_by", user.id);
    if (groupsError) throw groupsError;

    if (createdGroups && createdGroups.length > 0) {
      const { error: deleteGroupsError } = await supabase
        .from("groups")
        .delete()
        .eq("created_by", user.id);
      if (deleteGroupsError) throw deleteGroupsError;
    }

    // 3. 相性診断結果を削除
    const { error: compatibilityError } = await supabase
      .from("compatibility_results")
      .delete()
      .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`);
    if (compatibilityError) throw compatibilityError;

    // 4. 認証を削除（サインアウト）
    const { error: authError } = await supabase.auth.signOut();
    if (authError) throw authError;

    // 5. ユーザーを削除（service_role_keyを使用）
    const { error: deleteUserError } =
      await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (deleteUserError) throw deleteUserError;
  },
};
