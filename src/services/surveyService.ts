import { supabase } from "../lib/supabase";
import { compatibilityService } from "./compatibilityService";
import { SurveyResponse, PersonalityComment } from "../types";

export const surveyService = {
  async saveSurveyResponse(responses: SurveyResponse["responses"]) {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("認証エラー");

      // Check if the user already has a survey response with proper headers
      const { data: existingResponse, error: fetchError } = await supabase
        .from("survey_responses")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching existing survey response:", fetchError);
        // Continue with insert attempt even if fetch fails
      }

      if (existingResponse) {
        // Update existing record
        const { error } = await supabase
          .from("survey_responses")
          .update({
            responses,
            created_at: new Date().toISOString(),
          })
          .eq("user_id", existingResponse.user_id);

        if (error) {
          console.error("Error updating survey response:", error);
          throw error;
        }
      } else {
        // Insert new record with a try-catch to handle potential conflicts
        const { error } = await supabase.from("survey_responses").insert({
          user_id: user.id,
          responses,
          created_at: new Date().toISOString(),
        });

        if (error) {
          console.error("Error inserting survey response:", error);
          throw error;
        }
      }
    } catch (error) {
      console.error("Survey response save failed:", error);
      throw error;
    }
  },

  async savePersonalityComment(
    comment: Omit<PersonalityComment, "id" | "user_id" | "created_at">,
    onLoading?: (message: string) => void
  ) {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("認証エラー");

      onLoading?.("プロフィールを更新しています...");

      // Check if the user already has a personality comment with proper headers
      const { data: existingComment, error: fetchError } = await supabase
        .from("personality_comments")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        console.error(
          "Error fetching existing personality comment:",
          fetchError
        );
        // Continue with insert attempt even if fetch fails
      }

      if (existingComment) {
        // Update existing record
        const { error } = await supabase
          .from("personality_comments")
          .update({
            ...comment,
            created_at: new Date().toISOString(),
          })
          .eq("user_id", existingComment.user_id);

        if (error) {
          console.error("Error updating personality comment:", error);
          throw error;
        }
        await this.recalculateAllGroupCompatibilities(user.id);
      } else {
        // Insert new record with a try-catch to handle potential conflicts
        const { error } = await supabase.from("personality_comments").insert({
          user_id: user.id,
          ...comment,
          created_at: new Date().toISOString(),
        });

        if (error) {
          console.error("Error inserting personality comment:", error);
          throw error;
        }
      }
    } catch (error) {
      console.error("Personality comment save failed:", error);
      throw error;
    }
  },

  // 所属グループ内の全メンバーとの相性診断を更新
  async recalculateAllGroupCompatibilities(userId: string) {
    try {
      // 所属グループの取得
      const { data: groupMembers, error: groupError } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", userId);

      if (groupError) throw groupError;

      // 各グループでの処理
      for (const { group_id } of groupMembers) {
        // 各メンバーとの相性を再計算
        await compatibilityService.generateAndSaveCompatibilityForNewMember(
          group_id,
          userId
        );
      }

      console.log("全グループメンバーとの相性診断を更新しました");
    } catch (error) {
      console.error("相性診断の更新に失敗:", error);
      throw error;
    }
  },
};
