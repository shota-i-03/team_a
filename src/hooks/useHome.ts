import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GroupMember } from "../services/groupService";
import { groupService } from "../services/groupService";
import { authService } from "../services/authService";
import { Profile } from "../types";

export const useHome = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [leavingGroup, setLeavingGroup] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [removingMember, setRemovingMember] = useState<{
    groupId: string;
    userId: string;
    name: string;
  } | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    checkAuthAndFetchGroups();
    fetchProfile();
  }, []);

  const checkAuthAndFetchGroups = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        navigate("/register");
      }
      await fetchGroups();
    } catch (error) {
      console.error("認証エラー:", error);
      setError("認証に失敗しました");
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("ユーザーが見つかりません");

      const allGroups = await groupService.getGroups();
      // ユーザーが所属するグループのみをフィルタリング
      const userGroups = allGroups.filter((group) =>
        group.members.some((member) => member.user_id === user.id)
      );
      setGroups(userGroups);
    } catch (error) {
      console.error("グループ取得エラー:", error);
      setError("グループの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("ユーザーが見つかりません");
      const profile = await groupService.getProfile(user.id);
      setProfile(profile);
    } catch (error) {
      console.error("ユーザープロフィール取得エラー:", error);
      setError("ユーザープロフィールの取得に失敗しました");
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("ユーザーが見つかりません");

      await groupService.leaveGroup(groupId, user.id);
      await fetchGroups();
    } catch (error) {
      console.error("グループ退出エラー:", error);
      setError("グループからの退出に失敗しました");
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("ユーザーが見つかりません");

      // グループのメンバーを全員削除
      await groupService.deleteGroup(groupId);
      await fetchGroups();
      setDeletingGroup(null);
    } catch (error) {
      console.error("グループ削除エラー:", error);
      setError("グループの削除に失敗しました");
    }
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const handleRemoveMember = async (groupId: string, userId: string) => {
    try {
      await groupService.leaveGroup(groupId, userId);
      await fetchGroups();
      setRemovingMember(null);
    } catch (error) {
      console.error("メンバー削除エラー:", error);
      setError("メンバーの削除に失敗しました");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // ユーザーのデータを削除
      await authService.deleteAccount();
      // 感謝ページにリダイレクト
      navigate("/thank-you");
    } catch (error) {
      console.error("アカウント削除エラー:", error);
      setError("アカウントの削除に失敗しました");
      setIsDeletingAccount(false);
    }
  };

  return {
    groups,
    loading,
    error,
    profile,
    leavingGroup,
    setLeavingGroup,
    deletingGroup,
    setDeletingGroup,
    expandedGroups,
    toggleGroup,
    removingMember,
    setRemovingMember,
    handleLeaveGroup,
    handleDeleteGroup,
    handleRemoveMember,
    navigate,
    isDeletingAccount,
    setIsDeletingAccount,
    handleDeleteAccount,
  };
};
