
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export async function fetchUserLocations() {
  const { data, error } = await supabase
    .from('user_locations')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createUserLocation(location: Omit<Tables<'user_locations'>, 'id' | 'created_at'>) {
  const { data: user } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('user_locations')
    .insert({
      ...location,
      user_id: user.user?.id
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function setDefaultLocation(locationId: number) {
  const { data: user } = await supabase.auth.getUser();
  
  // First, reset all locations to non-default
  await supabase
    .from('user_locations')
    .update({ is_default: false })
    .eq('user_id', user.user?.id);
  
  // Then set the specified location as default
  const { data, error } = await supabase
    .from('user_locations')
    .update({ is_default: true })
    .eq('id', locationId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
