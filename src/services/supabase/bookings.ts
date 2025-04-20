
import { supabase } from "@/integrations/supabase/client";

export async function fetchUserBookings() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}
