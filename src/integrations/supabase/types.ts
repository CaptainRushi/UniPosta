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
        }
        Insert: {
          id?: string
          user_id: string
          caption?: string | null
          media_url?: string | null
          cta_link?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          caption?: string | null
          media_url?: string | null
          cta_link?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "master_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
          status: 'draft' | 'live' | 'paused' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          status?: 'draft' | 'live' | 'paused' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          status?: 'draft' | 'live' | 'paused' | 'completed'
          created_at?: string
          updated_at?: string
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
