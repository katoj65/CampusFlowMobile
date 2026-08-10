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
          wallet_balance: number;
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
          wallet_balance: number;
          updated_at: string;
        }>;
        Relationships: [];
      };
      payment_methods: {
        Row: {
          id: string;
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
        Row: { id: string; label: string; icon: string };
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
          category_id: string;
          tags: string[];
          calories: number;
          available: number;
          ingredients: string[];
          customizable: boolean;
        };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
      pickup_locations: {
        Row: { id: string; name: string; building: string; walk_time: string; hours: string };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: number;
          user_id: string;
          status: 'placed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
          pickup_location_id: string | null;
          pickup_slot: string;
          code: string;
          total: number;
          placed_at: string;
        };
        Insert: {
          user_id: string;
          pickup_location_id: string | null;
          pickup_slot: string;
          code: string;
          total: number;
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
          id: string;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
