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
    // 質問内容を含むマッピングを作成
    const questionMap = {
      q1: "大勢の人と一緒にいることでエネルギーを得る方だ",
      q2: "新しい人と会うとき、すぐに打ち解けて話すことができる方だ",
      q3: "週末に友人と集まる計画を立てるのが好きだ",
      q4: "物事を考えるとき、具体的な事実や詳細に注目する方だ",
      q5: "新しいプロジェクトを始めるとき、まず具体的な手順や計画を立てる方だ",
      q6: "過去の経験や実績に基づいて決断を下すことが多い",
      q7: "意見の対立が生じたとき、論理的な根拠を重視して解決しようとする方だ",
      q8: "重要な決断を下す際、客観的なデータや事実を基にする方だ",
      q9: "批判やフィードバックを受けるとき、内容の正確さや論理性を重視する方だ",
      q10: "日常生活で、計画を立てて物事を進めることを好む方だ",
      q11: "締め切りやスケジュールが厳しいプロジェクトでは、早めに終わらせることを目指す方だ",
      q12: "新しい情報を得たとき、すぐに結論を出して行動に移りたいと思う方だ",
      q13: "チームで作業するとき、リーダーシップを発揮して方向性を示す役割を好む方だ",
      q14: "問題に直面したとき、まず論理的に分析して解決策を見つける方だ",
      q15: "日常生活で、ルーチンや習慣を守ることが多い方だ",
      q16: "人間関係で聞き手の役割を好む方だ",
      q17: "意見の対立が生じたとき、話し合いで解決しようとする方だ",
      q18: "新しい環境に適応するのが得意だ",
      q19: "人と競争するのが好きだ",
    };

    // 質問タイプに基づいた回答の意味を説明するマッピング
    const getAnswerMeaning = (value: number): string => {
      // すべての質問タイプに対して統一した表現を使用
      switch (value) {
        case 1:
          return "全く当てはまらない";
        case 2:
          return "あまり当てはまらない";
        case 3:
          return "どちらとも言えない";
        case 4:
          return "やや当てはまる";
        case 5:
          return "かなり当てはまる";
        default:
          return "不明な回答";
      }
    };

    // 質問と回答の詳細を含むオブジェクトを作成
    const enrichPersonData = (person: {
      profile: Profile;
      surveyResponse: SurveyResponse;
      personalityComment: PersonalityComment;
    }) => {
      const enrichedResponses: Record<
        string,
        {
          question: string;
          answer: number;
          meaning: string;
        }
      > = {};

      if (person.surveyResponse && person.surveyResponse.responses) {
        Object.entries(person.surveyResponse.responses).forEach(
          ([qId, value]) => {
            enrichedResponses[qId] = {
              question:
                questionMap[qId as keyof typeof questionMap] || "不明な質問",
              answer: value,
              meaning: getAnswerMeaning(value),
            };
          }
        );
      }

      return {
        ...person,
        enrichedSurveyResponse: {
          ...person.surveyResponse,
          enrichedResponses,
        },
      };
    };

    const enrichedPersonA = enrichPersonData(personA);
    const enrichedPersonB = enrichPersonData(personB);

    const prompt = `You are an expert in diagnosing interpersonal compatibility.
    
    Your personality is warm, insightful, and witty—like a friendly relationship counselor with a sense of humor.
    
    Based on the provided JSON data for ${personA.profile.name} and ${
      personB.profile.name
    }, evaluate their compatibility according to the following criteria:
    - Alignment of communication styles.
    - Commonalities in values, interests, and hobbies.
    - Approaches to emotional expression and conflict resolution.
    - Compatibility in interpersonal roles.
    - Similarity in stress tolerance and handling pressure.
    
    # Input
    ## ${personA.profile.name}
    ${JSON.stringify(enrichedPersonA, null, 2)}
    
    ## ${personB.profile.name}
    ${JSON.stringify(enrichedPersonB, null, 2)}
    
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
      "catchphrase": string, // A short, catchy Japanese phrase summarizing the relationship (e.g., "火と水。でもお互いを蒸発させない距離感なら最強。")
      "description": {
        "diagnosis_reasons": string,
        "strengths": string,
        "weaknesses": string,
        "negative_perspectives": string,
        "positive_perspectives": string
      },  
      "advice": {
        "action_plan" : string,
        "steps": string[]
      }
    }
    
    Ensure that:
    - The "description" is emotionally expressive and includes clever analogies or metaphors when helpful.
    - Use a warm, slightly playful tone like a skilled human compatibility advisor.
    - Add a fun or witty catchphrase that captures the essence of their relationship.
    - The output is entirely in Japanese and the JSON is valid.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;

    const text = response.text().trim();
    console.log(text);
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
    // user_a_id と user_b_id の順番を関係なく同じペアとして扱うために
    const sortedIds = [personAId, personBId].sort();

    const { error } = await supabase.from("compatibility_results").upsert(
      {
        id: uuidv4(),
        group_id: groupId,
        user_a_id: sortedIds[0],
        user_b_id: sortedIds[1],
        degree: result.degree,
        description: result.description,
        advice: result.advice,
        created_at: new Date().toISOString(),
      },
      {
        onConflict: "user_a_id,user_b_id,group_id",
        ignoreDuplicates: false,
      }
    );

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
