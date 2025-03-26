import { supabase } from "../lib/supabase";

export interface GroupMember {
  group_id: string;
  name: string;
  created_at: string;
  created_by: string;
  member_count: number;
  members: {
    user_id: string;
    name: string;
  }[];
}

export const groupService = {
  async createGroup(name: string, userId: string) {
    const group_id = this.generateGroupId();

    const { error: groupError } = await supabase.from("groups").insert({
      name,
      group_id,
      created_by: userId,
    });

    if (groupError) throw groupError;

    const { error: memberError } = await supabase.from("group_members").insert({
      group_id,
      user_id: userId,
      role: "admin",
    });

    if (memberError) throw memberError;

    return group_id;
  },

  async joinGroup(groupId: string, userId: string) {
    const { error } = await supabase.from("group_members").insert({
      group_id: groupId,
      user_id: userId,
      role: "member",
    });

    if (error) throw error;
  },

  async getGroups(): Promise<GroupMember[]> {
    const { data: groups, error } = await supabase
      .from("groups")
      .select("group_id, name, created_by, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // 各グループのメンバー情報を取得
    const groupsWithDetails = await Promise.all(
      (groups || []).map(async (group) => {
        // メンバー数を取得
        const { count, error: countError } = await supabase
          .from("group_members")
          .select("*", { count: "exact", head: true })
          .eq("group_id", group.group_id);

        if (countError) {
          throw countError;
        }

        // メンバーのIDを取得
        const { data: memberData, error: memberError } = await supabase
          .from("group_members")
          .select("user_id")
          .eq("group_id", group.group_id);

        if (memberError) {
          throw memberError;
        }

        // メンバーの名前を取得
        const userIds = memberData.map((member) => member.user_id);
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", userIds);

        if (profileError) {
          throw profileError;
        }

        // メンバー情報を整形
        const members = memberData.map((member) => {
          const profile = profileData.find((p) => p.id === member.user_id);
          return {
            user_id: member.user_id,
            name: profile?.name || "不明なユーザー",
          };
        });

        return {
          group_id: group.group_id,
          name: group.name,
          created_at: group.created_at,
          created_by: group.created_by,
          member_count: count || 0,
          members,
        };
      })
    );

    return groupsWithDetails;
  },

  async getGroupMemberCount(groupId: string) {
    const { count, error } = await supabase
      .from("group_members")
      .select("*", { count: "exact", head: true })
      .eq("group_id", groupId);

    if (error) throw error;
    return count || 0;
  },

  generateGroupId() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `group-${timestamp}-${randomStr}`;
  },

  async getProfile(userId: string) {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, name, blood_type, birthdate, zodiac, mbti")
      .eq("id", userId)
      .single();

    if (profileError) {
      throw profileError;
    }

    return profileData;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    // グループの作成者かどうかを確認
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("created_by")
      .eq("group_id", groupId)
      .single();

    if (groupError) throw groupError;
    if (group.created_by === userId) {
      throw new Error("グループの作成者はグループを抜けることができません");
    }

    // グループメンバーから削除
    const { error: memberError } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", userId);

    if (memberError) throw memberError;

    // 相性診断結果を削除
    const { error: compatibilityError } = await supabase
      .from("compatibility_results")
      .delete()
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .eq("group_id", groupId);

    if (compatibilityError) throw compatibilityError;
  },

  async deleteGroup(groupId: string) {
    // まずグループのメンバーを全員削除
    const { error: membersError } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId);

    if (membersError) throw membersError;

    // 相性診断結果を削除
    const { error: compatibilityError } = await supabase
      .from("compatibility_results")
      .delete()
      .eq("group_id", groupId);

    if (compatibilityError) throw compatibilityError;

    // グループ自体を削除
    const { error: groupError } = await supabase
      .from("groups")
      .delete()
      .eq("group_id", groupId);

    if (groupError) throw groupError;
  },

  async getUserGroups(userId: string): Promise<GroupMember[]> {
    const { data: memberGroups, error: memberError } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", userId);

    if (memberError) throw memberError;

    if (!memberGroups || memberGroups.length === 0) {
      return [];
    }

    const groupIds = memberGroups.map((mg) => mg.group_id);
    const { data: groups, error: groupError } = await supabase
      .from("groups")
      .select("group_id, name, created_by, created_at")
      .in("group_id", groupIds)
      .order("created_at", { ascending: false });

    if (groupError) throw groupError;

    // 各グループのメンバー情報を取得
    const groupsWithDetails = await Promise.all(
      (groups || []).map(async (group) => {
        // メンバー数を取得
        const { count, error: countError } = await supabase
          .from("group_members")
          .select("*", { count: "exact", head: true })
          .eq("group_id", group.group_id);

        if (countError) {
          throw countError;
        }

        // メンバーのIDを取得
        const { data: memberData, error: memberError } = await supabase
          .from("group_members")
          .select("user_id")
          .eq("group_id", group.group_id);

        if (memberError) {
          throw memberError;
        }

        // メンバーの名前を取得
        const userIds = memberData.map((member) => member.user_id);
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", userIds);

        if (profileError) {
          throw profileError;
        }

        // メンバー情報を整形
        const members = memberData.map((member) => {
          const profile = profileData.find((p) => p.id === member.user_id);
          return {
            user_id: member.user_id,
            name: profile?.name || "不明なユーザー",
          };
        });

        return {
          group_id: group.group_id,
          name: group.name,
          created_at: group.created_at,
          created_by: group.created_by,
          member_count: count || 0,
          members,
        };
      })
    );

    return groupsWithDetails;
  },
};
