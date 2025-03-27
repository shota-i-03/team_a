import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { groupService } from "../services/groupService";
import { compatibilityService } from "../services/compatibilityService";
import { Group } from "../types/index";
import { authService } from "../services/authService";

export function useGroupRegistration() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"create" | "join" | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    group_id: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (mode === "join") {
      fetchGroups();
    }
  }, [mode]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const user = await authService.getCurrentUser();
      if (!user) {
        setError("ユーザーが見つかりません");
        return;
      }

      // 全グループを取得
      const allGroups = await groupService.getGroups();

      // ユーザーが所属しているグループを取得
      const userGroups = await groupService.getUserGroups(user.id);
      const userGroupIds = new Set(userGroups.map((group) => group.group_id));

      // 所属していないグループのみをフィルタリング
      const availableGroups = allGroups.filter(
        (group) => !userGroupIds.has(group.group_id)
      );

      setGroups(availableGroups);
    } catch (err) {
      console.error("グループ一覧の取得に失敗:", err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        setError("ユーザーが見つかりません");
        return;
      }

      if (mode === "create") {
        await groupService.createGroup(formData.name, user.id);
        navigate(`/home`);
      } else if (mode === "join") {
        await groupService.joinGroup(formData.group_id, user.id);
        //このタイミングで相性診断を生成して保存
        await compatibilityService.generateAndSaveCompatibilityForNewMember(
          formData.group_id,
          user.id
        );
        navigate(`/compatibility/${formData.group_id}`);
      }
    } catch (err) {
      console.error("予期せぬエラー:", err);
      setError("予期せぬエラーが発生しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mode,
    setMode,
    formData,
    setFormData,
    error,
    groups,
    loading,
    handleSubmit,
    isLoading,
  };
}
