import { supabase } from "../lib/supabase";
import { SurveyResponse, PersonalityComment } from "../types";
import { v4 as uuidv4 } from "uuid";

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
        .select("id")
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
            updated_at: new Date().toISOString()
          })
          .eq("id", existingResponse.id);

        if (error) {
          console.error("Error updating survey response:", error);
          throw error;
        }
      } else {
        // Insert new record with a try-catch to handle potential conflicts
        const responseId = uuidv4();
        const { error } = await supabase.from("survey_responses").insert({
          id: responseId,
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
    comment: Omit<PersonalityComment, "id" | "user_id" | "created_at">
  ) {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("認証エラー");

      // Check if the user already has a personality comment with proper headers
      const { data: existingComment, error: fetchError } = await supabase
        .from("personality_comments")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching existing personality comment:", fetchError);
        // Continue with insert attempt even if fetch fails
      }

      if (existingComment) {
        // Update existing record
        const { error } = await supabase
          .from("personality_comments")
          .update({
            ...comment,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingComment.id);

        if (error) {
          console.error("Error updating personality comment:", error);
          throw error;
        }
      } else {
        // Insert new record with a try-catch to handle potential conflicts
        const commentId = uuidv4();
        const { error } = await supabase.from("personality_comments").insert({
          id: commentId,
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
};
