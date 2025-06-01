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
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          business_name: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          business_name?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          business_name?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          color_type: Database["public"]["Enums"]["color_type"] | null
          created_at: string
          id: string
          name: string
          paper_orientation:
            | Database["public"]["Enums"]["paper_orientation"]
            | null
          paper_size: string | null
          price: number
          service_type: Database["public"]["Enums"]["service_type"]
          updated_at: string
        }
        Insert: {
          color_type?: Database["public"]["Enums"]["color_type"] | null
          created_at?: string
          id?: string
          name: string
          paper_orientation?:
            | Database["public"]["Enums"]["paper_orientation"]
            | null
          paper_size?: string | null
          price: number
          service_type: Database["public"]["Enums"]["service_type"]
          updated_at?: string
        }
        Update: {
          color_type?: Database["public"]["Enums"]["color_type"] | null
          created_at?: string
          id?: string
          name?: string
          paper_orientation?:
            | Database["public"]["Enums"]["paper_orientation"]
            | null
          paper_size?: string | null
          price?: number
          service_type?: Database["public"]["Enums"]["service_type"]
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          cost: number
          created_at: string
          date: string
          estimation: number
          final_cost: number
          id: string
          notes: string | null
          paper_size: Database["public"]["Enums"]["paper_size"]
          quantity: number
          sales_type: Database["public"]["Enums"]["sales_type"]
          service_id: string | null
          service_type: Database["public"]["Enums"]["service_type"] | null
          time: string
          updated_at: string
          user_id: string
          xerox_type: Database["public"]["Enums"]["xerox_type"]
        }
        Insert: {
          cost: number
          created_at?: string
          date?: string
          estimation?: number
          final_cost: number
          id?: string
          notes?: string | null
          paper_size: Database["public"]["Enums"]["paper_size"]
          quantity: number
          sales_type: Database["public"]["Enums"]["sales_type"]
          service_id?: string | null
          service_type?: Database["public"]["Enums"]["service_type"] | null
          time?: string
          updated_at?: string
          user_id: string
          xerox_type: Database["public"]["Enums"]["xerox_type"]
        }
        Update: {
          cost?: number
          created_at?: string
          date?: string
          estimation?: number
          final_cost?: number
          id?: string
          notes?: string | null
          paper_size?: Database["public"]["Enums"]["paper_size"]
          quantity?: number
          sales_type?: Database["public"]["Enums"]["sales_type"]
          service_id?: string | null
          service_type?: Database["public"]["Enums"]["service_type"] | null
          time?: string
          updated_at?: string
          user_id?: string
          xerox_type?: Database["public"]["Enums"]["xerox_type"]
        }
        Relationships: [
          {
            foreignKeyName: "transactions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
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
      binding_type: "spiral_a4" | "spiral_a3"
      color_type: "black_white" | "color"
      lamination_type: "id_card" | "a4" | "a3"
      paper_orientation: "single_side" | "both_sides"
      paper_size: "A4" | "A3" | "A2" | "A1" | "A0"
      sales_type: "Cash" | "PhonePe"
      service_type:
        | "xerox"
        | "scanning"
        | "net_printing"
        | "spiral_binding"
        | "lamination"
        | "rubber_stamps"
      stamp_type: "one_line" | "two_line" | "address" | "pre_inked"
      xerox_type: "Black" | "White" | "Color"
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
    Enums: {
      binding_type: ["spiral_a4", "spiral_a3"],
      color_type: ["black_white", "color"],
      lamination_type: ["id_card", "a4", "a3"],
      paper_orientation: ["single_side", "both_sides"],
      paper_size: ["A4", "A3", "A2", "A1", "A0"],
      sales_type: ["Cash", "PhonePe"],
      service_type: [
        "xerox",
        "scanning",
        "net_printing",
        "spiral_binding",
        "lamination",
        "rubber_stamps",
      ],
      stamp_type: ["one_line", "two_line", "address", "pre_inked"],
      xerox_type: ["Black", "White", "Color"],
    },
  },
} as const
