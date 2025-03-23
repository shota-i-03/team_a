import { supabase } from "../lib/supabase";
import {
  Profile,
  SurveyResponse,
  PersonalityComment,
  CompatibilityResult,
} from "../types";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from "uuid";
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export const compatibilityService = {
  async generateCompatibilityResult(
    personA: {
      profile: Profile;
      surveyResponse: SurveyResponse;
      personalityComment: PersonalityComment;
    },
    personB: {
      profile: Profile;
      surveyResponse: SurveyResponse;
      personalityComment: PersonalityComment;
    }
  ): Promise<CompatibilityResult> {
    const prompt = `You are an expert in diagnosing interpersonal compatibility.

Based on the provided JSON data for Person A and Person B, evaluate their compatibility according to the following criteria:
- Alignment of communication styles.
- Commonalities in values, interests, and hobbies.
- Approaches to emotional expression and conflict resolution.
- Compatibility in interpersonal roles.
- Similarity in stress tolerance and handling pressure.

# Input
## Person A
${JSON.stringify(personA, null, 2)}

## Person B
${JSON.stringify(personB, null, 2)}

# Evaluation Guidelines
- Assess compatibility based on the following weightings:
  - Communication styles: 25%
  - Values, interests, and hobbies: 25%
  - Emotional expression and conflict resolution: 20%
  - Interpersonal roles: 15%
  - Stress tolerance: 15%
- For each criterion, evaluate similarity or complementarity using the provided data.
- Use survey responses to infer traits where direct indicators are unavailable.

# Output
Return a JSON object with the following structure (do not include markdown formatting or code blocks).
All text content (description and advice) must be in Japanese:

{
  "degree": number, // An integer compatibility score from 0 to 100.
  "description": string, // A detailed explanation with sections:
                         // - Diagnosis Reasons: Key factors influencing the score.
                         // - Strengths: Positive aspects of the relationship.
                         // - Weaknesses: Potential challenges or areas for improvement.
                         // - Negative Perspectives: Possible conflicts or mismatches.
                         // - Positive Perspectives: Opportunities for growth and harmony.
  "advice": string       // Practical advice and an actionable plan for improving the relationship.
                         // Include specific steps (e.g., "Discuss differing values during a weekly meeting").
}
  Ensure that:
- The "description" is formatted in markdown, covering all specified sections in a clear and balanced manner.
- The output is entirely in Japanese.
- The JSON is valid and adheres to the specified structure.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;

    console.log(response.text());
    const text = response.text().trim();
    // Remove markdown code block if present
    const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
    try {
      return JSON.parse(cleanText);
    } catch (error) {
      console.error("JSON parse error:", cleanText, error);
      throw new Error("相性診断結果の解析に失敗しました");
    }
  },

  async saveCompatibilityResult(
    groupId: string,
    personAId: string,
    personBId: string,
    result: CompatibilityResult
  ) {
    const { error } = await supabase.from("compatibility_results").insert({
      id: uuidv4(),
      group_id: groupId,
      user_a_id: personAId,
      user_b_id: personBId,
      degree: result.degree,
      description: result.description,
      advice: result.advice,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;
  },

  async generateAndSaveCompatibilityForNewMember(
    groupId: string,
    newMemberId: string
  ) {
    // グループの既存メンバーを取得
    const { data: existingMembers, error: memberError } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId)
      .neq("user_id", newMemberId);

    if (memberError) throw memberError;

    // 新メンバーのデータを取得
    const newMemberData = await this.getMemberData(newMemberId);
    if (!newMemberData) throw new Error("New member data not found");

    // 既存メンバーそれぞれとの相性診断を実行
    for (const member of existingMembers || []) {
      const existingMemberData = await this.getMemberData(member.user_id);
      if (!existingMemberData) continue;

      const result = await this.generateCompatibilityResult(
        newMemberData,
        existingMemberData
      );

      await this.saveCompatibilityResult(
        groupId,
        newMemberId,
        member.user_id,
        result
      );
      await this.saveCompatibilityResult(
        groupId,
        member.user_id,
        newMemberId,
        result
      );
    }
  },

  async getMemberData(userId: string) {
    // プロフィール情報を取得
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError) throw profileError;

    // アンケート回答を取得
    const { data: surveyResponse, error: surveyError } = await supabase
      .from("survey_responses")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (surveyError) throw surveyError;

    // パーソナリティコメントを取得
    const { data: personalityComment, error: commentError } = await supabase
      .from("personality_comments")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (commentError) throw commentError;

    return {
      profile,
      surveyResponse,
      personalityComment,
    };
  },
};
