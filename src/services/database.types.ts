/**
 * Hand-written to match supabase/migrations/*.sql. Regenerate with
 * `supabase gen types typescript --linked` if the schema drifts from this file.
 *
 * Every table needs Row/Insert/Update/Relationships (even if empty) for
 * postgrest-js's GenericSchema constraint — omitting any of them silently
 * collapses inference for the whole client to `never`.
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          telephone: string | null;
          student_id: string | null;
          primary_diet: string;
          allergies: string[];
          weekly_order_time: string;
          university_id: number | null;
          member_since: string;
          updated_at: string;
        };
        Insert: Record<string, never>;
        Update: Partial<{
          first_name: string;
          last_name: string;
          email: string;
          telephone: string | null;
          student_id: string | null;
          primary_diet: string;
          allergies: string[];
          weekly_order_time: string;
          university_id: number | null;
          updated_at: string;
        }>;
        Relationships: [];
      };
      payment_methods: {
        Row: {
          id: number;
          user_id: string;
          type: 'card' | 'wallet' | 'cash';
          label: string;
          detail: string;
          is_default: boolean;
          removable: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          type: 'card' | 'wallet' | 'cash';
          label: string;
          detail: string;
          is_default?: boolean;
          removable?: boolean;
        };
        Update: Partial<{ label: string; detail: string; is_default: boolean }>;
        Relationships: [];
      };
      categories: {
        Row: { id: number; label: string; icon: string };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
      meals: {
        Row: {
          id: number;
          name: string;
          description: string;
          image_url: string;
          price: number;
          category_id: number;
          tags: string[];
          calories: number;
          available: number;
          ingredients: string[];
          customizable: boolean;
          university_id: number;
        };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
      pickup_locations: {
        Row: { id: number; name: string; building: string; walk_time: string; hours: string };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: number;
          user_id: string;
          status: 'placed' | 'preparing' | 'ready' | 'picked_up' | 'cancelled';
          pickup_location_id: number | null;
          pickup_slot: string;
          code: string;
          total: number;
          payment_method: string;
          placed_at: string;
        };
        Insert: {
          user_id: string;
          pickup_location_id: number | null;
          pickup_slot: string;
          code: string;
          total: number;
          payment_method: string;
        };
        Update: { status: 'cancelled' };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: number;
          order_id: number;
          meal_id: number | null;
          name: string;
          qty: number;
          unit_price: number;
          summary: string;
        };
        Insert: {
          order_id: number;
          meal_id: number | null;
          name: string;
          qty: number;
          unit_price: number;
          summary: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: number;
          user_id: string;
          type: 'order' | 'reward' | 'menu' | 'system';
          title: string;
          message: string;
          action_route: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          type: 'order' | 'reward' | 'menu' | 'system';
          title: string;
          message: string;
          action_route: string | null;
        };
        Update: { read: boolean };
        Relationships: [];
      };
      wallets: {
        Row: {
          user_id: string;
          balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
      wallet_transactions: {
        Row: {
          id: number;
          user_id: string;
          type: 'top_up' | 'withdrawal' | 'payment' | 'refund';
          amount: number;
          balance_after: number;
          order_id: number | null;
          note: string | null;
          payment_method_id: number | null;
          source_label: string | null;
          created_at: string;
        };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
      universities: {
        Row: {
          id: number;
          name: string;
          city: string;
          country: string;
          canteen_opens_at: string;
          canteen_closes_at: string;
          canteen_open_from_day: string;
          canteen_open_to_day: string;
        };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
      order_cancellation: {
        Row: {
          id: number;
          title: string;
          description: string;
          minutes: number;
          status: string;
        };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
      cart_items: {
        Row: {
          id: number;
          user_id: string;
          meal_id: number;
          name: string;
          image_url: string;
          unit_price: number;
          qty: number;
          summary: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          meal_id: number;
          name: string;
          image_url: string;
          unit_price: number;
          qty: number;
          summary?: string;
        };
        Update: Partial<{ qty: number; updated_at: string }>;
        Relationships: [];
      };
      weekly_meal_plan: {
        Row: {
          id: number;
          user_id: string;
          day_of_week: number;
          meal_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: { user_id: string; day_of_week: number; meal_id: number | null; updated_at?: string };
        Update: { meal_id: number | null; updated_at?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      wallet_top_up: { Args: { p_amount: number; p_payment_method_id?: number | null }; Returns: number };
      wallet_withdraw: { Args: { p_amount: number; p_payment_method_id?: number | null }; Returns: number };
      wallet_pay: { Args: { p_amount: number; p_order_id?: number | null; p_note?: string | null }; Returns: number };
    };
  };
}
