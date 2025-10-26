export type ConsentType = 'essential' | 'analytics' | 'marketing' | 'third_party';

export interface ConsentRecord {
  id: string;
  user_id: string;
  consent_type: ConsentType;
  granted: boolean;
  ip_address: string | null;
  user_agent: string | null;
  granted_at: string;
  withdrawn_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConsentPreferences {
  essential: boolean; // 필수 (항상 true)
  analytics: boolean;
  marketing: boolean;
  third_party: boolean;
}

export interface CreateConsentInput {
  consent_type: ConsentType;
  granted: boolean;
  ip_address?: string;
  user_agent?: string;
}


