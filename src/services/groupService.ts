import { supabase } from "../lib/supabase";

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

  async getGroups() {
    const { data, error } = await supabase
      .from("groups")
      .select("group_id, name, created_by, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map((group) => ({
      group_id: group.group_id,
      name: group.name,
      created_by: group.created_by,
      created_at: group.created_at,
    }));
  },

  async getUserGroups(userId: string) {
    const { data, error } = await supabase
      .from("group_members")
      .select(
        `
        group_id,
        groups:group_id (
          name,
          created_at
        )
      `
      )
      .eq("user_id", userId);

    if (error) throw error;
    return (data || []).map((item) => ({
      group_id: item.group_id,
      name: item.groups?.[0]?.name || "",
      created_at: item.groups?.[0]?.created_at || "",
    }));
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
};
