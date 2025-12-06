import { createClient } from '@supabase/supabase-js';
import { Appointment } from '@/types/appointment';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create client if credentials are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database types
export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: Appointment;
        Insert: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Appointment, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
};

// Helper functions for appointments
export const appointmentsApi = {
  // Get all appointments
  async getAll() {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('appointment_time', { ascending: true });
    
    if (error) throw error;
    return data as Appointment[];
  },

  // Get appointment by ID
  async getById(id: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error} = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Appointment;
  },

  // Create new appointment
  async create(appointment: Database['public']['Tables']['appointments']['Insert']) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointment)
      .select()
      .single();
    
    if (error) throw error;
    return data as Appointment;
  },

  // Update appointment
  async update(id: string, updates: Database['public']['Tables']['appointments']['Update']) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Appointment;
  },

  // Delete appointment
  async delete(id: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Subscribe to real-time changes
  subscribeToChanges(callback: (payload: unknown) => void) {
    if (!supabase) {
      console.warn('Supabase not configured, real-time updates disabled');
      return { unsubscribe: () => {} };
    }
    
    return supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        callback
      )
      .subscribe();
  }
};
