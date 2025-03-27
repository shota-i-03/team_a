import { supabase } from "../lib/supabase";
import {
  Profile,
  SurveyResponse,
  PersonalityComment,
  CompatibilityResult,
  GroupCompatibilityResult
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
    const getAnswerMeaning = (questionId: string, value: number): string => {
      // 標準的な5段階評価のマッピング
      const standardScaleMeaning = {
        1: "全く当てはまらない",
        2: "あまり当てはまらない",
        3: "どちらとも言えない",
        4: "やや当てはまる",
        5: "かなり当てはまる",
      };

      // 特定の質問タイプに対するカスタムマッピング
      const customMappings: Record<string, Record<number, string>> = {
        q16: {
          1: "常に聞き手を好む",
          2: "どちらかといえば聞き手を好む",
          3: "状況によって使い分ける",
          4: "どちらかといえば話し手を好む",
          5: "常に話し手を好む",
        },
        q17: {
          1: "対立を避ける",
          2: "相手に合わせる",
          3: "妥協点を探る",
          4: "話し合いで解決を目指す",
          5: "自分の意見を主張する",
        },
      };

      // カスタムマッピングがある場合はそれを使用
      if (questionId in customMappings) {
        return customMappings[questionId][value] || "不明な回答";
      }

      // 標準的な5段階評価を使用（q1-q15, q18-q19など）
      return standardScaleMeaning[value as keyof typeof standardScaleMeaning] || "不明な回答";
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
              meaning: getAnswerMeaning(qId, value),
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

    // 両者のデータを強化
    const enrichedPersonA = enrichPersonData(personA);
    const enrichedPersonB = enrichPersonData(personB);

    const prompt = `You are an expert in diagnosing interpersonal compatibility.

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
  "description": {
    "diagnosis_reasons": string,  // Reasons for the compatibility score.
    "strengths": string,  // Positive aspects of the relationship.
    "weaknesses": string,  // Areas for improvement.
    "negative_perspectives": string,  // Potential conflicts or mismatches.
    "positive_perspectives": string  // Opportunities for growth and harmony.
  },
    "advice": {
      "action_plan" : string, // Practical advice and an actionable plan for improving the relationship.
      "steps": string[]  // Include specific steps (e.g., "Discuss differing values during a weekly meeting").
    }
  }
}
  Ensure that:
- The "description" is formatted in markdown, covering all specified sections in a clear and balanced manner.
- The output is entirely in Japanese.
- The JSON is valid and adheres to the specified structure.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    const response = result.response;

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

  // グループ全体の相性平均を計算
  async calculateGroupCompatibilityAverage(groupId: string): Promise<number> {
    // グループ内の全メンバー間の相性結果を取得
    const { data: results, error } = await supabase
      .from("compatibility_results")
      .select("degree")
      .eq("group_id", groupId);

    if (error) throw error;
    if (!results || results.length === 0) return 0;

    // 平均値を計算して返す
    const sum = results.reduce((acc, result) => acc + result.degree, 0);
    return Math.round(sum / results.length);
  },

  // 最も相性の良いペアと最も相性の悪いペアを特定
  async identifyBestAndWorstPairs(groupId: string): Promise<{
    bestPair: { userIds: string[]; names: string[]; degree: number };
    worstPair: { userIds: string[]; names: string[]; degree: number };
  }> {
    // グループ内の全メンバー間の相性結果を取得
    const { data: results, error } = await supabase
      .from("compatibility_results")
      .select("user_a_id, user_b_id, degree")
      .eq("group_id", groupId);

    if (error) throw error;
    if (!results || results.length === 0) {
      throw new Error("グループの相性診断結果が見つかりません");
    }

    // 相性度の最大値と最小値を特定
    let bestPair = { userIds: ["", ""], names: ["", ""], degree: 0 };
    let worstPair = { userIds: ["", ""], names: ["", ""], degree: 100 };

    for (const result of results) {
      // 最高相性ペアの更新
      if (result.degree > bestPair.degree) {
        bestPair = {
          userIds: [result.user_a_id, result.user_b_id],
          names: ["", ""], // 一時的に空文字を設定、後で名前を取得
          degree: result.degree,
        };
      }

      // 最低相性ペアの更新
      if (result.degree < worstPair.degree) {
        worstPair = {
          userIds: [result.user_a_id, result.user_b_id],
          names: ["", ""], // 一時的に空文字を設定、後で名前を取得
          degree: result.degree,
        };
      }
    }

    // ユーザーIDから名前を取得
    for (const pair of [bestPair, worstPair]) {
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", pair.userIds);

      if (profileError) throw profileError;

      // 名前を設定
      if (profiles) {
        pair.names = pair.userIds.map(
          (userId) => profiles.find((p) => p.id === userId)?.name || "不明なユーザー"
        );
      }
    }

    return { bestPair, worstPair };
  },

  // グループ全体の相性診断結果を生成
  async generateGroupCompatibilityAnalysis(groupId: string): Promise<{
    averageDegree: number;
    bestPair: { userIds: string[]; names: string[]; degree: number };
    worstPair: { userIds: string[]; names: string[]; degree: number };
    analysis: {
      overall_assessment: string;
      group_strengths: string;
      group_challenges: string;
      relationship_dynamics: string;
      growth_opportunities: string;
      action_plan: string;
      recommendations: string[];
    };
  }> {
    // グループメンバーを取得
    const { data: members, error: memberError } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId);

    if (memberError) throw memberError;
    if (!members || members.length < 2) {
      throw new Error("グループにはメンバーが2人以上必要です");
    }

    // グループ情報を取得
    const { data: groupData, error: groupError } = await supabase
      .from("groups")
      .select("name")
      .eq("group_id", groupId)
      .single();

    if (groupError) throw groupError;

    // 平均相性度を計算
    const averageDegree = await this.calculateGroupCompatibilityAverage(groupId);

    // ベスト・ワーストペアを特定
    const { bestPair, worstPair } = await this.identifyBestAndWorstPairs(groupId);

    // すべてのメンバーの詳細データを取得
    const memberDataPromises = members.map((member) =>
      this.getMemberData(member.user_id)
    );
    const membersData = await Promise.all(memberDataPromises);

    // グループ分析のためのAIプロンプト
    const prompt = `あなたはチーム分析の専門家です。以下のグループの相性分析を行ってください。

# グループ情報
グループ名: ${groupData.name}
メンバー数: ${members.length}人
平均相性度: ${averageDegree}%
最も相性の良いペア: ${bestPair.names[0]}と${bestPair.names[1]} (${bestPair.degree}%)
最も改善が必要なペア: ${worstPair.names[0]}と${worstPair.names[1]} (${worstPair.degree}%)

# メンバーデータ
${JSON.stringify(membersData, null, 2)}

# 分析要件
以下の項目についてグループ全体の分析を行い、日本語で回答してください:
1. 全体評価: グループの相性の総合的な評価と特徴
2. グループの強み: チームとしての強みや長所
3. グループの課題: 改善すべき点や潜在的な問題
4. 関係性ダイナミクス: グループ内の人間関係の特徴や傾向
5. 成長可能性: グループとしての成長機会や発展性
6. アクションプラン: グループとしての改善方法
7. 具体的な推奨事項: 簡潔な箇条書きで5つほど提案

# 出力形式
以下のJSON形式で出力してください（コードブロックやマークダウン形式は不要）:

{
  "overall_assessment": "グループ全体の評価",
  "group_strengths": "グループの強み",
  "group_challenges": "グループの課題",
  "relationship_dynamics": "関係性ダイナミクス",
  "growth_opportunities": "成長可能性",
  "action_plan": "アクションプラン",
  "recommendations": ["推奨事項1", "推奨事項2", "推奨事項3", "推奨事項4", "推奨事項5"]
}`;

    // AIによる分析を生成
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const aiResult = await model.generateContent(prompt);
    const aiResponse = aiResult.response;

    const analysisText = aiResponse.text().trim();
    // マークダウンや不要なフォーマットを除去
    const cleanText = analysisText.replace(/```json\n?|\n?```/g, "").trim();

    try {
      const analysis = JSON.parse(cleanText);
      return {
        averageDegree,
        bestPair,
        worstPair,
        analysis,
      };
    } catch (error) {
      console.error("グループ分析の解析エラー:", error, cleanText);
      throw new Error("グループ分析の解析に失敗しました");
    }
  },

  // グループ相性診断結果を保存
  async saveGroupCompatibilityResult(
    groupId: string,
    result: {
      averageDegree: number;
      bestPair: { userIds: string[]; names: string[]; degree: number };
      worstPair: { userIds: string[]; names: string[]; degree: number };
      analysis: {
        overall_assessment: string;
        group_strengths: string;
        group_challenges: string;
        relationship_dynamics: string;
        growth_opportunities: string;
        action_plan: string;
        recommendations: string[];
      };
    }
  ) {
    if (!groupId) {
      throw new Error("グループIDが指定されていません");
    }



    const { error } = await supabase.from("group_compatibility_results").upsert(
      {
        id: uuidv4(),
        group_id: groupId,
        average_degree: result.averageDegree,
        best_pair: {
          user_ids: result.bestPair.userIds,
          names: result.bestPair.names,
          degree: result.bestPair.degree,
        },
        worst_pair: {
          user_ids: result.worstPair.userIds,
          names: result.worstPair.names,
          degree: result.worstPair.degree,
        },
        analysis: result.analysis,
        created_at: new Date().toISOString(),
      },
      {
        onConflict: "group_id",
        ignoreDuplicates: false,
      }
    );

    if (error) {
      console.error("グループ相性診断結果の保存エラー:", error);
      throw error;
    }
  },

  // グループ相性診断を実行して結果を保存
  async generateAndSaveGroupCompatibility(groupId: string): Promise<{
    averageDegree: number;
    bestPair: { userIds: string[]; names: string[]; degree: number };
    worstPair: { userIds: string[]; names: string[]; degree: number };
    analysis: {
      overall_assessment: string;
      group_strengths: string;
      group_challenges: string;
      relationship_dynamics: string;
      growth_opportunities: string;
      action_plan: string;
      recommendations: string[];
    };
  }> {
    // 入力検証
    if (!groupId || typeof groupId !== 'string') {
      throw new Error("無効なグループIDが指定されました");
    }

    // グループ全体の相性分析を生成
    const result = await this.generateGroupCompatibilityAnalysis(groupId);

    try {
      // 結果を保存
      await this.saveGroupCompatibilityResult(groupId, result);
    } catch (error) {
      console.error("グループ相性診断結果の保存に失敗:", error);
      // 保存に失敗しても結果は返す
    }

    return result;
  },

  // グループの保存済み相性診断結果を取得
  async getGroupCompatibilityResult(groupId: string) {
    try {
      // 入力検証: groupIdが正しい形式かチェック
      if (!groupId || typeof groupId !== 'string') {
        console.error("無効なgroup_id:", groupId);
        throw new Error("有効なグループIDを指定してください");
      }

      console.log("グループ相性診断結果を取得中:", groupId);

      const { data, error } = await supabase
        .from("group_compatibility_results")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("相性診断結果取得エラー:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log("グループの相性診断結果が見つかりませんでした:", groupId);
        return null;
      }

      return data[0];
    } catch (error) {
      // テーブルが存在しないエラーの場合は表示しない（既に上で処理済み）
      if (!(error as any)?.message?.includes('does not exist')) {
        console.error("相性診断結果取得エラー:", error);
      }
      // nullを返すことでGeminiでの生成にフォールバックする
      return null;
    }
  },

  async saveCompatibilityResult(
    groupId: string,
    personAId: string,
    personBId: string,
    result: CompatibilityResult
  ) {
    // 入力検証
    if (!groupId || !personAId || !personBId) {
      throw new Error("グループIDまたはユーザーIDが指定されていません");
    }

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

    if (error) {
      console.error("相性診断結果の保存エラー:", error);
      throw error;
    }
  },

  async generateAndSaveCompatibilityForNewMember(
    groupId: string,
    newMemberId: string
  ) {
    // 入力検証
    if (!groupId || !newMemberId) {
      throw new Error("グループIDまたは新メンバーIDが指定されていません");
    }

    // グループの既存メンバーを取得
    const { data: existingMembers, error: memberError } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId)
      .neq("user_id", newMemberId);

    if (memberError) {
      console.error("グループメンバー取得エラー:", memberError);
      throw memberError;
    }

    if (!existingMembers || existingMembers.length === 0) {
      console.log("既存メンバーが見つかりません:", groupId);
      return; // 既存メンバーがいなければ処理終了
    }

    // 新メンバーのデータを取得
    const newMemberData = await this.getMemberData(newMemberId);
    if (!newMemberData) {
      throw new Error("新メンバーのデータが見つかりません");
    }

    // 既存メンバーそれぞれとの相性診断を実行
    const compatibilityPromises = existingMembers.map(async (member) => {
      try {
        const existingMemberData = await this.getMemberData(member.user_id);
        if (!existingMemberData) {
          console.warn(`メンバー ${member.user_id} のデータが見つかりません`);
          return;
        }

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
      } catch (error) {
        console.error(`メンバー ${member.user_id} との相性診断に失敗:`, error);
      }
    });

    await Promise.all(compatibilityPromises);

    // 全ての個別相性診断が完了した後、グループ全体の相性診断を実行
    try {
      console.log(`新メンバー追加に伴いグループ全体の相性診断を更新します: ${groupId}`);
      await this.generateAndSaveGroupCompatibility(groupId);
      console.log(`グループ全体の相性診断更新完了: ${groupId}`);
    } catch (error) {
      console.error(`グループ全体の相性診断更新中にエラーが発生: ${groupId}`, error);
      // グループ全体の診断に失敗しても、個別の相性診断は既に完了しているため処理は続行
    }
  },

  async getMemberData(userId: string) {
    if (!userId) {
      throw new Error("ユーザーIDが指定されていません");
    }

    try {
      // プロフィール情報を取得
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error(`ユーザー ${userId} のプロフィール取得エラー:`, profileError);
        throw profileError;
      }

      if (!profile) {
        console.error(`ユーザー ${userId} のプロフィールが見つかりません`);
        return null;
      }

      // アンケート回答を取得
      const { data: surveyResponse, error: surveyError } = await supabase
        .from("survey_responses")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (surveyError && surveyError.code !== 'PGRST116') { // PGRST116 は "結果なし" エラー
        console.error(`ユーザー ${userId} のアンケート回答取得エラー:`, surveyError);
        throw surveyError;
      }

      // パーソナリティコメントを取得
      const { data: personalityComment, error: commentError } = await supabase
        .from("personality_comments")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (commentError && commentError.code !== 'PGRST116') {
        console.error(`ユーザー ${userId} のパーソナリティコメント取得エラー:`, commentError);
        throw commentError;
      }

      return {
        profile,
        surveyResponse: surveyResponse || { responses: {} },
        personalityComment: personalityComment || { comment: "" },
      };
    } catch (error) {
      console.error(`ユーザー ${userId} のデータ取得中のエラー:`, error);
      throw error;
    }
  },

  // グループの相性診断結果を取得または生成する関数
  async ensureGroupCompatibilityResult(groupId: string): Promise<GroupCompatibilityResult | null> {
    try {
      // まず既存の結果を取得
      const existingResult = await this.getGroupCompatibilityResult(groupId);
      if (existingResult) {
        console.log("既存の相性診断結果を使用します:", groupId);
        return existingResult;
      }

      console.log("相性診断結果が見つからないため、新たに生成します:", groupId);

      // 結果が見つからない場合は新たに生成して保存
      const result = await this.generateAndSaveGroupCompatibility(groupId);

      // UIで表示できる形式に変換
      const formattedResult: GroupCompatibilityResult = {
        id: 'generated-' + Date.now(),
        group_id: groupId,
        average_degree: result.averageDegree,
        best_pair: {
          user_ids: result.bestPair.userIds,
          names: result.bestPair.names,
          degree: result.bestPair.degree
        },
        worst_pair: {
          user_ids: result.worstPair.userIds,
          names: result.worstPair.names,
          degree: result.worstPair.degree
        },
        analysis: result.analysis,
        created_at: new Date().toISOString()
      };

      return formattedResult;
    } catch (error: any) {
      console.error("グループ相性診断の自動生成に失敗:", error);
      return null;
    }
  },
};
