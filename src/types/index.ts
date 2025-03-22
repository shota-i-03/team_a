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
  id: string;
  name: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  created_at: string;
}

export interface CompatibilityResult {
  id: string;
  user_a_id: string;
  user_b_id: string;
  compatibility_score: number;
  description: string;
  advice: string;
  created_at: string;
}