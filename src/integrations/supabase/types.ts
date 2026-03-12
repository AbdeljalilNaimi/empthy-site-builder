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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ad_likes: {
        Row: {
          ad_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          ad_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          ad_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_likes_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_reports: {
        Row: {
          ad_id: string
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          status: string
        }
        Insert: {
          ad_id: string
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          status?: string
        }
        Update: {
          ad_id?: string
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_reports_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_saves: {
        Row: {
          ad_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          ad_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          ad_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_saves_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_provider_notes: {
        Row: {
          admin_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          provider_id: string
          report_id: string | null
          severity: string
          title: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          provider_id: string
          report_id?: string | null
          severity?: string
          title: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          provider_id?: string
          report_id?: string | null
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_provider_notes_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "provider_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      ads: {
        Row: {
          created_at: string
          expires_at: string | null
          full_description: string
          id: string
          image_url: string
          is_featured: boolean
          is_verified_provider: boolean
          likes_count: number
          provider_avatar: string | null
          provider_city: string | null
          provider_id: string
          provider_name: string
          provider_type: string | null
          rejection_reason: string | null
          saves_count: number
          short_description: string
          status: string
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          full_description: string
          id?: string
          image_url: string
          is_featured?: boolean
          is_verified_provider?: boolean
          likes_count?: number
          provider_avatar?: string | null
          provider_city?: string | null
          provider_id: string
          provider_name: string
          provider_type?: string | null
          rejection_reason?: string | null
          saves_count?: number
          short_description: string
          status?: string
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          full_description?: string
          id?: string
          image_url?: string
          is_featured?: boolean
          is_verified_provider?: boolean
          likes_count?: number
          provider_avatar?: string | null
          provider_city?: string | null
          provider_id?: string
          provider_name?: string
          provider_type?: string | null
          rejection_reason?: string | null
          saves_count?: number
          short_description?: string
          status?: string
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          app_description: string | null
          app_name: string | null
          created_at: string
          developer_id: string
          id: string
          is_active: boolean
          key_hash: string
          key_suffix: string
          plan: string
          rate_limit_per_day: number
        }
        Insert: {
          app_description?: string | null
          app_name?: string | null
          created_at?: string
          developer_id: string
          id?: string
          is_active?: boolean
          key_hash: string
          key_suffix: string
          plan?: string
          rate_limit_per_day?: number
        }
        Update: {
          app_description?: string | null
          app_name?: string | null
          created_at?: string
          developer_id?: string
          id?: string
          is_active?: boolean
          key_hash?: string
          key_suffix?: string
          plan?: string
          rate_limit_per_day?: number
        }
        Relationships: []
      }
      api_logs: {
        Row: {
          api_key_id: string
          created_at: string
          endpoint: string
          id: string
          method: string
          response_time_ms: number | null
          status_code: number
        }
        Insert: {
          api_key_id: string
          created_at?: string
          endpoint: string
          id?: string
          method: string
          response_time_ms?: number | null
          status_code: number
        }
        Update: {
          api_key_id?: string
          created_at?: string
          endpoint?: string
          id?: string
          method?: string
          response_time_ms?: number | null
          status_code?: number
        }
        Relationships: [
          {
            foreignKeyName: "api_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      api_usage: {
        Row: {
          api_key_id: string
          date: string
          endpoint: string
          id: string
          request_count: number
        }
        Insert: {
          api_key_id: string
          date?: string
          endpoint: string
          id?: string
          request_count?: number
        }
        Update: {
          api_key_id?: string
          date?: string
          endpoint?: string
          id?: string
          request_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      article_reactions: {
        Row: {
          article_id: string
          created_at: string
          id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          reaction_type?: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_reactions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "research_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_saves: {
        Row: {
          article_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_saves_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "research_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_views: {
        Row: {
          article_id: string
          created_at: string
          id: string
          viewer_id: string | null
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          viewer_id?: string | null
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_views_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "research_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_emergencies: {
        Row: {
          blood_type_needed: string
          created_at: string
          id: string
          message: string | null
          provider_id: string
          provider_lat: number | null
          provider_lng: number | null
          provider_name: string | null
          resolved_at: string | null
          responders_count: number
          status: string
          urgency_level: string
        }
        Insert: {
          blood_type_needed: string
          created_at?: string
          id?: string
          message?: string | null
          provider_id: string
          provider_lat?: number | null
          provider_lng?: number | null
          provider_name?: string | null
          resolved_at?: string | null
          responders_count?: number
          status?: string
          urgency_level: string
        }
        Update: {
          blood_type_needed?: string
          created_at?: string
          id?: string
          message?: string | null
          provider_id?: string
          provider_lat?: number | null
          provider_lng?: number | null
          provider_name?: string | null
          resolved_at?: string | null
          responders_count?: number
          status?: string
          urgency_level?: string
        }
        Relationships: []
      }
      blood_emergency_responses: {
        Row: {
          citizen_id: string
          citizen_name: string | null
          citizen_phone: string | null
          created_at: string
          emergency_id: string
          id: string
          status: string
        }
        Insert: {
          citizen_id: string
          citizen_name?: string | null
          citizen_phone?: string | null
          created_at?: string
          emergency_id: string
          id?: string
          status?: string
        }
        Update: {
          citizen_id?: string
          citizen_name?: string | null
          citizen_phone?: string | null
          created_at?: string
          emergency_id?: string
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "blood_emergency_responses_emergency_id_fkey"
            columns: ["emergency_id"]
            isOneToOne: false
            referencedRelation: "blood_emergencies"
            referencedColumns: ["id"]
          },
        ]
      }
      card_consultation_logs: {
        Row: {
          card_id: string
          card_user_id: string
          id: string
          provider_name: string | null
          provider_type: string | null
          provider_uid: string
          scanned_at: string
        }
        Insert: {
          card_id: string
          card_user_id: string
          id?: string
          provider_name?: string | null
          provider_type?: string | null
          provider_uid: string
          scanned_at?: string
        }
        Update: {
          card_id?: string
          card_user_id?: string
          id?: string
          provider_name?: string | null
          provider_type?: string | null
          provider_uid?: string
          scanned_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_consultation_logs_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "emergency_health_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      community_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_anonymous: boolean
          parent_comment_id: string | null
          post_id: string
          updated_at: string
          upvotes_count: number
          user_avatar: string | null
          user_id: string
          user_name: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string
          upvotes_count?: number
          user_avatar?: string | null
          user_id: string
          user_name?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string
          upvotes_count?: number
          user_avatar?: string | null
          user_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          category: Database["public"]["Enums"]["community_category"]
          comments_count: number
          content: string
          created_at: string
          id: string
          is_admin_post: boolean
          is_anonymous: boolean
          is_pinned: boolean
          title: string
          updated_at: string
          upvotes_count: number
          user_avatar: string | null
          user_id: string
          user_name: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["community_category"]
          comments_count?: number
          content: string
          created_at?: string
          id?: string
          is_admin_post?: boolean
          is_anonymous?: boolean
          is_pinned?: boolean
          title: string
          updated_at?: string
          upvotes_count?: number
          user_avatar?: string | null
          user_id: string
          user_name?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["community_category"]
          comments_count?: number
          content?: string
          created_at?: string
          id?: string
          is_admin_post?: boolean
          is_anonymous?: boolean
          is_pinned?: boolean
          title?: string
          updated_at?: string
          upvotes_count?: number
          user_avatar?: string | null
          user_id?: string
          user_name?: string | null
        }
        Relationships: []
      }
      community_reports: {
        Row: {
          comment_id: string | null
          created_at: string
          details: string | null
          id: string
          post_id: string | null
          reason: Database["public"]["Enums"]["community_report_reason"]
          reporter_id: string
          status: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          details?: string | null
          id?: string
          post_id?: string | null
          reason: Database["public"]["Enums"]["community_report_reason"]
          reporter_id: string
          status?: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          details?: string | null
          id?: string
          post_id?: string | null
          reason?: Database["public"]["Enums"]["community_report_reason"]
          reporter_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_upvotes: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          post_id: string | null
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_upvotes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_upvotes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string | null
          type: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string | null
          type?: string | null
        }
        Relationships: []
      }
      contact_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      donation_history: {
        Row: {
          blood_type: string
          citizen_id: string
          donated_at: string
          emergency_id: string | null
          id: string
          notes: string | null
          provider_id: string
          provider_name: string | null
        }
        Insert: {
          blood_type: string
          citizen_id: string
          donated_at?: string
          emergency_id?: string | null
          id?: string
          notes?: string | null
          provider_id: string
          provider_name?: string | null
        }
        Update: {
          blood_type?: string
          citizen_id?: string
          donated_at?: string
          emergency_id?: string | null
          id?: string
          notes?: string | null
          provider_id?: string
          provider_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donation_history_emergency_id_fkey"
            columns: ["emergency_id"]
            isOneToOne: false
            referencedRelation: "blood_emergencies"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_health_cards: {
        Row: {
          allergies: string[] | null
          blood_group: string | null
          chronic_conditions: string[] | null
          created_at: string
          current_medications: string[] | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          id: string
          is_public_for_emergencies: boolean
          share_token: string | null
          updated_at: string
          user_id: string
          vaccination_history: string | null
        }
        Insert: {
          allergies?: string[] | null
          blood_group?: string | null
          chronic_conditions?: string[] | null
          created_at?: string
          current_medications?: string[] | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          is_public_for_emergencies?: boolean
          share_token?: string | null
          updated_at?: string
          user_id: string
          vaccination_history?: string | null
        }
        Update: {
          allergies?: string[] | null
          blood_group?: string | null
          chronic_conditions?: string[] | null
          created_at?: string
          current_medications?: string[] | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          is_public_for_emergencies?: boolean
          share_token?: string | null
          updated_at?: string
          user_id?: string
          vaccination_history?: string | null
        }
        Relationships: []
      }
      provider_reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          provider_id: string
          reason: string
          reporter_id: string
          status: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          provider_id: string
          reason: string
          reporter_id: string
          status?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          provider_id?: string
          reason?: string
          reporter_id?: string
          status?: string
        }
        Relationships: []
      }
      provider_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          patient_id: string
          patient_name: string
          provider_id: string
          rating: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          patient_id: string
          patient_name: string
          provider_id: string
          rating: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          patient_id?: string
          patient_name?: string
          provider_id?: string
          rating?: number
        }
        Relationships: []
      }
      providers_public: {
        Row: {
          address: string | null
          area: string | null
          city: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_24h: boolean
          is_open: boolean
          is_verified: boolean
          languages: string[] | null
          lat: number | null
          lng: number | null
          name: string
          night_duty: boolean | null
          phone: string | null
          rating: number | null
          reviews_count: number | null
          specialty: string | null
          type: string
        }
        Insert: {
          address?: string | null
          area?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          id: string
          image_url?: string | null
          is_24h?: boolean
          is_open?: boolean
          is_verified?: boolean
          languages?: string[] | null
          lat?: number | null
          lng?: number | null
          name: string
          night_duty?: boolean | null
          phone?: string | null
          rating?: number | null
          reviews_count?: number | null
          specialty?: string | null
          type: string
        }
        Update: {
          address?: string | null
          area?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_24h?: boolean
          is_open?: boolean
          is_verified?: boolean
          languages?: string[] | null
          lat?: number | null
          lng?: number | null
          name?: string
          night_duty?: boolean | null
          phone?: string | null
          rating?: number | null
          reviews_count?: number | null
          specialty?: string | null
          type?: string
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          client_name: string
          client_phone: string
          created_at: string
          details: string | null
          equipment: string
          id: string
          provider_id: string
          status: string
        }
        Insert: {
          client_name: string
          client_phone: string
          created_at?: string
          details?: string | null
          equipment: string
          id?: string
          provider_id: string
          status?: string
        }
        Update: {
          client_name?: string
          client_phone?: string
          created_at?: string
          details?: string | null
          equipment?: string
          id?: string
          provider_id?: string
          status?: string
        }
        Relationships: []
      }
      research_articles: {
        Row: {
          abstract: string
          category: string
          content: string
          created_at: string
          doi: string | null
          id: string
          is_featured: boolean
          is_verified_provider: boolean
          pdf_url: string | null
          provider_avatar: string | null
          provider_city: string | null
          provider_id: string
          provider_name: string
          provider_type: string | null
          reactions_count: number
          rejection_reason: string | null
          saves_count: number
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          abstract: string
          category: string
          content: string
          created_at?: string
          doi?: string | null
          id?: string
          is_featured?: boolean
          is_verified_provider?: boolean
          pdf_url?: string | null
          provider_avatar?: string | null
          provider_city?: string | null
          provider_id: string
          provider_name: string
          provider_type?: string | null
          reactions_count?: number
          rejection_reason?: string | null
          saves_count?: number
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          abstract?: string
          category?: string
          content?: string
          created_at?: string
          doi?: string | null
          id?: string
          is_featured?: boolean
          is_verified_provider?: boolean
          pdf_url?: string | null
          provider_avatar?: string | null
          provider_city?: string | null
          provider_id?: string
          provider_name?: string
          provider_type?: string | null
          reactions_count?: number
          rejection_reason?: string | null
          saves_count?: number
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: []
      }
      review_reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          reporter_type: string
          review_id: string
          status: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          reporter_type?: string
          review_id: string
          status?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          reporter_type?: string
          review_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_reports_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "provider_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      community_category: "suggestion" | "feedback" | "experience" | "question"
      community_report_reason: "spam" | "abuse" | "false_info" | "other"
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
      community_category: ["suggestion", "feedback", "experience", "question"],
      community_report_reason: ["spam", "abuse", "false_info", "other"],
    },
  },
} as const
