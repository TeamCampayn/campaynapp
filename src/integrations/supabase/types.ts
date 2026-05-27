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
            referencedRelation: "legacy_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      audience_details: {
        Row: {
          age_range_max: number | null
          age_range_min: number | null
          campaign_id: string | null
          created_at: string | null
          id: string
          ideal_audience: string | null
          target_states: string[] | null
          updated_at: string | null
        }
        Insert: {
          age_range_max?: number | null
          age_range_min?: number | null
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          ideal_audience?: string | null
          target_states?: string[] | null
          updated_at?: string | null
        }
        Update: {
          age_range_max?: number | null
          age_range_min?: number | null
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          ideal_audience?: string | null
          target_states?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audience_details_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audience_details_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_payment_summary"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "audience_details_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_transactions: {
        Row: {
          amount: number
          brand_id: string | null
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          status: string | null
          type: string | null
        }
        Insert: {
          amount: number
          brand_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          status?: string | null
          type?: string | null
        }
        Update: {
          amount?: number
          brand_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          status?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_transactions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_wallets: {
        Row: {
          balance: number | null
          brand_id: string | null
          currency: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          balance?: number | null
          brand_id?: string | null
          currency?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          balance?: number | null
          brand_id?: string | null
          currency?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_wallets_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: true
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          brand_name: string
          brand_website: string
          company_size: string | null
          created_at: string | null
          description: string | null
          experience_level: string | null
          id: string
          industry: string | null
          monthly_budget: string | null
          niches: string[] | null
          social_handles: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          brand_name: string
          brand_website: string
          company_size?: string | null
          created_at?: string | null
          description?: string | null
          experience_level?: string | null
          id?: string
          industry?: string | null
          monthly_budget?: string | null
          niches?: string[] | null
          social_handles?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          brand_name?: string
          brand_website?: string
          company_size?: string | null
          created_at?: string | null
          description?: string | null
          experience_level?: string | null
          id?: string
          industry?: string | null
          monthly_budget?: string | null
          niches?: string[] | null
          social_handles?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      campaign_activities: {
        Row: {
          activity_type: string
          campaign_id: string | null
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          user_id: string
          user_type: string
        }
        Insert: {
          activity_type: string
          campaign_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          user_id: string
          user_type: string
        }
        Update: {
          activity_type?: string
          campaign_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          user_id?: string
          user_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_activities_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_activities_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_payment_summary"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "campaign_activities_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_contents: {
        Row: {
          admin_feedback: string | null
          approval_status: string | null
          approved_at: string | null
          brand_feedback: string | null
          campaign_id: string | null
          caption: string | null
          content_type: string
          content_url: string | null
          created_at: string | null
          creator_id: number | null
          hashtags: string[] | null
          id: string
          max_revisions: number | null
          performance_metrics: Json | null
          post_url: string | null
          posted_at: string | null
          posted_by: string | null
          revision_count: number | null
          scheduled_post_time: string | null
          thumbnail_url: string | null
          updated_at: string | null
        }
        Insert: {
          admin_feedback?: string | null
          approval_status?: string | null
          approved_at?: string | null
          brand_feedback?: string | null
          campaign_id?: string | null
          caption?: string | null
          content_type: string
          content_url?: string | null
          created_at?: string | null
          creator_id?: number | null
          hashtags?: string[] | null
          id?: string
          max_revisions?: number | null
          performance_metrics?: Json | null
          post_url?: string | null
          posted_at?: string | null
          posted_by?: string | null
          revision_count?: number | null
          scheduled_post_time?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_feedback?: string | null
          approval_status?: string | null
          approved_at?: string | null
          brand_feedback?: string | null
          campaign_id?: string | null
          caption?: string | null
          content_type?: string
          content_url?: string | null
          created_at?: string | null
          creator_id?: number | null
          hashtags?: string[] | null
          id?: string
          max_revisions?: number | null
          performance_metrics?: Json | null
          post_url?: string | null
          posted_at?: string | null
          posted_by?: string | null
          revision_count?: number | null
          scheduled_post_time?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_contents_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_contents_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_payment_summary"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "campaign_contents_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_contents_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_contents_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators_classified"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_creators: {
        Row: {
          admin_notes: string | null
          admin_reply: string | null
          admin_reply_at: string | null
          brand_reply: string | null
          brand_reply_at: string | null
          brand_response: string | null
          brand_response_at: string | null
          campaign_id: string | null
          created_at: string | null
          creator_id: number | null
          deliverables_completed: number | null
          deliverables_count: number | null
          id: string
          negotiated_rate: number | null
          performance_bonus: number | null
          recommended_by_admin: boolean | null
          selection_status: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          admin_reply?: string | null
          admin_reply_at?: string | null
          brand_reply?: string | null
          brand_reply_at?: string | null
          brand_response?: string | null
          brand_response_at?: string | null
          campaign_id?: string | null
          created_at?: string | null
          creator_id?: number | null
          deliverables_completed?: number | null
          deliverables_count?: number | null
          id?: string
          negotiated_rate?: number | null
          performance_bonus?: number | null
          recommended_by_admin?: boolean | null
          selection_status?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          admin_reply?: string | null
          admin_reply_at?: string | null
          brand_reply?: string | null
          brand_reply_at?: string | null
          brand_response?: string | null
          brand_response_at?: string | null
          campaign_id?: string | null
          created_at?: string | null
          creator_id?: number | null
          deliverables_completed?: number | null
          deliverables_count?: number | null
          id?: string
          negotiated_rate?: number | null
          performance_bonus?: number | null
          recommended_by_admin?: boolean | null
          selection_status?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_creators_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_creators_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_payment_summary"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "campaign_creators_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_creators_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_creators_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators_classified"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_payments: {
        Row: {
          admin_confirmed: boolean | null
          admin_confirmed_at: string | null
          admin_confirmed_by: string | null
          amount: number
          campaign_id: string | null
          created_at: string | null
          currency: string | null
          id: string
          paid_by: string | null
          paid_to: string | null
          payment_gateway_response: Json | null
          payment_method: string | null
          payment_status: string | null
          payment_type: string
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          admin_confirmed?: boolean | null
          admin_confirmed_at?: string | null
          admin_confirmed_by?: string | null
          amount: number
          campaign_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          paid_by?: string | null
          paid_to?: string | null
          payment_gateway_response?: Json | null
          payment_method?: string | null
          payment_status?: string | null
          payment_type: string
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_confirmed?: boolean | null
          admin_confirmed_at?: string | null
          admin_confirmed_by?: string | null
          amount?: number
          campaign_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          paid_by?: string | null
          paid_to?: string | null
          payment_gateway_response?: Json | null
          payment_method?: string | null
          payment_status?: string | null
          payment_type?: string
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_payments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_payments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_payment_summary"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "campaign_payments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_performance: {
        Row: {
          campaign_id: string | null
          content_id: string | null
          created_at: string | null
          creator_id: number | null
          data_source: string | null
          id: string
          measurement_date: string
          metric_type: string
          metric_value: number
        }
        Insert: {
          campaign_id?: string | null
          content_id?: string | null
          created_at?: string | null
          creator_id?: number | null
          data_source?: string | null
          id?: string
          measurement_date: string
          metric_type: string
          metric_value: number
        }
        Update: {
          campaign_id?: string | null
          content_id?: string | null
          created_at?: string | null
          creator_id?: number | null
          data_source?: string | null
          id?: string
          measurement_date?: string
          metric_type?: string
          metric_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaign_performance_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_performance_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_payment_summary"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "campaign_performance_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_performance_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "campaign_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_performance_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_performance_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators_classified"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          actual_creators_selected: number | null
          actual_metrics: Json | null
          admin_notes: string | null
          brand_id: string | null
          brand_notes: string | null
          budget: number
          campaign_completed_at: string | null
          campaign_description: string
          campaign_name: string
          campaign_objectives: string[] | null
          campaign_started_at: string | null
          campaign_type: string
          content_types: string[] | null
          cpv_rate: number | null
          created_at: string | null
          creator_category: string | null
          creator_tier: string | null
          creator_type: string | null
          creators_approved_count: number | null
          deliverables: Json | null
          description: string | null
          end_date: string | null
          estimated_cost_per_creator: number | null
          id: string
          max_affordable_creators: number | null
          payment_completed_at: string | null
          payment_confirmed_at: string | null
          payment_initiated: boolean | null
          payment_initiated_at: string | null
          payment_status: string | null
          phase: string | null
          platform_fee_percent: number | null
          requirements: string | null
          start_date: string | null
          status: string | null
          tagline: string | null
          target_category: string | null
          target_creators_count: number | null
          target_metrics: Json | null
          target_subcategory: string | null
          updated_at: string | null
        }
        Insert: {
          actual_creators_selected?: number | null
          actual_metrics?: Json | null
          admin_notes?: string | null
          brand_id?: string | null
          brand_notes?: string | null
          budget?: number
          campaign_completed_at?: string | null
          campaign_description: string
          campaign_name: string
          campaign_objectives?: string[] | null
          campaign_started_at?: string | null
          campaign_type: string
          content_types?: string[] | null
          cpv_rate?: number | null
          created_at?: string | null
          creator_category?: string | null
          creator_tier?: string | null
          creator_type?: string | null
          creators_approved_count?: number | null
          deliverables?: Json | null
          description?: string | null
          end_date?: string | null
          estimated_cost_per_creator?: number | null
          id?: string
          max_affordable_creators?: number | null
          payment_completed_at?: string | null
          payment_confirmed_at?: string | null
          payment_initiated?: boolean | null
          payment_initiated_at?: string | null
          payment_status?: string | null
          phase?: string | null
          platform_fee_percent?: number | null
          requirements?: string | null
          start_date?: string | null
          status?: string | null
          tagline?: string | null
          target_category?: string | null
          target_creators_count?: number | null
          target_metrics?: Json | null
          target_subcategory?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_creators_selected?: number | null
          actual_metrics?: Json | null
          admin_notes?: string | null
          brand_id?: string | null
          brand_notes?: string | null
          budget?: number
          campaign_completed_at?: string | null
          campaign_description?: string
          campaign_name?: string
          campaign_objectives?: string[] | null
          campaign_started_at?: string | null
          campaign_type?: string
          content_types?: string[] | null
          cpv_rate?: number | null
          created_at?: string | null
          creator_category?: string | null
          creator_tier?: string | null
          creator_type?: string | null
          creators_approved_count?: number | null
          deliverables?: Json | null
          description?: string | null
          end_date?: string | null
          estimated_cost_per_creator?: number | null
          id?: string
          max_affordable_creators?: number | null
          payment_completed_at?: string | null
          payment_confirmed_at?: string | null
          payment_initiated?: boolean | null
          payment_initiated_at?: string | null
          payment_status?: string | null
          phase?: string | null
          platform_fee_percent?: number | null
          requirements?: string | null
          start_date?: string | null
          status?: string | null
          tagline?: string | null
          target_category?: string | null
          target_creators_count?: number | null
          target_metrics?: Json | null
          target_subcategory?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_messages: {
        Row: {
          campaign_id: string
          created_at: string | null
          creator_id: number
          decision_type: string | null
          id: string
          message: string
          message_type: string
          sender_id: string
          sender_type: string
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          creator_id: number
          decision_type?: string | null
          id?: string
          message: string
          message_type?: string
          sender_id: string
          sender_type: string
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          creator_id?: number
          decision_type?: string | null
          id?: string
          message?: string
          message_type?: string
          sender_id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_payment_summary"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "conversation_messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_messages_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_messages_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators_classified"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_invites: {
        Row: {
          accepted_at: string | null
          campaign_id: string | null
          creator_id: number | null
          id: string
          invite_token: string | null
          sent_at: string | null
          status: string | null
          teaser_data: Json | null
        }
        Insert: {
          accepted_at?: string | null
          campaign_id?: string | null
          creator_id?: number | null
          id?: string
          invite_token?: string | null
          sent_at?: string | null
          status?: string | null
          teaser_data?: Json | null
        }
        Update: {
          accepted_at?: string | null
          campaign_id?: string | null
          creator_id?: number | null
          id?: string
          invite_token?: string | null
          sent_at?: string | null
          status?: string | null
          teaser_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_invites_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_invites_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_payment_summary"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "creator_invites_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_invites_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_invites_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators_classified"
            referencedColumns: ["id"]
          },
        ]
      }
      creators: {
        Row: {
          account_status: string | null
          avg_comments: number | null
          avg_likes: number | null
          avg_views: number | null
          bio: string | null
          campayn_score: number | null
          category: string | null
          content_style: string | null
          created_at: string | null
          engagement_rate: number | null
          external_id: string | null
          followers_count: number | null
          id: number
          ig_access_token: string | null
          ig_followers: number | null
          ig_handle: string
          ig_token_expires_at: string | null
          ig_user_id: string | null
          languages: string[] | null
          location: string | null
          name: string
          profile_picture_url: string | null
          subcategory: string | null
          updated_at: string | null
          user_id: string | null
          verified: boolean | null
        }
        Insert: {
          account_status?: string | null
          avg_comments?: number | null
          avg_likes?: number | null
          avg_views?: number | null
          bio?: string | null
          campayn_score?: number | null
          category?: string | null
          content_style?: string | null
          created_at?: string | null
          engagement_rate?: number | null
          external_id?: string | null
          followers_count?: number | null
          id?: number
          ig_access_token?: string | null
          ig_followers?: number | null
          ig_handle: string
          ig_token_expires_at?: string | null
          ig_user_id?: string | null
          languages?: string[] | null
          location?: string | null
          name: string
          profile_picture_url?: string | null
          subcategory?: string | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
        }
        Update: {
          account_status?: string | null
          avg_comments?: number | null
          avg_likes?: number | null
          avg_views?: number | null
          bio?: string | null
          campayn_score?: number | null
          category?: string | null
          content_style?: string | null
          created_at?: string | null
          engagement_rate?: number | null
          external_id?: string | null
          followers_count?: number | null
          id?: number
          ig_access_token?: string | null
          ig_followers?: number | null
          ig_handle?: string
          ig_token_expires_at?: string | null
          ig_user_id?: string | null
          languages?: string[] | null
          location?: string | null
          name?: string
          profile_picture_url?: string | null
          subcategory?: string | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      follower_history: {
        Row: {
          creator_id: number | null
          followers_count: number
          id: string
          recorded_at: string | null
        }
        Insert: {
          creator_id?: number | null
          followers_count: number
          id?: string
          recorded_at?: string | null
        }
        Update: {
          creator_id?: number | null
          followers_count?: number
          id?: string
          recorded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "follower_history_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follower_history_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators_classified"
            referencedColumns: ["id"]
          },
        ]
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
      legacy_campaigns: {
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
          hashtags: string[]
          id: string
          key_messages: string[]
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
          hashtags?: string[]
          id?: string
          key_messages?: string[]
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
          hashtags?: string[]
          id?: string
          key_messages?: string[]
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
      messages: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          id: string
          is_admin: boolean | null
          message: string
          message_type: string | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
          user_name: string
          user_type: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          message: string
          message_type?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name: string
          user_type: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          message?: string
          message_type?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string
          user_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_payment_summary"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
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
      payment_config: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string | null
          description: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          campaign_id: string
          created_at: string | null
          currency: string | null
          id: string
          payment_details: Json | null
          payment_method: string | null
          payment_verified_at: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          refund_details: Json | null
          refunded_at: string | null
          status: string
        }
        Insert: {
          amount: number
          campaign_id: string
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_details?: Json | null
          payment_method?: string | null
          payment_verified_at?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          refund_details?: Json | null
          refunded_at?: string | null
          status: string
        }
        Update: {
          amount?: number
          campaign_id?: string
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_details?: Json | null
          payment_method?: string | null
          payment_verified_at?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          refund_details?: Json | null
          refunded_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_payment_summary"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "payments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          id: string
          launch_status: string | null
          product_description: string | null
          product_features: string[] | null
          product_name: string
          product_website: string | null
          shipping_details: string | null
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          launch_status?: string | null
          product_description?: string | null
          product_features?: string[] | null
          product_name: string
          product_website?: string | null
          shipping_details?: string | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          launch_status?: string | null
          product_description?: string | null
          product_features?: string[] | null
          product_name?: string
          product_website?: string | null
          shipping_details?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_payment_summary"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "products_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
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
      quotation_items: {
        Row: {
          cost: number
          created_at: string | null
          creator_id: number
          description: string | null
          id: string
          item_type: string
          quotation_id: string
        }
        Insert: {
          cost: number
          created_at?: string | null
          creator_id: number
          description?: string | null
          id?: string
          item_type: string
          quotation_id: string
        }
        Update: {
          cost?: number
          created_at?: string | null
          creator_id?: number
          description?: string | null
          id?: string
          item_type?: string
          quotation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators_classified"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          creator_count: number
          estimated_reach: number
          id: string
          notes: string | null
          status: string | null
          total_cost: number
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          creator_count?: number
          estimated_reach?: number
          id?: string
          notes?: string | null
          status?: string | null
          total_cost: number
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          creator_count?: number
          estimated_reach?: number
          id?: string
          notes?: string | null
          status?: string | null
          total_cost?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_payment_summary"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "quotations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_details: {
        Row: {
          barter_discount: boolean | null
          campaign_id: string | null
          created_at: string | null
          id: string
          is_mrp: boolean | null
          product_shipping: boolean | null
          retail_value: number | null
          shipping_product_link: string | null
          shipping_product_name: string | null
          updated_at: string | null
        }
        Insert: {
          barter_discount?: boolean | null
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          is_mrp?: boolean | null
          product_shipping?: boolean | null
          retail_value?: number | null
          shipping_product_link?: string | null
          shipping_product_name?: string | null
          updated_at?: string | null
        }
        Update: {
          barter_discount?: boolean | null
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          is_mrp?: boolean | null
          product_shipping?: boolean | null
          retail_value?: number | null
          shipping_product_link?: string | null
          shipping_product_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipping_details_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipping_details_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_payment_summary"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "shipping_details_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
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
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string | null
          wallet_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string | null
          wallet_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string | null
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string | null
          wallet_type: string | null
        }
        Insert: {
          balance?: number
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
          wallet_type?: string | null
        }
        Update: {
          balance?: number
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
          wallet_type?: string | null
        }
        Relationships: []
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
      campaign_overview: {
        Row: {
          actual_metrics: Json | null
          admin_notes: string | null
          approved_contents: number | null
          approved_creators: number | null
          avg_engagement_rate: number | null
          brand_id: string | null
          brand_name: string | null
          brand_notes: string | null
          brand_website: string | null
          budget: number | null
          campaign_completed_at: string | null
          campaign_description: string | null
          campaign_name: string | null
          campaign_objectives: string[] | null
          campaign_started_at: string | null
          campaign_type: string | null
          content_types: string[] | null
          created_at: string | null
          creator_category: string | null
          creator_tier: string | null
          deliverables: Json | null
          description: string | null
          end_date: string | null
          id: string | null
          industry: string | null
          payment_confirmed_at: string | null
          payment_status: string | null
          pending_contents: number | null
          pending_creators: number | null
          phase: string | null
          rejected_creators: number | null
          requirements: string | null
          start_date: string | null
          status: string | null
          tagline: string | null
          target_metrics: Json | null
          total_clicks: number | null
          total_contents: number | null
          total_creators: number | null
          total_engagement: number | null
          total_impressions: number | null
          total_paid: number | null
          total_reach: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_payment_summary: {
        Row: {
          actual_creators_selected: number | null
          approved_creators: number | null
          brand_id: string | null
          budget: number | null
          campaign_id: string | null
          campaign_name: string | null
          creators_approved_count: number | null
          estimated_cost_per_creator: number | null
          estimated_total_cost: number | null
          max_affordable_creators: number | null
          paid_creators: number | null
          payment_initiated: boolean | null
          payment_initiated_at: string | null
          payment_status: string | null
          remaining_budget: number | null
          selected_for_payment: number | null
          selection_percentage: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_categories_summary: {
        Row: {
          avg_followers: number | null
          category: string | null
          creator_count: number | null
          macro_count: number | null
          max_followers: number | null
          mega_count: number | null
          micro_count: number | null
          min_followers: number | null
          subcategories: string[] | null
        }
        Relationships: []
      }
      creators_classified: {
        Row: {
          account_status: string | null
          avg_comments: number | null
          avg_likes: number | null
          avg_views: number | null
          bio: string | null
          calculated_type: string | null
          category: string | null
          content_style: string | null
          created_at: string | null
          engagement_rate: number | null
          external_id: string | null
          followers_count: number | null
          id: number | null
          ig_followers: number | null
          ig_handle: string | null
          languages: string[] | null
          location: string | null
          name: string | null
          subcategory: string | null
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          account_status?: string | null
          avg_comments?: number | null
          avg_likes?: number | null
          avg_views?: number | null
          bio?: string | null
          calculated_type?: never
          category?: string | null
          content_style?: string | null
          created_at?: string | null
          engagement_rate?: number | null
          external_id?: string | null
          followers_count?: number | null
          id?: number | null
          ig_followers?: number | null
          ig_handle?: string | null
          languages?: string[] | null
          location?: string | null
          name?: string | null
          subcategory?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          account_status?: string | null
          avg_comments?: number | null
          avg_likes?: number | null
          avg_views?: number | null
          bio?: string | null
          calculated_type?: never
          category?: string | null
          content_style?: string | null
          created_at?: string | null
          engagement_rate?: number | null
          external_id?: string | null
          followers_count?: number | null
          id?: number | null
          ig_followers?: number | null
          ig_handle?: string | null
          languages?: string[] | null
          location?: string | null
          name?: string | null
          subcategory?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      payment_summaries: {
        Row: {
          amount: number | null
          brand_name: string | null
          campaign_id: string | null
          campaign_name: string | null
          created_at: string | null
          currency: string | null
          id: string | null
          payment_method: string | null
          payment_verified_at: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          refunded_at: string | null
          status: string | null
          status_display: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_payment_summary"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "payments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      count_selected_creators: {
        Args: { p_campaign_id: string }
        Returns: number
      }
      get_campaign_payment_info: {
        Args: { campaign_uuid: string }
        Returns: {
          budget: number
          campaign_id: string
          campaign_name: string
          payment_amount: number
          payment_method: string
          payment_status: string
          payment_verified_at: string
          razorpay_order_id: string
          razorpay_payment_id: string
        }[]
      }
      get_creator_type: { Args: { follower_count: number }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      prepare_campaign_payment: {
        Args: { p_campaign_id: string; p_total_cost: number }
        Returns: {
          estimated_cost: number
          message: string
          selected_count: number
          success: boolean
        }[]
      }
      recommend_creators: {
        Args: {
          p_category: string
          p_creator_type?: string
          p_limit?: number
          p_min_engagement?: number
          p_subcategory?: string
        }
        Returns: {
          category: string
          creator_tier: string
          engagement_rate: number
          id: number
          ig_followers: number
          ig_handle: string
          match_score: number
          name: string
          subcategory: string
        }[]
      }
      recompute_campayn_score: { Args: { _user_id: string }; Returns: number }
      validate_creator_selection: {
        Args: { p_campaign_id: string; p_creator_id: number }
        Returns: {
          current_selected: number
          is_valid: boolean
          max_allowed: number
          message: string
        }[]
      }
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
