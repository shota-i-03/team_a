import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { CompatibilityResult } from "../types";
import { authService } from "../services/authService";

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

  useEffect(() => {
    fetchGroupData();
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

  return {
    members,
    loading,
    error,
    fetchCompatibility,
    groupName,
  };
};
