import { supabase } from "../lib/supabase";
import { SurveyResponse, PersonalityComment } from "../types";

export const surveyService = {
  async saveSurveyResponse(responses: SurveyResponse["responses"]) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("認証エラー");

    const { error } = await supabase.from("survey_responses").upsert({
      user_id: user.id,
      responses,
    });

    if (error) throw error;
  },

  async savePersonalityComment(
    comment: Omit<PersonalityComment, "id" | "user_id" | "created_at">
  ) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("認証エラー");

    const { error } = await supabase.from("personality_comments").upsert({
      user_id: user.id,
      ...comment,
    });

    if (error) throw error;
  },
};
