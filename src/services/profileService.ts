import { supabase } from "../lib/supabase";
import { Profile } from "../types";

export const profileService = {
  async upsertProfile(profile: Omit<Profile, "id">) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("認証エラー");

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      ...profile,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("プロフィール取得エラー:", error);
      throw error;
    }

    return data as Profile;
  },
};
