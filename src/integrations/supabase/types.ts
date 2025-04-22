export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          quantity: number
          service_id: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          quantity?: number
          service_id?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          quantity?: number
          service_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          description: string | null
          id: number
          image_url: string | null
          name: string
        }
        Insert: {
          description?: string | null
          id?: never
          image_url?: string | null
          name: string
        }
        Update: {
          description?: string | null
          id?: never
          image_url?: string | null
          name?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean | null
          code: string
          description: string | null
          discount_type: string | null
          discount_value: number
          expires_at: string | null
          id: number
          usage_limit: number | null
        }
        Insert: {
          active?: boolean | null
          code: string
          description?: string | null
          discount_type?: string | null
          discount_value: number
          expires_at?: string | null
          id?: number
          usage_limit?: number | null
        }
        Update: {
          active?: boolean | null
          code?: string
          description?: string | null
          discount_type?: string | null
          discount_value?: number
          expires_at?: string | null
          id?: number
          usage_limit?: number | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: number
          item_total: number
          order_id: number | null
          quantity: number
          service_id: number | null
          service_name: string | null
          unit_price: number
        }
        Insert: {
          id?: number
          item_total: number
          order_id?: number | null
          quantity: number
          service_id?: number | null
          service_name?: string | null
          unit_price: number
        }
        Update: {
          id?: number
          item_total?: number
          order_id?: number | null
          quantity?: number
          service_id?: number | null
          service_name?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string | null
          coupon_id: number | null
          created_at: string | null
          email: string | null
          fullname: string | null
          id: number
          latitude: number | null
          longitude: number | null
          payment_id: string | null
          payment_status: string | null
          phone: string | null
          scheduled_at: string
          status: string | null
          total_amount: number | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          coupon_id?: number | null
          created_at?: string | null
          email?: string | null
          fullname?: string | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          payment_id?: string | null
          payment_status?: string | null
          phone?: string | null
          scheduled_at: string
          status?: string | null
          total_amount?: number | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          coupon_id?: number | null
          created_at?: string | null
          email?: string | null
          fullname?: string | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          payment_id?: string | null
          payment_status?: string | null
          phone?: string | null
          scheduled_at?: string
          status?: string | null
          total_amount?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          created_at: string | null
          id: number
          order_id: number | null
          payment_amount: number
          payment_details: Json | null
          payment_gateway: string
          payment_id: string | null
          payment_method: string | null
          payment_status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          order_id?: number | null
          payment_amount: number
          payment_details?: Json | null
          payment_gateway: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          order_id?: number | null
          payment_amount?: number
          payment_details?: Json | null
          payment_gateway?: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          admin_response: string | null
          comment: string | null
          created_at: string | null
          id: number
          is_approved: boolean | null
          order_id: number | null
          rating: number | null
          service_id: number | null
          user_id: string | null
        }
        Insert: {
          admin_response?: string | null
          comment?: string | null
          created_at?: string | null
          id?: number
          is_approved?: boolean | null
          order_id?: number | null
          rating?: number | null
          service_id?: number | null
          user_id?: string | null
        }
        Update: {
          admin_response?: string | null
          comment?: string | null
          created_at?: string | null
          id?: number
          is_approved?: boolean | null
          order_id?: number | null
          rating?: number | null
          service_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category_id: number | null
          description: string | null
          duration_minutes: number | null
          id: number
          image_url: string | null
          is_active: boolean | null
          name: string
          price: number
          rating: number | null
          review_count: number | null
        }
        Insert: {
          category_id?: number | null
          description?: string | null
          duration_minutes?: number | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          name: string
          price: number
          rating?: number | null
          review_count?: number | null
        }
        Update: {
          category_id?: number | null
          description?: string | null
          duration_minutes?: number | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          price?: number
          rating?: number | null
          review_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_locations: {
        Row: {
          address: string
          created_at: string | null
          id: number
          is_default: boolean | null
          latitude: number | null
          longitude: number | null
          user_id: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          id?: number
          is_default?: boolean | null
          latitude?: number | null
          longitude?: number | null
          user_id?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          id?: number
          is_default?: boolean | null
          latitude?: number | null
          longitude?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_locations_user_id_fkey"
            columns: ["user_id"]
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
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
