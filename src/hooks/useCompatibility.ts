import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { CompatibilityResult, GroupCompatibilityResult } from "../types";
import { authService } from "../services/authService";
import { compatibilityService } from "../services/compatibilityService";
import { MemoryCache, generateCacheKey } from "../utils/cacheUtils";

// キャッシュの設定
const CACHE_PREFIX = "group-compatibility";
const CACHE_EXPIRY = 30 * 60 * 1000; // 30分

interface Member {
  user_id: string;
  name: string;
}

export const useCompatibility = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string>("グループ");

  // グループ診断関連の状態
  const [groupDiagnosisLoading, setGroupDiagnosisLoading] = useState(false);
  const [groupCompatibilityResult, setGroupCompatibilityResult] =
    useState<GroupCompatibilityResult | null>(null);
  const [isBackgroundUpdating, setIsBackgroundUpdating] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // キャッシュシングルトンインスタンスの取得
  const cache = MemoryCache.getInstance();

  useEffect(() => {
    fetchGroupData();
    fetchGroupCompatibilityResult();
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      // グループ名を取得
      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .select("name")
        .eq("group_id", groupId)
        .single();

      if (groupError) throw groupError;
      if (groupData) {
        setGroupName(groupData.name);
      }

      await fetchMembers();
    } catch (error) {
      console.error("グループデータ取得エラー:", error);
      setError("グループ情報の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("ユーザーが見つかりません");

      const { data: memberData, error: memberError } = await supabase
        .from("group_members")
        .select("user_id")
        .eq("group_id", groupId)
        .neq("user_id", user.id);

      if (memberError) throw memberError;

      const userIds = memberData.map((member) => member.user_id);
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", userIds);

      if (profileError) throw profileError;

      const members = memberData.map((member) => {
        const profile = profileData.find((p) => p.id === member.user_id);
        return {
          user_id: member.user_id,
          name: profile?.name || "不明なユーザー",
        };
      });

      setMembers(members);
    } catch (error) {
      console.error("メンバー取得エラー:", error);
      setError("メンバー情報の取得に失敗しました");
    }
  };

  const fetchCompatibility = async (
    memberId: string
  ): Promise<CompatibilityResult> => {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error("ユーザーが見つかりません");

    const { data, error: resultError } = await supabase
      .from("compatibility_results")
      .select("*")
      .eq("group_id", groupId)
      .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
      .or(`user_a_id.eq.${memberId},user_b_id.eq.${memberId}`);

    if (resultError) throw resultError;

    // 複数の結果から、該当する組み合わせの結果を探す
    const result = data.find(
      (r) =>
        (r.user_a_id === user.id && r.user_b_id === memberId) ||
        (r.user_a_id === memberId && r.user_b_id === user.id)
    );

    if (!result) {
      throw new Error("相性診断結果が見つかりません");
    }

    return {
      degree: result.degree,
      description: result.description,
      advice: result.advice,
    };
  };

  // グループ全体の相性診断結果を取得
  const fetchGroupCompatibilityResult = async () => {
    try {
      if (!groupId) return;

      // キャッシュキーの生成
      const cacheKey = generateCacheKey(CACHE_PREFIX, groupId);

      // キャッシュから結果を取得
      const cachedResult = cache.get<GroupCompatibilityResult>(cacheKey);
      if (cachedResult) {
        console.log("キャッシュから相性診断結果を取得:", groupId);
        setGroupCompatibilityResult(cachedResult);
        return;
      }

      // キャッシュにない場合はデータベースから取得を試みる
      try {
        setGroupDiagnosisLoading(true);

        // 新しく追加した関数を使用して、結果が見つからない場合は自動的に生成
        const result = await compatibilityService.ensureGroupCompatibilityResult(groupId);

        if (result) {
          setGroupCompatibilityResult(result);
          // キャッシュに保存
          cache.set(cacheKey, result, CACHE_EXPIRY);
          setLastUpdateTime(new Date(result.created_at));
        } else {
          // エラーの場合はGeminiのみで生成を試みる
          await generateWithGeminiOnly(false);
        }
      } catch (error) {
        console.error("グループ相性診断結果の取得に失敗:", error);
        // エラーの場合もGeminiのみで生成を試みる
        await generateWithGeminiOnly(false);
      } finally {
        setGroupDiagnosisLoading(false);
      }
    } catch (error: any) {
      console.error("グループ相性診断結果の処理に失敗:", error);
      setError(`グループ相性診断結果の処理に失敗しました: ${error.message || '不明なエラー'}`);
    }
  };

  // バックグラウンドで診断結果を更新
  const triggerBackgroundUpdate = async () => {
    if (isBackgroundUpdating || !groupId) return;

    try {
      setIsBackgroundUpdating(true);

      // 新しい結果を生成（Supabaseまたは必要に応じてGemini）
      const newResult = await compatibilityService.generateAndSaveGroupCompatibility(groupId);

      // 新しい結果をキャッシュと状態に設定
      const cacheKey = generateCacheKey(CACHE_PREFIX, groupId);
      cache.set(cacheKey, newResult, CACHE_EXPIRY);
      setGroupCompatibilityResult(newResult as unknown as GroupCompatibilityResult);
      setLastUpdateTime(new Date());

      console.log("バックグラウンド更新が完了しました");
    } catch (error) {
      console.error("バックグラウンド更新中にエラーが発生しました:", error);
    } finally {
      setIsBackgroundUpdating(false);
    }
  };

  // Geminiのみを使用してグループ相性を生成（データベースを使用しない）
  const generateWithGeminiOnly = async (showLoading = false) => {
    try {
      if (showLoading) {
        setGroupDiagnosisLoading(true);
      }

      // Geminiから直接結果を生成
      const result = await compatibilityService.generateGroupCompatibilityAnalysis(groupId!);

      // UIに表示するために正しい形式に変換
      const formattedResult = {
        id: 'temporary-' + Date.now(),
        group_id: groupId!,
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

      setGroupCompatibilityResult(formattedResult);

      // キャッシュに結果を保存
      const cacheKey = generateCacheKey(CACHE_PREFIX, groupId!);
      cache.set(cacheKey, formattedResult, CACHE_EXPIRY);
      setLastUpdateTime(new Date());

    } catch (error) {
      console.error("Geminiからのグループ相性診断生成に失敗:", error);
      setError("グループ全体の相性診断に失敗しました");
    } finally {
      if (showLoading) {
        setGroupDiagnosisLoading(false);
      }
    }
  };

  // グループ全体の相性診断を実行
  const generateGroupCompatibility = async (showLoading = true) => {
    if (!groupId) return;

    try {
      if (showLoading) {
        setGroupDiagnosisLoading(true);
      }

      try {
        // まずSupabaseへの保存を試みる
        const result = await compatibilityService.generateAndSaveGroupCompatibility(groupId);

        // 結果を状態とキャッシュに設定
        setGroupCompatibilityResult(result as unknown as GroupCompatibilityResult);
        const cacheKey = generateCacheKey(CACHE_PREFIX, groupId);
        cache.set(cacheKey, result, CACHE_EXPIRY);
        setLastUpdateTime(new Date());

      } catch (dbError: any) {
        // データベースエラーの場合（テーブルが存在しない場合など）
        console.error("Supabaseへの保存に失敗:", dbError);

        // テーブルが存在しない場合はGeminiのみを使用
        if (dbError.code === "42P01" || dbError.message?.includes("does not exist")) {
          console.log("データベーステーブルが存在しないため、Geminiから直接生成します");
          await generateWithGeminiOnly(false); // ローディング表示は既に行われているので不要
        } else {
          // その他のエラーの場合も、Geminiのみで生成を試みる
          console.error("データベースエラー詳細:", dbError);
          await generateWithGeminiOnly(false);
        }
      }
    } catch (error: any) {
      console.error("グループ相性診断の生成に失敗:", error);
      setError(`グループ全体の相性診断に失敗しました: ${error.message || '不明なエラー'}`);
    } finally {
      if (showLoading) {
        setGroupDiagnosisLoading(false);
      }
    }
  };

  return {
    members,
    loading,
    error,
    fetchCompatibility,
    groupName,
    groupCompatibilityResult,
    groupDiagnosisLoading,
    generateGroupCompatibility,
    isBackgroundUpdating,
    lastUpdateTime
  };
};
