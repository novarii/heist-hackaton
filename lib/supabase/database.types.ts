export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agent_endorsements: {
        Row: {
          agent_id: string
          author: string | null
          created_at: string
          happened_at: string | null
          id: string
          quote: string
        }
        Insert: {
          agent_id: string
          author?: string | null
          created_at?: string
          happened_at?: string | null
          id?: string
          quote: string
        }
        Update: {
          agent_id?: string
          author?: string | null
          created_at?: string
          happened_at?: string | null
          id?: string
          quote?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_endorsements_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_tag_map: {
        Row: {
          agent_id: string
          tag_id: string
          weight: number
        }
        Insert: {
          agent_id: string
          tag_id: string
          weight: number
        }
        Update: {
          agent_id?: string
          tag_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "agent_tag_map_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_tag_map_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "agent_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_tags: {
        Row: {
          id: string
          label: string
        }
        Insert: {
          id?: string
          label: string
        }
        Update: {
          id?: string
          label?: string
        }
        Relationships: []
      }
      agents: {
        Row: {
          base_rate: number | null
          created_at: string
          description: string | null
          experience_years: number | null
          id: string
          name: string
          pricing_model: string | null
          profile_embedding: string | null
          rating: number | null
          slug: string
          success_rate: number | null
          tagline: string | null
          updated_at: string
          visibility: Database["public"]["Enums"]["agent_visibility"]
        }
        Insert: {
          base_rate?: number | null
          created_at?: string
          description?: string | null
          experience_years?: number | null
          id?: string
          name: string
          pricing_model?: string | null
          profile_embedding?: string | null
          rating?: number | null
          slug: string
          success_rate?: number | null
          tagline?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["agent_visibility"]
        }
        Update: {
          base_rate?: number | null
          created_at?: string
          description?: string | null
          experience_years?: number | null
          id?: string
          name?: string
          pricing_model?: string | null
          profile_embedding?: string | null
          rating?: number | null
          slug?: string
          success_rate?: number | null
          tagline?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["agent_visibility"]
        }
        Relationships: []
      }
      anonymous_prompts: {
        Row: {
          created_at: string
          id: string
          ip_hash: string | null
          linked_profile_id: string | null
          n8n_run_id: string | null
          prompt_text: string
          source: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_hash?: string | null
          linked_profile_id?: string | null
          n8n_run_id?: string | null
          prompt_text: string
          source?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_hash?: string | null
          linked_profile_id?: string | null
          n8n_run_id?: string | null
          prompt_text?: string
          source?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anonymous_prompts_linked_profile_id_fkey"
            columns: ["linked_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comparison_candidates: {
        Row: {
          agent_id: string
          fit_score: number | null
          reasons: string[] | null
          session_id: string
        }
        Insert: {
          agent_id: string
          fit_score?: number | null
          reasons?: string[] | null
          session_id: string
        }
        Update: {
          agent_id?: string
          fit_score?: number | null
          reasons?: string[] | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comparison_candidates_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comparison_candidates_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "comparison_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      comparison_sessions: {
        Row: {
          anonymous_prompt_id: string | null
          created_at: string
          filter_payload: Json | null
          id: string
          profile_id: string | null
        }
        Insert: {
          anonymous_prompt_id?: string | null
          created_at?: string
          filter_payload?: Json | null
          id?: string
          profile_id?: string | null
        }
        Update: {
          anonymous_prompt_id?: string | null
          created_at?: string
          filter_payload?: Json | null
          id?: string
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comparison_sessions_anonymous_prompt_id_fkey"
            columns: ["anonymous_prompt_id"]
            isOneToOne: false
            referencedRelation: "anonymous_prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comparison_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_events: {
        Row: {
          created_at: string
          event_type: string
          id: number
          payload: Json
          provider: string
          reference_id: string | null
          status: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: number
          payload: Json
          provider: string
          reference_id?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: number
          payload?: Json
          provider?: string
          reference_id?: string | null
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company: string | null
          company_size: Database["public"]["Enums"]["company_size"] | null
          created_at: string
          focus_industries: string[] | null
          id: string
          onboarding_status: Database["public"]["Enums"]["onboarding_status"]
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          company_size?: Database["public"]["Enums"]["company_size"] | null
          created_at?: string
          focus_industries?: string[] | null
          id: string
          onboarding_status?: Database["public"]["Enums"]["onboarding_status"]
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          company_size?: Database["public"]["Enums"]["company_size"] | null
          created_at?: string
          focus_industries?: string[] | null
          id?: string
          onboarding_status?: Database["public"]["Enums"]["onboarding_status"]
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
      waitlist_entries: {
        Row: {
          agent_id: string | null
          comparison_session_id: string | null
          created_at: string
          email_override: string | null
          id: string
          message: string | null
          profile_id: string | null
          status: Database["public"]["Enums"]["waitlist_status"]
        }
        Insert: {
          agent_id?: string | null
          comparison_session_id?: string | null
          created_at?: string
          email_override?: string | null
          id?: string
          message?: string | null
          profile_id?: string | null
          status?: Database["public"]["Enums"]["waitlist_status"]
        }
        Update: {
          agent_id?: string | null
          comparison_session_id?: string | null
          created_at?: string
          email_override?: string | null
          id?: string
          message?: string | null
          profile_id?: string | null
          status?: Database["public"]["Enums"]["waitlist_status"]
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_entries_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_entries_comparison_session_id_fkey"
            columns: ["comparison_session_id"]
            isOneToOne: false
            referencedRelation: "comparison_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_entries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_is_service_role: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      agent_visibility: "public" | "hidden" | "internal"
      company_size: "small" | "medium" | "enterprise"
      onboarding_status: "pending" | "completed"
      user_role: "employer" | "founder" | "recruiter" | "other"
      waitlist_status: "new" | "contacted"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agent_visibility: ["public", "hidden", "internal"],
      company_size: ["small", "medium", "enterprise"],
      onboarding_status: ["pending", "completed"],
      user_role: ["employer", "founder", "recruiter", "other"],
      waitlist_status: ["new", "contacted"],
    },
  },
} as const
