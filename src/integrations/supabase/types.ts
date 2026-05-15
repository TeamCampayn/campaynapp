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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          applied_at: string
          brand_feedback: string | null
          campaign_id: string
          estimated_earning_inr: number
          final_earning_inr: number | null
          flag_reason: string | null
          id: string
          is_flagged: boolean
          payout_due_at: string | null
          post_url: string | null
          posted_at: string | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
          user_id: string
          verified_views: number | null
        }
        Insert: {
          applied_at?: string
          brand_feedback?: string | null
          campaign_id: string
          estimated_earning_inr?: number
          final_earning_inr?: number | null
          flag_reason?: string | null
          id?: string
          is_flagged?: boolean
          payout_due_at?: string | null
          post_url?: string | null
          posted_at?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id: string
          verified_views?: number | null
        }
        Update: {
          applied_at?: string
          brand_feedback?: string | null
          campaign_id?: string
          estimated_earning_inr?: number
          final_earning_inr?: number | null
          flag_reason?: string | null
          id?: string
          is_flagged?: boolean
          payout_due_at?: string | null
          post_url?: string | null
          posted_at?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id?: string
          verified_views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          brand_logo_url: string | null
          brand_name: string
          brief: string
          budget_inr: number
          cover_image_url: string | null
          cpv_paise: number
          created_at: string
          created_by: string | null
          deadline: string | null
          deliverables: string[]
          do_dont: Json
          id: string
          payout_window_days: number
          platform: Database["public"]["Enums"]["platform_type"]
          requires_script: boolean
          slots_filled: number
          slots_total: number
          status: Database["public"]["Enums"]["campaign_status"]
          tagline: string | null
          target_niches: string[]
          target_tiers: Database["public"]["Enums"]["creator_tier"][]
          title: string
          updated_at: string
        }
        Insert: {
          brand_logo_url?: string | null
          brand_name: string
          brief: string
          budget_inr?: number
          cover_image_url?: string | null
          cpv_paise?: number
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          deliverables?: string[]
          do_dont?: Json
          id?: string
          payout_window_days?: number
          platform?: Database["public"]["Enums"]["platform_type"]
          requires_script?: boolean
          slots_filled?: number
          slots_total?: number
          status?: Database["public"]["Enums"]["campaign_status"]
          tagline?: string | null
          target_niches?: string[]
          target_tiers?: Database["public"]["Enums"]["creator_tier"][]
          title: string
          updated_at?: string
        }
        Update: {
          brand_logo_url?: string | null
          brand_name?: string
          brief?: string
          budget_inr?: number
          cover_image_url?: string | null
          cpv_paise?: number
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          deliverables?: string[]
          do_dont?: Json
          id?: string
          payout_window_days?: number
          platform?: Database["public"]["Enums"]["platform_type"]
          requires_script?: boolean
          slots_filled?: number
          slots_total?: number
          status?: Database["public"]["Enums"]["campaign_status"]
          tagline?: string | null
          target_niches?: string[]
          target_tiers?: Database["public"]["Enums"]["creator_tier"][]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      kyc: {
        Row: {
          aadhaar_last4: string | null
          notes: string | null
          pan_name: string | null
          pan_number: string | null
          status: Database["public"]["Enums"]["kyc_status"]
          submitted_at: string | null
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          aadhaar_last4?: string | null
          notes?: string | null
          pan_name?: string | null
          pan_number?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          submitted_at?: string | null
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          aadhaar_last4?: string | null
          notes?: string | null
          pan_name?: string | null
          pan_number?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          deep_link: string | null
          id: string
          kind: Database["public"]["Enums"]["notification_kind"]
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          deep_link?: string | null
          id?: string
          kind: Database["public"]["Enums"]["notification_kind"]
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          deep_link?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["notification_kind"]
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          campayn_score: number
          city: string | null
          coin_balance: number
          created_at: string
          display_name: string | null
          dob: string | null
          gender: string | null
          id: string
          instagram_bio: string | null
          languages: string[] | null
          lifetime_earnings: number
          niches: string[] | null
          onboarding_complete: boolean
          phone: string | null
          profile_completion: number
          referral_code: string | null
          score_breakdown: Json
          state: string | null
          updated_at: string
          youtube_about: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          campayn_score?: number
          city?: string | null
          coin_balance?: number
          created_at?: string
          display_name?: string | null
          dob?: string | null
          gender?: string | null
          id: string
          instagram_bio?: string | null
          languages?: string[] | null
          lifetime_earnings?: number
          niches?: string[] | null
          onboarding_complete?: boolean
          phone?: string | null
          profile_completion?: number
          referral_code?: string | null
          score_breakdown?: Json
          state?: string | null
          updated_at?: string
          youtube_about?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          campayn_score?: number
          city?: string | null
          coin_balance?: number
          created_at?: string
          display_name?: string | null
          dob?: string | null
          gender?: string | null
          id?: string
          instagram_bio?: string | null
          languages?: string[] | null
          lifetime_earnings?: number
          niches?: string[] | null
          onboarding_complete?: boolean
          phone?: string | null
          profile_completion?: number
          referral_code?: string | null
          score_breakdown?: Json
          state?: string | null
          updated_at?: string
          youtube_about?: string | null
        }
        Relationships: []
      }
      social_connections: {
        Row: {
          avg_views: number
          connected_at: string
          engagement_rate: number
          followers: number
          handle: string
          id: string
          is_stub: boolean
          platform: Database["public"]["Enums"]["platform_type"]
          tier: Database["public"]["Enums"]["creator_tier"]
          user_id: string
        }
        Insert: {
          avg_views?: number
          connected_at?: string
          engagement_rate?: number
          followers?: number
          handle: string
          id?: string
          is_stub?: boolean
          platform: Database["public"]["Enums"]["platform_type"]
          tier?: Database["public"]["Enums"]["creator_tier"]
          user_id: string
        }
        Update: {
          avg_views?: number
          connected_at?: string
          engagement_rate?: number
          followers?: number
          handle?: string
          id?: string
          is_stub?: boolean
          platform?: Database["public"]["Enums"]["platform_type"]
          tier?: Database["public"]["Enums"]["creator_tier"]
          user_id?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          application_id: string
          approved: boolean | null
          asset_url: string | null
          content: string | null
          created_at: string
          feedback: string | null
          id: string
          kind: Database["public"]["Enums"]["submission_kind"]
        }
        Insert: {
          application_id: string
          approved?: boolean | null
          asset_url?: string | null
          content?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          kind: Database["public"]["Enums"]["submission_kind"]
        }
        Update: {
          application_id?: string
          approved?: boolean | null
          asset_url?: string | null
          content?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["submission_kind"]
        }
        Relationships: [
          {
            foreignKeyName: "submissions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount_inr: number
          application_id: string | null
          created_at: string
          description: string | null
          id: string
          kind: Database["public"]["Enums"]["transaction_kind"]
          status: Database["public"]["Enums"]["transaction_status"]
          user_id: string
        }
        Insert: {
          amount_inr: number
          application_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          kind: Database["public"]["Enums"]["transaction_kind"]
          status?: Database["public"]["Enums"]["transaction_status"]
          user_id: string
        }
        Update: {
          amount_inr?: number
          application_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["transaction_kind"]
          status?: Database["public"]["Enums"]["transaction_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      view_snapshots: {
        Row: {
          application_id: string
          captured_at: string
          id: string
          views: number
        }
        Insert: {
          application_id: string
          captured_at?: string
          id?: string
          views?: number
        }
        Update: {
          application_id?: string
          captured_at?: string
          id?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "view_snapshots_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawals: {
        Row: {
          amount_inr: number
          created_at: string
          destination_kind: string
          destination_value: string
          id: string
          reference: string | null
          status: Database["public"]["Enums"]["withdrawal_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_inr: number
          created_at?: string
          destination_kind: string
          destination_value: string
          id?: string
          reference?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_inr?: number
          created_at?: string
          destination_kind?: string
          destination_value?: string
          id?: string
          reference?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      recompute_campayn_score: { Args: { _user_id: string }; Returns: number }
    }
    Enums: {
      app_role: "admin" | "creator"
      application_status:
        | "applied"
        | "approved"
        | "rejected"
        | "script_submitted"
        | "script_approved"
        | "revision_requested"
        | "video_submitted"
        | "video_approved"
        | "posted"
        | "verified"
        | "paid"
        | "withdrawn"
      campaign_status: "draft" | "active" | "paused" | "closed"
      creator_tier: "nano" | "micro" | "mid" | "macro"
      kyc_status: "not_started" | "pending" | "verified" | "rejected"
      notification_kind: "campaign" | "application" | "wallet" | "system"
      platform_type: "instagram" | "youtube" | "both"
      submission_kind: "script" | "video"
      transaction_kind:
        | "earning"
        | "withdrawal"
        | "bonus"
        | "referral"
        | "adjustment"
      transaction_status: "pending" | "completed" | "failed"
      withdrawal_status: "pending" | "processing" | "paid" | "failed"
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
      app_role: ["admin", "creator"],
      application_status: [
        "applied",
        "approved",
        "rejected",
        "script_submitted",
        "script_approved",
        "revision_requested",
        "video_submitted",
        "video_approved",
        "posted",
        "verified",
        "paid",
        "withdrawn",
      ],
      campaign_status: ["draft", "active", "paused", "closed"],
      creator_tier: ["nano", "micro", "mid", "macro"],
      kyc_status: ["not_started", "pending", "verified", "rejected"],
      notification_kind: ["campaign", "application", "wallet", "system"],
      platform_type: ["instagram", "youtube", "both"],
      submission_kind: ["script", "video"],
      transaction_kind: [
        "earning",
        "withdrawal",
        "bonus",
        "referral",
        "adjustment",
      ],
      transaction_status: ["pending", "completed", "failed"],
      withdrawal_status: ["pending", "processing", "paid", "failed"],
    },
  },
} as const
