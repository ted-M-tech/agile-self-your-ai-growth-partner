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
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          is_premium: boolean
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          is_premium?: boolean
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          is_premium?: boolean
        }
      }
      user_preferences: {
        Row: {
          user_id: string
          reminder_enabled: boolean
          reminder_frequency: 'weekly' | 'monthly'
          reminder_day: string
          reminder_time: string
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          reminder_enabled?: boolean
          reminder_frequency?: 'weekly' | 'monthly'
          reminder_day?: string
          reminder_time?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          reminder_enabled?: boolean
          reminder_frequency?: 'weekly' | 'monthly'
          reminder_day?: string
          reminder_time?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
      retrospectives: {
        Row: {
          id: string
          user_id: string
          title: string | null
          period_type: 'weekly' | 'monthly'
          period_start_date: string | null
          period_end_date: string | null
          status: 'draft' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          period_type?: 'weekly' | 'monthly'
          period_start_date?: string | null
          period_end_date?: string | null
          status?: 'draft' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          period_type?: 'weekly' | 'monthly'
          period_start_date?: string | null
          period_end_date?: string | null
          status?: 'draft' | 'completed'
          created_at?: string
          updated_at?: string
        }
      }
      keeps: {
        Row: {
          id: string
          retrospective_id: string
          text: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          retrospective_id: string
          text: string
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          retrospective_id?: string
          text?: string
          order_index?: number
          created_at?: string
        }
      }
      problems: {
        Row: {
          id: string
          retrospective_id: string
          text: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          retrospective_id: string
          text: string
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          retrospective_id?: string
          text?: string
          order_index?: number
          created_at?: string
        }
      }
      tries: {
        Row: {
          id: string
          retrospective_id: string
          text: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          retrospective_id: string
          text: string
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          retrospective_id?: string
          text?: string
          order_index?: number
          created_at?: string
        }
      }
      actions: {
        Row: {
          id: string
          user_id: string
          retrospective_id: string
          try_id: string | null
          text: string
          is_completed: boolean
          completed_at: string | null
          due_date: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          retrospective_id: string
          try_id?: string | null
          text: string
          is_completed?: boolean
          completed_at?: string | null
          due_date?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          retrospective_id?: string
          try_id?: string | null
          text?: string
          is_completed?: boolean
          completed_at?: string | null
          due_date?: string | null
          order_index?: number
          created_at?: string
        }
      }
    }
  }
}
