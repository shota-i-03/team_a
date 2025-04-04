export interface Profile {
  id: string;
  name: string;
  blood_type: string;
  birthdate: string;
  zodiac: string;
  mbti?: string;
}

export interface SurveyResponse {
  user_id: string;
  responses: Record<string, number>;
  created_at: string;
}

export interface PersonalityComment {
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
  description: {
    diagnosis_reasons: string;
    strengths: string;
    weaknesses: string;
    negative_perspectives: string;
    positive_perspectives: string;
  };
  advice: {
    action_plan: string;
    steps: string[];
  };
}

export interface GroupCompatibilityResult {
  id: string;
  group_id: string;
  average_degree: number;
  best_pair: {
    user_ids: string[];
    names: string[];
    degree: number;
  };
  worst_pair: {
    user_ids: string[];
    names: string[];
    degree: number;
  };
  analysis: {
    overall_assessment: string;
    group_strengths: string;
    group_challenges: string;
    relationship_dynamics: string;
    growth_opportunities: string;
    action_plan: string;
    recommendations: string[];
  };
  created_at: string;
}
