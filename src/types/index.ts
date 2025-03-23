export interface Profile {
  id: string;
  name: string;
  blood_type: string;
  birthdate: string;
  zodiac: string;
  mbti?: string;
}

export interface SurveyResponse {
  id: string;
  user_id: string;
  responses: Record<string, number>;
  created_at: string;
}

export interface PersonalityComment {
  id: string;
  user_id: string;
  desired_traits: string;
  avoid_traits: string;
  ideal_relationship: string;
  created_at: string;
}

export interface Group {
  group_id: string;
  name: string;
  created_at: string;
  created_by: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  created_at: string;
}

export interface CompatibilityResult {
  degree: number;
  description: string;
  advice: string;
}
