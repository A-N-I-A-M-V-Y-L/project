import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: 'Student' | 'Faculty' | 'Admin';
          full_name: string;
          user_id: string;
          department: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role: 'Student' | 'Faculty' | 'Admin';
          full_name: string;
          user_id: string;
          department?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'Student' | 'Faculty' | 'Admin';
          full_name?: string;
          user_id?: string;
          department?: string | null;
          created_at?: string;
        };
      };
      grievances: {
        Row: {
          id: string;
          grievance_id: string;
          submitted_by: string;
          title: string;
          description: string;
          category: 'Academic' | 'Facility' | 'Examination' | 'Placement' | 'Other';
          status: 'Submitted' | 'In Progress' | 'Resolved' | 'Closed';
          created_at: string;
          updated_at: string;
          assigned_to: string | null;
          resolution_comments: string | null;
          details: any;
        };
        Insert: {
          id?: string;
          grievance_id?: string;
          submitted_by: string;
          title: string;
          description: string;
          category: 'Academic' | 'Facility' | 'Examination' | 'Placement' | 'Other';
          status?: 'Submitted' | 'In Progress' | 'Resolved' | 'Closed';
          created_at?: string;
          updated_at?: string;
          assigned_to?: string | null;
          resolution_comments?: string | null;
          details: any;
        };
        Update: {
          id?: string;
          grievance_id?: string;
          submitted_by?: string;
          title?: string;
          description?: string;
          category?: 'Academic' | 'Facility' | 'Examination' | 'Placement' | 'Other';
          status?: 'Submitted' | 'In Progress' | 'Resolved' | 'Closed';
          created_at?: string;
          updated_at?: string;
          assigned_to?: string | null;
          resolution_comments?: string | null;
          details?: any;
        };
      };
    };
  };
};
