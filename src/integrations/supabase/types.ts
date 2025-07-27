export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      api_usage: {
        Row: {
          created_at: string
          id: string
          key: string
          timestamp: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          timestamp?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          timestamp?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string | null
          email: string | null
          email_sent: boolean | null
          email_sent_at: string | null
          id: string
          ip_address: unknown | null
          message: string
          name: string | null
          processed_at: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          ip_address?: unknown | null
          message: string
          name?: string | null
          processed_at?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          ip_address?: unknown | null
          message?: string
          name?: string | null
          processed_at?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          preferences: Json | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          preferences?: Json | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          preferences?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rooms: {
        Row: {
          created_at: string
          current_restaurant_id: string | null
          filters: Json | null
          food_type_swipes: Json
          host_id: string
          id: string
          location: string | null
          next_page_token: string | null
          participants: Json
          restaurant_swipes: Json
          restaurants: Json
          updated_at: string
          viewed_restaurant_ids: string[]
        }
        Insert: {
          created_at?: string
          current_restaurant_id?: string | null
          filters?: Json | null
          food_type_swipes?: Json
          host_id: string
          id: string
          location?: string | null
          next_page_token?: string | null
          participants?: Json
          restaurant_swipes?: Json
          restaurants?: Json
          updated_at?: string
          viewed_restaurant_ids?: string[]
        }
        Update: {
          created_at?: string
          current_restaurant_id?: string | null
          filters?: Json | null
          food_type_swipes?: Json
          host_id?: string
          id?: string
          location?: string | null
          next_page_token?: string | null
          participants?: Json
          restaurant_swipes?: Json
          restaurants?: Json
          updated_at?: string
          viewed_restaurant_ids?: string[]
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          id: string
          user_id: string
          restaurant_id: string
          restaurant_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          restaurant_id: string
          restaurant_data: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          restaurant_id?: string
          restaurant_data?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      room_history: {
        Row: {
          id: string
          user_id: string
          room_id: string
          room_name: string | null
          location: string
          restaurants: Json
          filters: Json | null
          created_at: string
          last_accessed: string
        }
        Insert: {
          id?: string
          user_id: string
          room_id: string
          room_name?: string | null
          location: string
          restaurants: Json
          filters?: Json | null
          created_at?: string
          last_accessed?: string
        }
        Update: {
          id?: string
          user_id?: string
          room_id?: string
          room_name?: string | null
          location?: string
          restaurants?: Json
          filters?: Json | null
          created_at?: string
          last_accessed?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_history_user_id_fkey"
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
      cleanup_old_api_usage: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_user_profile: {
        Args: {
          user_id_param: string
          first_name_param?: string
          last_name_param?: string
          avatar_url_param?: string
          preferences_param?: Json
        }
        Returns: Json
      }
      update_user_profile_debug: {
        Args: {
          user_id_param: string
          first_name_param?: string
          last_name_param?: string
          avatar_url_param?: string
          preferences_param?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
