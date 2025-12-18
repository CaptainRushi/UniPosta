export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      master_posts: {
        Row: {
          id: string
          user_id: string
          caption: string | null
          media_url: string | null
          cta_link: string | null
          created_at: string
          updated_at: string
          campaign_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          caption?: string | null
          media_url?: string | null
          cta_link?: string | null
          created_at?: string
          updated_at?: string
          campaign_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          caption?: string | null
          media_url?: string | null
          cta_link?: string | null
          created_at?: string
          updated_at?: string
          campaign_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "master_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_posts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          }
        ]
      }
      platform_variants: {
        Row: {
          id: string
          master_post_id: string | null
          user_id: string
          platform: 'twitter' | 'linkedin' | 'instagram' | 'facebook'
          caption: string | null
          hashtags: string[] | null
          media_url: string | null
          posting_time: string | null
          created_at: string
        }
        Insert: {
          id?: string
          master_post_id?: string | null
          user_id: string
          platform: 'twitter' | 'linkedin' | 'instagram' | 'facebook'
          caption?: string | null
          hashtags?: string[] | null
          media_url?: string | null
          posting_time?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          master_post_id?: string | null
          user_id?: string
          platform?: 'twitter' | 'linkedin' | 'instagram' | 'facebook'
          caption?: string | null
          hashtags?: string[] | null
          media_url?: string | null
          posting_time?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_variants_master_post_id_fkey"
            columns: ["master_post_id"]
            isOneToOne: false
            referencedRelation: "master_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_variants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      campaigns: {
        Row: {
          id: string
          user_id: string
          name: string
          status: 'draft' | 'live' | 'paused' | 'completed' | 'scheduled'
          created_at: string
          updated_at: string
          description: string | null
          objective: string | null
          start_date: string | null
          end_date: string | null
          total_budget: number | null
          currency: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          status?: 'draft' | 'live' | 'paused' | 'completed' | 'scheduled'
          created_at?: string
          updated_at?: string
          description?: string | null
          objective?: string | null
          start_date?: string | null
          end_date?: string | null
          total_budget?: number | null
          currency?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          status?: 'draft' | 'live' | 'paused' | 'completed' | 'scheduled'
          created_at?: string
          updated_at?: string
          description?: string | null
          objective?: string | null
          start_date?: string | null
          end_date?: string | null
          total_budget?: number | null
          currency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      analytics_events: {
        Row: {
          id: string
          user_id: string
          campaign_id: string | null
          platform: 'twitter' | 'linkedin' | 'instagram' | 'facebook'
          metric_type: string
          value: number
          event_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          campaign_id?: string | null
          platform: 'twitter' | 'linkedin' | 'instagram' | 'facebook'
          metric_type: string
          value: number
          event_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          campaign_id?: string | null
          platform?: 'twitter' | 'linkedin' | 'instagram' | 'facebook'
          metric_type?: string
          value?: number
          event_date?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      social_accounts: {
        Row: {
          id: string
          user_id: string
          platform: string
          account_id: string
          account_name: string | null
          access_token: string
          refresh_token: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: string
          account_id: string
          account_name?: string | null
          access_token: string
          refresh_token?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: string
          account_id?: string
          account_name?: string | null
          access_token?: string
          refresh_token?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      campaign_platforms: {
        Row: {
          id: string
          campaign_id: string | null
          platform_name: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok'
          platform_account_id: string | null
          status: 'active' | 'disconnected' | 'error'
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id?: string | null
          platform_name: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok'
          platform_account_id?: string | null
          status?: 'active' | 'disconnected' | 'error'
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string | null
          platform_name?: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok'
          platform_account_id?: string | null
          status?: 'active' | 'disconnected' | 'error'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_platforms_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          }
        ]
      },
      campaign_posts: {
        Row: {
          id: string
          campaign_id: string | null
          original_post_id: string | null
          adapted_caption: string | null
          adapted_hashtags: string[] | null
          media_url: string | null
          platform_name: string
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id?: string | null
          original_post_id?: string | null
          adapted_caption?: string | null
          adapted_hashtags?: string[] | null
          media_url?: string | null
          platform_name: string
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string | null
          original_post_id?: string | null
          adapted_caption?: string | null
          adapted_hashtags?: string[] | null
          media_url?: string | null
          platform_name?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_posts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_posts_original_post_id_fkey"
            columns: ["original_post_id"]
            isOneToOne: false
            referencedRelation: "master_posts"
            referencedColumns: ["id"]
          }
        ]
      },
      campaign_analytics: {
        Row: {
          id: string
          campaign_id: string | null
          platform_name: string
          reach: number
          impressions: number
          clicks: number
          conversions: number
          cost_per_result: number
          recorded_at: string
        }
        Insert: {
          id?: string
          campaign_id?: string | null
          platform_name: string
          reach?: number
          impressions?: number
          clicks?: number
          conversions?: number
          cost_per_result?: number
          recorded_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string | null
          platform_name?: string
          reach?: number
          impressions?: number
          clicks?: number
          conversions?: number
          cost_per_result?: number
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          }
        ]
      },
      profiles: {
        Row: {
          id: string
          plan: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          plan?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          plan?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
      campaign_status: 'draft' | 'live' | 'paused' | 'completed'
      platform_type: 'twitter' | 'linkedin' | 'instagram' | 'facebook'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
