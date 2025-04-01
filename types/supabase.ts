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
      games: {
        Row: {
          id: number
          user_id: string
          igdb_id: number | null
          title: string
          cover_url: string | null
          platform: string | null
          release_date: string | null
          developer: string | null
          publisher: string | null
          genres: string[] | null
          status: string
          progress: number | null
          rating: number | null
          play_time: number | null
          notes: string | null
          added_date: string
          updated_at: string | null
        }
        Insert: {
          id?: number
          user_id: string
          igdb_id?: number | null
          title: string
          cover_url?: string | null
          platform?: string | null
          release_date?: string | null
          developer?: string | null
          publisher?: string | null
          genres?: string[] | null
          status: string
          progress?: number | null
          rating?: number | null
          play_time?: number | null
          notes?: string | null
          added_date?: string
          updated_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string
          igdb_id?: number | null
          title?: string
          cover_url?: string | null
          platform?: string | null
          release_date?: string | null
          developer?: string | null
          publisher?: string | null
          genres?: string[] | null
          status?: string
          progress?: number | null
          rating?: number | null
          play_time?: number | null
          notes?: string | null
          added_date?: string
          updated_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
          theme_preference: string | null
          show_completed_games: boolean | null
          default_view: string | null
          default_sort: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          theme_preference?: string | null
          show_completed_games?: boolean | null
          default_view?: string | null
          default_sort?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          theme_preference?: string | null
          show_completed_games?: boolean | null
          default_view?: string | null
          default_sort?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}