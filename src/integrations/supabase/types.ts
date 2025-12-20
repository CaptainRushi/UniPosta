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
      },
      plans: {
        Row: {
          id: string
          name: string
          price: number
          billing_cycle: 'monthly' | 'yearly' | 'lifetime' | null
          features: Json | null
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          price: number
          billing_cycle?: 'monthly' | 'yearly' | 'lifetime' | null
          features?: Json | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          price?: number
          billing_cycle?: 'monthly' | 'yearly' | 'lifetime' | null
          features?: Json | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Relationships: []
      },
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string | null
          status: 'pending' | 'active' | 'expired' | 'canceled' | null
          start_date: string | null
          end_date: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          plan_id?: string | null
          status?: 'pending' | 'active' | 'expired' | 'canceled' | null
          start_date?: string | null
          end_date?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string | null
          status?: 'pending' | 'active' | 'expired' | 'canceled' | null
          start_date?: string | null
          end_date?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      },
      payments: {
        Row: {
          id: string
          user_id: string | null
          subscription_id: string | null
          gateway: string // 'razorpay'
          gateway_order_id: string | null
          gateway_payment_id: string | null
          amount: number
          currency: string | null
          status: 'created' | 'paid' | 'failed' | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          subscription_id?: string | null
          gateway: string
          gateway_order_id?: string | null
          gateway_payment_id?: string | null
          amount: number
          currency?: string | null
          status?: 'created' | 'paid' | 'failed' | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          subscription_id?: string | null
          gateway?: string
          gateway_order_id?: string | null
          gateway_payment_id?: string | null
          amount?: number
          currency?: string | null
          status?: 'created' | 'paid' | 'failed' | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      },
      billing_plans: {
        Row: {
          id: string
          name: string
          description: string | null
          tier: string
          price: number
          currency: string | null
          interval: 'month' | 'year' | 'one_time' | null
          features: Json | null
          is_active: boolean | null
          provider_config: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          tier: string
          price: number
          currency?: string | null
          interval?: 'month' | 'year' | 'one_time' | null
          features?: Json | null
          is_active?: boolean | null
          provider_config?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          tier?: string
          price?: number
          currency?: string | null
          interval?: 'month' | 'year' | 'one_time' | null
          features?: Json | null
          is_active?: boolean | null
          provider_config?: Json | null
          created_at?: string | null
        }
        Relationships: []
      },
      billing_customers: {
        Row: {
          id: string
          user_id: string
          provider_id: string
          provider_customer_id: string
          user_email: string | null
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          provider_id: string
          provider_customer_id: string
          user_email?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          provider_id?: string
          provider_customer_id?: string
          user_email?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      },
      billing_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string | null
          status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'paused' | 'pending' | 'expired' | null
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean | null
          provider_id: string
          provider_subscription_id: string | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          plan_id?: string | null
          status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'paused' | 'pending' | 'expired' | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean | null
          provider_id: string
          provider_subscription_id?: string | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string | null
          status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'paused' | 'pending' | 'expired' | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean | null
          provider_id?: string
          provider_subscription_id?: string | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "billing_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      },
      billing_invoices: {
        Row: {
          id: string
          invoice_number: string | null
          user_id: string
          subscription_id: string | null
          provider_id: string | null
          amount_due: number | null
          amount_paid: number | null
          currency: string | null
          status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible' | null
          invoice_pdf_url: string | null
          billing_details: Json | null
          tax_breakdown: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          invoice_number?: string | null
          user_id: string
          subscription_id?: string | null
          provider_id?: string | null
          amount_due?: number | null
          amount_paid?: number | null
          currency?: string | null
          status?: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible' | null
          invoice_pdf_url?: string | null
          billing_details?: Json | null
          tax_breakdown?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          invoice_number?: string | null
          user_id?: string
          subscription_id?: string | null
          provider_id?: string | null
          amount_due?: number | null
          amount_paid?: number | null
          currency?: string | null
          status?: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible' | null
          invoice_pdf_url?: string | null
          billing_details?: Json | null
          tax_breakdown?: Json | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "billing_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      },
      billing_payments: {
        Row: {
          id: string
          invoice_id: string | null
          user_id: string | null
          amount: number
          currency: string | null
          provider_id: string
          provider_transaction_id: string | null
          payment_method: string | null
          status: 'pending' | 'succeeded' | 'failed' | 'refunded' | null
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          invoice_id?: string | null
          user_id?: string | null
          amount: number
          currency?: string | null
          provider_id: string
          provider_transaction_id?: string | null
          payment_method?: string | null
          status?: 'pending' | 'succeeded' | 'failed' | 'refunded' | null
          metadata?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          invoice_id?: string | null
          user_id?: string | null
          amount?: number
          currency?: string | null
          provider_id?: string
          provider_transaction_id?: string | null
          payment_method?: string | null
          status?: 'pending' | 'succeeded' | 'failed' | 'refunded' | null
          metadata?: Json | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "billing_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_payments_user_id_fkey"
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
